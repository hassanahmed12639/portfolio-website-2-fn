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
  BarChart,
  Bar,
  Legend,
  RadialBarChart,
  RadialBar,
} from 'recharts'

const INDUSTRY_AVG = 45
const FIELD_LABELS: Record<string, string> = {
  email: 'Email',
  phone: 'Phone',
  fbp: 'fbp',
  fbc: 'fbc',
  name: 'Name',
  location: 'Location',
  fbclid: 'fbclid',
}

type DataQualityResponse = {
  avgScore: number
  total: number
  errorCount?: number
  distribution: { Excellent: number; Good: number; Fair: number; Poor: number }
  trendData: { date: string; avgScore: number; count: number }[]
  fieldCoverage: { field: string; coverage: number; points: number }[]
  topMissing: string
  topMissingPoints: number
  dailyQuality: { date: string; Excellent: number; Good: number; Fair: number; Poor: number }[]
}

type MatchRateResponse = {
  estimated_match_rate?: number
  label?: string
  recommendation?: string
  trend?: number
  trend_direction?: 'up' | 'down' | 'stable'
  total_events?: number
  coverage?: {
    email: number
    phone: number
    fbp: number
    fbc: number
    name: number
    location: number
    fbclid: number
  }
  last_updated?: string
  message?: string
  error?: string
}

type EMQFixResult = {
  score: number
  fixed_fields: Record<string, string>
  suggested_fields: Record<string, string>
  original_event: Record<string, any>
  fixed_event: Record<string, any>
  timestamp: string
}

type RecentEvent = {
  id: string
  event_name: string
  created_at: string
  data_quality_score: number
  data_quality_label: string
  emq_fix?: EMQFixResult
}

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const r = 56
  const circ = 2 * Math.PI * r
  const stroke = (clamped / 100) * circ
  const color =
    clamped >= 80 ? 'stroke-[var(--dash-success)]' : clamped >= 60 ? 'stroke-blue-500' : clamped >= 40 ? 'stroke-amber-500' : 'stroke-red-500'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-[var(--dash-border)]" />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - stroke}
          className={color}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <span className="absolute text-3xl font-bold text-[var(--dash-text)]">{clamped}</span>
    </div>
  )
}

function gaugeColor(rate: number) {
  if (rate >= 80) return '#2563eb'
  if (rate >= 60) return '#eab308'
  if (rate >= 40) return '#f97316'
  return '#ef4444'
}

function barColor(pct: number) {
  if (pct >= 80) return 'bg-[var(--dash-success)]'
  if (pct >= 50) return 'bg-[var(--dash-warning)]'
  return 'bg-[var(--dash-danger)]'
}

function formatLastUpdated(iso: string | undefined) {
  if (!iso) return 'just now'
  const d = new Date(iso)
  const sec = Math.floor((Date.now() - d.getTime()) / 1000)
  if (sec < 60) return 'just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} mins ago`
  return 'just now'
}

