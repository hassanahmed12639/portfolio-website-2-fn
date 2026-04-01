import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@/lib/supabase/server'
import { decrypt } from '@/lib/encrypt'
import { cancelWarmupJob, getWarmupJob, startWarmupJob, waitForWarmupStore, type PixelWarmupCredentials } from '@/lib/pixelWarmupWorker'

export const runtime = 'nodejs'

const MANDATORY_FIELDS = ['email', 'phone', 'first_name', 'last_name']

type Credentials = {
  ga4?: { measurementId: string; apiSecret: string }
  meta?: { pixelId: string; accessToken?: string }
}

type RequestBody = {
  eventType: string
  credentials: Credentials
  rows?: Array<Record<string, string>>
  record?: Record<string, string>
}

async function getSavedMetaCredentials() {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return null
  }

  const { data: integrations, error } = await supabase
    .from('integrations')
    .select('pixel_id, access_token')
    .eq('user_id', user.id)
    .eq('platform', 'meta')
    .limit(1)

  if (error || !integrations?.length) {
    return null
  }

  const row = integrations[0] as { pixel_id?: string | null; access_token?: string | null }
  const pixelId = row.pixel_id?.trim() || null
  const accessToken = row.access_token ? (await decrypt(row.access_token)) : null
  if (!pixelId || !accessToken) {
    return null
  }

  return { pixelId, accessToken }
}

function normalizeKey(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, '_')
}

function validateRecord(record: Record<string, string>) {
  const missing = MANDATORY_FIELDS.filter((field) => {
    const key = normalizeKey(field)
    return !record[key] || record[key].toString().trim().length === 0
  })

  if (missing.length) {
    throw new Error(`Missing required fields: ${missing.join(', ')}`)
  }
}

function safeEventName(eventType: string) {
  return String(eventType || 'event')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '')
    .toLowerCase()
}

function sanitizeEmail(value: string) {
  return value.trim().toLowerCase()
}

function sanitizePhone(value: string) {
  return value.replace(/[^0-9+]/g, '')
}

function hashValue(value: string) {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function buildGa4Payload(eventType: string, record: Record<string, string>) {
  const email = sanitizeEmail(record.email || '')
  const phone = sanitizePhone(record.phone || '')
  const clientId = hashValue(email || phone || String(Date.now()))

  const params: Record<string, unknown> = {
    first_name: record.first_name || '',
    last_name: record.last_name || '',
  }

  const payload: Record<string, unknown> = {
    client_id: clientId,
    events: [
      {
        name: safeEventName(eventType),
        params,
      },
    ],
  }

  if (email || phone) {
    const userProperties: Record<string, { value: string }> = {}
    if (email) userProperties.email = { value: email }
    if (phone) userProperties.phone = { value: phone }
    payload.user_properties = userProperties
  }

  return payload
}

function buildMetaPayload(eventType: string, record: Record<string, string>) {
  const email = sanitizeEmail(record.email || '')
  const phone = sanitizePhone(record.phone || '')
  const firstName = String(record.first_name || '').trim()
  const lastName = String(record.last_name || '').trim()
  const city = String(record.city || '').trim()
  const state = String(record.state || '').trim()
  const zip = String(record.zip || '').trim()
  const country = String(record.country || '').trim()
  const externalId = String(record.external_id || record.externalId || '').trim()
  const fbLoginId = String(record.fb_login_id || record.fbLoginId || '').trim()
  const currency = String(record.currency || record.purchase_currency || '').trim().toUpperCase()
  const rawValue = String(record.value || record.purchase_value || '').trim()
  const value = rawValue ? Number(rawValue) : undefined

  const userData: Record<string, string> = {}
  if (email) userData.em = hashValue(email)
  if (phone) userData.ph = hashValue(phone)
  if (firstName) userData.fn = hashValue(firstName)
  if (lastName) userData.ln = hashValue(lastName)
  if (city) userData.ct = hashValue(city)
  if (state) userData.st = hashValue(state)
  if (zip) userData.zp = hashValue(zip)
  if (country) userData.country = hashValue(country)
  if (externalId) userData.external_id = hashValue(externalId)
  if (fbLoginId) userData.fb_login_id = fbLoginId

  const customData: Record<string, unknown> = {}
  if (firstName) customData.first_name = firstName
  if (lastName) customData.last_name = lastName
  if (currency) customData.currency = currency
  else if (eventType.toLowerCase() === 'purchase') customData.currency = 'USD'
  if (value !== undefined && !Number.isNaN(value)) customData.value = value
  else if (eventType.toLowerCase() === 'purchase') customData.value = 1.0

  return {
    data: [
      {
        event_name: eventType,
        event_time: Math.floor(Date.now() / 1000),
        event_source_url: 'https://track.itshassanahmed.com/dashboard/pixel-warmup',
        action_source: 'website',
        user_data: userData,
        custom_data: customData,
      },
    ],
  }
}

async function sendGa4Event(credentials: NonNullable<Credentials['ga4']>, eventType: string, record: Record<string, string>) {
  const endpoint = `https://www.google-analytics.com/mp/collect?measurement_id=${encodeURIComponent(
    credentials.measurementId
  )}&api_secret=${encodeURIComponent(credentials.apiSecret)}`
  const payload = buildGa4Payload(eventType, record)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`GA4 error ${res.status}: ${body}`)
  }
}

