'use client'

import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
} from 'recharts'
import { formatLocalDate } from '@/lib/utils'

type Snapshot = {
  date: string
  pixel_events: number
  capi_events: number
  signal_loss_pct: number
  ratio: number
  status: string
  suggestion: string
}

type FeedbackResponse = {
  current: Snapshot
  history: Snapshot[]
  totals: {
    pixel_events: number
    capi_events: number
    signal_loss_pct: number
    ratio: number
    status: string
    suggestion: string
  }
  last_updated: string
}

function statusClass(status: string) {
  if (status === 'Healthy') return 'bg-[var(--dash-success)]/10 text-[var(--dash-success)]'
  if (status === 'Warning') return 'bg-amber-100 text-amber-700'
  if (status === 'At risk') return 'bg-red-100 text-red-700'
  return 'bg-slate-100 text-slate-700'
}

function formatRatio(value: number) {
  return `${Math.round(value * 100)}%`
}

export default function ConversionFeedbackPage() {
  const [data, setData] = useState<FeedbackResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/conversion-feedback')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)] animate-pulse">Loading conversion feedback...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)]">Unable to load conversion feedback.</p>
      </div>
    )
  }

  const { current, history, totals, last_updated } = data
  const chartData = history.map((row) => ({
    date: row.date.slice(5),
    pixel: row.pixel_events,
    capi: row.capi_events,
  }))

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[var(--dash-text)]">Conversion Feedback</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-1 max-w-2xl">
            Compare browser-side pixel event attempts with server-side CAPI delivery. Track daily snapshots, uncover signal loss, and get practical suggestions to recover missing events.
          </p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] px-4 py-3 text-sm text-[var(--dash-muted)]">
          Updated {formatLocalDate(last_updated, { month: 'short', day: 'numeric', hour: 'numeric', minute: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5">
          <p className="text-sm text-[var(--dash-muted)]">Browser pixel attempts</p>
          <p className="text-3xl font-semibold text-[var(--dash-text)]">{current.pixel_events}</p>
          <p className="text-xs text-[var(--dash-muted)] mt-2">Unique browser event IDs observed today</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5">
          <p className="text-sm text-[var(--dash-muted)]">Server-side CAPI events</p>
          <p className="text-3xl font-semibold text-[var(--dash-text)]">{current.capi_events}</p>
          <p className="text-xs text-[var(--dash-muted)] mt-2">Unique CAPI event IDs successfully delivered today</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5">
          <p className="text-sm text-[var(--dash-muted)]">Signal coverage</p>
          <p className="text-3xl font-semibold text-[var(--dash-text)]">{formatRatio(current.ratio)}</p>
          <p className="text-xs text-[var(--dash-muted)] mt-2">CAPI events / browser pixel attempts</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5">
          <p className="text-sm text-[var(--dash-muted)]">Health</p>
          <p className={`mt-2 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${statusClass(current.status)}`}>{current.status}</p>
          <p className="text-xs text-[var(--dash-muted)] mt-2">{current.signal_loss_pct}% signal loss today</p>
        </div>
      </div>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-[var(--dash-muted)]">Trend (last 30 days)</h2>
            <p className="text-xs text-[var(--dash-muted)] mt-1">Daily browser vs server-side event coverage.</p>
          </div>
        </div>
        <div className="mt-5 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }} />
              <Line type="monotone" dataKey="pixel" stroke="#2563eb" strokeWidth={2} dot={false} name="Pixel attempts" />
              <Line type="monotone" dataKey="capi" stroke="#10b981" strokeWidth={2} dot={false} name="CAPI events" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">Daily snapshots</h2>
          <p className="text-xs text-[var(--dash-muted)]">Last 30 days</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Pixel</th>
                <th className="px-4 py-3 font-medium">CAPI</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Suggestion</th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={row.date} className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30">
                  <td className="px-4 py-3 text-[var(--dash-text)]">{formatLocalDate(row.date, { month: 'short', day: 'numeric' })}</td>
                  <td className="px-4 py-3 text-[var(--dash-text)]">{row.pixel_events}</td>
                  <td className="px-4 py-3 text-[var(--dash-text)]">{row.capi_events}</td>
                  <td className="px-4 py-3 text-[var(--dash-text)]">{formatRatio(row.ratio)}</td>
                  <td className="px-4 py-3"><span className={`rounded-full px-2 py-1 text-xs font-semibold ${statusClass(row.status)}`}>{row.status}</span></td>
                  <td className="px-4 py-3 text-[var(--dash-muted)]">{row.suggestion}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-[var(--dash-surface-hover)]/50 border border-[var(--dash-border)] p-6 text-sm text-[var(--dash-text)]">
        <p className="font-medium text-[var(--dash-text)] mb-2">How it works</p>
        <p className="text-[var(--dash-text)] mb-3">
          TrackHive compares browser-side pixel event attempts against server-side CAPI deliveries using the same event IDs. If CAPI coverage stays above 95%, your server-side tracking is healthy.
        </p>
        <ul className="list-disc pl-5 text-[var(--dash-text)] space-y-2">
          <li>Pixel attempts are browser events captured by TrackHive and used as the baseline.</li>
          <li>CAPI events are the same conversions successfully sent from your server.</li>
          <li>Coverage is calculated as CAPI events divided by pixel attempts.</li>
          <li>If coverage drops below 75%, check event_id consistency, network delivery, or integration settings.</li>
        </ul>
      </section>
    </div>
  )
}
