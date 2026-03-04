import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromIso = thirtyDaysAgo.toISOString()

  const { data: events, error } = await supabase
    .from('events')
    .select('id, event_name, country, device_type, created_at')
    .eq('user_id', user.id)
    .gte('created_at', fromIso)
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = events ?? []
  const totalEvents = list.length

  const eventCounts: Record<string, number> = {}
  const countryCounts: Record<string, number> = {}
  const deviceCounts: Record<string, number> = {}
  const byDay: Record<string, number> = {}

  let oldestDate: string | null = null
  for (const e of list) {
    const d = e.created_at ? e.created_at.slice(0, 10) : ''
    if (d) {
      byDay[d] = (byDay[d] || 0) + 1
      if (!oldestDate || d < oldestDate) oldestDate = d
    }
    const name = e.event_name || 'Unknown'
    eventCounts[name] = (eventCounts[name] || 0) + 1
    const country = e.country || 'Unknown'
    countryCounts[country] = (countryCounts[country] || 0) + 1
    const device = e.device_type || 'Unknown'
    deviceCounts[device] = (deviceCounts[device] || 0) + 1
  }

  let mostCommonEvent = '—'
  let maxEvent = 0
  for (const [name, c] of Object.entries(eventCounts)) {
    if (c > maxEvent) {
      maxEvent = c
      mostCommonEvent = name
    }
  }

  let topCountry = '—'
  let maxCountry = 0
  for (const [name, c] of Object.entries(countryCounts)) {
    if (c > maxCountry) {
      maxCountry = c
      topCountry = name
    }
  }

  let topDevice = '—'
  let maxDevice = 0
  for (const [name, c] of Object.entries(deviceCounts)) {
    if (c > maxDevice) {
      maxDevice = c
      topDevice = name
    }
  }

  const { count: totalStored } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: oldestRow } = await supabase
    .from('events')
    .select('created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
    .limit(1)
    .single()

  const oldestEventDate = oldestRow?.created_at ? oldestRow.created_at.slice(0, 10) : oldestDate ?? '—'
  const days = Object.keys(byDay).sort()
  const eventsPerDay = days.map((d) => ({ date: d, count: byDay[d] }))

  return NextResponse.json({
    total_events: totalStored ?? 0,
    total_data_size_kb: Math.round(((totalStored ?? 0) * 0.5) / 1024 * 10) / 10,
    oldest_event_date: oldestEventDate,
    most_common_event: mostCommonEvent,
    top_country: topCountry,
    top_device_type: topDevice,
    events_per_day: eventsPerDay,
  })
}
