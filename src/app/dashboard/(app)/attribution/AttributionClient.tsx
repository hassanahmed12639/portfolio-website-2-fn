'use client'

import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { useCallback, useEffect, useState } from 'react'

const TABS = [
  { id: 'overview', label: 'Truth Score Overview' },
  { id: 'calculator', label: 'Score Calculator' },
  { id: 'ai', label: 'AI Attribution Analysis' },
] as const

type ConversionRow = {
  conversion_id: string
  event_name: string
  created_at: string
  value: number | null
  truth_score: number
  meta_score: number
  google_score: number
  platform: string | null
  status: string | null
  breakdown: Record<string, number>
  confidence: 'High' | 'Medium' | 'Low'
}

function TruthScoreRing({ score, size = 120 }: { score: number; size?: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const r = size * 0.4
  const circ = 2 * Math.PI * r
  const stroke = (clamped / 100) * circ
  const color =
    clamped >= 80
      ? 'stroke-[var(--dash-success)]'
      : clamped >= 50
        ? 'stroke-amber-500'
        : 'stroke-red-500'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-[var(--dash-text)]"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
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
      <span className="absolute text-2xl font-bold text-[var(--dash-text)]">{Math.round(clamped)}</span>
    </div>
  )
}

function ConfidenceBadge({ level }: { level: 'High' | 'Medium' | 'Low' }) {
  const config = {
    High: { label: 'High Confidence', className: 'bg-[var(--dash-success-soft)] text-[var(--dash-success)] border-[var(--dash-success-border)]' },
    Medium: { label: 'Medium Confidence', className: 'bg-[var(--dash-warning)]/20 text-amber-400 border-amber-500/50' },
    Low: { label: 'Attribution Mismatch', className: 'bg-[var(--dash-danger)]/20 text-red-400 border-red-500/50' },
  }
  const { label, className } = config[level]
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${className}`}>
      {label}
    </span>
  )
}

function ScoreBadge({ score }: { score: number }) {
  const level = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low'
  return (
    <span className="inline-flex items-center gap-1">
      <span className="font-semibold text-[var(--dash-text)]">{score}</span>
      <ConfidenceBadge level={level} />
    </span>
  )
}

type AnalyzeResult = {
  overall_truth_score?: number
  platform_breakdown?: {
    meta?: { score?: number; issues?: string[]; recommendation?: string }
    google?: { score?: number; issues?: string[]; recommendation?: string }
  }
  attribution_issues?: Array<{
    issue: string
    impact: string
    fix: string
    priority: string
  }>
  data_quality?: {
    score?: number
    missing_signals?: string[]
    recommendations?: string[]
  }
  estimated_revenue_at_risk?: number
  summary?: string
}

function FixSnippetModal({
  issue,
  onClose,
}: {
  issue: { issue: string; impact: string; fix: string; priority: string }
  onClose: () => void
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60"
      onClick={onClose}
    >
      <div
        className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--dash-border)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--dash-text)]">{issue.issue}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--dash-muted)] hover:text-[var(--dash-text)] p-1 text-xl leading-none"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[var(--dash-muted)] text-sm">
            <span className="text-[var(--dash-muted)]">Impact:</span> {issue.impact}
          </p>
          <p className="text-[var(--dash-muted)] text-sm">
            <span className="text-[var(--dash-muted)]">Fix:</span> {issue.fix}
          </p>
          <pre className="text-xs bg-[var(--dash-surface-hover)] rounded-lg p-4 overflow-auto text-[var(--dash-muted)] border border-[var(--dash-border)] whitespace-pre-wrap">
            {issue.fix}
          </pre>
        </div>
      </div>
    </div>
  )
}

export default function AttributionClient() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('overview')
  const [conversions, setConversions] = useState<ConversionRow[]>([])
  const [overviewLoading, setOverviewLoading] = useState(false)
  const [overviewError, setOverviewError] = useState<string | null>(null)

  const [serverSide, setServerSide] = useState(false)
  const [browserSide, setBrowserSide] = useState(false)
  const [hasEmail, setHasEmail] = useState(false)
  const [hasEventId, setHasEventId] = useState(false)
  const [hasUtm, setHasUtm] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const [deduplicated, setDeduplicated] = useState(false)
  const [hasSourceUrl, setHasSourceUrl] = useState(false)

  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [analyzeResult, setAnalyzeResult] = useState<AnalyzeResult | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [fixModal, setFixModal] = useState<{
    issue: string
    impact: string
    fix: string
    priority: string
  } | null>(null)

  const fetchScores = useCallback(async () => {
    setOverviewError(null)
    setOverviewLoading(true)
    try {
      const res = await fetch('/api/attribution/score')
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'Failed to load scores')
      }
      const data = await res.json()
      setConversions(data.conversions ?? [])
    } catch (e) {
      setOverviewError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setOverviewLoading(false)
    }
  }, [])

  useEffect(() => {
    if (tab === 'overview') fetchScores()
  }, [tab, fetchScores])

  const calculatorScore =
    (serverSide ? 25 : 0) +
    (browserSide ? 10 : 0) +
    (hasEmail ? 20 : 0) +
    (hasEventId ? 15 : 0) +
    (hasUtm ? 10 : 0) +
    (hasValue ? 10 : 0) +
    (deduplicated ? 5 : 0) +
    (hasSourceUrl ? 5 : 0)
  const clampedCalculatorScore = Math.min(100, calculatorScore)

  const runAnalyze = useCallback(async () => {
    setAnalyzeError(null)
    setAnalyzeResult(null)
    setAnalyzeLoading(true)
    try {
      const res = await fetch('/api/attribution/analyze', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Analysis failed')
      setAnalyzeResult(data)
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setAnalyzeLoading(false)
    }
  }, [])

  const avgScore =
    conversions.length > 0
      ? conversions.reduce((a, c) => a + c.truth_score, 0) / conversions.length
      : 0
  const highConfidence = conversions.filter((c) => c.truth_score >= 80).length
  const mismatches = conversions.filter((c) => c.truth_score < 50).length
  const metaReported = conversions.filter((c) => c.platform === 'meta').length
  const googleReported = conversions.filter((c) => c.platform === 'google').length
  const serverLogged = conversions.filter((c) => c.status === 'success').length
  const total = conversions.length
  const maxReported = Math.max(metaReported, googleReported, serverLogged, 1)
  const discrepancyPct = total > 0 ? Math.round((Math.abs(serverLogged - total) / total) * 100) : 0

  const chartData = [
    { name: 'Meta reported', count: metaReported, fill: '#8b5cf6' },
    { name: 'Google reported', count: googleReported, fill: '#3b82f6' },
    { name: 'Server logged', count: serverLogged, fill: '#10b981' },
  ]

  const calculatorMeaning =
    clampedCalculatorScore >= 90
      ? 'Perfect tracking setup. Your conversion data is highly reliable.'
      : clampedCalculatorScore >= 70
        ? 'Good tracking. Minor improvements possible.'
        : clampedCalculatorScore >= 50
          ? 'Average tracking. Missing some key signals.'
          : 'Poor tracking. Significant attribution loss detected.'

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Attribution Truth Score</h1>

      <div className="flex gap-1 p-1 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)]' : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-6">
          {overviewLoading && (
            <p className="text-[var(--dash-muted)] text-sm flex items-center gap-2">
              <span className="inline-block w-4 h-4 border-2 border-[var(--dash-border-strong)] border-t-[var(--dash-primary)] rounded-full animate-spin" />
              Calculating truth scores…
            </p>
          )}
          {overviewError && (
            <p className="text-red-400 text-sm rounded-lg bg-red-950/30 border border-red-800 p-3">
              {overviewError}
            </p>
          )}

          {!overviewLoading && !overviewError && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 flex flex-col items-center">
                  <p className="text-sm text-[var(--dash-muted)] mb-2">Average Truth Score</p>
                  <TruthScoreRing score={avgScore} size={100} />
                </div>
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <p className="text-sm text-[var(--dash-muted)] mb-1">Total Conversions Analyzed</p>
                  <p className="text-2xl font-semibold text-[var(--dash-text)]">{conversions.length}</p>
                </div>
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <p className="text-sm text-[var(--dash-muted)] mb-1">High Confidence (80+)</p>
                  <p className="text-2xl font-semibold text-[var(--dash-success)]">{highConfidence}</p>
                </div>
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <p className="text-sm text-[var(--dash-muted)] mb-1">Attribution Mismatches</p>
                  <p className="text-2xl font-semibold text-red-400">{mismatches}</p>
                </div>
              </div>

              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
                <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
                  Conversion Truth Score Table
                </h2>
                {conversions.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                          <th className="px-4 py-3 font-medium">Event name</th>
                          <th className="px-4 py-3 font-medium">Timestamp</th>
                          <th className="px-4 py-3 font-medium">Value</th>
                          <th className="px-4 py-3 font-medium">Meta</th>
                          <th className="px-4 py-3 font-medium">Google</th>
                          <th className="px-4 py-3 font-medium">Truth Score</th>
                          <th className="px-4 py-3 font-medium">Confidence</th>
                          <th className="px-4 py-3 font-medium" />
                        </tr>
                      </thead>
                      <tbody>
                        {conversions.slice(0, 50).map((row) => (
                          <tr
                            key={row.conversion_id}
                            className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30"
                          >
                            <td className="px-4 py-3 text-[var(--dash-text)]">{row.event_name}</td>
                            <td className="px-4 py-3 text-[var(--dash-muted)]">
                              {new Date(row.created_at).toLocaleString()}
                            </td>
                            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.value ?? '—'}</td>
                            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.meta_score}</td>
                            <td className="px-4 py-3 text-[var(--dash-muted)]">{row.google_score}</td>
                            <td className="px-4 py-3">
                              <ScoreBadge score={row.truth_score} />
                            </td>
                            <td className="px-4 py-3">
                              <ConfidenceBadge level={row.confidence} />
                            </td>
                            <td className="px-4 py-3">
                              <span className="text-[var(--dash-muted)] text-xs">Details</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="px-4 py-8 text-[var(--dash-muted)] text-center">
                    No conversions yet. Send events to see truth scores.
                  </p>
                )}
              </div>

              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">
                  Platform Comparison (Meta vs Google vs Server logged)
                </h2>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                      <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#18181b',
                          border: '1px solid #3f3f46',
                          borderRadius: '8px',
                        }}
                        labelStyle={{ color: '#d4d4d8' }}
                      />
                      <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry, i) => (
                        <Cell key={i} fill={entry.fill} />
                      ))}
                    </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                {total > 0 && (
                  <p className="text-[var(--dash-muted)] text-sm mt-2">
                    Discrepancy (server vs total): {discrepancyPct}%
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'calculator' && (
        <div className="space-y-6 max-w-xl">
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 flex flex-col items-center">
            <p className="text-sm text-[var(--dash-muted)] mb-4">Live Truth Score</p>
            <TruthScoreRing score={clampedCalculatorScore} size={140} />
            <p className="mt-4 text-[var(--dash-muted)] text-sm text-center">{calculatorMeaning}</p>
          </div>

          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
            <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
              Score breakdown
            </h2>
            <ul className="divide-y divide-[var(--dash-border)] text-sm">
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Server-side fired</span>
                <span className={serverSide ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {serverSide ? '+25' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Browser-side fired</span>
                <span className={browserSide ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {browserSide ? '+10' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Email/phone</span>
                <span className={hasEmail ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {hasEmail ? '+20' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Event ID (dedup)</span>
                <span className={hasEventId ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {hasEventId ? '+15' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">UTM parameters</span>
                <span className={hasUtm ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {hasUtm ? '+10' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Value</span>
                <span className={hasValue ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {hasValue ? '+10' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Deduplicated</span>
                <span className={deduplicated ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {deduplicated ? '+5' : '0'}
                </span>
              </li>
              <li className="px-4 py-2 flex justify-between">
                <span className="text-[var(--dash-muted)]">Source URL</span>
                <span className={hasSourceUrl ? 'text-[var(--dash-success)]' : 'text-[var(--dash-muted)]'}>
                  {hasSourceUrl ? '+5' : '0'}
                </span>
              </li>
            </ul>
          </div>

          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 space-y-3">
            <h2 className="text-sm font-medium text-[var(--dash-muted)]">Toggle factors</h2>
            {[
              { label: 'Was event fired server-side?', value: serverSide, set: setServerSide },
              { label: 'Was event fired browser-side?', value: browserSide, set: setBrowserSide },
              { label: 'Does event have email/phone?', value: hasEmail, set: setHasEmail },
              { label: 'Does event have event_id for dedup?', value: hasEventId, set: setHasEventId },
              { label: 'Does event have UTM parameters?', value: hasUtm, set: setHasUtm },
              { label: 'Does event have value?', value: hasValue, set: setHasValue },
              { label: 'Was event deduplicated?', value: deduplicated, set: setDeduplicated },
              { label: 'Source URL present?', value: hasSourceUrl, set: setHasSourceUrl },
            ].map(({ label, value, set }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[var(--dash-muted)] text-sm">{label}</span>
                <button
                  type="button"
                  onClick={() => set(!value)}
                  className={`w-11 h-6 rounded-full transition-colors relative ${
                    value ? 'bg-[var(--dash-success)]' : 'bg-[var(--dash-surface-hover)]'
                  }`}
                >
                  <span
                    className={`absolute top-1 w-4 h-4 rounded-full bg-[var(--dash-surface)] transition-all duration-200 ${
                      value ? 'left-[22px]' : 'left-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'ai' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
            <button
              type="button"
              onClick={runAnalyze}
              disabled={analyzeLoading}
              className="px-4 py-2 rounded-lg bg-[var(--dash-success)] hover:bg-[var(--dash-success-strong)] disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {analyzeLoading ? 'Analyzing…' : 'Analyze My Attribution'}
            </button>
            {analyzeLoading && (
              <p className="mt-3 text-[var(--dash-muted)] text-sm flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-[var(--dash-border-strong)] border-t-[var(--dash-primary)] rounded-full animate-spin" />
                AI is analyzing your attribution…
              </p>
            )}
          </div>
          {analyzeError && (
            <p className="text-red-400 text-sm rounded-lg bg-red-950/30 border border-red-800 p-3">
              {analyzeError}
            </p>
          )}
          {analyzeResult && (
            <div className="space-y-6">
              {analyzeResult.summary && (
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-2">Summary</h2>
                  <p className="text-[var(--dash-text)]">{analyzeResult.summary}</p>
                </div>
              )}
              {analyzeResult.overall_truth_score != null && (
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 flex flex-col items-center">
                  <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-3">Overall Truth Score</h2>
                  <TruthScoreRing score={analyzeResult.overall_truth_score} />
                </div>
              )}
              {analyzeResult.estimated_revenue_at_risk != null && (
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-1">
                    Estimated revenue at risk
                  </h2>
                  <p className="text-xl font-semibold text-amber-400">
                    ${analyzeResult.estimated_revenue_at_risk.toLocaleString()}
                  </p>
                </div>
              )}
              {analyzeResult.platform_breakdown && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {analyzeResult.platform_breakdown.meta && (
                    <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                      <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-2">Meta</h2>
                      <p className="text-2xl font-semibold text-[var(--dash-text)]">
                        {analyzeResult.platform_breakdown.meta.score ?? '—'}
                      </p>
                      {analyzeResult.platform_breakdown.meta.issues?.length ? (
                        <ul className="mt-2 text-sm text-[var(--dash-muted)] list-disc list-inside">
                          {analyzeResult.platform_breakdown.meta.issues.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      ) : null}
                      {analyzeResult.platform_breakdown.meta.recommendation && (
                        <p className="mt-2 text-sm text-[var(--dash-success)]">
                          {analyzeResult.platform_breakdown.meta.recommendation}
                        </p>
                      )}
                    </div>
                  )}
                  {analyzeResult.platform_breakdown.google && (
                    <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                      <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-2">Google</h2>
                      <p className="text-2xl font-semibold text-[var(--dash-text)]">
                        {analyzeResult.platform_breakdown.google.score ?? '—'}
                      </p>
                      {analyzeResult.platform_breakdown.google.issues?.length ? (
                        <ul className="mt-2 text-sm text-[var(--dash-muted)] list-disc list-inside">
                          {analyzeResult.platform_breakdown.google.issues.map((i, idx) => (
                            <li key={idx}>{i}</li>
                          ))}
                        </ul>
                      ) : null}
                      {analyzeResult.platform_breakdown.google.recommendation && (
                        <p className="mt-2 text-sm text-[var(--dash-success)]">
                          {analyzeResult.platform_breakdown.google.recommendation}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}
              {analyzeResult.data_quality && (
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                  <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-2">Data quality</h2>
                  <p className="text-2xl font-semibold text-[var(--dash-text)]">
                    {analyzeResult.data_quality.score ?? '—'}
                  </p>
                  {analyzeResult.data_quality.missing_signals?.length ? (
                    <ul className="mt-2 text-sm text-[var(--dash-muted)] list-disc list-inside">
                      {analyzeResult.data_quality.missing_signals.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  ) : null}
                  {analyzeResult.data_quality.recommendations?.length ? (
                    <ul className="mt-2 text-sm text-[var(--dash-success)] list-disc list-inside">
                      {analyzeResult.data_quality.recommendations.map((r, idx) => (
                        <li key={idx}>{r}</li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              )}
              {analyzeResult.attribution_issues && analyzeResult.attribution_issues.length > 0 && (
                <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
                  <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
                    Attribution issues
                  </h2>
                  <ul className="divide-y divide-[var(--dash-border)]">
                    {analyzeResult.attribution_issues.map((item, i) => (
                      <li key={i} className="px-4 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-2">
                          <span className="font-medium text-[var(--dash-text)]">{item.issue}</span>
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded border ${
                              item.priority === 'high'
                                ? 'bg-[var(--dash-danger)]/20 text-red-400 border-red-500/50'
                                : item.priority === 'medium'
                                  ? 'bg-[var(--dash-warning)]/20 text-amber-400 border-amber-500/50'
                                  : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border-[var(--dash-border-strong)]'
                            }`}
                          >
                            {item.priority}
                          </span>
                        </div>
                        <p className="text-[var(--dash-muted)] text-sm mt-1">
                          <span className="text-[var(--dash-muted)]">Impact:</span> {item.impact}
                        </p>
                        <p className="text-[var(--dash-muted)] text-sm mt-0.5">
                          <span className="text-[var(--dash-muted)]">Fix:</span> {item.fix}
                        </p>
                        <button
                          type="button"
                          onClick={() =>
                            setFixModal({
                              issue: item.issue,
                              impact: item.impact,
                              fix: item.fix,
                              priority: item.priority,
                            })
                          }
                          className="mt-2 px-3 py-1.5 rounded-md bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm font-medium transition-colors"
                        >
                          Show code snippet
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {fixModal && (
            <FixSnippetModal
              issue={fixModal}
              onClose={() => setFixModal(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}




