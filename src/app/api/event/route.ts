import { validateEvent } from '@/lib/validate-event'
import { validateEventPayload, sanitizeString, sanitizeEmail, sanitizeNumber, sanitizeUrl } from '@/lib/validate'
import { enrichEvent } from '@/lib/enrich-event'
import { calculateNextRetry } from '@/lib/retry-queue'
import { getUserCredentials } from '@/lib/get-user-credentials'
import { rateLimit } from '@/lib/rate-limit'
import { getMetaEventName } from '@/lib/meta'
import { sendGA4Event, getGA4EventName } from '@/lib/ga4'
import { sendTikTokEvent, getTikTokEventName } from '@/lib/tiktok'
import { sendGoogleEnhancedConversion } from '@/lib/google-ads'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
} as const

export async function OPTIONS() {
  return new NextResponse(null, {
    headers: CORS_HEADERS,
  })
}

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

function getClientIp(headers: Headers): string | null {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    headers.get('cf-connecting-ip') ??
    null
  )
}

function parseAttributionSignals(inputUrl?: string | null) {
  if (!inputUrl) {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      gclid: null,
      fbclid: null,
      ttclid: null,
      msclkid: null,
      landing_page: null,
    }
  }
  try {
    const u = new URL(inputUrl)
    return {
      utm_source: u.searchParams.get('utm_source'),
      utm_medium: u.searchParams.get('utm_medium'),
      utm_campaign: u.searchParams.get('utm_campaign'),
      utm_term: u.searchParams.get('utm_term'),
      utm_content: u.searchParams.get('utm_content'),
      gclid: u.searchParams.get('gclid'),
      fbclid: u.searchParams.get('fbclid'),
      ttclid: u.searchParams.get('ttclid'),
      msclkid: u.searchParams.get('msclkid'),
      landing_page: `${u.origin}${u.pathname}`,
    }
  } catch {
    return {
      utm_source: null,
      utm_medium: null,
      utm_campaign: null,
      utm_term: null,
      utm_content: null,
      gclid: null,
      fbclid: null,
      ttclid: null,
      msclkid: null,
      landing_page: null,
    }
  }
}

function inferChannelFromSignals(signals: {
  utm_source: string | null
  utm_medium: string | null
  gclid: string | null
  fbclid: string | null
  ttclid: string | null
}): string {
  const source = (signals.utm_source ?? '').toLowerCase()
  const medium = (signals.utm_medium ?? '').toLowerCase()
  if (signals.fbclid || source.includes('facebook') || source.includes('instagram')) return 'meta'
  if (signals.ttclid || source.includes('tiktok')) return 'tiktok'
  if (signals.gclid || source.includes('google') || medium === 'cpc') return 'google_ads'
  if (medium === 'organic' || source.includes('google')) return 'organic'
  if (medium === 'email') return 'email'
  return 'direct'
}

