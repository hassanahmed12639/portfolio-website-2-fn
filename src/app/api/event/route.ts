import { validateEvent } from '@/lib/validate-event'
import { enrichEvent } from '@/lib/enrich-event'
import { calculateNextRetry } from '@/lib/retry-queue'
import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

function hashValue(value: string): string {
  return createHash('sha256').update(value).digest('hex')
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
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    api_key,
    event_name,
    event_id,
    event_source_url: bodySourceUrl,
    value = 0,
    currency = 'USD',
    email,
    phone,
    first_name,
    last_name,
    city,
    state,
    zip,
    country: userCountry,
    date_of_birth,
    gender,
    visitor_id,
    fbc,
    fbp,
    fbclid,
    is_test,
    consent_rejected,
  } = body
  const event_source_url = bodySourceUrl ?? request.headers.get('referer') ?? undefined
  if (!api_key || !event_name) {
    return NextResponse.json({ error: 'api_key and event_name required' }, { status: 400 })
  }

  let qualityScore = 0
  const qualityBreakdown: Record<string, boolean> = {}
  if (email) {
    qualityScore += 20
    qualityBreakdown.email = true
  } else {
    qualityBreakdown.email = false
  }
  if (phone) {
    qualityScore += 15
    qualityBreakdown.phone = true
  } else {
    qualityBreakdown.phone = false
  }
  if (fbp) {
    qualityScore += 20
    qualityBreakdown.fbp = true
  } else {
    qualityBreakdown.fbp = false
  }
  if (fbc) {
    qualityScore += 15
    qualityBreakdown.fbc = true
  } else {
    qualityBreakdown.fbc = false
  }
  if (first_name && last_name) {
    qualityScore += 10
    qualityBreakdown.name = true
  } else {
    qualityBreakdown.name = false
  }
  if (city || state || zip) {
    qualityScore += 10
    qualityBreakdown.location = true
  } else {
    qualityBreakdown.location = false
  }
  if (fbclid) {
    qualityScore += 10
    qualityBreakdown.fbclid = true
  } else {
    qualityBreakdown.fbclid = false
  }
  let qualityLabel = 'Poor'
  if (qualityScore >= 80) qualityLabel = 'Excellent'
  else if (qualityScore >= 60) qualityLabel = 'Good'
  else if (qualityScore >= 40) qualityLabel = 'Fair'
  else qualityLabel = 'Poor'

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const supabaseService = supabase

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, events_used, plan, is_trial, trial_expires_at')
    .eq('api_key', api_key)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const effectivePlan =
    profile.is_trial &&
    profile.trial_expires_at &&
    new Date(profile.trial_expires_at) > new Date()
      ? 'trial'
      : (profile.plan as string) ?? 'free'
  const eventsLimit =
    effectivePlan === 'agency'
      ? -1
      : effectivePlan === 'pro' || effectivePlan === 'trial'
        ? 50000
        : 500
  const eventsUsed = profile.events_used ?? 0
  if (
    !is_test &&
    eventsLimit !== -1 &&
    eventsUsed >= eventsLimit
  ) {
    return NextResponse.json(
      {
        error: 'Monthly event limit reached',
        limit: eventsLimit,
        used: eventsUsed,
        upgrade_url: 'https://track.itshassanahmed.com/dashboard/billing',
      },
      { status: 429 }
    )
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

  const ipRaw = getClientIp(request.headers) ?? request.headers.get('x-real-ip') ?? '127.0.0.1'
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

  const userAgentRaw = request.headers.get('user-agent') ?? ''
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
      console.log('[QS]', { qualityScore, qualityLabel, qualityBreakdown })
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
      await supabase
        .from('profiles')
        .update({ events_used: (profile.events_used ?? 0) + 1 })
        .eq('id', profile.id)
    }
    return NextResponse.json({
      success: true,
      note: 'Event logged but not forwarded due to consent rejection',
    })
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
  }

  const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000).toISOString()

  for (const integration of integrations ?? []) {
    let status: 'success' | 'failed' = 'failed'
    let originalPayload: Record<string, unknown> = {}

    if (integration.platform === 'meta') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const hashedEmail = enrichmentData?.hashes?.email_hash ?? (email ? sha256(email) : undefined)
        const hashedPhone = enrichmentData?.hashes?.phone_hash ?? (phone ? sha256(phone.replace(/\D/g, '')) : undefined)

        const userData: Record<string, string | string[]> = {}
        if (ip) userData.client_ip_address = ip
        if (userAgent) userData.client_user_agent = userAgent
        if (hashedEmail) userData.em = [hashedEmail]
        if (hashedPhone) userData.ph = [hashedPhone]
        if (fbc) userData.fbc = fbc
        if (fbp) userData.fbp = fbp
        if (first_name) userData.fn = [hashValue(first_name.toLowerCase().trim())]
        if (last_name) userData.ln = [hashValue(last_name.toLowerCase().trim())]
        if (city) userData.ct = [hashValue(city.toLowerCase().trim())]
        if (state) userData.st = [hashValue(state.toLowerCase().trim())]
        if (zip) userData.zp = [hashValue(zip.toLowerCase().trim())]
        if (userCountry) userData.country = [hashValue(userCountry.toLowerCase().trim())]
        if (date_of_birth) userData.db = [hashValue(date_of_birth.replace(/-/g, ''))]
        if (gender) userData.ge = [hashValue(gender.toLowerCase().trim())]
        if (enrichmentData?.geo?.countryCode && !userData.country) {
          userData.country = [enrichmentData.geo.countryCode.toLowerCase()]
        }
        if (enrichmentData?.geo?.city && !userData.ct) {
          userData.ct = [enrichmentData.geo.city.toLowerCase().replace(/\s/g, '')]
        }

        const actionSource = (headerSettings?.meta_send_action_source !== false && headerSettings?.meta_action_source)
          ? headerSettings.meta_action_source
          : 'website'
        const metaEvent: Record<string, unknown> = {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          action_source: actionSource,
          user_data: userData,
          custom_data: { value, currency },
        }
        if (event_id) metaEvent.event_id = event_id
        if (event_source_url_final) metaEvent.event_source_url = event_source_url_final

        const testEventCode = (integration as { meta_test_event_code?: string | null }).meta_test_event_code?.trim() || null
        const metaRequestBody: { data: Record<string, unknown>[]; test_event_code?: string } = { data: [metaEvent] }
        if (testEventCode) {
          metaRequestBody.test_event_code = testEventCode
        }
        originalPayload = metaRequestBody

        const metaHeaders = buildHeaders('meta', headerSettings, ip, userAgent, event_source_url_final)
        const res = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: 'POST',
            headers: metaHeaders,
            body: JSON.stringify(metaRequestBody),
          }
        )
        if (res.ok) {
          status = 'success'
          platformsFired.push('meta')
        } else {
          const metaResponseBody = await res.text()
          const metaErrorMessage = `${res.status}: ${metaResponseBody.slice(0, 300)}`
          console.log('[Meta CAPI] Failed:', metaErrorMessage)
          if (status === 'failed' && integration.platform === 'meta') {
            const userId = profile.id
            console.log('[RetryQueue] Attempting to add to queue for user:', userId)
            const nextRetry = calculateNextRetry(1)
            console.log('[RetryQueue] Next retry at:', nextRetry)

            const { error: retryError } = await supabaseService.from('retry_queue').insert({
              user_id: userId,
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
              last_error: metaErrorMessage ?? 'Meta CAPI call failed',
              status: 'pending',
            })

            if (retryError) {
              console.error('[RetryQueue] Insert error:', retryError)
            } else {
              console.log('[RetryQueue] Successfully added to queue')
            }
          }
        }
      }
    } else if (integration.platform === 'google') {
      console.log('[event] Google integration (not implemented):', { event_name, value, currency })
      status = 'success'
    } else if (integration.platform === 'tiktok') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const tiktokPayload = {
          pixel_code: pixelId,
          event: event_name === 'Purchase' ? 'CompletePayment' :
                 event_name === 'Lead' ? 'SubmitForm' :
                 event_name === 'AddToCart' ? 'AddToCart' :
                 event_name === 'ViewContent' ? 'ViewContent' :
                 event_name === 'PageView' ? 'Pageview' : event_name,
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
        const ga4Payload = {
          client_id: visitor_id || crypto.randomUUID(),
          events: [{
            name: event_name === 'Purchase' ? 'purchase' :
                  event_name === 'Lead' ? 'generate_lead' :
                  event_name === 'AddToCart' ? 'add_to_cart' :
                  event_name === 'PageView' ? 'page_view' :
                  event_name === 'ViewContent' ? 'view_item' :
                  event_name.toLowerCase(),
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
    console.log('[QS]', { qualityScore, qualityLabel, qualityBreakdown })
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
