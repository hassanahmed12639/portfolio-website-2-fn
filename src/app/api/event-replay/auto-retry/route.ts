import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function POST() {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ retried: 0, recovered: 0, error: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })
  const now = new Date().toISOString()

  const { data: events, error: fetchErr } = await supabase
    .from('events')
    .select('id, user_id, platform, original_payload, retry_count')
    .eq('status', 'failed')
    .lt('next_retry_at', now)
    .not('next_retry_at', 'is', null)
    .limit(100)

  if (fetchErr) {
    return NextResponse.json({ retried: 0, recovered: 0, error: fetchErr.message }, { status: 500 })
  }

  let recovered = 0
  for (const event of events ?? []) {
    const integrationRes = await supabase
      .from('integrations')
      .select('pixel_id, access_token')
      .eq('user_id', event.user_id)
      .eq('platform', event.platform)
      .eq('is_active', true)
      .single()

    const integration = integrationRes.data
    if (!integration) continue

    let sendOk = false
    const payload = (event.original_payload as Record<string, unknown>) ?? {}

    if (event.platform === 'meta' && integration.pixel_id && integration.access_token) {
      const res = await fetch(
        `https://graph.facebook.com/v19.0/${integration.pixel_id}/events?access_token=${encodeURIComponent(integration.access_token)}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      )
      sendOk = res.ok
    }

    if (sendOk) {
      await supabase.from('events').update({ status: 'recovered' }).eq('id', event.id)
      recovered++
    } else {
      const nextRetry = new Date(Date.now() + 30 * 60 * 1000).toISOString()
      await supabase
        .from('events')
        .update({ retry_count: (event.retry_count ?? 0) + 1, next_retry_at: nextRetry })
        .eq('id', event.id)
    }
  }

  return NextResponse.json({ retried: events?.length ?? 0, recovered })
}
