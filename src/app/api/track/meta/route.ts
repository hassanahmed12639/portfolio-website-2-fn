import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { createClient } from '@supabase/supabase-js'
import { decrypt } from '@/lib/encrypt'
import { sendMetaCapiEvent, MetaCapiError } from '@/lib/meta-capi-sender'

type MetaUserData = {
  fbc?: string
  fbp?: string
  email?: string
  phone?: string
  first_name?: string
  last_name?: string
  city?: string
  state?: string
  zip?: string | number
  country?: string
  external_id?: string | number
  fb_login_id?: string
}

type MetaTrackBody = {
  event_name: string
  event_source_url?: string
  event_id?: string
  user_data?: MetaUserData
  custom_data?: Record<string, unknown>
  pixel_id?: string
  project_id?: string
  _client_ip?: string
  _client_user_agent?: string
}

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function POST(request: Request) {
  try {
    console.log('META_PIXEL_ID:', process.env.META_PIXEL_ID ? 'SET' : 'MISSING')
    console.log('META_ACCESS_TOKEN:', process.env.META_ACCESS_TOKEN ? 'SET' : 'MISSING')

    const body = await request.json()
    const {
      event_name,
      event_source_url,
      event_id,
      user_data = {},
      custom_data = {},
      pixel_id: bodyPixelId,
      project_id,
      _client_ip: bodyClientIp,
      _client_user_agent: bodyClientUserAgent,
    } = body as MetaTrackBody

    // Get real client IP (allow override for internal/server-to-server calls e.g. from playground)
    const forwarded = request.headers.get('x-forwarded-for')
    const ip =
      bodyClientIp ||
      (forwarded ? forwarded.split(',')[0].trim() : '') ||
      request.headers.get('x-real-ip') ||
      ''
    const userAgent = bodyClientUserAgent || request.headers.get('user-agent') || ''

    // Build user_data with every available signal
    const ud: Record<string, unknown> = {
      client_ip_address: ip,
      client_user_agent: userAgent,
    }

    // fbc — Click ID (biggest impact, +20% match quality)
    if (user_data.fbc) ud.fbc = user_data.fbc

    // fbp — Browser ID (+16% match quality)
    if (user_data.fbp) ud.fbp = user_data.fbp

    // Email — hashed (+10% match quality)
    if (user_data.email) ud.em = hash(user_data.email)

    // Phone — hashed (+2% match quality), strip non-digits
    if (user_data.phone) ud.ph = hash((user_data.phone as string).replace(/\D/g, ''))

    // Name fields — hashed
    if (user_data.first_name) ud.fn = hash(user_data.first_name)
    if (user_data.last_name) ud.ln = hash(user_data.last_name)

    // Location — hashed
    if (user_data.city) ud.ct = hash((user_data.city as string).toLowerCase().replace(/\s/g, ''))
    if (user_data.state) ud.st = hash((user_data.state as string).toLowerCase())
    if (user_data.zip) ud.zp = hash(String(user_data.zip))
    if (user_data.country) ud.country = hash((user_data.country as string).toLowerCase())

    // External ID — hashed session or user ID (+16% match quality)
    if (user_data.external_id) ud.external_id = hash(String(user_data.external_id))

    // Facebook Login ID — not hashed
    if (user_data.fb_login_id) ud.fb_login_id = user_data.fb_login_id

    const effectiveEventId = event_id || `${event_name}_${Date.now()}`
    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: event_source_url || '',
          event_id: effectiveEventId,
          action_source: 'website',
          user_data: ud,
          custom_data,
        },
      ],
      ...(process.env.NODE_ENV === 'development' && process.env.META_TEST_EVENT_CODE && {
        test_event_code: process.env.META_TEST_EVENT_CODE,
      }),
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    const supabaseAdmin =
      supabaseUrl && serviceRoleKey
        ? createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
        : null

    let pixelId: string | undefined = process.env.META_PIXEL_ID
    let accessToken: string | undefined = process.env.META_ACCESS_TOKEN
    let userId: string | null = null

    // Prefer per-user pixel credentials when pixel_id (or project_id alias) is provided
    const pixelIdentifier = (bodyPixelId || project_id)?.toString().trim()
    if (supabaseAdmin && pixelIdentifier) {
      try {
        // First, try pixels table (multi-pixel manager)
        const { data: pixelRow } = await supabaseAdmin
          .from('pixels')
          .select('pixel_id, access_token, user_id')
          .eq('pixel_id', pixelIdentifier)
          .eq('platform', 'meta')
          .eq('is_active', true)
          .maybeSingle()

        if (pixelRow?.pixel_id && pixelRow.access_token) {
          pixelId = pixelRow.pixel_id
          accessToken = pixelRow.access_token
          userId = (pixelRow as { user_id?: string }).user_id ?? null
        } else {
          // Fallback: look up Meta integration row by pixel_id (encrypted access_token)
          const { data: integration } = await supabaseAdmin
            .from('integrations')
            .select('pixel_id, access_token, user_id')
            .eq('pixel_id', pixelIdentifier)
            .eq('platform', 'meta')
            .eq('is_active', true)
            .maybeSingle()

          if (integration?.pixel_id && integration.access_token) {
            pixelId = integration.pixel_id
            accessToken = await decrypt(integration.access_token)
            userId = (integration as { user_id?: string }).user_id ?? null
          }
        }
      } catch (lookupError) {
        console.error('Meta CAPI pixel lookup error:', lookupError)
      }
    }

    if (!pixelId || !accessToken) {
      return NextResponse.json({ error: 'Meta CAPI not configured' }, { status: 500 })
    }

    // Deduplication: check deduplication_log before sending to Meta
    let isDuplicate = false
    if (supabaseAdmin) {
      const { data: existing } = await supabaseAdmin
        .from('deduplication_log')
        .select('id')
        .eq('event_id', effectiveEventId)
        .eq('pixel_id', pixelId)
        .maybeSingle()

      isDuplicate = !!existing
      console.log('Dedup check:', effectiveEventId, 'duplicate:', isDuplicate)

      if (existing) {
        console.log(`Meta CAPI: duplicate skipped | event_id: ${effectiveEventId}`)
        return NextResponse.json({ success: true, duplicate: true })
      }

      await supabaseAdmin.from('deduplication_log').insert({
        event_id: effectiveEventId,
        event_name,
        pixel_id: pixelId,
        user_id: userId ?? null,
      })
    }

    const result = await sendMetaCapiEvent({
      pixelId,
      accessToken,
      eventPayload: payload,
    })

    console.log('Meta CAPI response:', JSON.stringify(result.raw, null, 2))
    console.log('Meta CAPI payload sent:', JSON.stringify(payload, null, 2))
    console.log(
      `Meta CAPI: ${event_name} | pixel: ${pixelId} | fbc: ${!!ud.fbc} | fbp: ${!!ud.fbp}`
    )

    // Clean up old deduplication logs occasionally (1 in 100 requests)
    if (supabaseAdmin && Math.random() < 0.01) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
      await supabaseAdmin
        .from('deduplication_log')
        .delete()
        .lt('created_at', sevenDaysAgo)
    }

    return NextResponse.json({
      success: true,
      events_received: result.normalized.eventsReceived,
      fbtrace_id: result.normalized.fbtraceId,
      raw_meta_response: result.raw,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    const isMetaError = err instanceof MetaCapiError
    const responseBody = isMetaError
      ? {
          error: message,
          kind: err.kind,
          status: err.statusCode ?? 500,
          raw_meta_error: err.rawResponse,
        }
      : { error: message }

    console.error('Meta CAPI error:', JSON.stringify(responseBody))
    return NextResponse.json(responseBody, {
      status: isMetaError ? err.statusCode ?? 500 : 500,
    })
  }
}
