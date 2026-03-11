import { NextResponse } from 'next/server'
import crypto from 'crypto'

function hash(value: string): string {
  return crypto.createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
}

export async function POST(request: Request) {
  try {
    console.log('META_PIXEL_ID:', process.env.META_PIXEL_ID ? 'SET' : 'MISSING')
    console.log('META_ACCESS_TOKEN:', process.env.META_ACCESS_TOKEN ? 'SET' : 'MISSING')

    const body = await request.json()
    const { event_name, event_source_url, event_id, user_data = {}, custom_data = {} } = body

    // Get real client IP
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0].trim() : request.headers.get('x-real-ip') || ''
    const userAgent = request.headers.get('user-agent') || ''

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

    const payload = {
      data: [
        {
          event_name,
          event_time: Math.floor(Date.now() / 1000),
          event_source_url: event_source_url || '',
          event_id: event_id || `${event_name}_${Date.now()}`,
          action_source: 'website',
          user_data: ud,
          custom_data,
        },
      ],
      ...(process.env.META_TEST_EVENT_CODE && {
        test_event_code: process.env.META_TEST_EVENT_CODE,
      }),
    }

    const pixelId = process.env.META_PIXEL_ID
    const accessToken = process.env.META_ACCESS_TOKEN

    if (!pixelId || !accessToken) {
      return NextResponse.json({ error: 'Meta CAPI not configured' }, { status: 500 })
    }

    const res = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }
    )

    const data = await res.json()
    console.log('Meta CAPI response:', JSON.stringify(data, null, 2))
    console.log('Meta CAPI payload sent:', JSON.stringify(payload, null, 2))

    if (data.error) throw new Error(data.error.message)

    console.log(`Meta CAPI: ${event_name} sent | fbc: ${!!ud.fbc} | fbp: ${!!ud.fbp} | em: ${!!ud.em} | eventId: ${event_id}`)

    return NextResponse.json({ success: true, events_received: data.events_received })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('Meta CAPI error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
