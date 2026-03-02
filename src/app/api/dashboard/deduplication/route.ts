import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: events, error } = await supabase
    .from('events')
    .select('event_name, value, is_duplicate, dedup_reason, created_at, platform')
    .eq('user_id', user.id)
    .gte('created_at', thirtyDaysAgo.toISOString())

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const total = events?.length ?? 0
  const duplicates = (events ?? []).filter((e) => e.is_duplicate)
  const totalDuplicates = duplicates.length
  const dedupRate =
    total > 0 ? Math.round(((totalDuplicates / total) * 100 + Number.EPSILON) * 10) / 10 : 0

  const moneySaved = duplicates
    .filter((e) => e.event_name === 'Purchase' && e.value)
    .reduce((sum, e) => sum + (e.value || 0), 0)

  const byEventName: Record<string, number> = {}
  for (const e of duplicates) {
    const name = e.event_name || 'Unknown'
    byEventName[name] = (byEventName[name] || 0) + 1
  }

  const dailyTrend: { date: string; duplicates: number; total: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    const dayDups = duplicates.filter((e) =>
      (e.created_at as string).startsWith(dateStr)
    ).length
    const dayTotal =
      events?.filter((e) => (e.created_at as string).startsWith(dateStr)).length ?? 0
    dailyTrend.push({
      date: dateStr,
      duplicates: dayDups,
      total: dayTotal,
    })
  }

  const { data: recentDuplicates } = await supabase
    .from('events')
    .select('event_name, value, dedup_reason, created_at, platform')
    .eq('user_id', user.id)
    .eq('is_duplicate', true)
    .order('created_at', { ascending: false })
    .limit(20)

  return NextResponse.json({
    total_events: total,
    total_duplicates: totalDuplicates,
    dedup_rate: dedupRate,
    money_saved: Math.round(moneySaved * 100) / 100,
    by_event_name: byEventName,
    daily_trend: dailyTrend,
    recent_duplicates: recentDuplicates ?? [],
    last_updated: new Date().toISOString(),
  })
}

