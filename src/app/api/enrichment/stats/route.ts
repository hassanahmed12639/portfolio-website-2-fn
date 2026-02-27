import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()

  const { data: events, error } = await supabase
    .from('events')
    .select('country, device_type, customer_type, enriched_data')
    .eq('user_id', user.id)
    .gte('created_at', startOfToday)
    .not('enriched_data', 'is', null)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const enrichedToday = (events ?? []).filter((e) => e.enriched_data != null).length
  const countries = new Set((events ?? []).map((e) => e.country).filter(Boolean))
  let newCount = 0
  let returningCount = 0
  let mobileCount = 0
  let desktopCount = 0
  let tabletCount = 0

  for (const e of events ?? []) {
    if (e.customer_type === 'new') newCount++
    else if (e.customer_type === 'returning') returningCount++
    if (e.device_type === 'mobile') mobileCount++
    else if (e.device_type === 'desktop') desktopCount++
    else if (e.device_type === 'tablet') tabletCount++
  }

  const total = events?.length ?? 0
  const deviceTotal = mobileCount + desktopCount + tabletCount

  return NextResponse.json({
    eventsEnrichedToday: enrichedToday,
    countriesDetected: countries.size,
    newCount,
    returningCount,
    mobilePct: deviceTotal > 0 ? Math.round((mobileCount / deviceTotal) * 100) : 0,
    desktopPct: deviceTotal > 0 ? Math.round((desktopCount / deviceTotal) * 100) : 0,
    tabletPct: deviceTotal > 0 ? Math.round((tabletCount / deviceTotal) * 100) : 0,
  })
}