export default function DataQualityPage() {
  const [data, setData] = useState<DataQualityResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [matchRate, setMatchRate] = useState<MatchRateResponse | null>(null)
  const [matchRateLoading, setMatchRateLoading] = useState(true)
  const [matchRateRefreshing, setMatchRateRefreshing] = useState(false)
  const [recentEvents, setRecentEvents] = useState<RecentEvent[]>([])
  const [fixingEventId, setFixingEventId] = useState<string | null>(null)
  const estimatedMatchRate = matchRate?.estimated_match_rate ?? 0

  useEffect(() => {
    fetch('/api/dashboard/data-quality')
      .then((res) => res.ok ? res.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  const fetchRecentEvents = async () => {
    try {
      const res = await fetch('/api/dashboard/events?limit=10')
      if (res.ok) {
        const events = await res.json()
        // Fetch EMQ fixes for these events
        const eventsWithFixes = await Promise.all(
          events.map(async (event: RecentEvent) => {
            try {
              const fixRes = await fetch(`/api/dashboard/data-quality/fix/${event.id}`)
              if (fixRes.ok) {
                const fixData = await fixRes.json()
                return { ...event, emq_fix: fixData.fix }
              }
            } catch {
              // Ignore errors
            }
            return event
          })
        )
        setRecentEvents(eventsWithFixes)
      }
    } catch (error) {
      console.error('Failed to fetch recent events:', error)
    }
  }

  const runEMQFix = async (eventId: string) => {
    setFixingEventId(eventId)
    try {
      const res = await fetch('/api/dashboard/data-quality/fix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventId }),
      })

      if (res.ok) {
        const result = await res.json()
        // Refresh data and recent events
        fetch('/api/dashboard/data-quality')
          .then((res) => res.ok ? res.json() : null)
          .then(setData)
        fetchRecentEvents()
      } else {
        console.error('Failed to fix event')
      }
    } catch (error) {
      console.error('Error fixing event:', error)
    } finally {
      setFixingEventId(null)
    }
  }

  const fetchMatchRate = (isRefresh = false) => {
    if (isRefresh) setMatchRateRefreshing(true)
    else setMatchRateLoading(true)
    fetch('/api/meta/match-rate')
      .then((r) => r.json())
      .then(setMatchRate)
      .catch(() => setMatchRate(null))
      .finally(() => {
        setMatchRateLoading(false)
        setMatchRateRefreshing(false)
      })
  }

  useEffect(() => {
    fetchMatchRate()
    fetchRecentEvents()
  }, [])

  useEffect(() => {
    if (!data) return
    const errorCount = data.errorCount ?? 0
    const eventVolume = data.total ?? 0
    fetch('/api/alerts')
      .then((r) => r.json())
      .then(async (rules: import('@/lib/email-alerts').AlertRule[]) => {
        const { checkAlertRules } = await import('@/lib/email-alerts')
        const triggered = checkAlertRules(rules, {
          avgScore: data.avgScore,
          matchRate: estimatedMatchRate,
          errorCount,
          eventVolume,
        })
        for (const rule of triggered) {
          const value =
            rule.condition === 'score_below'
              ? data.avgScore
              : rule.condition === 'match_rate_below'
                ? estimatedMatchRate
                : rule.condition === 'error_spike'
                  ? errorCount
                  : eventVolume
          await fetch('/api/alerts/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              ruleId: rule.id,
              ruleName: rule.name,
              condition: rule.condition,
              value,
              threshold: rule.threshold,
              email: rule.notifyEmail,
            }),
          })
          await fetch('/api/alerts', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...rule, lastTriggeredAt: new Date().toISOString() }),
          })
        }
      })
      .catch(() => {})
  }, [data, estimatedMatchRate])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)] animate-pulse">Loading data quality...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)]">Failed to load data quality.</p>
      </div>
    )
  }

  const qualityLabel =
    data.avgScore >= 80 ? 'Excellent' : data.avgScore >= 60 ? 'Good' : data.avgScore >= 40 ? 'Fair' : 'Poor'
  const aboveIndustry = data.avgScore > INDUSTRY_AVG
  const recommendations: string[] = []
  if (data.fieldCoverage.find((f) => f.field === 'phone')?.coverage ?? 0 < 50) {
    recommendations.push('Adding phone numbers could improve your match rate by ~15%.')
  }
  const fbcCoverage = data.fieldCoverage.find((f) => f.field === 'fbc')?.coverage ?? 0
  if (fbcCoverage < 50) {
    recommendations.push(
      `Only ${fbcCoverage}% of events have fbc — make sure fbclid is captured from Meta ad URLs.`
    )
  }
  const nameCoverage = data.fieldCoverage.find((f) => f.field === 'name')?.coverage ?? 0
  if (nameCoverage < 50) {
    recommendations.push('Passing customer name increases Meta match rate significantly.')
  }
  if (recommendations.length === 0) {
    recommendations.push('Your data quality is solid. Keep passing all available user data for best match rates.')
  }

  const rate = matchRate?.estimated_match_rate ?? 0
  const trendDir = matchRate?.trend_direction ?? 'stable'
  const trendVal = Math.abs(matchRate?.trend ?? 0)
  const coverage = matchRate?.coverage
  const coverageOrder = ['email', 'phone', 'fbp', 'fbc', 'name', 'location', 'fbclid'] as const
  const lowestCoverage = coverage
    ? (coverageOrder
        .map((key) => ({ key, pct: coverage[key] }))
        .filter((x) => x.key !== 'fbclid' || x.pct < 100)
        .sort((a, b) => a.pct - b.pct)[0] ?? { key: 'email', pct: 0 })
    : null
  const gaugeData = [{ name: 'rate', value: rate, fill: gaugeColor(rate) }]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)]">Data Quality</h1>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">Meta Match Rate</h2>
          {matchRateLoading && !matchRate ? (
            <span className="text-xs text-[var(--dash-muted)]">Loading…</span>
          ) : (
            <span
              className={`text-xs font-medium ${
                trendDir === 'up'
                  ? 'text-[var(--dash-success)]'
                  : trendDir === 'down'
                    ? 'text-red-400'
                    : 'text-[var(--dash-muted)]'
              }`}
            >
              {trendDir === 'up' && `↑ +${trendVal}% this week`}
              {trendDir === 'down' && `↓ -${trendVal}% this week`}
              {trendDir === 'stable' && '→ Stable this week'}
            </span>
          )}
        </div>
        {matchRateLoading && !matchRate ? (
          <p className="text-[var(--dash-muted)] animate-pulse py-8">Loading match rate...</p>
        ) : matchRate?.error ? (
          <p className="text-[var(--dash-muted)] py-4">Unable to load match rate.</p>
        ) : matchRate?.message === 'No events yet' ? (
          <p className="text-[var(--dash-muted)] py-4">No Meta events yet. Send events to see your estimated match rate.</p>
        ) : (
          <>
            <div className="flex flex-col items-center py-4">
              <ResponsiveContainer width={200} height={200}>
                <RadialBarChart
                  cx="50%"
                  cy="50%"
                  innerRadius="60%"
                  outerRadius="95%"
                  barSize={14}
                  data={gaugeData}
                  startAngle={180}
                  endAngle={0}
                >
                  <RadialBar background dataKey="value" max={100} cornerRadius={6} />
                </RadialBarChart>
              </ResponsiveContainer>
              <p className="text-4xl font-semibold text-[var(--dash-text)] -mt-6">{rate}%</p>
              <p
                className="text-sm font-medium"
                style={{ color: gaugeColor(rate) }}
              >
                {matchRate?.label ?? '—'}
              </p>
            </div>
            {matchRate?.recommendation && (
              <blockquote className="text-sm text-[var(--dash-muted)] border-l-2 border-[var(--dash-border)] pl-4 my-4 italic">
                &ldquo;{matchRate.recommendation}&rdquo;
              </blockquote>
            )}
            <p className="text-xs text-[var(--dash-muted)] mb-6">
              Based on {matchRate?.total_events ?? 0} events · Updated {formatLastUpdated(matchRate?.last_updated)}
            </p>

            {coverage && (
              <div className="space-y-3 mb-6">
                {coverageOrder.map((key) => {
                  const pct = coverage[key]
                  const displayLabel =
                    key === 'email'
                      ? 'Email Coverage'
                      : key === 'phone'
                        ? 'Phone Coverage'
                        : key === 'fbp'
                          ? 'fbp Coverage'
                          : key === 'fbc'
                            ? 'fbc Coverage'
                            : key === 'name'
                              ? 'Name Coverage'
                              : key === 'location'
                                ? 'Location Coverage'
                                : 'Ad Click (fbclid)'
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-[var(--dash-muted)]">{displayLabel}</span>
                        <span className="text-[var(--dash-muted)]">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden">
                        <span
                          className={`block h-full rounded-full ${barColor(pct)}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}

            {matchRate?.recommendation && lowestCoverage && (
              <div className="rounded-lg bg-[var(--dash-surface-hover)]/50 border border-[var(--dash-border)] p-4">
                <p className="text-sm font-medium text-[var(--dash-muted)] mb-1">💡 How to improve your match rate</p>
                <p className="text-sm text-[var(--dash-muted)]">{matchRate.recommendation}</p>
                <p className="text-sm text-[var(--dash-muted)] mt-2">
                  Currently only {lowestCoverage.pct}% of events include{' '}
                  {lowestCoverage.key === 'fbclid'
                    ? 'ad click (fbclid)'
                    : lowestCoverage.key === 'fbp'
                      ? 'fbp'
                      : lowestCoverage.key === 'fbc'
                        ? 'fbc'
                        : lowestCoverage.key}.
                </p>
              </div>
            )}
            <button
              type="button"
              onClick={() => fetchMatchRate(true)}
              disabled={matchRateRefreshing}
              className="mt-4 text-sm text-[var(--dash-muted)] hover:text-[var(--dash-text)] disabled:opacity-50"
            >
              {matchRateRefreshing ? 'Refreshing…' : '🔄 Refresh'}
            </button>
          </>
        )}
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Score overview</h2>
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={data.avgScore} />
            <p className="text-lg font-medium text-[var(--dash-text)]">{data.avgScore}/100</p>
            <p className="text-sm text-[var(--dash-muted)]">{qualityLabel}</p>
          </div>
          <div className="flex-1 min-w-[240px] h-48">
            <p className="text-sm text-[var(--dash-muted)] mb-2">Score trend (last 7 days)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fill: '#94a3b8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                  labelStyle={{ color: '#0f172a' }}
                  formatter={(value: number | undefined) => [value ?? 0, 'Avg score']}
                  labelFormatter={(label) => label}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#2563eb" strokeWidth={2} dot={{ fill: '#2563eb' }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg bg-[var(--dash-surface-hover)]/50 border border-[var(--dash-border)] px-4 py-3">
            <p className="text-sm text-[var(--dash-muted)]">Industry average: {INDUSTRY_AVG}/100</p>
            <p className={`font-medium ${aboveIndustry ? 'text-[var(--dash-success)]' : 'text-amber-400'}`}>
              {aboveIndustry ? "You're above average!" : 'Room to improve.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
          Field coverage
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                <th className="px-4 py-3 font-medium">Field</th>
                <th className="px-4 py-3 font-medium">Coverage</th>
                <th className="px-4 py-3 font-medium">Impact</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {data.fieldCoverage.map((row) => {
                const status =
                  row.coverage >= 80 ? 'Great' : row.coverage >= 50 ? 'Improve' : 'Missing'
                return (
                  <tr key={row.field} className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30">
                    <td className="px-4 py-3 text-[var(--dash-text)]">{FIELD_LABELS[row.field] ?? row.field}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">{row.coverage}%</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">+{row.points} pts</td>
                    <td className="px-4 py-3">
                      {status === 'Great' && <span className="text-[var(--dash-success)]">✅ Great</span>}
                      {status === 'Improve' && <span className="text-amber-400">⚠️ Improve</span>}
                      {status === 'Missing' && <span className="text-red-400">❌ Missing</span>}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-3">Recommendations</h2>
        <ul className="space-y-2 text-sm text-[var(--dash-muted)]">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-[var(--dash-success)] shrink-0">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Event quality timeline (last 30 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyQuality} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#94a3b8', fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 }}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar dataKey="Excellent" stackId="a" fill="#2563eb" name="Excellent" />
              <Bar dataKey="Good" stackId="a" fill="#60a5fa" name="Good" />
              <Bar dataKey="Fair" stackId="a" fill="#eab308" name="Fair" />
              <Bar dataKey="Poor" stackId="a" fill="#dc2626" name="Poor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
          <h2 className="text-sm font-medium text-[var(--dash-muted)]">EMQ Auto-Fix Engine</h2>
          <button
            onClick={fetchRecentEvents}
            className="text-xs text-[var(--dash-text)] hover:text-[var(--dash-success)] underline"
          >
            Refresh
          </button>
        </div>
        <div className="p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-4">
            Recent events with EMQ scores. Click "Fix" to manually run the auto-fix engine on any event.
          </p>
          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-[var(--dash-muted)]">No recent events found.</p>
            ) : (
              recentEvents.map((event) => (
                <div key={event.id} className="border border-[var(--dash-border)] rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-medium text-[var(--dash-text)]">{event.event_name}</span>
                      <span className={`text-xs px-2 py-1 rounded ${
                        event.data_quality_label === 'Excellent' ? 'bg-[var(--dash-success)]/10 text-[var(--dash-success)]' :
                        event.data_quality_label === 'Good' ? 'bg-blue-50 text-blue-600' :
                        event.data_quality_label === 'Fair' ? 'bg-amber-50 text-amber-600' :
                        'bg-red-50 text-red-600'
                      }`}>
                        {event.data_quality_score}/10 - {event.data_quality_label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[var(--dash-muted)]">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                      <button
                        onClick={() => runEMQFix(event.id)}
                        disabled={fixingEventId === event.id}
                        className="text-xs bg-[var(--dash-success)] text-white px-2 py-1 rounded hover:bg-[var(--dash-success)]/80 disabled:opacity-50"
                      >
                        {fixingEventId === event.id ? 'Fixing...' : 'Fix'}
                      </button>
                    </div>
                  </div>
                  {event.emq_fix && (
                    <div className="mt-3 space-y-2">
                      {Object.keys(event.emq_fix.fixed_fields).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-[var(--dash-success)]">✅ Fixed:</p>
                          <ul className="text-xs text-[var(--dash-muted)] ml-4">
                            {Object.entries(event.emq_fix.fixed_fields).map(([field, description]) => (
                              <li key={field}>• {field}: {description}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {Object.keys(event.emq_fix.suggested_fields).length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-amber-600">⚠️ Suggestions:</p>
                          <ul className="text-xs text-[var(--dash-muted)] ml-4">
                            {Object.entries(event.emq_fix.suggested_fields).map(([field, suggestion]) => (
                              <li key={field}>• {field}: {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </section>

    </div>
  )
}




