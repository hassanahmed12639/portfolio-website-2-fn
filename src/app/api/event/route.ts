import { validateEvent } from '@/lib/validate-event'
import { enrichEvent } from '@/lib/enrich-event'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function getClientIp(headers: Headers): string | null {
  return headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? null
}

export async function POST(request: NextRequest) {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  let body: {
    api_key?: string
    event_name?: string
    event_id?: string
    event_source_url?: string
    value?: number
    currency?: string
    email?: string
    phone?: string
    visitor_id?: string
    is_test?: boolean
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { api_key, event_name, event_id, event_source_url: bodySourceUrl, value = 0, currency = 'USD', email, phone, is_test } = body
  const event_source_url = bodySourceUrl ?? request.headers.get('referer') ?? undefined
  if (!api_key || !event_name) {
    return NextResponse.json({ error: 'api_key and event_name required' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, events_used, plan')
    .eq('api_key', api_key)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const eventsUsed = profile.events_used ?? 0
  const plan = (profile.plan as string) ?? 'free'
  if (!is_test && plan === 'free' && eventsUsed >= 500) {
    return NextResponse.json(
      { error: 'Monthly limit reached. Please upgrade.' },
      { status: 429 }
    )
  }

  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  const platformsFired: string[] = []
  const ip = getClientIp(request.headers) ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
  const userAgent = request.headers.get('user-agent') ?? ''

  const { data: enrichmentSettingsRow } = await supabase
    .from('enrichment_settings')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  const enrichmentSettings = enrichmentSettingsRow
    ? {
        geo_enabled: enrichmentSettingsRow.geo_enabled ?? true,
        device_enabled: enrichmentSettingsRow.device_enabled ?? true,
        customer_type_enabled: enrichmentSettingsRow.customer_type_enabled ?? true,
        ltv_enabled: enrichmentSettingsRow.ltv_enabled ?? true,
        email_hash_enabled: enrichmentSettingsRow.email_hash_enabled ?? true,
        phone_hash_enabled: enrichmentSettingsRow.phone_hash_enabled ?? true,
      }
    : {}

  let enrichmentData: Awaited<ReturnType<typeof enrichEvent>> | null = null
  try {
    enrichmentData = await enrichEvent(
      enrichmentSettings,
      {
        ip,
        userAgent,
        visitorId: body.visitor_id ?? null,
        email: email ?? null,
        phone: phone ?? null,
        userId: profile.id,
      },
      supabase
    )
  } catch {
    // continue without enrichment
  }

  const eventForValidation = {
    event_name,
    event_time: Math.floor(Date.now() / 1000),
    email: email ?? undefined,
    phone: phone ?? undefined,
    value,
    currency,
    event_id: event_id ?? undefined,
    event_source_url: event_source_url ?? undefined,
  }
  const validation = validateEvent(eventForValidation)
  const internalPayload = {
    event_name,
    event_time: eventForValidation.event_time,
    value,
    currency,
    event_id: event_id ?? null,
    event_source_url: event_source_url ?? null,
    visitor_id: visitor_id ?? null,
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  for (const integration of integrations ?? []) {
    let status: 'success' | 'failed' = 'failed'
    let originalPayload: Record<string, unknown> = {}

    if (integration.platform === 'meta') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const userData: Record<string, string | string[]> = {}
        if (enrichmentData?.hashes?.email_hash) {
          userData.em = [enrichmentData.hashes.email_hash]
        } else if (email) {
          userData.em = [sha256(email)]
        }
        if (enrichmentData?.hashes?.phone_hash) {
          userData.ph = [enrichmentData.hashes.phone_hash]
        } else if (phone) {
          userData.ph = [sha256(phone.replace(/\D/g, ''))]
        }
        if (enrichmentData?.geo?.countryCode) {
          userData.country = [enrichmentData.geo.countryCode.toLowerCase()]
        }
        if (enrichmentData?.geo?.city) {
          userData.ct = [enrichmentData.geo.city.toLowerCase().replace(/\s/g, '')]
        }
        userData.client_ip_address = ip
        userData.client_user_agent = userAgent

        const metaEvent: Record<string, unknown> = {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          user_data: userData,
          custom_data: { value, currency },
        }
        if (event_id) metaEvent.event_id = event_id
        if (event_source_url) metaEvent.event_source_url = event_source_url

        const metaRequestBody = { data: [metaEvent] }
        originalPayload = metaRequestBody

        const res = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metaRequestBody),
          }
        )
        if (res.ok) {
          status = 'success'
          platformsFired.push('meta')
        }
      }
    } else if (integration.platform === 'google') {
      console.log('[event] Google integration (not implemented):', { event_name, value, currency })
      status = 'success'
    }

    const insertRow: Record<string, unknown> = {
      user_id: profile.id,
      event_name,
      platform: integration.platform,
      value,
      status,
      ip,
      event_id: event_id ?? null,
      validation_score: validation.score,
      validation_issues: validation.issues,
      validation_checks: validation.checks,
      payload: internalPayload,
    }
    if (enrichmentData) {
      insertRow.country = enrichmentData.geo.country || null
      insertRow.city = enrichmentData.geo.city || null
      insertRow.device_type = enrichmentData.device.type || null
      insertRow.customer_type = enrichmentData.customer.type || null
      insertRow.enriched_data = enrichmentData
    }
    if (status === 'failed') {
      insertRow.original_payload = originalPayload
      insertRow.retry_count = 0
      insertRow.next_retry_at = fiveMinutesFromNow
    }
    await supabase.from('events').insert(insertRow)
  }

  if (!is_test) {
    await supabase
      .from('profiles')
      .update({ events_used: eventsUsed + 1 })
      .eq('id', profile.id)
  }

  return NextResponse.json({ success: true, platforms_fired: platformsFired })
}
