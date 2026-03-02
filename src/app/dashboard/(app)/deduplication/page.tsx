'use client'

import { useEffect, useState } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

type DeduplicationResponse = {
  total_events: number
  total_duplicates: number
  dedup_rate: number
  money_saved: number
  by_event_name: Record<string, number>
  daily_trend: { date: string; duplicates: number; total: number }[]
  recent_duplicates: {
    event_name: string
    value: number | null
    dedup_reason: string | null
    created_at: string
    platform: string
  }[]
  last_updated: string
}

export default function DeduplicationPage() {
  const [data, setData] = useState<DeduplicationResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/deduplication')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-zinc-400 animate-pulse">Loading deduplication data...</p>
      </div>
    )
  }

  const barData = data?.by_event_name
    ? Object.entries(data.by_event_name).map(([name, count]) => ({ name, count }))
    : []

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-xl font-semibold text-white">Event Deduplication</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Total Events</p>
          <p className="text-2xl font-semibold text-white">{data?.total_events ?? 0}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Duplicates Caught</p>
          <p className="text-2xl font-semibold text-emerald-400">{data?.total_duplicates ?? 0}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Dedup Rate</p>
          <p className="text-2xl font-semibold text-white">{data?.dedup_rate ?? 0}%</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Ad Spend Saved</p>
          <p className="text-2xl font-semibold text-white">
            ${(data?.money_saved ?? 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Duplicates by Event Name</h2>
        <div className="h-64">
          {barData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="count" fill="#22c55e" radius={[4, 4, 0, 0]} name="Duplicates" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-sm flex items-center h-full">No duplicate events by type yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Daily Deduplication Trend (last 7 days)</h2>
        <div className="h-64">
          {(data?.daily_trend?.length ?? 0) > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data?.daily_trend ?? []} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#a1a1aa', fontSize: 11 }}
                  tickFormatter={(v) => (v || '').slice(5)}
                />
                <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  labelFormatter={(label) => label}
                />
                <Line
                  type="monotone"
                  dataKey="duplicates"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={{ fill: '#22c55e' }}
                  name="Duplicates"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-zinc-500 text-sm flex items-center h-full">No trend data yet.</p>
          )}
        </div>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
          Recent Duplicate Events
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
                <th className="px-4 py-3 font-medium">Time</th>
                <th className="px-4 py-3 font-medium">Event Name</th>
                <th className="px-4 py-3 font-medium">Value</th>
                <th className="px-4 py-3 font-medium">Reason</th>
              </tr>
            </thead>
            <tbody>
              {(data?.recent_duplicates?.length ?? 0) === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-zinc-500">
                    No recent duplicates.
                  </td>
                </tr>
              ) : (
                (data?.recent_duplicates ?? []).map((row, i) => (
                  <tr key={i} className="border-b border-zinc-800/80 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-400">
                      {row.created_at ? new Date(row.created_at).toLocaleString() : '—'}
                    </td>
                    <td className="px-4 py-3 text-white">{row.event_name ?? '—'}</td>
                    <td className="px-4 py-3 text-zinc-300">{row.value != null ? row.value : '—'}</td>
                    <td className="px-4 py-3 text-zinc-400">{row.dedup_reason ?? '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Deduplication Settings</h2>
        <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4 space-y-2 text-sm text-zinc-300">
          <p>
            <span className="text-emerald-400">Deduplication: Active</span>
          </p>
          <p>
            <span className="text-zinc-400">Window:</span> 24 hours
          </p>
          <p>
            <span className="text-zinc-400">Method:</span> event_id matching
          </p>
          <p>
            <span className="text-zinc-400">Platforms:</span> Meta CAPI
          </p>
          <p className="text-zinc-500 pt-2">
            All events with a duplicate event_id within 24 hours are automatically suppressed and not sent to Meta.
          </p>
        </div>
      </section>
    </div>
  )
}
