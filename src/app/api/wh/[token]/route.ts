import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import crypto from 'crypto'
import { flattenObject, hashField } from '@/lib/utils'

export const dynamic = 'force-dynamic'

const TRACKHIVE_FIELDS = [
  'email',
  'phone',
  'first_name',
  'last_name',
  'value',
  'currency',
  'order_id',
  'city',
  'zip',
  'ignore',
] as const

type FieldMap = Record<string, string> // crm_key -> trackhive_field

function parseBody(request: NextRequest): Promise<Record<string, unknown>> {
  const contentType = request.headers.get('content-type') || ''
  if (contentType.includes('application/json')) {
    return request.json()
  }
  if (contentType.includes('application/x-www-form-urlencoded')) {
    return request.text().then((text) => {
      const params = new URLSearchParams(text)
      const obj: Record<string, unknown> = {}
      params.forEach((v, k) => {
        obj[k] = v
      })
      return obj
    })
  }
  // Try JSON first for multipart or unknown
  return request.json().catch(() => ({}))
}

function applyFieldMap(
  flat: Record<string, unknown>,
  fieldMap: FieldMap
): Record<string, string | number | null> {
  const out: Record<string, string | number | null> = {}
  for (const [crmKey, trackhiveField] of Object.entries(fieldMap)) {
    if (trackhiveField === 'ignore' || !crmKey) continue
    const raw = flat[crmKey]
    if (raw === undefined || raw === null) continue
    const val = typeof raw === 'object' ? JSON.stringify(raw) : String(raw).trim()
    if (val === '') continue
    if (trackhiveField === 'value') {
      const n = Number(val)
      out.value = Number.isFinite(n) ? n : 0
    } else if (trackhiveField === 'order_id') {
      out.order_id = String(val)
    } else {
      out[trackhiveField] = val
    }
  }
  return out
}

function hashForPlatforms(email: string | null, phone: string | null) {
  const hashedEmail = email ? hashField(email) : ''
  const hashedPhone = phone ? crypto.createHash('sha256').update(String(phone).replace(/\D/g, '')).digest('hex') : ''
  return { hashedEmail, hashedPhone }
}

