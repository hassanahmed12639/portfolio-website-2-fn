'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { useCallback, useEffect, useState } from 'react'

type Settings = {
  geo_enabled: boolean
  device_enabled: boolean
  customer_type_enabled: boolean
  ltv_enabled: boolean
  email_hash_enabled: boolean
  phone_hash_enabled: boolean
}

type Stats = {
  eventsEnrichedToday: number
  countriesDetected: number
  newCount: number
  returningCount: number
  mobilePct: number
  desktopPct: number
  tabletPct: number
}

type EnrichedEvent = {
  id: string
  event_name: string
  country: string | null
  city: string | null
  device_type: string | null
  customer_type: string | null
  enriched_data: {
    geo?: { country?: string; city?: string; countryCode?: string }
    device?: { type?: string }
    customer?: { type?: string }
    hashes?: { email_hash?: string | null; phone_hash?: string | null }
  } | null
  created_at: string
}

function countryCodeToFlag(code: string): string {
  if (!code || code.length !== 2) return '🌐'
  const a = 0x1f1e6
  return String.fromCodePoint(...[...code.toUpperCase()].map((c) => a + c.charCodeAt(0) - 65))
}

function enrichmentScore(data: EnrichedEvent['enriched_data']): number {
  if (!data) return 0
  let filled = 0
  const total = 6
  if (data.geo?.country) filled++
  if (data.geo?.city) filled++
  if (data.device?.type) filled++
  if (data.customer?.type) filled++
  if (data.hashes?.email_hash) filled++
  if (data.hashes?.phone_hash) filled++
  return Math.round((filled / total) * 100)
}

export default function EnrichmentClient() {
  const [settings, setSettings] = useState<Settings>({
    geo_enabled: true,
    device_enabled: true,
    customer_type_enabled: true,
    ltv_enabled: true,
    email_hash_enabled: true,
    phone_hash_enabled: true,
  })
  const [saving, setSaving] = useState(false)
  const [stats, setStats] = useState<Stats | null>(null)
  const [events, setEvents] = useState<EnrichedEvent[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      const [setRes, statsRes, eventsRes] = await Promise.all([
        fetch('/api/enrichment/settings'),
        fetch('/api/enrichment/stats'),
        fetch('/api/enrichment/events'),
      ])
      if (setRes.ok) {
        const s = await setRes.json()
        setSettings(s)
      }
      if (statsRes.ok) {
        const st = await statsRes.json()
        setStats(st)
      }
      if (eventsRes.ok) {
        const { events: ev } = await eventsRes.json()
        setEvents(ev ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const saveSettings = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/enrichment/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      if (res.ok) await load()
    } finally {
      setSaving(false)
    }
  }

  const pieData = stats
    ? [
        { name: 'New', value: stats.newCount, color: '#22c55e' },
        { name: 'Returning', value: stats.returningCount, color: '#3b82f6' },
      ].filter((d) => d.value > 0)
    : []

  const deviceData = stats
    ? [
        { name: 'Mobile', value: stats.mobilePct, fill: '#a855f7' },
        { name: 'Desktop', value: stats.desktopPct, fill: '#0ea5e9' },
        { name: 'Tablet', value: stats.tabletPct, fill: '#f59e0b' },
      ].filter((d) => d.value > 0)
    : []

  return (
    <div className="space-y-8">
      {/* Section 1 — Enrichment Settings */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Enrichment Settings</h2>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 disabled:opacity-50 text-zinc-200 text-sm font-medium transition-colors"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
        <div className="p-4 space-y-3">
          {[
            { key: 'geo_enabled' as const, label: 'Geolocation Enrichment (Country, City from IP)' },
            { key: 'device_enabled' as const, label: 'Device Detection (Mobile/Desktop/Tablet)' },
            { key: 'customer_type_enabled' as const, label: 'Customer Type (New/Returning)' },
            { key: 'ltv_enabled' as const, label: 'LTV Calculation' },
            { key: 'email_hash_enabled' as const, label: 'Email Hashing (auto hash email SHA256)' },
            { key: 'phone_hash_enabled' as const, label: 'Phone Hashing (auto hash phone SHA256)' },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between gap-4 cursor-pointer">
              <span className="text-sm text-zinc-300">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings[key]}
                onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings[key] ? 'bg-emerald-600' : 'bg-zinc-700'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      {/* Section 2 — Enrichment Stats */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Enrichment Stats</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-zinc-500 text-sm">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Events Enriched Today</p>
                <p className="text-2xl font-semibold text-white mt-1">{stats?.eventsEnrichedToday ?? 0}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Countries Detected</p>
                <p className="text-2xl font-semibold text-white mt-1">{stats?.countriesDetected ?? 0}</p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">New vs Returning</p>
                <p className="text-sm text-zinc-400 mt-1">
                  New {stats?.newCount ?? 0} / Returning {stats?.returningCount ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
                <p className="text-xs text-zinc-500 uppercase tracking-wider">Device Breakdown</p>
                <p className="text-sm text-zinc-400 mt-1">
                  Mobile {stats?.mobilePct ?? 0}% / Desktop {stats?.desktopPct ?? 0}% / Tablet {stats?.tabletPct ?? 0}%
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">New vs Returning</p>
              {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      label={({ name, value }) => `${name} ${value}`}
                    >
                      {pieData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-zinc-500 text-sm">No data today</p>
              )}
            </div>
            <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Device breakdown</p>
              {deviceData.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={deviceData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                      nameKey="name"
                      label={({ name, value }) => `${name} ${value}%`}
                    >
                      {deviceData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-zinc-500 text-sm">No data today</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Recent Enriched Events */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Recent Enriched Events</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-zinc-500 text-sm">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Country</th>
                  <th className="px-4 py-3 font-medium">City</th>
                  <th className="px-4 py-3 font-medium">Device</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Score</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-zinc-500">
                      No enriched events yet. Events will appear here once enrichment is running.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => (
                    <tr key={ev.id} className="border-b border-zinc-800/80">
                      <td className="px-4 py-3 text-zinc-300">{ev.event_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{ev.country ? countryCodeToFlag(ev.enriched_data?.geo?.countryCode ?? '') : '—'}</span>
                          <span className="text-zinc-300">{ev.country || '—'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-zinc-400">{ev.city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-zinc-400 capitalize">{ev.device_type || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {ev.customer_type ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              ev.customer_type === 'returning'
                                ? 'bg-blue-500/20 text-blue-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {ev.customer_type === 'returning' ? 'Returning' : 'New'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${
                            enrichmentScore(ev.enriched_data) >= 80
                              ? 'text-emerald-400'
                              : enrichmentScore(ev.enriched_data) >= 50
                                ? 'text-amber-400'
                                : 'text-zinc-500'
                          }`}
                        >
                          {enrichmentScore(ev.enriched_data)}%
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}
