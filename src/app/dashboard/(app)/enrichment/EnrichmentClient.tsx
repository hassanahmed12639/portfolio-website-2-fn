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
  period?: 'today' | 'last7days'
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
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">Enrichment Settings</h2>
          <button
            type="button"
            onClick={saveSettings}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] disabled:opacity-50 text-[var(--dash-text)] text-sm font-medium transition-colors"
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
              <span className="text-sm text-[var(--dash-muted)]">{label}</span>
              <button
                type="button"
                role="switch"
                aria-checked={settings[key]}
                onClick={() => setSettings((s) => ({ ...s, [key]: !s[key] }))}
                className={`relative w-10 h-5 rounded-full transition-colors ${settings[key] ? 'bg-[var(--dash-success)]' : 'bg-[var(--dash-surface-hover)]'}`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-[var(--dash-surface)] transition-transform ${settings[key] ? 'translate-x-5' : 'translate-x-0'}`}
                />
              </button>
            </label>
          ))}
        </div>
      </section>

      {/* Section 2 — Enrichment Stats */}
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)]">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">Enrichment Stats</h2>
        </div>
        <div className="p-4">
          {loading ? (
            <p className="text-[var(--dash-muted)] text-sm">Loading…</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
                <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider">
                  {stats?.period === 'last7days' ? 'Events Enriched (Last 7 days)' : 'Events Enriched Today'}
                </p>
                <p className="text-2xl font-semibold text-[var(--dash-text)] mt-1">{stats?.eventsEnrichedToday ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
                <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider">Countries Detected</p>
                <p className="text-2xl font-semibold text-[var(--dash-text)] mt-1">{stats?.countriesDetected ?? 0}</p>
              </div>
              <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
                <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider">New vs Returning</p>
                <p className="text-sm text-[var(--dash-muted)] mt-1">
                  New {stats?.newCount ?? 0} / Returning {stats?.returningCount ?? 0}
                </p>
              </div>
              <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
                <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider">Device Breakdown</p>
                <p className="text-sm text-[var(--dash-muted)] mt-1">
                  Mobile {stats?.mobilePct ?? 0}% / Desktop {stats?.desktopPct ?? 0}% / Tablet {stats?.tabletPct ?? 0}%
                </p>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
              <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider mb-3">New vs Returning</p>
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
                <p className="text-[var(--dash-muted)] text-sm">No data today</p>
              )}
            </div>
            <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-bg)] p-4">
              <p className="text-xs text-[var(--dash-muted)] uppercase tracking-wider mb-3">Device breakdown</p>
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
                <p className="text-[var(--dash-muted)] text-sm">No data today</p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Section 3 — Recent Enriched Events */}
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)]">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">Recent Enriched Events</h2>
        </div>
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-4 text-[var(--dash-muted)] text-sm">Loading…</div>
          ) : (
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
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
                    <td colSpan={6} className="px-4 py-6 text-center text-[var(--dash-muted)]">
                      No enriched events yet. Events will appear here once enrichment is running.
                    </td>
                  </tr>
                ) : (
                  events.map((ev) => {
                    const country = ev.country ?? ev.enriched_data?.geo?.country ?? null
                    const city = ev.city ?? ev.enriched_data?.geo?.city ?? null
                    const deviceType = ev.device_type ?? ev.enriched_data?.device?.type ?? null
                    const customerType = ev.customer_type ?? ev.enriched_data?.customer?.type ?? null
                    const countryCode = ev.enriched_data?.geo?.countryCode ?? ''
                    return (
                    <tr key={ev.id}>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">{ev.event_name}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5">
                          <span>{country ? countryCodeToFlag(countryCode || country) : '—'}</span>
                          <span className="text-[var(--dash-muted)]">{country || '—'}</span>
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">{city || '—'}</td>
                      <td className="px-4 py-3">
                        <span className="text-[var(--dash-muted)] capitalize">{deviceType || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {customerType ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded ${
                              customerType === 'returning'
                                ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]'
                                : 'bg-[var(--dash-success-soft)] text-[var(--dash-success)]'
                            }`}
                          >
                            {customerType === 'returning' ? 'Returning' : 'New'}
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`font-medium ${
                            enrichmentScore(ev.enriched_data) >= 80
                              ? 'text-[var(--dash-success)]'
                              : enrichmentScore(ev.enriched_data) >= 50
                                ? 'text-amber-400'
                                : 'text-[var(--dash-muted)]'
                          }`}
                        >
                          {enrichmentScore(ev.enriched_data)}%
                        </span>
                      </td>
                    </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </div>
  )
}




