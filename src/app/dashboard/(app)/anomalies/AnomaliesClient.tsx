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

type AnomalyType =
  | 'event_drop'
  | 'duplicate_events'
  | 'failed_api_calls'
  | 'value_anomaly'
  | 'spike'
  | 'platform_mismatch'

type Anomaly = {
  id: string
  type: AnomalyType
  severity: string
  description: string
  timestamp: string
  fix_description?: string
  code_snippet?: string
}

type DetectResponse = {
  anomalies: Anomaly[]
  hourly?: { hour: string; count: number }[]
  avgHourly?: number
}

type ValidationCheck = {
  field: string
  label: string
  required: boolean
  passed: boolean
  howToFix: string
}

type EventRow = {
  id: string
  event_name: string
  platform: string
  value: number | null
  status: string
  created_at: string
  validation_score?: number | null
  validation_issues?: string[] | null
  validation_checks?: ValidationCheck[] | null
  [key: string]: unknown
}

const ANOMALY_LABELS: Record<string, string> = {
  event_drop: 'Event Drop',
  duplicate_events: 'Duplicate',
  failed_api_calls: 'Failed Call',
  value_anomaly: 'Missing Value',
  spike: 'Spike',
  platform_mismatch: 'Platform Mismatch',
}

function SeverityBadge({ severity }: { severity: string }) {
  const c =
    severity === 'high'
      ? 'bg-[var(--dash-danger)]/20 text-red-400 border-red-500/50'
      : severity === 'medium'
        ? 'bg-[var(--dash-warning)]/20 text-amber-400 border-amber-500/50'
        : 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50'
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded border ${c}`}>
      {severity}
    </span>
  )
}

function FixModal({
  anomaly,
  onClose,
}: {
  anomaly: Anomaly
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60" onClick={onClose}>
      <div
        className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-[var(--dash-border)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--dash-text)]">
            Fix: {ANOMALY_LABELS[anomaly.type] ?? anomaly.type}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--dash-muted)] hover:text-[var(--dash-text)] p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-4">
          {anomaly.fix_description ? (
            <p className="text-[var(--dash-muted)] text-sm">{anomaly.fix_description}</p>
          ) : (
            <p className="text-[var(--dash-muted)] text-sm">
              No AI fix available. Add OPENROUTER_API_KEY for generated fixes.
            </p>
          )}
          {anomaly.code_snippet && (
            <pre className="text-xs bg-[var(--dash-surface-hover)] rounded-lg p-4 overflow-auto text-[var(--dash-muted)] border border-[var(--dash-border)]">
              {anomaly.code_snippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnomaliesClient() {
  const [tab, setTab] = useState<'monitor' | 'validator'>('monitor')
  const [anomalies, setAnomalies] = useState<Anomaly[]>([])
  const [hourly, setHourly] = useState<{ hour: string; count: number }[]>([])
  const [avgHourly, setAvgHourly] = useState(0)
  const [loading, setLoading] = useState(true)
  const [fixModal, setFixModal] = useState<Anomaly | null>(null)

  const [events, setEvents] = useState<EventRow[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)
  const [validateInput, setValidateInput] = useState('')
  const [validateResult, setValidateResult] = useState<{
    valid: boolean
    score: number
    checks: ValidationCheck[]
    issues: string[]
  } | null>(null)
  const [validateLoading, setValidateLoading] = useState(false)

  const fetchDetect = useCallback(async () => {
    const res = await fetch('/api/anomalies/detect')
    if (!res.ok) return
    const data: DetectResponse = await res.json()
    setAnomalies(data.anomalies ?? [])
    setHourly(data.hourly ?? [])
    setAvgHourly(data.avgHourly ?? 0)
    setLoading(false)
  }, [])

  const fetchEvents = useCallback(async () => {
    const res = await fetch('/api/dashboard/events?date_range=today')
    if (!res.ok) return
    const data = await res.json()
    setEvents((data.events ?? []).slice(0, 50))
    setEventsLoading(false)
  }, [])

  useEffect(() => {
    fetchDetect()
  }, [fetchDetect])

  useEffect(() => {
    const interval = setInterval(fetchDetect, 30000)
    return () => clearInterval(interval)
  }, [fetchDetect])

  useEffect(() => {
    if (tab === 'validator') {
      fetchEvents()
      const interval = setInterval(fetchEvents, 30000)
      return () => clearInterval(interval)
    }
  }, [tab, fetchEvents])

  const runValidate = useCallback(async () => {
    let event: Record<string, unknown>
    try {
      event = JSON.parse(validateInput || '{}')
    } catch {
      setValidateResult({
        valid: false,
        score: 0,
        checks: [],
        issues: ['Invalid JSON'],
      })
      return
    }
    setValidateLoading(true)
    setValidateResult(null)
    try {
      const res = await fetch('/api/anomalies/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event }),
      })
      const data = await res.json()
      setValidateResult(data)
    } finally {
      setValidateLoading(false)
    }
  }, [validateInput])

  const currentHourCount = hourly.length ? (hourly[hourly.length - 1]?.count ?? 0) : 0
  const eventDropAlert = avgHourly > 0 && currentHourCount < avgHourly * 0.5
  const duplicateAlert = anomalies.some((a) => a.type === 'duplicate_events')
  const failedAlert = anomalies.some((a) => a.type === 'failed_api_calls')
  const valueAlert = anomalies.some((a) => a.type === 'value_anomaly')

  const chartData = hourly.map((h) => ({
    hour: new Date(h.hour).toLocaleTimeString('en-US', { hour: 'numeric', hour12: true }),
    count: h.count,
    below: avgHourly > 0 && h.count < avgHourly * 0.5,
  }))

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Anomaly Detection & Event Validation</h1>

      <div className="flex gap-2 mb-6 border-b border-[var(--dash-border)] pb-2">
        <button
          type="button"
          onClick={() => setTab('monitor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'monitor'
              ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)]'
              : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
          }`}
        >
          Anomaly Monitor
        </button>
        <button
          type="button"
          onClick={() => setTab('validator')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'validator'
              ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)]'
              : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
          }`}
        >
          Event Validator
        </button>
      </div>

      {tab === 'monitor' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div
              className={`rounded-xl border p-4 ${
                eventDropAlert
                  ? 'bg-[var(--dash-danger)]/10 border-red-500/50'
                  : 'bg-[var(--dash-surface)] border-[var(--dash-border)]'
              }`}
            >
              <p className="text-sm text-[var(--dash-muted)] mb-1">Event Drop Alert</p>
              <p className={`text-lg font-semibold ${eventDropAlert ? 'text-red-400' : 'text-[var(--dash-text)]'}`}>
                {eventDropAlert ? 'Low' : 'OK'}
              </p>
              <p className="text-xs text-[var(--dash-muted)] mt-1">Today vs daily average</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                duplicateAlert
                  ? 'bg-[var(--dash-danger)]/10 border-red-500/50'
                  : 'bg-[var(--dash-surface)] border-[var(--dash-border)]'
              }`}
            >
              <p className="text-sm text-[var(--dash-muted)] mb-1">Duplicate Events</p>
              <p className={`text-lg font-semibold ${duplicateAlert ? 'text-red-400' : 'text-[var(--dash-text)]'}`}>
                {duplicateAlert ? 'Detected' : 'OK'}
              </p>
              <p className="text-xs text-[var(--dash-muted)] mt-1">3+ same in 1 min</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                failedAlert
                  ? 'bg-[var(--dash-danger)]/10 border-red-500/50'
                  : 'bg-[var(--dash-surface)] border-[var(--dash-border)]'
              }`}
            >
              <p className="text-sm text-[var(--dash-muted)] mb-1">Failed API Calls</p>
              <p className={`text-lg font-semibold ${failedAlert ? 'text-red-400' : 'text-[var(--dash-text)]'}`}>
                {failedAlert ? 'Yes' : 'None'}
              </p>
              <p className="text-xs text-[var(--dash-muted)] mt-1">Last hour</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                valueAlert
                  ? 'bg-[var(--dash-danger)]/10 border-red-500/50'
                  : 'bg-[var(--dash-surface)] border-[var(--dash-border)]'
              }`}
            >
              <p className="text-sm text-[var(--dash-muted)] mb-1">Value Anomaly</p>
              <p className={`text-lg font-semibold ${valueAlert ? 'text-red-400' : 'text-[var(--dash-text)]'}`}>
                {valueAlert ? 'Found' : 'OK'}
              </p>
              <p className="text-xs text-[var(--dash-muted)] mt-1">Purchase value 0/null</p>
            </div>
          </div>

          <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden mb-6">
            <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
              Anomaly Timeline
            </h2>
            {loading ? (
              <div className="py-8 text-center text-[var(--dash-muted)] text-sm">Loading...</div>
            ) : anomalies.length === 0 ? (
              <div className="py-8 text-center text-[var(--dash-muted)] text-sm">No anomalies detected.</div>
            ) : (
              <ul className="divide-y divide-[var(--dash-border)]">
                {[...anomalies].reverse().map((a) => (
                  <li key={a.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-[var(--dash-muted)] text-sm">
                      {ANOMALY_LABELS[a.type] ?? a.type}
                    </span>
                    <span className="text-[var(--dash-muted)] text-sm flex-1 min-w-0">{a.description}</span>
                    <span className="text-[var(--dash-muted)] text-xs shrink-0">
                      {new Date(a.timestamp).toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => setFixModal(a)}
                      className="text-amber-400 hover:text-amber-300 text-sm font-medium"
                    >
                      Fix
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
            <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Events per hour (last 24h)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                  />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#0f172a' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#2563eb">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.below ? '#ef4444' : '#2563eb'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-[var(--dash-muted)] mt-2">Bars in red are 50% below average. Auto-refresh 30s.</p>
          </div>
        </>
      )}

      {tab === 'validator' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
            <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-2">Validate an event (JSON)</h2>
            <textarea
              value={validateInput}
              onChange={(e) => setValidateInput(e.target.value)}
              placeholder='{"event_name":"Purchase","event_time":1234567890,"value":99,"currency":"USD",...}'
              className="w-full h-24 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)] placeholder:text-[var(--dash-muted)]"
            />
            <button
              type="button"
              onClick={runValidate}
              disabled={validateLoading}
              className="mt-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 shadow-sm transition-colors"
            >
              {validateLoading ? 'Validating...' : 'Validate'}
            </button>
            {validateResult && (
              <div className="mt-4 p-4 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)]">
                <p className="text-sm text-[var(--dash-muted)] mb-2">
                  Score: {validateResult.score} —{' '}
                  {validateResult.valid ? (
                    <span className="text-[var(--dash-success)]">Valid</span>
                  ) : (
                    <span className="text-red-400">Has issues</span>
                  )}
                </p>
                <ul className="space-y-1">
                  {validateResult.checks.map((c) => (
                    <li key={c.field} className="flex items-center gap-2 text-sm">
                      {c.passed ? (
                        <span className="text-[var(--dash-success)]">✅</span>
                      ) : (
                        <span className="text-red-400">❌</span>
                      )}
                      <span className={c.passed ? 'text-[var(--dash-muted)]' : 'text-[var(--dash-muted)]'}>
                        {c.label}
                      </span>
                      {!c.passed && (
                        <span
                          className="text-[var(--dash-muted)] text-xs cursor-help"
                          title={c.howToFix}
                        >
                          (hover for fix)
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">
              Live feed — recent events (auto-refresh 30s)
            </h2>
            {eventsLoading && !events.length ? (
              <div className="py-8 text-center text-[var(--dash-muted)] text-sm">Loading events...</div>
            ) : !events.length ? (
              <div className="py-8 text-center text-[var(--dash-muted)] text-sm">No events yet.</div>
            ) : (
              <ul className="divide-y divide-[var(--dash-border)]">
                {events.map((row) => {
                  const score = row.validation_score ?? 100
                  const checks = (row.validation_checks ?? []) as ValidationCheck[]
                  const status =
                    score === 100
                      ? 'valid'
                      : row.validation_issues?.some((i) => i.startsWith('Missing required'))
                        ? 'error'
                        : 'warning'
                  return (
                    <li key={row.id} className="px-4 py-3">
                      <div className="flex items-center gap-3 flex-wrap">
                        {status === 'valid' && (
                          <span className="text-[var(--dash-success)]" title="Valid">✅</span>
                        )}
                        {status === 'warning' && (
                          <span className="text-amber-400" title="Warning">⚠️</span>
                        )}
                        {status === 'error' && (
                          <span className="text-red-400" title="Error">❌</span>
                        )}
                        <span className="font-medium text-[var(--dash-text)]">{row.event_name}</span>
                        <span className="text-[var(--dash-muted)] text-sm">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                        <span className="text-[var(--dash-muted)] text-sm">Score: {score}</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {checks.length > 0 ? (
                          checks.map((c) => (
                            <span
                              key={c.field}
                              className="inline-flex items-center gap-1 text-xs"
                              title={!c.passed ? c.howToFix : undefined}
                            >
                              {c.passed ? (
                                <span className="text-[var(--dash-success)]">✅</span>
                              ) : (
                                <span className="text-red-500">❌</span>
                              )}
                              <span className="text-[var(--dash-muted)]">{c.label}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-[var(--dash-muted)] text-xs">No checks stored</span>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      )}

      {fixModal && (
        <FixModal anomaly={fixModal} onClose={() => setFixModal(null)} />
      )}
    </div>
  )
}




