import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const QUALITY_FIELDS = ['email', 'phone', 'fbp', 'fbc', 'name', 'location', 'fbclid'] as const
const FIELD_POINTS: Record<string, number> = {
  email: 20,
  phone: 15,
  fbp: 20,
  fbc: 15,
  name: 10,
  location: 10,
  fbclid: 10,
}

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const now = new Date()
  const thirtyDaysAgo = new Date(now)
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  const fromIso = thirtyDaysAgo.toISOString()

  const { data: events } = await supabase
    .from('events')
    .select('data_quality_score, data_quality_label, data_quality_breakdown, created_at, status')
    .eq('user_id', user.id)
    .gte('created_at', fromIso)
    .order('created_at', { ascending: true })

  const list = events ?? []
  const total = list.length
  const errorCount = list.filter((e) => (e as { status?: string }).status === 'error').length

  const avgScore = total
    ? Math.round(list.reduce((s, e) => s + (e.data_quality_score ?? 0), 0) / total)
    : 0

  const distribution = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 }
  list.forEach((e) => {
    const s = e.data_quality_score ?? 0
    const label = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor'
    distribution[label as keyof typeof distribution]++
  })

  const sevenDaysAgo = new Date(now)
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
  const sevenDaysIso = sevenDaysAgo.toISOString()
  const trendData: { date: string; avgScore: number; count: number }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const dayIso = d.toISOString().slice(0, 10)
    const dayEvents = list.filter(
      (e) => e.created_at >= d.toISOString() && e.created_at < next.toISOString()
    )
    const dayAvg = dayEvents.length
      ? Math.round(
          dayEvents.reduce((s, ev) => s + (ev.data_quality_score ?? 0), 0) / dayEvents.length
        )
      : 0
    trendData.push({ date: dayIso, avgScore: dayAvg, count: dayEvents.length })
  }

  const fieldCoverage: { field: string; coverage: number; points: number }[] = QUALITY_FIELDS.map(
    (field) => {
      const present = list.filter((b) => (b.data_quality_breakdown as Record<string, boolean>)?.[field])
      const coverage = total ? Math.round((present.length / total) * 100) : 0
      return { field, coverage, points: FIELD_POINTS[field] ?? 0 }
    }
  )

  const missingCount: Record<string, number> = {}
  list.forEach((e) => {
    const b = (e.data_quality_breakdown as Record<string, boolean>) ?? {}
    QUALITY_FIELDS.forEach((key) => {
      if (!b[key]) missingCount[key] = (missingCount[key] ?? 0) + 1
    })
  })
  let topMissing = ''
  let topMissingPoints = 0
  let maxMissing = 0
  for (const [key, count] of Object.entries(missingCount)) {
    if (count > maxMissing) {
      maxMissing = count
      topMissing = key
      topMissingPoints = FIELD_POINTS[key] ?? 0
    }
  }

  const dailyQuality: { date: string; Excellent: number; Good: number; Fair: number; Poor: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    d.setHours(0, 0, 0, 0)
    const next = new Date(d)
    next.setDate(next.getDate() + 1)
    const dayIso = d.toISOString().slice(0, 10)
    const dayEvents = list.filter(
      (e) => e.created_at >= d.toISOString() && e.created_at < next.toISOString()
    )
    const dayDist = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 }
    dayEvents.forEach((e) => {
      const s = e.data_quality_score ?? 0
      const label = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor'
      dayDist[label as keyof typeof dayDist]++
    })
    dailyQuality.push({ date: dayIso, ...dayDist })
  }

  return NextResponse.json({
    avgScore,
    total,
    errorCount,
    distribution,
    trendData,
    fieldCoverage,
    topMissing,
    topMissingPoints,
    dailyQuality,
  })
}
