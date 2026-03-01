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
      <h1 className="text-xl font-semibold text-white mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Events used</p>
          <p className="text-2xl font-semibold text-white">
            {limit != null ? `${eventsUsed} / ${limit}` : eventsUsed}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Current plan</p>
          <p className="text-2xl font-semibold text-white capitalize">{plan}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Events today</p>
          <p className="text-2xl font-semibold text-white">{eventsToday ?? 0}</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 mb-8">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Data Quality (this month)</h2>
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="text-3xl font-semibold text-white">{avgScore}/100</p>
            <p className="text-sm text-zinc-400">{qualityLabel}</p>
          </div>
          <div className="flex-1 min-w-[200px] flex h-6 rounded overflow-hidden bg-zinc-800">
            {(() => {
              const total = qualityData?.length || 1
              return (
                <>
                  <span
                    className="bg-emerald-600 transition-all"
                    style={{ width: `${(distribution.Excellent / total) * 100}%` }}
                    title={`Excellent: ${distribution.Excellent}`}
                  />
                  <span
                    className="bg-blue-600 transition-all"
                    style={{ width: `${(distribution.Good / total) * 100}%` }}
                    title={`Good: ${distribution.Good}`}
                  />
                  <span
                    className="bg-amber-500 transition-all"
                    style={{ width: `${(distribution.Fair / total) * 100}%` }}
                    title={`Fair: ${distribution.Fair}`}
                  />
                  <span
                    className="bg-red-600 transition-all"
                    style={{ width: `${(distribution.Poor / total) * 100}%` }}
                    title={`Poor: ${distribution.Poor}`}
                  />
                </>
              )
            })()}
          </div>
          <div className="text-sm text-zinc-400">
            Excellent: {distribution.Excellent} · Good: {distribution.Good} · Fair: {distribution.Fair} · Poor: {distribution.Poor}
          </div>
        </div>
        {topMissingField && (
          <p className="text-sm text-zinc-400 mt-3">
            Top missing field: <span className="text-amber-400 font-medium">{topMissingField}</span> (+{topMissingPoints} pts average gain)
          </p>
        )}
        <MatchRateSummary avgScore={avgScore} />
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
          Recent events
        </h2>
        {recentEvents?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {recentEvents.map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/80 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-white">{row.event_name}</td>
                    <td className="px-4 py-3 text-zinc-300 capitalize">{row.platform}</td>
                    <td className="px-4 py-3 text-zinc-300">{row.value}</td>
                    <td className="px-4 py-3">
                      <span
                        className={
                          row.status === 'success'
                            ? 'text-emerald-400'
                            : 'text-amber-400'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-zinc-500">
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
          <p className="px-4 py-8 text-zinc-500 text-center">
            No events yet. Add the snippet to your site to start tracking.
          </p>
        )}
      </div>
    </div>
  )
}
