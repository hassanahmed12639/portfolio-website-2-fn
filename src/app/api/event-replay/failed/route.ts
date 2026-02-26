import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_name, platform, value, status, created_at, retry_count, next_retry_at, original_payload, validation_issues')
    .eq('user_id', user.id)
    .in('status', ['failed', 'recovered'])
    .order('created_at', { ascending: false })
    .limit(500)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const failed = (events ?? []).filter((e) => e.status === 'failed')
  const recovered = (events ?? []).filter((e) => e.status === 'recovered')
  const totalFailed = failed.length
  const totalRecovered = recovered.length
  const recoveryRate = totalFailed + totalRecovered > 0
    ? Math.round((totalRecovered / (totalFailed + totalRecovered)) * 100)
    : 0
  const revenueAtRisk = failed
    .filter((e) => e.event_name === 'Purchase' && e.value != null)
    .reduce((sum, e) => sum + Number(e.value), 0)

  return NextResponse.json({
    events: events ?? [],
    summary: {
      totalFailed,
      totalRecovered,
      recoveryRate,
      revenueAtRisk,
    },
  })
}
