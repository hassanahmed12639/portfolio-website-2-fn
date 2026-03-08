import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()

  const { data: eventsToday, error: errToday } = await supabase
    .from('events')
    .select('country, device_type, customer_type, enriched_data')
    .eq('user_id', user.id)
    .gte('created_at', startOfToday)
    .not('enriched_data', 'is', null)

  if (errToday) {
    return NextResponse.json({ error: errToday.message }, { status: 500 })
  }

  let events = eventsToday ?? []
  if (events.length === 0) {
    const { data: eventsWeek, error: errWeek } = await supabase
      .from('events')
      .select('country, device_type, customer_type, enriched_data')
      .eq('user_id', user.id)
      .gte('created_at', sevenDaysAgo)
      .not('enriched_data', 'is', null)
    if (!errWeek && eventsWeek?.length) {
      events = eventsWeek
    }
  }

  const enrichedToday = events.filter((e) => e.enriched_data != null).length
  const usedFallback = (eventsToday ?? []).length === 0 && events.length > 0
  const countries = new Set(events.map((e) => e.country).filter(Boolean))
  let newCount = 0
  let returningCount = 0
  let mobileCount = 0
  let desktopCount = 0
  let tabletCount = 0

  for (const e of events) {
    if (e.customer_type === 'new') newCount++
    else if (e.customer_type === 'returning') returningCount++
    if (e.device_type === 'mobile') mobileCount++
    else if (e.device_type === 'desktop') desktopCount++
    else if (e.device_type === 'tablet') tabletCount++
  }

  const total = events.length
  const deviceTotal = mobileCount + desktopCount + tabletCount

  return NextResponse.json({
    eventsEnrichedToday: enrichedToday,
    countriesDetected: countries.size,
    newCount,
    returningCount,
    mobilePct: deviceTotal > 0 ? Math.round((mobileCount / deviceTotal) * 100) : 0,
    desktopPct: deviceTotal > 0 ? Math.round((desktopCount / deviceTotal) * 100) : 0,
    tabletPct: deviceTotal > 0 ? Math.round((tabletCount / deviceTotal) * 100) : 0,
    period: usedFallback ? 'last7days' as const : 'today' as const,
  })
}
