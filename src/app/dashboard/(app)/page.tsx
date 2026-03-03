import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import MatchRateSummary from './MatchRateSummary'

const QUALITY_FIELD_POINTS: Record<string, number> = {
  email: 20,
  phone: 15,
  fbp: 20,
  fbc: 15,
  name: 10,
  location: 10,
  fbclid: 10,
}
const QUALITY_FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  fbp: 'fbp',
  fbc: 'fbc',
  name: 'Name',
  location: 'Location',
  fbclid: 'fbclid',
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('events_used, plan')
    .eq('id', user.id)
    .single()

  const eventsUsed = profile?.events_used ?? 0
  const plan = (profile?.plan as string) ?? 'free'
  const limit = plan === 'free' ? 500 : undefined

  const { data: recentEvents } = await supabase
    .from('events')
    .select('event_name, platform, value, status, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(10)

  const startOfToday = new Date()
  startOfToday.setHours(0, 0, 0, 0)
  const startIso = startOfToday.toISOString()

  const startOfMonth = new Date(startOfToday.getFullYear(), startOfToday.getMonth(), 1)
  const startOfMonthIso = startOfMonth.toISOString()

  const { count: eventsToday } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startIso)

  const { data: qualityData } = await supabase
    .from('events')
    .select('data_quality_score, data_quality_label, data_quality_breakdown')
    .eq('user_id', user.id)
    .gte('created_at', startOfMonthIso)

  let avgScore = 0
  let qualityLabel = 'Poor'
  const distribution = { Excellent: 0, Good: 0, Fair: 0, Poor: 0 }
  let topMissingField = ''
  let topMissingPoints = 0
  if (qualityData?.length) {
    const sum = qualityData.reduce((s, e) => s + (e.data_quality_score ?? 0), 0)
    avgScore = Math.round(sum / qualityData.length)
    if (avgScore >= 80) qualityLabel = 'Excellent'
    else if (avgScore >= 60) qualityLabel = 'Good'
    else if (avgScore >= 40) qualityLabel = 'Fair'
    else qualityLabel = 'Poor'
    qualityData.forEach((e) => {
      const s = e.data_quality_score ?? 0
      const l = s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Fair' : 'Poor'
      distribution[l as keyof typeof distribution]++
    })
    const missingCount: Record<string, number> = {}
    qualityData.forEach((e) => {
      const b = (e.data_quality_breakdown as Record<string, boolean>) ?? {}
      for (const key of Object.keys(QUALITY_FIELD_POINTS)) {
        if (!b[key]) missingCount[key] = (missingCount[key] ?? 0) + 1
      }
    })
    let maxMissing = 0
    for (const [key, count] of Object.entries(missingCount)) {
      if (count > maxMissing) {
        maxMissing = count
        topMissingField = QUALITY_FIELD_LABELS[key] ?? key
        topMissingPoints = QUALITY_FIELD_POINTS[key] ?? 0
      }
    }
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-semibold text-[var(--dash-text)]">Overview</h1>
        <Link
          href="/dashboard/live"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--dash-surface)] hover:bg-[var(--dash-bg)] text-[var(--dash-text)] hover:text-[var(--dash-text)] text-sm font-medium transition-colors border border-[var(--dash-border)] shadow-sm"
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--dash-danger)] opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--dash-danger)]" />
          </span>
          LIVE
          <span className="text-[var(--dash-muted)]">View real-time event stream →</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-sm p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Events used</p>
          <p className="text-2xl font-semibold text-[var(--dash-text)]">
            {limit != null ? `${eventsUsed} / ${limit}` : eventsUsed}
          </p>
        </div>
        <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-sm p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Current plan</p>
          <p className="text-2xl font-semibold text-[var(--dash-text)] capitalize">{plan}</p>
        </div>
        <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-sm p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Events today</p>
          <p className="text-2xl font-semibold text-[var(--dash-text)]">{eventsToday ?? 0}</p>
        </div>
      </div>

      <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-sm p-4 mb-8">
        <h2 className="text-sm font-medium text-[var(--dash-text)] mb-3">Data Quality (this month)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-semibold text-[var(--dash-text)]">{avgScore}/100</p>
            <p className="text-sm text-[var(--dash-muted)]">{qualityLabel}</p>
          </div>
          <div className="flex-1 min-w-[200px] flex h-6 rounded overflow-hidden bg-[var(--dash-surface-hover)]">
            {(() => {
              const total = qualityData?.length || 1
              return (
                <>
                  <span
                    className="bg-[var(--dash-success)] transition-all"
                    style={{ width: `${(distribution.Excellent / total) * 100}%` }}
                    title={`Excellent: ${distribution.Excellent}`}
                  />
                  <span
                    className="bg-[var(--dash-success)] transition-all"
                    style={{ width: `${(distribution.Good / total) * 100}%` }}
                    title={`Good: ${distribution.Good}`}
                  />
                  <span
                    className="bg-[var(--dash-warning)] transition-all"
                    style={{ width: `${(distribution.Fair / total) * 100}%` }}
                    title={`Fair: ${distribution.Fair}`}
                  />
                  <span
                    className="bg-[var(--dash-danger)] transition-all"
                    style={{ width: `${(distribution.Poor / total) * 100}%` }}
                    title={`Poor: ${distribution.Poor}`}
                  />
                </>
              )
            })()}
          </div>
          <div className="text-sm text-[var(--dash-muted)]">
            Excellent: {distribution.Excellent} · Good: {distribution.Good} · Fair: {distribution.Fair} · Poor: {distribution.Poor}
          </div>
        </div>
        {topMissingField && (
          <p className="text-sm text-[var(--dash-muted)] mt-3">
            Top missing field: <span className="text-[var(--dash-warning)] font-medium">{topMissingField}</span> (+{topMissingPoints} pts average gain)
          </p>
        )}
        <MatchRateSummary avgScore={avgScore} />
      </div>

      <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-sm overflow-hidden">
        <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-text)]">
          Recent events
        </h2>
        {recentEvents?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((row, i) => (
                  <tr key={i} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-bg)]">
                    <td className="px-4 py-3 text-[var(--dash-text)]">{row.event_name}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)] capitalize">{row.platform}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">{row.value}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === 'success'
                            ? 'text-[var(--dash-success)]'
                            : 'text-[var(--dash-warning)]'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {row.created_at
                        ? new Date(row.created_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-4 py-8 text-[var(--dash-muted)] text-center">
            No events yet. Add the snippet to your site to start tracking.
          </p>
        )}
      </div>
    </div>
  )
}




