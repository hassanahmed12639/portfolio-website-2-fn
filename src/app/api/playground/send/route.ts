import { validateEvent } from '@/lib/validate-event'
import { enrichEvent } from '@/lib/enrich-event'
import { getUserCredentials } from '@/lib/get-user-credentials'
import { getMetaEventName } from '@/lib/meta'
import { sendGA4Event } from '@/lib/ga4'
import { sendTikTokEvent } from '@/lib/tiktok'
import { sendGoogleEnhancedConversion } from '@/lib/google-ads'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

/** All event types that must fire to ALL platforms (Meta, TikTok, GA4, Google). No event-type restriction. */
const ALL_EVENTS = [
  'PageView',
  'ViewContent',
  'AddToCart',
  'InitiateCheckout',
  'Purchase',
  'Lead',
  'CompleteRegistration',
  'Subscribe',
  'Contact',
  'Search',
  'CustomEvent',
]

function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex')
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
    source_url?: string
    pixel_id?: string
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
    country?: string
    date_of_birth?: string
    gender?: string
    fbclid?: string
    order_id?: string
    external_id?: string
    ttclid?: string
    content_ids?: string[]
    content_type?: string
    content_name?: string
    brand?: string
    contents?: { id?: string; quantity?: number; item_price?: number }[]
    num_items?: number
    client_user_agent?: string
    form_name?: string
    page_url?: string
    page_title?: string
    product_id?: string
    product_name?: string
    target?: 'all' | 'both' | 'meta' | 'google' | 'ga4' | 'tiktok'
    user_data?: {
      em?: string | string[]
      ph?: string | string[]
      fn?: string | string[]
      ln?: string | string[]
      ct?: string | string[]
      st?: string | string[]
      zp?: string | string[]
      country?: string | string[]
      db?: string | string[]
      ge?: string | string[]
      external_id?: string | string[]
      client_ip_address?: string
      client_user_agent?: string
    }
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
    target,
  } = body
  const sendToAll = target === 'all' || target === 'both' || !target
  const effectiveTarget = sendToAll ? 'all' : (target ?? 'all')
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

  const { data: headerSettings } = await serviceSupabase
    .from('header_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  let list = integrationsRes.data ?? []
  if (effectiveTarget === 'meta') {
    list = list.filter((i) => i.platform === 'meta')
  } else if (effectiveTarget === 'google') {
    list = list.filter((i) => i.platform === 'google')
  } else if (effectiveTarget === 'ga4' || effectiveTarget === 'tiktok') {
    list = []
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
  debugLog('[DQ]', dataQuality)

  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  const clientUserAgent =
    request.headers.get('user-agent') ?? body.user_data?.client_user_agent ?? body.client_user_agent ?? ''

  const { data: enrichmentSettingsRow } = await serviceSupabase
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
        ip: clientIp,
        userAgent: clientUserAgent,
        visitorId: body.visitor_id ?? null,
        email: email ?? null,
        phone: phone ?? null,
        userId: profile.id,
      },
      serviceSupabase
    )
  } catch {
    // continue without enrichment
  }

  for (const integration of list) {
    let status: 'success' | 'failed' = 'failed'
    let originalPayload: Record<string, unknown> = {}

    if (integration.platform === 'meta') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      const testEventCode = headerSettings?.meta_test_event_code?.trim() ||
        (process.env.META_TEST_EVENT_CODE ?? '')
      console.log('[Meta] Attempting to send event:', body.event_name)
      console.log('[Meta] Pixel ID:', pixelId ? 'found' : 'missing')
      console.log('[Meta] Access Token:', accessToken ? 'found' : 'missing')
      console.log('[Meta] Test event code:', testEventCode || 'none')
      if (pixelId && accessToken) {

        const userData: Record<string, string | string[]> = {}
        userData.client_ip_address = clientIp
        userData.client_user_agent = clientUserAgent
        if (body.fbp) userData.fbp = body.fbp
        if (body.fbc) userData.fbc = body.fbc
        if (email) userData.em = [sha256(email)]
        if (phone) userData.ph = [sha256(phone.replace(/\D/g, ''))]
        if (body.first_name) userData.fn = [hashValue(body.first_name.toLowerCase().trim())]
        if (body.last_name) userData.ln = [hashValue(body.last_name.toLowerCase().trim())]
        if (body.city) userData.ct = [hashValue(body.city.toLowerCase().trim().replace(/\s/g, ''))]
        if (body.state) userData.st = [hashValue(body.state.toLowerCase().trim().replace(/\s/g, ''))]
        if (body.zip) userData.zp = [hashValue(body.zip.replace(/\D/g, ''))]
        if (body.country) userData.country = [hashValue(body.country.toLowerCase().trim())]
        if (body.date_of_birth) userData.db = [hashValue(body.date_of_birth.replace(/-/g, ''))]
        if (body.gender) userData.ge = [hashValue(body.gender.toLowerCase().trim())]
        const extId = body.external_id ?? body.order_id
        if (extId) userData.external_id = [hashValue(extId)]

        const metaEventId = event_id ?? `th_${Date.now()}_${Math.random().toString(36).slice(2)}`
        const metaEventName = getMetaEventName(event_name)
        const metaEvent: Record<string, unknown> = {
          event_name: metaEventName,
          event_time: eventTime,
          event_id: metaEventId,
          event_source_url: event_source_url ?? '',
          action_source: 'website',
          user_data: userData,
          custom_data: {
            value,
            currency,
            order_id: body.order_id ?? undefined,
            content_ids: body.content_ids ?? undefined,
            content_type: body.content_type ?? undefined,
            contents: body.contents ?? undefined,
            num_items: body.num_items ?? undefined,
          },
        }

        const metaPayload: Record<string, unknown> = { data: [metaEvent] }
        if (testEventCode) {
          metaPayload.test_event_code = testEventCode
          console.log('[Meta] Using test event code:', testEventCode)
        }
        originalPayload = metaPayload

        const res = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
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
    const insertRow: Record<string, unknown> = {
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
    }
    if (enrichmentData) {
      insertRow.country = enrichmentData.geo.country || null
      insertRow.city = enrichmentData.geo.city || null
      insertRow.device_type = enrichmentData.device.type || null
      insertRow.customer_type = enrichmentData.customer.type || null
      insertRow.enriched_data = enrichmentData
    }
    await serviceSupabase.from('events').insert(insertRow)
  }

  // When playground sends a Lead event, save to leads table
  const leadEvents = ['Lead', 'CompleteRegistration', 'Subscribe', 'Contact']
  if (leadEvents.includes(event_name)) {
    const em = body.user_data?.em
    const leadEmail = typeof em === 'string' ? em : Array.isArray(em) ? em[0] : body.email
    const ph = body.user_data?.ph
    const leadPhone = typeof ph === 'string' ? ph : Array.isArray(ph) ? ph[0] : body.phone
    const fn = body.user_data?.fn
    const leadFirstName = typeof fn === 'string' ? fn : Array.isArray(fn) ? fn[0] : body.first_name
    const ln = body.user_data?.ln
    const leadLastName = typeof ln === 'string' ? ln : Array.isArray(ln) ? ln[0] : body.last_name
    const leadSourceUrl =
      body.event_source_url ?? body.source_url ?? body.page_url ?? null
    const leadData = {
      user_id: user.id,
      pixel_id: body.pixel_id ?? list[0]?.pixel_id ?? null,
      event_id: event_id ?? `th_${Date.now()}`,
      email: leadEmail ?? null,
      phone: leadPhone ?? null,
      first_name: leadFirstName ?? null,
      last_name: leadLastName ?? null,
      event_name,
      value: value ?? 0,
      currency: currency ?? 'USD',
      source_url: leadSourceUrl,
      score: 'new',
      stage: 'new',
      raw_data: body,
    }
    const { error: leadError } = await serviceSupabase.from('leads').insert(leadData)
    if (leadError) {
      console.error('[Leads] Error saving lead from playground:', leadError.message)
    } else {
      console.log('[Leads] Lead saved from playground successfully')
    }
  }

  const em = body.user_data?.em
  const emailStr = typeof em === 'string' ? em : Array.isArray(em) ? em[0] : body.email
  const ph = body.user_data?.ph
  const phoneStr = typeof ph === 'string' ? ph : Array.isArray(ph) ? ph[0] : body.phone
  const fn = body.user_data?.fn
  const firstNameStr = typeof fn === 'string' ? fn : Array.isArray(fn) ? fn[0] : body.first_name
  const ln = body.user_data?.ln
  const lastNameStr = typeof ln === 'string' ? ln : Array.isArray(ln) ? ln[0] : body.last_name

  // User credentials from integrations table (ENV fallback)
  const credentials = user ? await getUserCredentials(user.id) : {}

  // Fire GA4 / TikTok / Google only when target allows (all = every configured platform)
  const runGA4 = sendToAll || effectiveTarget === 'ga4'
  const runTikTok = sendToAll || effectiveTarget === 'tiktok'
  const runGoogle = sendToAll || effectiveTarget === 'google'

  const platformPromises: Promise<unknown>[] = []
  if (runGA4) {
    platformPromises.push(
      sendGA4Event(
        event_name,
        {
          value: body.value,
          currency: body.currency,
          order_id: body.order_id,
          event_source_url: body.event_source_url || 'https://track.itshassanahmed.com',
          client_ip_address: clientIp,
          client_user_agent: clientUserAgent,
          event_id: body.event_id,
        },
        emailStr,
        credentials.ga4MeasurementId,
        credentials.ga4ApiSecret
      )
    )
  }
  if (runTikTok) {
    platformPromises.push(
      sendTikTokEvent(
        event_name,
        {
          value: body.value,
          currency: body.currency,
          order_id: body.order_id,
          event_source_url: body.event_source_url || 'https://track.itshassanahmed.com',
          client_ip_address: clientIp,
          client_user_agent: clientUserAgent,
          event_id: body.event_id,
          ttclid: body.ttclid,
          user_data: {
            em: emailStr ? [emailStr] : [],
            ph: phoneStr ? [phoneStr] : [],
            external_id: (body.external_id || body.order_id) ? [String(body.external_id || body.order_id)] : [],
          },
          external_id: body.external_id ?? body.order_id,
          content_ids: body.content_ids,
          content_type: body.content_type,
          content_name: body.content_name,
          brand: body.brand,
        },
        request,
        credentials.tiktokPixelId,
        credentials.tiktokAccessToken
      )
    )
  }
  if (runGoogle) {
    platformPromises.push(
      sendGoogleEnhancedConversion(
        event_name,
        {
          fbp: body.fbp,
          value: body.value,
          currency: body.currency,
          order_id: body.order_id,
          event_id: body.event_id,
          user_data: {
            em: emailStr ? [emailStr] : [],
            ph: phoneStr ? [phoneStr] : [],
            fn: firstNameStr ? [firstNameStr] : [],
            ln: lastNameStr ? [lastNameStr] : [],
          },
        },
        credentials.googleConversionId,
        credentials.googleConversionLabel,
        credentials.ga4MeasurementId,
        credentials.ga4ApiSecret
      )
    )
  }

  const platformResults = await Promise.allSettled(platformPromises)
  const platformNames = [
    ...(runGA4 ? ['GA4'] : []),
    ...(runTikTok ? ['TikTok'] : []),
    ...(runGoogle ? ['Google'] : []),
  ]
  platformResults.forEach((result, index) => {
    if (result.status === 'fulfilled') {
      const name = platformNames[index]
      if (name === 'GA4') platformsFired.push('ga4')
      else if (name === 'TikTok') platformsFired.push('tiktok')
      else if (name === 'Google') platformsFired.push('google')
      debugLog(`[${name}] ✅ Sent`)
    } else {
      debugLog(`[${platformNames[index]}] ❌ Failed:`, result.reason)
    }
  })

  // Detailed logging: all platforms (no event-type restriction — all events fire to all platforms)
  console.log('[Playground] Results for:', body.event_name)
  console.log('[Meta]', metaResponse != null ? { status: metaResponse.status, body: metaResponse.body } : 'skipped (no integration or target)')
  let logIdx = 0
  if (runGA4) {
    const r = platformResults[logIdx]
    console.log('[GA4]', r?.status === 'fulfilled' ? r.value : r?.reason)
    logIdx++
  }
  if (runTikTok) {
    const r = platformResults[logIdx]
    console.log('[TikTok]', r?.status === 'fulfilled' ? r.value : r?.reason)
    logIdx++
  }
  if (runGoogle) {
    const r = platformResults[logIdx]
    console.log('[Google]', r?.status === 'fulfilled' ? r.value : r?.reason)
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
