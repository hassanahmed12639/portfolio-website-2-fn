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

function ScoreRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const r = 56
  const circ = 2 * Math.PI * r
  const stroke = (clamped / 100) * circ
  const color =
    clamped >= 80 ? 'stroke-emerald-500' : clamped >= 60 ? 'stroke-blue-500' : clamped >= 40 ? 'stroke-amber-500' : 'stroke-red-500'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-40 h-40 -rotate-90" viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} fill="none" strokeWidth="10" className="stroke-zinc-800" />
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
      <span className="absolute text-3xl font-bold text-white">{clamped}</span>
    </div>
  )
}

function gaugeColor(rate: number) {
  if (rate >= 80) return '#22c55e'
  if (rate >= 60) return '#eab308'
  if (rate >= 40) return '#f97316'
  return '#ef4444'
}

function barColor(pct: number) {
  if (pct >= 80) return 'bg-emerald-500'
  if (pct >= 50) return 'bg-amber-500'
  return 'bg-red-500'
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

  useEffect(() => {
    fetch('/api/dashboard/data-quality')
      .then((res) => res.ok ? res.json() : null)
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

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
  }, [])

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-zinc-400 animate-pulse">Loading data quality...</p>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-zinc-400">Failed to load data quality.</p>
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
      <h1 className="text-xl font-semibold text-white">Data Quality</h1>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <div className="flex items-center justify-between gap-4 mb-4">
          <h2 className="text-sm font-medium text-zinc-300">Meta Match Rate</h2>
          {matchRateLoading && !matchRate ? (
            <span className="text-xs text-zinc-500">Loading…</span>
          ) : (
            <span
              className={`text-xs font-medium ${
                trendDir === 'up'
                  ? 'text-emerald-400'
                  : trendDir === 'down'
                    ? 'text-red-400'
                    : 'text-zinc-500'
              }`}
            >
              {trendDir === 'up' && `↑ +${trendVal}% this week`}
              {trendDir === 'down' && `↓ -${trendVal}% this week`}
              {trendDir === 'stable' && '→ Stable this week'}
            </span>
          )}
        </div>
        {matchRateLoading && !matchRate ? (
          <p className="text-zinc-400 animate-pulse py-8">Loading match rate...</p>
        ) : matchRate?.error ? (
          <p className="text-zinc-400 py-4">Unable to load match rate.</p>
        ) : matchRate?.message === 'No events yet' ? (
          <p className="text-zinc-400 py-4">No Meta events yet. Send events to see your estimated match rate.</p>
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
              <p className="text-4xl font-semibold text-white -mt-6">{rate}%</p>
              <p
                className="text-sm font-medium"
                style={{ color: gaugeColor(rate) }}
              >
                {matchRate?.label ?? '—'}
              </p>
            </div>
            {matchRate?.recommendation && (
              <blockquote className="text-sm text-zinc-400 border-l-2 border-zinc-700 pl-4 my-4 italic">
                &ldquo;{matchRate.recommendation}&rdquo;
              </blockquote>
            )}
            <p className="text-xs text-zinc-500 mb-6">
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
                        <span className="text-zinc-400">{displayLabel}</span>
                        <span className="text-zinc-300">{pct}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
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
              <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
                <p className="text-sm font-medium text-zinc-300 mb-1">💡 How to improve your match rate</p>
                <p className="text-sm text-zinc-400">{matchRate.recommendation}</p>
                <p className="text-sm text-zinc-500 mt-2">
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
              className="mt-4 text-sm text-zinc-400 hover:text-white disabled:opacity-50"
            >
              {matchRateRefreshing ? 'Refreshing…' : '🔄 Refresh'}
            </button>
          </>
        )}
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Score overview</h2>
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col items-center gap-2">
            <ScoreRing score={data.avgScore} />
            <p className="text-lg font-medium text-white">{data.avgScore}/100</p>
            <p className="text-sm text-zinc-400">{qualityLabel}</p>
          </div>
          <div className="flex-1 min-w-[240px] h-48">
            <p className="text-sm text-zinc-400 mb-2">Score trend (last 7 days)</p>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data.trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
                <XAxis dataKey="date" tick={{ fill: '#a1a1aa', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis domain={[0, 100]} tick={{ fill: '#a1a1aa', fontSize: 11 }} />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: 8 }}
                  labelStyle={{ color: '#fff' }}
                  formatter={(value: number | undefined) => [value ?? 0, 'Avg score']}
                  labelFormatter={(label) => label}
                />
                <Line type="monotone" dataKey="avgScore" stroke="#22c55e" strokeWidth={2} dot={{ fill: '#22c55e' }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 px-4 py-3">
            <p className="text-sm text-zinc-400">Industry average: {INDUSTRY_AVG}/100</p>
            <p className={`font-medium ${aboveIndustry ? 'text-emerald-400' : 'text-amber-400'}`}>
              {aboveIndustry ? "You're above average!" : 'Room to improve.'}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
          Field coverage
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-zinc-800 text-left text-zinc-400">
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
                  <tr key={row.field} className="border-b border-zinc-800/80 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-white">{FIELD_LABELS[row.field] ?? row.field}</td>
                    <td className="px-4 py-3 text-zinc-300">{row.coverage}%</td>
                    <td className="px-4 py-3 text-zinc-300">+{row.points} pts</td>
                    <td className="px-4 py-3">
                      {status === 'Great' && <span className="text-emerald-400">✅ Great</span>}
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

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-3">Recommendations</h2>
        <ul className="space-y-2 text-sm text-zinc-300">
          {recommendations.map((rec, i) => (
            <li key={i} className="flex gap-2">
              <span className="text-emerald-500 shrink-0">•</span>
              {rec}
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Event quality timeline (last 30 days)</h2>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data.dailyQuality} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" />
              <XAxis
                dataKey="date"
                tick={{ fill: '#a1a1aa', fontSize: 10 }}
                tickFormatter={(v) => v.slice(5)}
              />
              <YAxis tick={{ fill: '#a1a1aa', fontSize: 11 }} />
              <RechartsTooltip
                contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46', borderRadius: 8 }}
                labelFormatter={(label) => label}
              />
              <Legend />
              <Bar dataKey="Excellent" stackId="a" fill="#16a34a" name="Excellent" />
              <Bar dataKey="Good" stackId="a" fill="#2563eb" name="Good" />
              <Bar dataKey="Fair" stackId="a" fill="#eab308" name="Fair" />
              <Bar dataKey="Poor" stackId="a" fill="#dc2626" name="Poor" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}
