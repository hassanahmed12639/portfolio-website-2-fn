import { createClient } from '@supabase/supabase-js'
import { createHash } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

function sha256(value: string): string {
  return createHash('sha256').update(value.trim().toLowerCase()).digest('hex')
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
    value?: number
    currency?: string
    email?: string
    phone?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { api_key, event_name, value = 0, currency = 'USD', email, phone } = body
  if (!api_key || !event_name) {
    return NextResponse.json({ error: 'api_key and event_name required' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id, events_used, plan')
    .eq('api_key', api_key)
    .single()

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const eventsUsed = profile.events_used ?? 0
  const plan = (profile.plan as string) ?? 'free'
  if (plan === 'free' && eventsUsed >= 500) {
    return NextResponse.json(
      { error: 'Monthly limit reached. Please upgrade.' },
      { status: 429 }
    )
  }

  const { data: integrations } = await supabase
    .from('integrations')
    .select('platform, pixel_id, access_token')
    .eq('user_id', profile.id)
    .eq('is_active', true)

  const platformsFired: string[] = []
  const ip = getClientIp(request.headers)

  for (const integration of integrations ?? []) {
    let status: 'success' | 'failed' = 'failed'

    if (integration.platform === 'meta') {
      const pixelId = integration.pixel_id
      const accessToken = integration.access_token
      if (pixelId && accessToken) {
        const userData: Record<string, string[]> = {}
        if (email) userData.em = [sha256(email)]
        if (phone) userData.ph = [sha256(phone.replace(/\D/g, ''))]

        const payload = {
          data: [
            {
              event_name,
              event_time: Math.floor(Date.now() / 1000),
              action_source: 'website',
              user_data: userData,
              custom_data: { value, currency },
            },
          ],
        }

        const res = await fetch(
          `https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${encodeURIComponent(accessToken)}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
          }
        )
        if (res.ok) {
          status = 'success'
          platformsFired.push('meta')
        }
      }
    } else if (integration.platform === 'google') {
      console.log('[event] Google integration (not implemented):', { event_name, value, currency })
      status = 'success'
    }

    await supabase.from('events').insert({
      user_id: profile.id,
      event_name,
      platform: integration.platform,
      value,
      status,
      ip,
    })
  }

  await supabase
    .from('profiles')
    .update({ events_used: eventsUsed + 1 })
    .eq('id', profile.id)

  return NextResponse.json({ success: true, platforms_fired: platformsFired })
}
