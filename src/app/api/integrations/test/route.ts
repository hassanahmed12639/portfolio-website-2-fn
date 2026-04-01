import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const supabase = await await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    let body: {
      platform?: string
      pixel_id?: string
      access_token?: string
      tag_id?: string
      meta_test_event_code?: string
      conversion_label?: string
    }

    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const { platform, pixel_id, access_token, tag_id, meta_test_event_code, conversion_label } = body

  if (platform === 'meta') {
    if (!pixel_id || !access_token) {
      return NextResponse.json(
        { error: 'pixel_id and access_token required for Meta' },
        { status: 400 }
      )
    }
    const clientIp = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      ?? request.headers.get('x-real-ip')
      ?? '127.0.0.1'
    const clientUa = request.headers.get('user-agent') ?? 'TrackHive-Test/1.0'
    const testEventCode = meta_test_event_code?.trim() || undefined

    const metaPayload: Record<string, unknown> = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
          event_source_url: 'https://test.com',
          user_data: {
            client_ip_address: clientIp,
            client_user_agent: clientUa,
          },
        },
      ],
      access_token: access_token,
    }
    if (testEventCode) {
      metaPayload.test_event_code = testEventCode
    }

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${pixel_id}/events`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metaPayload),
      }
    )
    if (!res.ok) {
      const raw = await res.text()
      let errorMessage = 'Test event failed'
      try {
        const parsed = JSON.parse(raw)
        const code = parsed?.error?.code
        const msg = parsed?.error?.message ?? parsed?.error?.error_user_msg
        const msgStr = typeof msg === 'string' ? msg : ''
        if (code === 100 || (msgStr.includes('(#100)') && msgStr.toLowerCase().includes('permission'))) {
          errorMessage =
            'Generate a new token: Events Manager → your Pixel → Settings → Generate Access Token (use the token from there, not from other tools).'
        } else if (msgStr) {
          errorMessage = msgStr
        }
      } catch {
        if (raw) errorMessage = raw.slice(0, 200)
      }
      return NextResponse.json(
        { error: errorMessage, details: raw },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true, message: 'Test event sent successfully' })
  }

  if (platform === 'tiktok') {
    if (!pixel_id || !access_token) {
      return NextResponse.json(
        { error: 'pixel_id and access_token required for TikTok' },
        { status: 400 }
      )
    }
    const tiktokPayload = {
      pixel_code: pixel_id,
      event: 'Pageview',
      event_time: Math.floor(Date.now() / 1000),
      event_id: crypto.randomUUID(),
      user: { ip: '127.0.0.1', user_agent: 'TrackHive-Test' },
      properties: { value: 0, currency: 'USD' },
    }
    const res = await fetch('https://business-api.tiktok.com/open_api/v1.3/pixel/track/', {
      method: 'POST',
      headers: {
        'Access-Token': access_token,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ data: [tiktokPayload] }),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Test event failed', details: text },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true, message: 'Test event sent successfully' })
  }

  if (platform === 'snapchat') {
    if (!pixel_id || !access_token) {
      return NextResponse.json(
        { error: 'pixel_id and access_token required for Snapchat' },
        { status: 400 }
      )
    }
    const snapPayload = {
      pixel_id,
      event_type: 'PAGE_VIEW',
      event_time: Math.floor(Date.now() / 1000),
      event_tag: crypto.randomUUID(),
      hashed_data_fields: { ip_address: '127.0.0.1', user_agent: 'TrackHive-Test' },
      custom_data: { currency: 'USD', price: 0 },
    }
    const res = await fetch('https://tr.snapchat.com/v2/conversion', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${access_token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(snapPayload),
    })
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Test event failed', details: text },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true, message: 'Test event sent successfully' })
  }

  if (platform === 'google') {
    if (!tag_id || !conversion_label) {
      return NextResponse.json(
        { error: 'Conversion ID (tag_id) and Conversion Label required for Google Enhanced' },
        { status: 400 }
      )
    }
    const measurementId = process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID
    const apiSecret = process.env.GA4_API_SECRET
    if (!measurementId || !apiSecret) {
      return NextResponse.json(
        { error: 'GA4 credentials (NEXT_PUBLIC_GA4_MEASUREMENT_ID, GA4_API_SECRET) required to send Google Enhanced test' },
        { status: 400 }
      )
    }
    const conversionId = tag_id
    const googlePayload = {
      client_id: `th_test_${Date.now()}`,
      events: [
        {
          name: 'conversion',
          params: {
            send_to: `${conversionId}/${conversion_label}`,
            value: 0,
            currency: 'USD',
            transaction_id: `th_test_${Date.now()}`,
          },
        },
      ],
    }
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${measurementId}&api_secret=${apiSecret}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(googlePayload),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Google Enhanced test failed', details: text },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true, message: 'Test conversion sent successfully' })
  }

  if (platform === 'ga4') {
    if (!tag_id || !access_token) {
      return NextResponse.json(
        { error: 'tag_id (measurement ID) and access_token (API secret) required for GA4' },
        { status: 400 }
      )
    }
    const ga4Payload = {
      client_id: crypto.randomUUID(),
      events: [{
        name: 'page_view',
        params: {
          currency: 'USD',
          value: 0,
          transaction_id: crypto.randomUUID(),
          engagement_time_msec: 100,
        },
      }],
    }
    const res = await fetch(
      `https://www.google-analytics.com/mp/collect?measurement_id=${tag_id}&api_secret=${access_token}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ga4Payload),
      }
    )
    if (!res.ok) {
      const text = await res.text()
      return NextResponse.json(
        { error: 'Test event failed', details: text },
        { status: 502 }
      )
    }
    return NextResponse.json({ success: true, message: 'Test event sent successfully' })
  }

    return NextResponse.json(
      { error: 'Test is only supported for meta, tiktok, snapchat, google, ga4' },
      { status: 400 }
    )
  } catch (error) {
    console.error('[integrations/test] Unexpected error', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

