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
      ? 'bg-red-500/20 text-red-400 border-red-500/50'
      : severity === 'medium'
        ? 'bg-amber-500/20 text-amber-400 border-amber-500/50'
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
        className="rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl max-w-lg w-full max-h-[80vh] overflow-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-4 border-b border-zinc-800 flex items-center justify-between">
          <h3 className="font-semibold text-white">
            Fix: {ANOMALY_LABELS[anomaly.type] ?? anomaly.type}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1"
            aria-label="Close"
          >
            ×
          </button>
        </div>
        <div className="p-4 space-y-4">
          {anomaly.fix_description ? (
            <p className="text-zinc-300 text-sm">{anomaly.fix_description}</p>
          ) : (
            <p className="text-zinc-500 text-sm">
              No AI fix available. Add OPENROUTER_API_KEY for generated fixes.
            </p>
          )}
          {anomaly.code_snippet && (
            <pre className="text-xs bg-zinc-950 rounded-lg p-4 overflow-auto text-zinc-300 border border-zinc-800">
              {anomaly.code_snippet}
            </pre>
          )}
        </div>
      </div>
    </div>
  )
}

export default function AnomaliesPage() {
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
      <h1 className="text-xl font-semibold text-white mb-6">Anomaly Detection & Event Validation</h1>

      <div className="flex gap-2 mb-6 border-b border-zinc-800 pb-2">
        <button
          type="button"
          onClick={() => setTab('monitor')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'monitor'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
          }`}
        >
          Anomaly Monitor
        </button>
        <button
          type="button"
          onClick={() => setTab('validator')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            tab === 'validator'
              ? 'bg-zinc-700 text-white'
              : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
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
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <p className="text-sm text-zinc-400 mb-1">Event Drop Alert</p>
              <p className={`text-lg font-semibold ${eventDropAlert ? 'text-red-400' : 'text-white'}`}>
                {eventDropAlert ? 'Low' : 'OK'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Today vs daily average</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                duplicateAlert
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <p className="text-sm text-zinc-400 mb-1">Duplicate Events</p>
              <p className={`text-lg font-semibold ${duplicateAlert ? 'text-red-400' : 'text-white'}`}>
                {duplicateAlert ? 'Detected' : 'OK'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">3+ same in 1 min</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                failedAlert
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <p className="text-sm text-zinc-400 mb-1">Failed API Calls</p>
              <p className={`text-lg font-semibold ${failedAlert ? 'text-red-400' : 'text-white'}`}>
                {failedAlert ? 'Yes' : 'None'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Last hour</p>
            </div>
            <div
              className={`rounded-xl border p-4 ${
                valueAlert
                  ? 'bg-red-500/10 border-red-500/50'
                  : 'bg-zinc-900 border-zinc-800'
              }`}
            >
              <p className="text-sm text-zinc-400 mb-1">Value Anomaly</p>
              <p className={`text-lg font-semibold ${valueAlert ? 'text-red-400' : 'text-white'}`}>
                {valueAlert ? 'Found' : 'OK'}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Purchase value 0/null</p>
            </div>
          </div>

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden mb-6">
            <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
              Anomaly Timeline
            </h2>
            {loading ? (
              <div className="py-8 text-center text-zinc-500 text-sm">Loading...</div>
            ) : anomalies.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 text-sm">No anomalies detected.</div>
            ) : (
              <ul className="divide-y divide-zinc-800">
                {[...anomalies].reverse().map((a) => (
                  <li key={a.id} className="px-4 py-3 flex flex-wrap items-center gap-3">
                    <SeverityBadge severity={a.severity} />
                    <span className="text-zinc-400 text-sm">
                      {ANOMALY_LABELS[a.type] ?? a.type}
                    </span>
                    <span className="text-zinc-300 text-sm flex-1 min-w-0">{a.description}</span>
                    <span className="text-zinc-500 text-xs shrink-0">
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

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-300 mb-4">Events per hour (last 24h)</h2>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                  <XAxis
                    dataKey="hour"
                    tick={{ fill: '#a1a1aa', fontSize: 10 }}
                    stroke="#3f3f46"
                  />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 10 }} stroke="#3f3f46" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#18181b',
                      border: '1px solid #3f3f46',
                      borderRadius: '8px',
                    }}
                    labelStyle={{ color: '#d4d4d8' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]} fill="#3f3f46">
                    {chartData.map((entry, i) => (
                      <Cell key={i} fill={entry.below ? '#ef4444' : '#3f3f46'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="text-xs text-zinc-500 mt-2">Bars in red are 50% below average. Auto-refresh 30s.</p>
          </div>
        </>
      )}

      {tab === 'validator' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <h2 className="text-sm font-medium text-zinc-300 mb-2">Validate an event (JSON)</h2>
            <textarea
              value={validateInput}
              onChange={(e) => setValidateInput(e.target.value)}
              placeholder='{"event_name":"Purchase","event_time":1234567890,"value":99,"currency":"USD",...}'
              className="w-full h-24 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm font-mono focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500"
            />
            <button
              type="button"
              onClick={runValidate}
              disabled={validateLoading}
              className="mt-2 px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium disabled:opacity-50"
            >
              {validateLoading ? 'Validating...' : 'Validate'}
            </button>
            {validateResult && (
              <div className="mt-4 p-4 rounded-lg bg-zinc-950 border border-zinc-800">
                <p className="text-sm text-zinc-400 mb-2">
                  Score: {validateResult.score} —{' '}
                  {validateResult.valid ? (
                    <span className="text-emerald-400">Valid</span>
                  ) : (
                    <span className="text-red-400">Has issues</span>
                  )}
                </p>
                <ul className="space-y-1">
                  {validateResult.checks.map((c) => (
                    <li key={c.field} className="flex items-center gap-2 text-sm">
                      {c.passed ? (
                        <span className="text-emerald-400">✅</span>
                      ) : (
                        <span className="text-red-400">❌</span>
                      )}
                      <span className={c.passed ? 'text-zinc-300' : 'text-zinc-400'}>
                        {c.label}
                      </span>
                      {!c.passed && (
                        <span
                          className="text-zinc-500 text-xs cursor-help"
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

          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
              Live feed — recent events (auto-refresh 30s)
            </h2>
            {eventsLoading && !events.length ? (
              <div className="py-8 text-center text-zinc-500 text-sm">Loading events...</div>
            ) : !events.length ? (
              <div className="py-8 text-center text-zinc-500 text-sm">No events yet.</div>
            ) : (
              <ul className="divide-y divide-zinc-800">
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
                          <span className="text-emerald-400" title="Valid">✅</span>
                        )}
                        {status === 'warning' && (
                          <span className="text-amber-400" title="Warning">⚠️</span>
                        )}
                        {status === 'error' && (
                          <span className="text-red-400" title="Error">❌</span>
                        )}
                        <span className="font-medium text-white">{row.event_name}</span>
                        <span className="text-zinc-500 text-sm">
                          {new Date(row.created_at).toLocaleString()}
                        </span>
                        <span className="text-zinc-400 text-sm">Score: {score}</span>
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
                                <span className="text-emerald-500">✅</span>
                              ) : (
                                <span className="text-red-500">❌</span>
                              )}
                              <span className="text-zinc-500">{c.label}</span>
                            </span>
                          ))
                        ) : (
                          <span className="text-zinc-500 text-xs">No checks stored</span>
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
