import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const platform = searchParams.get('platform') || ''
  const eventName = searchParams.get('event_name') || ''
  const status = searchParams.get('status') || ''
  const dateRange = searchParams.get('date_range') || 'today'
  const search = searchParams.get('search') || ''

  const now = new Date()
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let fromDate: Date
  if (dateRange === '7') {
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 7)
  } else if (dateRange === '30') {
    fromDate = new Date(now)
    fromDate.setDate(fromDate.getDate() - 30)
  } else {
    fromDate = startOfToday
  }
  const fromIso = fromDate.toISOString()

  let query = supabase
    .from('events')
    .select('*')
    .eq('user_id', user.id)
    .gte('created_at', fromIso)
    .order('created_at', { ascending: false })
    .limit(500)

  if (platform && platform !== 'all') {
    query = query.eq('platform', platform.toLowerCase())
  }
  if (eventName && eventName !== 'all') {
    query = query.eq('event_name', eventName)
  }
  if (status && status !== 'all') {
    query = query.eq('status', status.toLowerCase())
  }

  const { data: events, error } = await query

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let filtered = events ?? []
  if (search.trim()) {
    const term = search.trim().toLowerCase()
    filtered = filtered.filter(
      (e) =>
        (e.event_name && String(e.event_name).toLowerCase().includes(term)) ||
        (e.ip && String(e.ip).includes(term))
    )
  }

  const startOfTodayIso = startOfToday.toISOString()
  const { count: totalToday } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startOfTodayIso)

  return NextResponse.json({
    events: filtered,
    totalToday: totalToday ?? 0,
  })
}
