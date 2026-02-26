import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  let body: { platform?: string; pixel_id?: string; access_token?: string }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { platform, pixel_id, access_token } = body
  if (!platform || !pixel_id || !access_token) {
    return NextResponse.json(
      { error: 'platform, pixel_id, and access_token required' },
      { status: 400 }
    )
  }

  if (platform !== 'meta') {
    return NextResponse.json(
      { error: 'Test is only supported for Meta' },
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

  return NextResponse.json({
    success: true,
    message: 'Test event sent successfully',
  })
}
