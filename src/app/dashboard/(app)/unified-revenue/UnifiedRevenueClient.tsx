'use client'

import { useEffect, useState } from 'react'

type Overview = {
  model_key: string
  period_days: number
  exact_tracked_revenue: number
  modeled_attributed_revenue: number
  delta: number
  channels: Array<{ channel: string; spend: number; attributed_revenue: number; roas: number | null }>
}

const MODELS = [
  { key: 'last_click', label: 'Last Click' },
  { key: 'first_click', label: 'First Click' },
  { key: 'linear', label: 'Linear' },
  { key: 'position_based', label: 'Position Based' },
  { key: 'time_decay', label: 'Time Decay' },
]

export default function UnifiedRevenueClient() {
  const [modelKey, setModelKey] = useState('last_click')
  const [loading, setLoading] = useState(true)
  const [running, setRunning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [overview, setOverview] = useState<Overview | null>(null)

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/revenue/unified-overview?model_key=${encodeURIComponent(modelKey)}&days=90`, {
        cache: 'no-store',
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(payload.error ?? 'Failed to load unified revenue')
        return
      }
      setOverview(payload as Overview)
    } catch {
      setError('Request failed')
    } finally {
      setLoading(false)
    }
  }

  async function recompute() {
    setRunning(true)
    setError(null)
    try {
      const res = await fetch('/api/attribution/compute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model_key: modelKey, days: 120 }),
      })
      const payload = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(payload.error ?? 'Failed to compute attribution')
        return
      }
      await load()
    } catch {
      setError('Compute request failed')
    } finally {
      setRunning(false)
    }
  }

  useEffect(() => {
    load()
  }, [modelKey])

  return (
    <div className="space-y-6">
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={modelKey}
            onChange={(e) => setModelKey(e.target.value)}
            className="px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)]"
          >
            {MODELS.map((m) => (
              <option key={m.key} value={m.key}>
                {m.label}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={recompute}
            disabled={running}
            className="px-4 py-2 rounded-lg bg-[var(--dash-primary)] text-white text-sm font-medium disabled:opacity-50"
          >
            {running ? 'Computing...' : 'Recompute Attribution'}
          </button>
        </div>
      </section>

      {error && (
        <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
          <p className="text-red-500 text-sm">{error}</p>
        </section>
      )}

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        {loading || !overview ? (
          <p className="text-[var(--dash-muted)] text-sm">Loading overview...</p>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="rounded-lg border border-[var(--dash-border)] p-3">
                <p className="text-xs text-[var(--dash-muted)]">Exact Tracked Revenue</p>
                <p className="text-lg font-semibold text-[var(--dash-text)]">${overview.exact_tracked_revenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-[var(--dash-border)] p-3">
                <p className="text-xs text-[var(--dash-muted)]">Modeled Attributed Revenue</p>
                <p className="text-lg font-semibold text-[var(--dash-text)]">${overview.modeled_attributed_revenue.toFixed(2)}</p>
              </div>
              <div className="rounded-lg border border-[var(--dash-border)] p-3">
                <p className="text-xs text-[var(--dash-muted)]">Delta</p>
                <p className="text-lg font-semibold text-[var(--dash-text)]">${overview.delta.toFixed(2)}</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[var(--dash-muted)] border-b border-[var(--dash-border)]">
                    <th className="py-2 pr-3 font-medium">Channel</th>
                    <th className="py-2 pr-3 font-medium">Spend</th>
                    <th className="py-2 pr-3 font-medium">Attributed Revenue</th>
                    <th className="py-2 pr-3 font-medium">ROAS</th>
                  </tr>
                </thead>
                <tbody>
                  {overview.channels.map((c) => (
                    <tr key={c.channel} className="border-b border-[var(--dash-border)]/50">
                      <td className="py-2 pr-3 text-[var(--dash-text)]">{c.channel}</td>
                      <td className="py-2 pr-3 text-[var(--dash-muted)]">${c.spend.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-[var(--dash-muted)]">${c.attributed_revenue.toFixed(2)}</td>
                      <td className="py-2 pr-3 text-[var(--dash-muted)]">{c.roas == null ? '-' : c.roas.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
