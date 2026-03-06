import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { rateLimit } from '@/lib/rate-limit'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rateLimitResult = rateLimit(`admin:${ip}`, { windowMs: 60000, maxRequests: 30 })
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
  const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString()
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

  const [
    { count: totalEvents },
    { count: eventsToday },
    { count: eventsThisWeek },
    { count: eventsThisMonth },
    { data: allEvents },
    { data: platformCounts },
    { data: eventNameCounts },
  ] = await Promise.all([
    admin.from('events').select('id', { count: 'exact', head: true }),
    admin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', todayStart),
    admin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', weekStart),
    admin.from('events').select('id', { count: 'exact', head: true }).gte('created_at', monthStart),
    admin
      .from('events')
      .select('platform, event_name, created_at')
      .gte('created_at', new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()),
    admin.from('events').select('platform'),
    admin.from('events').select('event_name'),
  ])

  const byPlatform: Record<string, number> = {}
  platformCounts?.forEach((r) => {
    const p = (r.platform || 'unknown') as string
    byPlatform[p] = (byPlatform[p] || 0) + 1
  })

  const byEventName: Record<string, number> = {}
  eventNameCounts?.forEach((r) => {
    const n = (r.event_name || 'unknown') as string
    byEventName[n] = (byEventName[n] || 0) + 1
  })

  const dailyEvents: Record<string, number> = {}
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
  allEvents?.forEach((e) => {
    const d = new Date(e.created_at)
    if (d > fourteenDaysAgo) {
      const day = e.created_at.split('T')[0]
      dailyEvents[day] = (dailyEvents[day] || 0) + 1
    }
  })

  return NextResponse.json({
    totalEvents: totalEvents || 0,
    eventsToday: eventsToday || 0,
    eventsThisWeek: eventsThisWeek || 0,
    eventsThisMonth: eventsThisMonth || 0,
    byPlatform,
    byEventName,
    dailyEvents,
  })
}