export async function POST(request: NextRequest) {
  try {
    if (!serviceRoleKey || !supabaseUrl) {
      return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500, headers: CORS_HEADERS })
    }

    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
    const rateLimitResult = rateLimit(`event:${clientIp}`, { windowMs: 60000, maxRequests: 200 })
    if (!rateLimitResult.success) {
      return NextResponse.json({ error: 'Too many requests' }, { status: 429, headers: CORS_HEADERS })
    }

    let body: {
    api_key?: string
    pixel_id?: string
    client_user_agent?: string
    user_data?: {
      em?: string[]
      ph?: string[]
      fn?: string[]
      ln?: string[]
      ct?: string[]
      st?: string[]
      zp?: string[]
      country?: string[]
      db?: string[]
      ge?: string[]
      external_id?: string[]
    }
    event_name?: string
    event_id?: string
    event_source_url?: string
    source_url?: string
    page_url?: string
    value?: number
    currency?: string
    email?: string
    phone?: string
    first_name?: string
    last_name?: string
    city?: string
    state?: string
    zip?: string
    country?: string
    date_of_birth?: string
    gender?: string
    visitor_id?: string
    fbc?: string
    fbp?: string
    fbclid?: string
    is_test?: boolean
    consent_rejected?: boolean
    order_id?: string
    external_id?: string
    user_id?: string
    referrer?: string
    ttclid?: string
    content_ids?: string[]
    content_type?: string
    content_name?: string
    brand?: string
    contents?: { id?: string; quantity?: number; item_price?: number }[]
    num_items?: number
  }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400, headers: CORS_HEADERS })
    }

    const payloadValidation = validateEventPayload(body)
    if (!payloadValidation.valid) {
      return NextResponse.json(
        { error: 'Invalid payload', details: payloadValidation.errors },
        { status: 400, headers: CORS_HEADERS }
      )
    }

    const sanitizedBody = {
      ...body,
      event_name: sanitizeString(body.event_name),
      event_source_url: sanitizeUrl(body.event_source_url),
      currency: sanitizeString(body.currency),
      value: sanitizeNumber(body.value),
      user_data: {
        em: body.user_data?.em?.map((e: string) => sanitizeEmail(e)).filter(Boolean) || [],
        ph: body.user_data?.ph?.map((p: string) => sanitizeString(p)).filter(Boolean) || [],
        fn: body.user_data?.fn?.map((f: string) => sanitizeString(f)).filter(Boolean) || [],
        ln: body.user_data?.ln?.map((l: string) => sanitizeString(l)).filter(Boolean) || [],
      },
    }
    Object.assign(body, sanitizedBody)

  const {
    api_key: bodyApiKey,
    pixel_id: pixelId,
    client_user_agent: bodyClientUserAgent,
    user_data: userData,
    event_name,
    event_id: bodyEventId,
    event_source_url: bodySourceUrl,
    value = 0,
    currency = 'USD',
    email: bodyEmail,
    phone: bodyPhone,
    first_name: bodyFirstName,
    last_name: bodyLastName,
    visitor_id,
    fbc,
    fbp,
    fbclid,
    is_test,
    consent_rejected,
    order_id: bodyOrderId,
    content_ids: bodyContentIds,
    content_type: bodyContentType,
    contents: bodyContents,
    num_items: bodyNumItems,
    user_id: bodyUserId,
    referrer: bodyReferrer,
    ttclid: bodyTtclid,
  } = body
  const event_source_url = bodySourceUrl ?? bodyReferrer ?? request.headers.get('referer') ?? undefined
  const attributionSignals = parseAttributionSignals(event_source_url)

  // Support th.js payload: extract from user_data arrays if present
  const email = bodyEmail ?? userData?.em?.[0] ?? undefined
  const phone = bodyPhone ?? userData?.ph?.[0] ?? undefined
  const first_name = bodyFirstName ?? userData?.fn?.[0] ?? undefined
  const last_name = bodyLastName ?? userData?.ln?.[0] ?? undefined
  const city = body.city ?? userData?.ct?.[0] ?? undefined
  const state = body.state ?? userData?.st?.[0] ?? undefined
  const zip = body.zip ?? userData?.zp?.[0] ?? undefined
  const userCountry = body.country ?? userData?.country?.[0] ?? undefined
  const date_of_birth = body.date_of_birth ?? userData?.db?.[0] ?? undefined
  const gender = body.gender ?? userData?.ge?.[0] ?? undefined
  const external_id = body.external_id ?? visitor_id ?? bodyUserId ?? userData?.external_id?.[0] ?? undefined
  const event_id = bodyEventId ?? `th_${Date.now()}_${Math.random().toString(36).slice(2)}`

  let api_key = bodyApiKey
  if (!api_key && pixelId) {
    const supabaseForLookup = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
    const { data: pixel } = await supabaseForLookup
      .from('pixels')
      .select('user_id')
      .eq('pixel_id', pixelId)
      .eq('is_active', true)
      .single()
    if (pixel) {
      const { data: profileWithKey } = await supabaseForLookup
        .from('profiles')
        .select('api_key')
        .eq('id', pixel.user_id)
        .single()
      if (profileWithKey?.api_key) api_key = profileWithKey.api_key
    }
  }

  if (!api_key || !event_name) {
    return NextResponse.json({ error: 'api_key (or valid pixel_id) and event_name required' }, { status: 400, headers: CORS_HEADERS })
  }

  // EMQ 0-10 scale: fbc +2, fbp +2, email +2, phone +1, name +1, location +1, fbclid +1
  let qualityScore = 0
  const qualityBreakdown: Record<string, boolean> = {}
  if (fbc) { qualityScore += 2; qualityBreakdown.fbc = true } else { qualityBreakdown.fbc = false }
  if (fbp) { qualityScore += 2; qualityBreakdown.fbp = true } else { qualityBreakdown.fbp = false }
  if (email) { qualityScore += 2; qualityBreakdown.email = true } else { qualityBreakdown.email = false }
  if (phone) { qualityScore += 1; qualityBreakdown.phone = true } else { qualityBreakdown.phone = false }
  if (first_name && last_name) { qualityScore += 1; qualityBreakdown.name = true } else { qualityBreakdown.name = false }
  if (city || state || zip || userCountry) { qualityScore += 1; qualityBreakdown.location = true } else { qualityBreakdown.location = false }
  if (fbclid) { qualityScore += 1; qualityBreakdown.fbclid = true } else { qualityBreakdown.fbclid = false }
  qualityScore = Math.min(10, qualityScore)
  let qualityLabel = 'Poor'
  if (qualityScore >= 9) qualityLabel = 'Excellent'
  else if (qualityScore >= 7) qualityLabel = 'Good'
  else if (qualityScore >= 5) qualityLabel = 'Fair'

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const supabaseService = supabase

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, events_used, events_this_month, events_reset_at, plan, is_trial, trial_expires_at')
    .eq('api_key', api_key)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401, headers: CORS_HEADERS })
  }

  const userId = profile.id

  const effectivePlan =
    profile.is_trial &&
    profile.trial_expires_at &&
    new Date(profile.trial_expires_at) > new Date()
      ? 'pro'
      : (profile.plan as string) ?? 'free'
  const limits: Record<string, number> = { free: 500, pro: 25000, agency: -1 }
  const eventsLimit = limits[effectivePlan] ?? 500

  // Use events_this_month when available, else fall back to events_used
  const profileExt = profile as { events_this_month?: number; events_used?: number; events_reset_at?: string }
  let eventsThisMonth: number =
    profileExt.events_this_month ?? profileExt.events_used ?? 0

  // Reset monthly counter if needed
  const resetAt = profile.events_reset_at
    ? new Date(profile.events_reset_at)
    : new Date(0)
  const now = new Date()
  if (
    resetAt.getTime() > 0 &&
    (now.getMonth() !== resetAt.getMonth() || now.getFullYear() !== resetAt.getFullYear())
  ) {
    await supabase
      .from('profiles')
      .update({
        events_this_month: 0,
        events_reset_at: now.toISOString(),
      } as Record<string, unknown>)
      .eq('id', userId)
    eventsThisMonth = 0
  }

  if (
    !is_test &&
    eventsLimit !== -1 &&
    eventsThisMonth >= eventsLimit
  ) {
    return NextResponse.json(
      {
        error: 'Monthly event limit reached. Please upgrade your plan.',
        limitReached: true,
        limit: eventsLimit,
        used: eventsThisMonth,
        plan: effectivePlan,
        upgrade_url: '/pricing',
      },
      { status: 429, headers: CORS_HEADERS }
    )
  }

  // Check for duplicate before processing
  if (event_id) {
    const twentyFourHoursAgoIso = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
    const { data: existingEvent } = await supabaseService
      .from('events')
      .select('id')
      .eq('user_id', userId)
      .eq('event_id', event_id)
      .gte('created_at', twentyFourHoursAgoIso)
      .single()

    if (existingEvent) {
      await supabaseService.from('events').insert({
        user_id: userId,
        event_name,
        platform: 'meta',
        status: 'deduplicated',
        event_id,
        value: value || 0,
        is_duplicate: true,
        dedup_reason: 'Duplicate event_id within 24 hours',
      })

      return NextResponse.json(
        {
          success: true,
          deduplicated: true,
          message: 'Duplicate event detected and suppressed',
        },
        { headers: CORS_HEADERS }
      )
    }
  }

  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token, tag_id, meta_test_event_code')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  const { data: privacySettings } = await supabase
    .from('privacy_settings')
    .select('*')
    .eq('user_id', profile.id)
    .single()

  const { data: headerSettings } = await supabase
    .from('header_settings')
    .select('*')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .single()

  const ipRaw =
    getClientIp(request.headers) ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    '127.0.0.1'
  const ipMode = (privacySettings?.ip_modification as string) || 'anonymized'
  let processedIp = ipRaw
  if (ipMode === 'anonymized' && ipRaw) {
    const parts = ipRaw.split('.')
    if (parts.length === 4) {
      processedIp = parts.slice(0, 3).join('.') + '.0'
    }
  } else if (ipMode === 'partial' && ipRaw) {
    const parts = ipRaw.split('.')
    if (parts.length === 4) {
      processedIp = parts.slice(0, 2).join('.') + '.x.x'
    }
  } else if (ipMode === 'full_mask') {
    processedIp = '0.0.0.0'
  }
  const ip = processedIp

  let sourceUrl = bodySourceUrl ?? request.headers.get('referer') ?? ''
  if (typeof sourceUrl !== 'string') sourceUrl = ''
  if (privacySettings?.strip_query_params && sourceUrl) {
    sourceUrl = sourceUrl.split('?')[0]
  }
  const event_source_url_final = sourceUrl || undefined

  const userAgentRaw = request.headers.get('user-agent') ?? bodyClientUserAgent ?? ''
  let processedUA = userAgentRaw
  if (privacySettings?.anonymize_user_agent && userAgentRaw) {
    const device = /mobile/i.test(userAgentRaw) ? 'Mobile' : 'Desktop'
    const os = /windows/i.test(userAgentRaw) ? 'Windows'
      : /mac/i.test(userAgentRaw) ? 'MacOS'
      : /android/i.test(userAgentRaw) ? 'Android'
      : /iphone|ipad/i.test(userAgentRaw) ? 'iOS'
      : 'Unknown'
    processedUA = `${device}/${os}`
  }
  const userAgent = processedUA

  if (privacySettings?.consent_mode && consent_rejected) {
    const validation = validateEvent({
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      email: email ?? undefined,
      phone: phone ?? undefined,
      value,
      currency,
      event_id: event_id ?? undefined,
      event_source_url: event_source_url_final,
    })
    const internalPayload = {
      event_name,
      event_time: Math.floor(Date.now() / 1000),
      value,
      currency,
      event_id: event_id ?? null,
      event_source_url: event_source_url_final ?? null,
      visitor_id: visitor_id ?? null,
    }
    for (const integration of integrations ?? []) {
      debugLog('[QS]', { qualityScore, qualityLabel, qualityBreakdown })
      await supabase.from('events').insert({
        user_id: profile.id,
        event_name,
        platform: integration.platform,
        value,
        status: 'consent_rejected',
        ip,
        event_id: event_id ?? null,
        validation_score: validation.score,
        validation_issues: validation.issues,
        validation_checks: validation.checks,
        payload: internalPayload,
        data_quality_score: qualityScore,
        data_quality_label: qualityLabel,
        data_quality_breakdown: qualityBreakdown,
      })
    }
    if (!is_test) {
      const nextCount = eventsThisMonth + 1
      await supabase
        .from('profiles')
        .update({
          events_this_month: nextCount,
          events_reset_at:
            (profile as { events_reset_at?: string }).events_reset_at ??
            now.toISOString(),
          events_used: (profile.events_used ?? 0) + 1,
        } as Record<string, unknown>)
        .eq('id', profile.id)
    }
    return NextResponse.json(
      {
        success: true,
        note: 'Event logged but not forwarded due to consent rejection',
      },
      { headers: CORS_HEADERS }
    )
  }

  const platformsFired: string[] = []

  function buildHeaders(
    platform: string,
    hs: typeof headerSettings,
    ipAddr: string,
    ua: string,
    referer: string | undefined
  ): Record<string, string> {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' }
    if (!hs) return headers
    const uaToSend = hs.override_user_agent && hs.custom_user_agent ? hs.custom_user_agent : ua
    if (hs.forward_user_agent) headers['User-Agent'] = uaToSend
    if (hs.forward_ip) headers['X-Forwarded-For'] = ipAddr
    if (hs.forward_referer && referer) headers['Referer'] = referer
    if (hs.forward_origin && referer) {
      try {
        headers['Origin'] = new URL(referer).origin
      } catch {
        // skip
      }
    }
    const custom = hs.custom_headers as Array<{ name?: string; value?: string }> | undefined
    if (Array.isArray(custom)) {
      for (const h of custom) {
        if (h?.name?.trim()) headers[h.name.trim()] = String(h.value ?? '').trim()
      }
    }
    if (platform === 'meta' && hs.meta_send_test_event_code && hs.meta_test_event_code) {
      headers['X-Test-Event-Code'] = hs.meta_test_event_code
    }
    return headers
  }

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
        visitorId: visitor_id ?? null,
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
    event_source_url: event_source_url_final,
  }
  const validation = validateEvent(eventForValidation)
  const internalPayload = {
    event_name,
    event_time: eventForValidation.event_time,
    value,
    currency,
    event_id: event_id ?? null,
    event_source_url: event_source_url_final ?? null,
    visitor_id: visitor_id ?? null,
    referrer: bodyReferrer ?? null,
    session_key: visitor_id ? `${visitor_id}:${new Date().toISOString().slice(0, 10)}` : null,
    utm_source: attributionSignals.utm_source,
    utm_medium: attributionSignals.utm_medium,
    utm_campaign: attributionSignals.utm_campaign,
    utm_term: attributionSignals.utm_term,
    utm_content: attributionSignals.utm_content,
    gclid: attributionSignals.gclid,
    fbclid: fbclid ?? attributionSignals.fbclid,
    ttclid: bodyTtclid ?? attributionSignals.ttclid,
    msclkid: attributionSignals.msclkid,
    landing_page: attributionSignals.landing_page,
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString()
  let metaStatus: 'sent' | 'failed' | 'pending' = 'pending'

  for (const integration of integrations ?? []) {
    let status: 'success' | 'failed' = 'failed'
    let originalPayload: Record<string, unknown> = {}

    if (integration.platform === 'meta') {
      // Multi-Pixel: fetch from pixels table, fallback to integration
      const { data: additionalPixels } = await supabaseService
        .from('pixels')
        .select('pixel_id, access_token, name')
        .eq('user_id', userId)
        .eq('platform', 'meta')
        .eq('is_active', true)

      const pixelsToFire: { pixel_id: string; access_token: string; name: string }[] =
        (additionalPixels || []).map((p) => ({
          pixel_id: p.pixel_id,
          access_token: p.access_token,
          name: p.name || 'Pixel',
        }))

      if (pixelsToFire.length === 0 && integration.pixel_id && integration.access_token) {
        pixelsToFire.push({
          pixel_id: integration.pixel_id,
          access_token: integration.access_token,
          name: 'Primary',
        })
      }

      if (pixelsToFire.length > 0) {
        const hashedEmail = enrichmentData?.hashes?.email_hash ?? (email ? sha256(email) : undefined)
        const hashedPhone = enrichmentData?.hashes?.phone_hash ?? (phone ? sha256(phone.replace(/\D/g, '')) : undefined)

        // fbc from fbclid when missing — Click ID gives +64% Event Match Quality
        const effectiveFbc = fbc || (fbclid ? `fb.1.${Date.now()}.${fbclid}` : undefined)

        const userData: Record<string, string | string[] | undefined> = {
          em: hashedEmail ? [hashedEmail] : undefined,
          ph: hashedPhone ? [hashedPhone] : undefined,
          fn: first_name ? [hashValue(first_name.toLowerCase().trim())] : undefined,
          ln: last_name ? [hashValue(last_name.toLowerCase().trim())] : undefined,
          ct: city ? [hashValue(city.toLowerCase().trim().replace(/\s/g, ''))] : undefined,
          st: state ? [hashValue(state.toLowerCase().trim().replace(/\s/g, ''))] : undefined,
          zp: zip ? [hashValue(zip.replace(/\D/g, ''))] : undefined,
          country: userCountry ? [hashValue(userCountry.toLowerCase().trim())] : undefined,
          db: date_of_birth ? [hashValue(date_of_birth.replace(/-/g, ''))] : undefined,
          ge: gender ? [hashValue(gender.toLowerCase().trim())] : undefined,
          client_ip_address: ip && ip !== '0.0.0.0' ? ip : undefined,
          client_user_agent: userAgent || undefined,
          fbp: fbp || undefined,
          fbc: effectiveFbc || undefined,
          external_id: external_id ? [hashValue(String(external_id))] : undefined,
        }
        Object.keys(userData).forEach((key) => {
          if (userData[key] === undefined) {
            delete userData[key]
          }
        })
        // Geo enrichment — Meta requires hashed values for Event Match Quality
        if (enrichmentData?.geo?.countryCode && !userData.country) {
          userData.country = [hashValue(enrichmentData.geo.countryCode.toLowerCase().trim())]
        }
        if (enrichmentData?.geo?.city && !userData.ct) {
          userData.ct = [hashValue(enrichmentData.geo.city.toLowerCase().trim().replace(/\s/g, ''))]
        }
        if (enrichmentData?.geo?.region && !userData.st) {
          userData.st = [hashValue(enrichmentData.geo.region.toLowerCase().trim().replace(/\s/g, ''))]
        }

        const actionSource = (headerSettings?.meta_send_action_source !== false && headerSettings?.meta_action_source)
          ? headerSettings.meta_action_source
          : 'website'
        const customData: Record<string, unknown> = {
          value,
          currency,
          order_id: bodyOrderId ?? undefined,
          content_ids: bodyContentIds ?? undefined,
          content_type: bodyContentType ?? undefined,
          contents: bodyContents ?? undefined,
          num_items: bodyNumItems ?? undefined,
        }
        const metaEventName = getMetaEventName(event_name)
        const metaEvent: Record<string, unknown> = {
          event_name: metaEventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id,
          event_source_url: event_source_url_final ?? '',
          action_source: actionSource,
          user_data: userData,
          custom_data: customData,
        }
        console.log('[Meta CAPI] user_data params:', {
          has_fbp: !!fbp,
          has_fbc: !!fbc,
          has_ip: !!ip,
          has_external_id: !!external_id,
          has_email: !!userData.em,
          has_phone: !!userData.ph,
        })

        const testEventCode = (integration as { meta_test_event_code?: string | null }).meta_test_event_code?.trim() || null
        const metaRequestBody: { data: Record<string, unknown>[]; test_event_code?: string } = { data: [metaEvent] }
        if (testEventCode) {
          metaRequestBody.test_event_code = testEventCode
        }
        originalPayload = metaRequestBody

        const metaHeaders = buildHeaders('meta', headerSettings, ip, userAgent, event_source_url_final)
        let lastMetaError: string | null = null

        for (const px of pixelsToFire) {
          const res = await fetch(
            `https://graph.facebook.com/v19.0/${px.pixel_id}/events?access_token=${encodeURIComponent(px.access_token)}`,
            {
              method: 'POST',
              headers: metaHeaders,
              body: JSON.stringify(metaRequestBody),
            }
          )
          if (res.ok) {
            status = 'success'
            metaStatus = 'sent'
            platformsFired.push('meta')
            debugLog(`[MultiPixel] Fired to ${px.name} (${px.pixel_id}): ${res.status}`)
          } else {
            const metaResponseBody = await res.text()
            lastMetaError = `${res.status}: ${metaResponseBody.slice(0, 300)}`
            debugLog(`[MultiPixel] Failed ${px.name} (${px.pixel_id}):`, lastMetaError)
          }
        }

        if (status === 'failed') {
          metaStatus = 'failed'
        }
        if (status === 'failed' && lastMetaError) {
          const nextRetry = calculateNextRetry(1)
          await supabaseService.from('retry_queue').insert({
            user_id: profile.id,
            event_id: event_id ?? null,
            payload: {
              event_name,
              email: email ?? null,
              phone: phone ?? null,
              value: value ?? null,
              currency: currency ?? 'USD',
              event_id: event_id ?? null,
              event_source_url: event_source_url_final ?? null,
              fbp: fbp ?? null,
              fbc: fbc ?? null,
              fbclid: fbclid ?? null,
            },
            platform: 'meta',
            attempt: 1,
            max_attempts: 4,
            next_retry_at: nextRetry.toISOString(),
            last_error: lastMetaError,
            status: 'pending',
          })
        }
      }
    } else if (integration.platform === 'google') {
      debugLog('[event] Google integration (not implemented):', { event_name, value, currency })
      status = 'success'
    } else if (integration.platform === 'tiktok') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const tiktokEventName = getTikTokEventName(event_name)
        const tiktokPayload = {
          pixel_code: pixelId,
          event: tiktokEventName,
          event_time: Math.floor(Date.now() / 1000),
          event_id: event_id || crypto.randomUUID(),
          user: {
            email: email ? createHash('sha256').update(email.toLowerCase().trim()).digest('hex') : undefined,
            phone_number: phone ? createHash('sha256').update(phone).digest('hex') : undefined,
            ip,
            user_agent: userAgent,
          },
          properties: {
            value: value || 0,
            currency: currency || 'USD',
          },
        }
        originalPayload = { data: [tiktokPayload] }
        const tiktokHeaders = buildHeaders('tiktok', headerSettings, ip, userAgent, event_source_url_final)
        tiktokHeaders['Access-Token'] = accessToken
        const tiktokResponse = await fetch(
          'https://business-api.tiktok.com/open_api/v1.3/pixel/track/',
          {
            method: 'POST',
            headers: tiktokHeaders,
            body: JSON.stringify({ data: [tiktokPayload] }),
          }
        )
        if (tiktokResponse.ok) {
          status = 'success'
          platformsFired.push('tiktok')
        }
      }
    } else if (integration.platform === 'snapchat') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const snapPayload = {
          pixel_id: pixelId,
          event_type: event_name === 'Purchase' ? 'PURCHASE' :
                      event_name === 'Lead' ? 'SIGN_UP' :
                      event_name === 'AddToCart' ? 'ADD_CART' :
                      event_name === 'PageView' ? 'PAGE_VIEW' : 'CUSTOM',
          event_time: Math.floor(Date.now() / 1000),
          event_tag: event_id || crypto.randomUUID(),
          hashed_data_fields: {
            email: email ? createHash('sha256').update(email.toLowerCase().trim()).digest('hex') : undefined,
            phone_number: phone ? createHash('sha256').update(phone).digest('hex') : undefined,
            ip_address: ip,
            user_agent: userAgent,
          },
          custom_data: {
            currency: currency || 'USD',
            price: value || 0,
          },
        }
        originalPayload = snapPayload
        const snapHeaders = buildHeaders('snapchat', headerSettings, ip, userAgent, event_source_url_final)
        snapHeaders['Authorization'] = `Bearer ${accessToken}`
        const snapResponse = await fetch(
          'https://tr.snapchat.com/v2/conversion',
          {
            method: 'POST',
            headers: snapHeaders,
            body: JSON.stringify(snapPayload),
          }
        )
        if (snapResponse.ok) {
          status = 'success'
          platformsFired.push('snapchat')
        }
      }
    } else if (integration.platform === 'ga4') {
      const measurementId = integration.tag_id
      const apiSecret = integration.access_token
      if (measurementId && apiSecret) {
        const ga4EventName = getGA4EventName(event_name)
        const ga4Payload = {
          client_id: visitor_id || crypto.randomUUID(),
          events: [{
            name: ga4EventName,
            params: {
              currency: currency || 'USD',
              value: value || 0,
              transaction_id: event_id || crypto.randomUUID(),
              engagement_time_msec: 100,
            },
          }],
        }
        originalPayload = ga4Payload
        const ga4Headers = buildHeaders('google', headerSettings, ip, userAgent, event_source_url_final)
        const ga4Response = await fetch(
          `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
          {
            method: 'POST',
            headers: ga4Headers,
            body: JSON.stringify(ga4Payload),
          }
        )
        if (ga4Response.ok) {
          status = 'success'
          platformsFired.push('ga4')
        }
      }
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
      fbc: fbc || null,
      fbp: fbp || null,
      fbclid: fbclid || null,
      data_quality_score: qualityScore,
      data_quality_label: qualityLabel,
      data_quality_breakdown: qualityBreakdown,
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
    insertRow.data_quality_score = qualityScore
    insertRow.data_quality_label = qualityLabel
    insertRow.data_quality_breakdown = qualityBreakdown
    debugLog('[QS]', { qualityScore, qualityLabel, qualityBreakdown })
    await supabase.from('events').insert(insertRow)
  }

  // After saving to events table, check if it's a lead event and save to leads table
  const leadEvents = ['Lead', 'CompleteRegistration', 'Subscribe', 'Contact']
  if (leadEvents.includes(event_name)) {
    console.log('[Leads] Saving lead event to leads table')
    const leadSourceUrl =
      body.event_source_url ?? body.source_url ?? body.page_url ?? request.headers.get('referer') ?? null
    const leadData = {
      user_id: userId,
      pixel_id: pixelId ?? null,
      event_id: event_id ?? `th_${Date.now()}`,
      email: email ?? null,
      phone: phone ?? null,
      first_name: first_name ?? null,
      last_name: last_name ?? null,
      event_name,
      value: value ?? 0,
      currency: currency ?? 'USD',
      source_url: leadSourceUrl,
      ip_address: ip,
      user_agent: userAgent,
      score: 'new',
      stage: 'new',
      raw_data: body,
    }
    const { error: leadError } = await supabase.from('leads').insert(leadData)
    if (leadError) {
      console.error('[Leads] Error saving lead:', leadError.message)
    } else {
      console.log('[Leads] Lead saved successfully')
    }
  }

  // Fire GA4, TikTok, Google Enhanced Conversions in parallel (user credentials from integrations, ENV fallback)
  const credentials = await getUserCredentials(profile.id)
  const platformResults = await Promise.allSettled([
    sendGA4Event(
      event_name,
      {
        value,
        currency,
        order_id: bodyOrderId,
        event_source_url: event_source_url_final,
        fbp,
        client_ip_address: ip,
        client_user_agent: userAgent,
        event_id,
      },
      email,
      credentials.ga4MeasurementId,
      credentials.ga4ApiSecret
    ),
    sendTikTokEvent(
      event_name,
      {
        value,
        currency,
        order_id: bodyOrderId,
        event_source_url: event_source_url_final,
        client_ip_address: ip,
        client_user_agent: userAgent,
        event_id,
        ttclid: body.ttclid,
        user_data: {
          em: email ? [email] : [],
          ph: phone ? [phone] : [],
          external_id: external_id ? [external_id] : [],
        },
        external_id,
        content_ids: body.content_ids,
        content_type: body.content_type,
        content_name: body.content_name,
        brand: body.brand,
      },
      request,
      credentials.tiktokPixelId,
      credentials.tiktokAccessToken
    ),
    sendGoogleEnhancedConversion(
      event_name,
      {
        fbp,
        value,
        currency,
        order_id: bodyOrderId,
        event_id,
        user_data: {
          em: email ? [email] : [],
          ph: phone ? [phone] : [],
          fn: first_name ? [first_name] : [],
          ln: last_name ? [last_name] : [],
        },
      },
      credentials.googleConversionId,
      credentials.googleConversionLabel,
      credentials.ga4MeasurementId,
      credentials.ga4ApiSecret
    ),
  ])

  const platformNames = ['GA4', 'TikTok', 'Google']
  // Detailed logging: all platforms (all events fire to all platforms)
  console.log('[Event API] Results for:', event_name)
  console.log('[Meta]', metaStatus)
  platformResults.forEach((result, index) => {
    const name = platformNames[index]
    const value = result.status === 'fulfilled' ? result.value : result.reason
    console.log(`[${name}]`, value)
    if (result.status === 'fulfilled') {
      debugLog(`[${name}] ✅`)
    } else {
      debugLog(`[${name}] ❌`, result.reason)
    }
  })

  if (event_id) {
    const ga4Ok = platformResults[0].status === 'fulfilled' && (platformResults[0].value as { success?: boolean })?.success
    const tiktokOk = platformResults[1].status === 'fulfilled' && (platformResults[1].value as { success?: boolean })?.success
    const googleOk = platformResults[2].status === 'fulfilled' && (platformResults[2].value as { success?: boolean })?.success === true
    await supabase
      .from('events')
      .update({
        meta_status: metaStatus,
        ga4_status: ga4Ok ? 'sent' : 'failed',
        tiktok_status: tiktokOk ? 'sent' : 'failed',
        google_status: googleOk ? 'sent' : 'failed',
      })
      .eq('event_id', event_id)
      .eq('user_id', profile.id)
  }

  // Unified revenue infrastructure: persist touchpoints + canonical conversion rows.
  try {
    const inferredChannel = inferChannelFromSignals({
      utm_source: attributionSignals.utm_source,
      utm_medium: attributionSignals.utm_medium,
      gclid: attributionSignals.gclid,
      fbclid: fbclid ?? attributionSignals.fbclid,
      ttclid: bodyTtclid ?? attributionSignals.ttclid,
    })
    await supabaseService.from('channel_touchpoints').insert({
      user_id: profile.id,
      conversion_event_id: event_id,
      touchpoint_at: new Date().toISOString(),
      session_key: internalPayload.session_key,
      visitor_id: visitor_id ?? null,
      event_id: event_id ?? null,
      event_name,
      channel: inferredChannel,
      source: attributionSignals.utm_source,
      medium: attributionSignals.utm_medium,
      campaign: attributionSignals.utm_campaign,
      term: attributionSignals.utm_term,
      content: attributionSignals.utm_content,
      landing_page: attributionSignals.landing_page,
      referrer: bodyReferrer ?? null,
      gclid: attributionSignals.gclid,
      fbclid: fbclid ?? attributionSignals.fbclid,
      ttclid: bodyTtclid ?? attributionSignals.ttclid,
      msclkid: attributionSignals.msclkid,
      click_id: attributionSignals.gclid ?? (fbclid ?? attributionSignals.fbclid) ?? (bodyTtclid ?? attributionSignals.ttclid) ?? null,
      raw_payload: internalPayload,
    })

    const isRevenueConversion = event_name === 'Purchase' || Number(value ?? 0) > 0
    if (isRevenueConversion && event_id) {
      await supabaseService.from('conversions_fact').upsert(
        {
          user_id: profile.id,
          event_id,
          event_name,
          conversion_at: new Date().toISOString(),
          value: Number(value ?? 0),
          currency: currency ?? 'USD',
          order_id: bodyOrderId ?? null,
          source_url: event_source_url_final ?? null,
          referrer: bodyReferrer ?? null,
          visitor_id: visitor_id ?? null,
          session_key: internalPayload.session_key,
          is_exact: true,
          payload: internalPayload,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,event_id' }
      )
    }
  } catch (infrastructureError) {
    console.error('[event] revenue persistence failed', infrastructureError)
  }

  if (!is_test) {
    const nextCount = eventsThisMonth + 1
    await supabase
      .from('profiles')
      .update({
        events_this_month: nextCount,
        events_reset_at:
          (profile as { events_reset_at?: string }).events_reset_at ??
          new Date().toISOString(),
        events_used: (profile.events_used ?? 0) + 1,
      } as Record<string, unknown>)
      .eq('id', profile.id)
  }

    return NextResponse.json({ success: true, platforms_fired: platformsFired }, { headers: CORS_HEADERS })
  } catch (error) {
    console.error('[event] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: CORS_HEADERS })
  }
}