async function sendMetaEvent(credentials: NonNullable<Credentials['meta']>, eventType: string, record: Record<string, string>) {
  // Warmup events must be sent as real Meta CAPI conversions.
  // Do not include any test_event_code or testEventCode in the payload.
  const unsafeMeta = credentials as Record<string, unknown>
  if (unsafeMeta.testEventCode || unsafeMeta.test_event_code) {
    console.warn('[pixel-warmup] Ignoring Meta test event code in warmup request')
  }

  const endpoint = `https://graph.facebook.com/v18.0/${encodeURIComponent(credentials.pixelId)}/events?access_token=${encodeURIComponent(
    credentials.accessToken || ''
  )}`
  const payload = buildMetaPayload(eventType, record)
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Meta CAPI error ${res.status}: ${body}`)
  }
}

export async function GET(request: Request) {
  try {
    await waitForWarmupStore()
    const url = new URL(request.url)
    const jobId = url.searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId query parameter is required' }, { status: 400 })
    }

    const job = getWarmupJob(jobId)
    if (!job) {
      return NextResponse.json({ success: false, error: 'Warmup job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, job })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[pixel-warmup] GET ', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url)
    const jobId = url.searchParams.get('jobId')
    if (!jobId) {
      return NextResponse.json({ success: false, error: 'jobId query parameter is required' }, { status: 400 })
    }

    const cancelled = cancelWarmupJob(jobId)
    if (!cancelled) {
      return NextResponse.json({ success: false, error: 'Warmup job not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true, jobId })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[pixel-warmup] DELETE ', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RequestBody
    if (!body || !body.eventType || !body.credentials) {
      return NextResponse.json({ success: false, error: 'Missing required request body fields' }, { status: 400 })
    }

    const { eventType, rows, credentials } = body
    if (!eventType || typeof eventType !== 'string') {
      return NextResponse.json({ success: false, error: 'eventType must be a string' }, { status: 400 })
    }

    const savedMeta = await getSavedMetaCredentials()
    const rawMeta = credentials.meta
      ? {
          pixelId: credentials.meta.pixelId || savedMeta?.pixelId,
          accessToken: credentials.meta.accessToken || savedMeta?.accessToken,
        }
      : savedMeta

    const effectiveMeta =
      rawMeta && rawMeta.pixelId && rawMeta.accessToken
        ? {
            pixelId: rawMeta.pixelId,
            accessToken: rawMeta.accessToken,
          }
        : null

    const metaRequested = Boolean(credentials.meta && credentials.meta.pixelId)
    if (metaRequested && !effectiveMeta) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Meta warmup requires a saved Meta access token. Please connect your Meta integration in dashboard integrations before warming up Meta events.',
        },
        { status: 400 }
      )
    }

    if (!credentials.ga4 && !effectiveMeta) {
      return NextResponse.json({ success: false, error: 'Provide GA4 or Meta credentials' }, { status: 400 })
    }

    if (rows && Array.isArray(rows)) {
      if (!rows.length) {
        return NextResponse.json({ success: false, error: 'No rows provided' }, { status: 400 })
      }
      if (rows.length > 250) {
        return NextResponse.json({ success: false, error: 'Maximum 250 rows allowed per upload' }, { status: 400 })
      }

      const warmupCredentials: PixelWarmupCredentials = {
        ga4: credentials.ga4,
        meta: effectiveMeta ?? undefined,
      }

      const result = startWarmupJob(eventType, rows, warmupCredentials)
      return NextResponse.json({ success: true, jobId: result.jobId, queued: result.queued, skipped: result.skipped })
    }

    if (!body.record) {
      return NextResponse.json({ success: false, error: 'Missing record payload' }, { status: 400 })
    }

    const { record } = body
    validateRecord(record)

    if (credentials.ga4) {
      const { measurementId, apiSecret } = credentials.ga4
      if (!measurementId || !apiSecret) {
        return NextResponse.json({ success: false, error: 'GA4 credentials require measurementId and apiSecret' }, { status: 400 })
      }
      await sendGa4Event(credentials.ga4, eventType, record)
    }

    if (effectiveMeta) {
      const { pixelId, accessToken } = effectiveMeta
      if (!pixelId || !accessToken) {
        return NextResponse.json(
          { success: false, error: 'Meta credentials require pixelId and accessToken' },
          { status: 400 }
        )
      }
      await sendMetaEvent(effectiveMeta, eventType, record)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown server error'
    console.error('[pixel-warmup] ', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
