import { createClient } from '@/lib/supabase/server'

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

  const { count: eventsToday } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .gte('created_at', startIso)

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-6">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