async function processWebhookInBackground(
  logId: string,
  webhook: {
    id: string
    user_id: string
    name: string
    event_name: string
    event_value: number
    pixel_ids: string[]
    field_map: FieldMap
  },
  rawPayload: Record<string, unknown>,
  supabaseAdmin: ReturnType<typeof createClient>
) {
  try {
    const flat = flattenObject(rawPayload) as Record<string, unknown>
    const mapped = applyFieldMap(flat, webhook.field_map)
    const email = (mapped.email as string) || null
    const phone = (mapped.phone as string) || null
    const first_name = (mapped.first_name as string) || null
    const last_name = (mapped.last_name as string) || null
    const value = typeof mapped.value === 'number' ? mapped.value : Number(webhook.event_value) || 0
    const currency = (mapped.currency as string) || 'USD'
    const city = (mapped.city as string) || null
    const zip = (mapped.zip as string) || null
    const order_id = (mapped.order_id as string) || null

    const eventId = `wh_${webhook.id}_${Date.now()}_${Math.random().toString(36).slice(2)}`
    const platformResponses: Record<string, unknown> = {}

    // Create lead in leads table
    const leadData = {
      user_id: webhook.user_id,
      pixel_id: null,
      event_id: eventId,
      email,
      phone,
      first_name,
      last_name,
      event_name: webhook.event_name,
      value,
      currency,
      source_url: null,
      ip_address: null,
      user_agent: null,
      score: 'new',
      stage: 'new',
      raw_data: rawPayload,
      source: 'webhook',
      source_display: webhook.name,
      webhook_id: webhook.id,
    }
    let leadId: string | null = null
    let leadError: { message: string } | null = null
    let { data: leadRow, error: leadErr } = await supabaseAdmin
      .from('leads')
      .insert(leadData)
      .select('id')
      .single()

    if (leadErr) {
      const isColumnError =
        /column .* does not exist/i.test(leadErr.message) ||
        /could not find .* column/i.test(leadErr.message) ||
        /relation.*does not exist/i.test(leadErr.message)
      if (isColumnError) {
        const { source: _s, source_display: _sd, webhook_id: _wid, ...leadDataWithoutWebhookCols } = leadData
        const retry = await supabaseAdmin.from('leads').insert(leadDataWithoutWebhookCols).select('id').single()
        if (!retry.error) {
          leadId = retry.data?.id ?? null
          leadErr = null
        }
      }
      if (leadErr) {
        leadError = { message: leadErr.message }
        console.error('[webhook] Lead insert error:', leadErr.message)
        platformResponses.lead = { ok: false, error: leadErr.message }
      }
    } else {
      leadId = leadRow?.id ?? null
    }
    const { hashedEmail, hashedPhone } = hashForPlatforms(email, phone)

    if (webhook.pixel_ids?.length) {
      const { data: pixels } = await supabaseAdmin
        .from('pixels')
        .select('id, pixel_id, access_token, platform, name')
        .in('id', webhook.pixel_ids)
        .eq('user_id', webhook.user_id)
        .eq('is_active', true)

      for (const px of pixels || []) {
        if (px.platform === 'meta' && px.pixel_id && px.access_token) {
          const ud: Record<string, unknown> = {
            client_ip_address: '',
            client_user_agent: '',
          }
          if (hashedEmail) ud.em = hashedEmail
          if (hashedPhone) ud.ph = hashedPhone
          if (first_name) ud.fn = crypto.createHash('sha256').update(first_name.trim().toLowerCase()).digest('hex')
          if (last_name) ud.ln = crypto.createHash('sha256').update(last_name.trim().toLowerCase()).digest('hex')
          if (city) ud.ct = crypto.createHash('sha256').update(city.toLowerCase().replace(/\s/g, '')).digest('hex')
          if (zip) ud.zp = crypto.createHash('sha256').update(String(zip).replace(/\D/g, '')).digest('hex')

          const payload = {
            data: [
              {
                event_name: webhook.event_name,
                event_time: Math.floor(Date.now() / 1000),
                event_source_url: '',
                event_id: eventId,
                action_source: 'website',
                user_data: ud,
                custom_data: { value, currency, order_id: order_id ?? undefined },
              },
            ],
          }
          try {
            const res = await fetch(
              `https://graph.facebook.com/v18.0/${px.pixel_id}/events?access_token=${encodeURIComponent(px.access_token)}`,
              { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
            )
            const data = await res.json()
            platformResponses[px.name || px.pixel_id] = res.ok ? { ok: true, events_received: data.events_received } : { ok: false, error: data.error?.message || res.status }
          } catch (e) {
            platformResponses[px.name || px.pixel_id] = { ok: false, error: String(e) }
          }
        }
      }
    }

    const allOk = Object.values(platformResponses).every((v) => (v as { ok?: boolean })?.ok !== false)
    const hasPlatformErrors = Object.keys(platformResponses).length > 0 && !allOk
    const status = leadError || hasPlatformErrors ? 'failed' : 'sent'

    await supabaseAdmin
      .from('webhook_logs')
      .update({
        mapped_data: mapped,
        status,
        platform_responses: platformResponses,
        lead_id: leadId,
      })
      .eq('id', logId)
  } catch (err) {
    console.error('[webhook] Background process error:', err)
    await supabaseAdmin
      .from('webhook_logs')
      .update({ status: 'failed', platform_responses: { error: String(err) } })
      .eq('id', logId)
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  let rawPayload: Record<string, unknown>
  try {
    rawPayload = await parseBody(request)
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 })
  }

  const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: webhook, error: whError } = await supabaseAdmin
    .from('webhooks')
    .select('id, user_id, name, event_name, event_value, pixel_ids, field_map, is_active')
    .eq('token', token)
    .maybeSingle()

  if (whError || !webhook || !webhook.is_active) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }

  const { data: logRow, error: logError } = await supabaseAdmin
    .from('webhook_logs')
    .insert({
      webhook_id: webhook.id,
      user_id: webhook.user_id,
      raw_payload: rawPayload,
      status: 'received',
    })
    .select('id')
    .single()

  if (logError) {
    console.error('[webhook] Log insert error:', logError.message)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }

  void processWebhookInBackground(
    logRow.id,
    {
      id: webhook.id,
      user_id: webhook.user_id,
      name: webhook.name,
      event_name: webhook.event_name || 'Lead',
      event_value: Number(webhook.event_value) || 0,
      pixel_ids: Array.isArray(webhook.pixel_ids) ? webhook.pixel_ids : [],
      field_map: (webhook.field_map as FieldMap) || {},
    },
    rawPayload,
    supabaseAdmin
  )

  return NextResponse.json({ ok: true })
}
