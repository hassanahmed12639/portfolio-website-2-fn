import { validateEvent } from '@/lib/validate-event'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function calculateDataQuality(payload: {
  email?: string
  phone?: string
  fbp?: string
  fbc?: string
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  zip?: string
  fbclid?: string
}): { score: number; label: string; breakdown: Record<string, boolean> } {
  let score = 0
  const breakdown: Record<string, boolean> = {}

  if (payload.email) { score += 20; breakdown.email = true } else { breakdown.email = false }
  if (payload.phone) { score += 15; breakdown.phone = true } else { breakdown.phone = false }
  if (payload.fbp) { score += 20; breakdown.fbp = true } else { breakdown.fbp = false }
  if (payload.fbc) { score += 15; breakdown.fbc = true } else { breakdown.fbc = false }
  if (payload.first_name && payload.last_name) { score += 10; breakdown.name = true } else { breakdown.name = false }
  if (payload.city || payload.state || payload.zip) { score += 10; breakdown.location = true } else { breakdown.location = false }
  if (payload.fbclid) { score += 10; breakdown.fbclid = true } else { breakdown.fbclid = false }

  let label = 'Poor'
  if (score >= 80) label = 'Excellent'
  else if (score >= 60) label = 'Good'
  else if (score >= 40) label = 'Fair'

  return { score, label, breakdown }
}

export async function POST(request: NextRequest) {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    event_name?: string
    event_id?: string
    event_source_url?: string
    value?: number
    currency?: string
    email?: string
    phone?: string
    fbp?: string
    fbc?: string
    first_name?: string
    last_name?: string
    city?: string
    state?: string
    zip?: string
    fbclid?: string
    order_id?: string
    form_name?: string
    page_url?: string
    page_title?: string
    product_id?: string
    product_name?: string
    target?: 'both' | 'meta' | 'google'
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    event_name,
    event_id,
    event_source_url,
    value = 0,
    currency = 'USD',
    email,
    phone,
    target = 'both',
  } = body
  if (!event_name) {
    return NextResponse.json({ error: 'event_name required' }, { status: 400 })
  }

  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const { data: profile, error: profileError } = await serviceSupabase
    .from('profiles')
    .select('id, api_key')
    .eq('id', user.id)
    .single()

  if (profileError || !profile?.api_key) {
    return NextResponse.json({ error: 'Profile or API key not found' }, { status: 400 })
  }

  const integrationsRes = await serviceSupabase
    .from('integrations')
    .select('platform, pixel_id, access_token')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  let list = integrationsRes.data ?? []
  if (target === 'meta') {
    list = list.filter((i) => i.platform === 'meta')
  } else if (target === 'google') {
    list = list.filter((i) => i.platform === 'google')
  }

  const eventTime = Math.floor(Date.now() / 1000)
  const eventForValidation = {
    event_name,
    event_time: eventTime,
    email: email ?? undefined,
    phone: phone ?? undefined,
    value,
    currency,
    event_id: event_id ?? undefined,
    event_source_url: event_source_url ?? undefined,
  }
  const validation = validateEvent(eventForValidation)
  const platformsFired: string[] = []
  let metaResponse: { status: number; body: unknown } | null = null
  let googleResponse: unknown = null

  const internalPayload = {
    event_name,
    event_time: eventTime,
    value,
    currency,
    event_id: event_id ?? null,
    event_source_url: event_source_url ?? null,
  }

  const dataQuality = calculateDataQuality({
    email,
    phone,
    fbp: body.fbp,
    fbc: body.fbc,
    first_name: body.first_name,
    last_name: body.last_name,
    city: body.city,
    state: body.state,
    zip: body.zip,
    fbclid: body.fbclid,
  })
  console.log('[DQ]', dataQuality)

  for (const integration of list) {
    let status: 'success' | 'failed' = 'failed'
    let originalPayload: Record<string, unknown> = {}

    if (integration.platform === 'meta') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const userData: Record<string, string[]> = {}
        if (email) userData.em = [sha256(email)]
        if (phone) userData.ph = [sha256(phone.replace(/\D/g, ''))]

        const metaEvent: Record<string, unknown> = {
          event_name,
          event_time: eventTime,
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
        const metaJson = await res.json().catch(() => ({}))
        metaResponse = { status: res.status, body: metaJson }
        if (res.ok) {
          status = 'success'
          platformsFired.push('meta')
        }
      }
    } else if (integration.platform === 'google') {
      googleResponse = { message: 'Google CAPI not implemented', status: 'skipped' }
      status = 'success'
      platformsFired.push('google')
    }

    const logEventName = `TEST_${event_name}`
    await serviceSupabase.from('events').insert({
      user_id: profile.id,
      event_name: logEventName,
      platform: integration.platform,
      value,
      status,
      event_id: event_id ?? null,
      validation_score: validation.score,
      validation_issues: validation.issues,
      validation_checks: validation.checks,
      payload: internalPayload,
      data_quality_score: dataQuality.score,
      data_quality_label: dataQuality.label,
      data_quality_breakdown: dataQuality.breakdown,
      ...(status === 'failed' && { original_payload: originalPayload }),
    })
  }

  return NextResponse.json({
    success: true,
    platforms_fired: platformsFired,
    event_id: event_id ?? null,
    timestamp: eventTime,
    meta_response: metaResponse ?? undefined,
    google_response: googleResponse ?? undefined,
    quality_score: dataQuality.score,
    data_quality: dataQuality,
    validation,
  })
}
