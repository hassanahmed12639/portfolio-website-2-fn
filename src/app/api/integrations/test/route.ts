import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { platform?: string; pixel_id?: string; access_token?: string; tag_id?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { platform, pixel_id, access_token, tag_id } = body

  if (platform === 'meta') {
    if (!pixel_id || !access_token) {
      return NextResponse.json(
        { error: 'pixel_id and access_token required for Meta' },
        { status: 400 }
      )
    }
    const payload = {
      data: [
        {
          event_name: 'PageView',
          event_time: Math.floor(Date.now() / 1000),
          action_source: 'website',
        },
      ],
    }
    const url = `https://graph.facebook.com/v19.0/${pixel_id}/events?access_token=${encodeURIComponent(access_token)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
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
    { error: 'Test is only supported for meta, tiktok, snapchat, ga4' },
    { status: 400 }
  )
}
