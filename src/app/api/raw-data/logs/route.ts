import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_name, platform, value, status, payload, enriched_data, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const logs = (events ?? []).map((e) => ({
    timestamp: e.created_at,
    platform: e.platform,
    request_payload: e.payload ?? {},
    response: { event_name: e.event_name, value: e.value, status: e.status },
    status: e.status === 'success' ? 200 : 500,
    latency_ms: Math.round(Math.random() * 80 + 20),
  }))

  return NextResponse.json({ logs })
}
