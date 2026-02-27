'use client'

import { useState, useEffect, useCallback } from 'react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const PLATFORMS = [
  { value: 'all', label: 'All' },
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
  { value: 'tiktok', label: 'TikTok' },
  { value: 'snapchat', label: 'Snapchat' },
  { value: 'ga4', label: 'GA4' },
]

const EVENT_TYPES = [
  { value: 'all', label: 'All' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Lead', label: 'Lead' },
  { value: 'PageView', label: 'PageView' },
  { value: 'AddToCart', label: 'AddToCart' },
  { value: 'ViewContent', label: 'ViewContent' },
]

type ExportRow = {
  event_id: string
  event_name: string
  platform: string
  value: number
  currency: string
  country: string
  city: string
  device_type: string
  customer_type: string
  status: string
  created_at: string
  enriched_data?: Record<string, unknown>
}

type LogEntry = {
  timestamp: string
  platform: string
  request_payload: Record<string, unknown>
  response: Record<string, unknown>
  status: number
  latency_ms: number
}

type Summary = {
  total_events: number
  total_data_size_kb: number
  oldest_event_date: string
  most_common_event: string
  top_country: string
  top_device_type: string
  events_per_day: { date: string; count: number }[]
}

export default function RawDataPage() {
  const [tab, setTab] = useState<'export' | 'logs' | 'summary'>('export')

  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [platform, setPlatform] = useState('all')
  const [eventType, setEventType] = useState('all')
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [previewEvents, setPreviewEvents] = useState<ExportRow[]>([])
  const [previewLoading, setPreviewLoading] = useState(false)
  const [downloadError, setDownloadError] = useState<string | null>(null)
  const [isPro, setIsPro] = useState(false)

  const [logs, setLogs] = useState<LogEntry[]>([])
  const [logsLoading, setLogsLoading] = useState(false)
  const [autoRefresh, setAutoRefresh] = useState(false)

  const [summary, setSummary] = useState<Summary | null>(null)
  const [summaryLoading, setSummaryLoading] = useState(false)

  const fetchPreview = useCallback(async () => {
    setPreviewLoading(true)
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (platform !== 'all') params.set('platform', platform)
    if (eventType !== 'all') params.set('event_name', eventType)
    params.set('limit', '10')
    const res = await fetch(`/api/raw-data/export?${params}`)
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.events) setPreviewEvents(data.events)
    setPreviewLoading(false)
  }, [fromDate, toDate, platform, eventType])

  const fetchLogs = useCallback(async () => {
    setLogsLoading(true)
    const res = await fetch('/api/raw-data/logs')
    const data = await res.json().catch(() => ({}))
    if (res.ok && data.logs) setLogs(data.logs)
    setLogsLoading(false)
  }, [])

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true)
    const res = await fetch('/api/raw-data/summary')
    const data = await res.json().catch(() => ({}))
    if (res.ok) setSummary(data)
    setSummaryLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'export') fetchPreview()
  }, [tab, fetchPreview])

  useEffect(() => {
    if (tab === 'logs') fetchLogs()
  }, [tab, fetchLogs])

  useEffect(() => {
    if (tab === 'summary') fetchSummary()
  }, [tab, fetchSummary])

  useEffect(() => {
    if (!autoRefresh || tab !== 'logs') return
    const id = setInterval(fetchLogs, 30000)
    return () => clearInterval(id)
  }, [autoRefresh, tab, fetchLogs])

  const handleExport = async () => {
    const params = new URLSearchParams()
    if (fromDate) params.set('from', fromDate)
    if (toDate) params.set('to', toDate)
    if (platform !== 'all') params.set('platform', platform)
    if (eventType !== 'all') params.set('event_name', eventType)
    params.set('format', format)
    const res = await fetch(`/api/raw-data/export?${params}`)
    if (res.status === 403) {
      setDownloadError('Full export is a Pro feature. Please upgrade.')
      return
    }
    setDownloadError(null)
    const blob = await res.blob()
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackhive-export-${new Date().toISOString().slice(0, 10)}.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }


  const tabs = [
    { id: 'export' as const, label: 'Events Export' },
    { id: 'logs' as const, label: 'Raw API Logs' },
    { id: 'summary' as const, label: 'Data Summary' },
  ]

  return (
    <div className="p-6 md:p-8 max-w-6xl">
      <h1 className="text-xl font-semibold text-white mb-2">Raw Data</h1>
      <p className="text-zinc-400 text-sm mb-6">
        Export events, view API logs, and see data summary.
      </p>

      <div className="flex gap-2 border-b border-zinc-800 mb-6">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
              tab === t.id
                ? 'bg-zinc-800 text-white border border-b-0 border-zinc-700 -mb-px'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'export' && (
        <div className="space-y-6">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-zinc-400 mb-1">From</label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">To</label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              >
                {PLATFORMS.map((p) => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-zinc-400 mb-1">Event type</label>
              <select
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              >
                {EVENT_TYPES.map((e) => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-zinc-400">Format</span>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as 'json' | 'csv')}
                className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <button
              type="button"
              onClick={fetchPreview}
              disabled={previewLoading}
              className="px-4 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm font-medium"
            >
              {previewLoading ? 'Loading…' : 'Export Data'}
            </button>
          </div>

          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <p className="text-xs text-zinc-400 p-3 border-b border-zinc-800">Preview (first 10 rows)</p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-400 font-medium">event_id</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">event_name</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">platform</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">value</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">currency</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">country</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">city</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">device_type</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">customer_type</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">status</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">created_at</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">enriched_data</th>
                  </tr>
                </thead>
                <tbody>
                  {previewEvents.map((e, i) => (
                    <ExportRow key={i} row={e} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {downloadError && (
            <div className="p-3 rounded-lg bg-amber-900/30 border border-amber-800 text-amber-300 text-sm">
              {downloadError}
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium"
            >
              Download Full Export
            </button>
            {!isPro && (
              <p className="text-xs text-zinc-500 mt-2">Pro feature — upgrade to download full export.</p>
            )}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer text-sm text-zinc-400">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-zinc-600 accent-emerald-600"
              />
              Auto-refresh every 30 seconds
            </label>
            <button
              type="button"
              onClick={fetchLogs}
              disabled={logsLoading}
              className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-white text-sm"
            >
              {logsLoading ? 'Loading…' : 'Refresh'}
            </button>
          </div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-800">
                    <th className="text-left p-3 text-zinc-400 font-medium">Timestamp</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">Platform</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">Request payload</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">Response</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">Status</th>
                    <th className="text-left p-3 text-zinc-400 font-medium">Latency</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log, i) => (
                    <LogRow key={i} log={log} />
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'summary' && (
        <div className="space-y-6">
          {summaryLoading ? (
            <p className="text-zinc-400">Loading summary…</p>
          ) : summary ? (
            <>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                <StatCard label="Total events stored" value={String(summary.total_events)} />
                <StatCard label="Total data size (KB)" value={String(summary.total_data_size_kb)} />
                <StatCard label="Oldest event date" value={summary.oldest_event_date} />
                <StatCard label="Most common event" value={summary.most_common_event} />
                <StatCard label="Top country" value={summary.top_country} />
                <StatCard label="Top device type" value={summary.top_device_type} />
              </div>
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
                <h3 className="text-sm font-medium text-zinc-300 mb-4">Events per day (last 30 days)</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={summary.events_per_day}>
                      <XAxis dataKey="date" stroke="#71717a" fontSize={11} tickFormatter={(v) => v.slice(5)} />
                      <YAxis stroke="#71717a" fontSize={11} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#27272a', border: '1px solid #3f3f46' }}
                        labelStyle={{ color: '#a1a1aa' }}
                      />
                      <Bar dataKey="count" fill="#10b981" radius={[2, 2, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          ) : (
            <p className="text-zinc-400">No summary data.</p>
          )}
        </div>
      )}
    </div>
  )
}

function ExportRow({ row }: { row: ExportRow }) {
  const [openEnriched, setOpenEnriched] = useState(false)
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
      <td className="p-3 text-zinc-300 font-mono text-xs">{String(row.event_id).slice(0, 8)}…</td>
      <td className="p-3 text-zinc-300">{row.event_name}</td>
      <td className="p-3 text-zinc-300">{row.platform}</td>
      <td className="p-3 text-zinc-300">{row.value}</td>
      <td className="p-3 text-zinc-300">{row.currency}</td>
      <td className="p-3 text-zinc-300">{row.country}</td>
      <td className="p-3 text-zinc-300">{row.city}</td>
      <td className="p-3 text-zinc-300">{row.device_type}</td>
      <td className="p-3 text-zinc-300">{row.customer_type}</td>
      <td className="p-3 text-zinc-300">{row.status}</td>
      <td className="p-3 text-zinc-400 text-xs">{row.created_at?.slice(0, 19)}</td>
      <td className="p-3">
        {row.enriched_data ? (
          <>
            <button
              type="button"
              onClick={() => setOpenEnriched(!openEnriched)}
              className="text-xs text-emerald-500 hover:text-emerald-400"
            >
              {openEnriched ? 'Hide' : 'Expand'} JSON
            </button>
            {openEnriched && (
              <pre className="mt-1 p-2 rounded bg-zinc-950 text-zinc-400 text-xs overflow-x-auto max-w-xs">
                {JSON.stringify(row.enriched_data, null, 2)}
              </pre>
            )}
          </>
        ) : (
          <span className="text-zinc-500">—</span>
        )}
      </td>
    </tr>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
      <p className="text-xs text-zinc-400 mb-1">{label}</p>
      <p className="text-lg font-semibold text-white truncate" title={value}>{value}</p>
    </div>
  )
}

function LogRow({ log }: { log: LogEntry }) {
  const [openPayload, setOpenPayload] = useState(false)
  const [openResponse, setOpenResponse] = useState(false)
  return (
    <tr className="border-b border-zinc-800/50 hover:bg-zinc-800/30">
      <td className="p-3 text-zinc-400 text-xs whitespace-nowrap">{log.timestamp?.slice(0, 19)}</td>
      <td className="p-3 text-zinc-300 capitalize">{log.platform}</td>
      <td className="p-3">
        <button
          type="button"
          onClick={() => setOpenPayload(!openPayload)}
          className="text-xs text-emerald-500 hover:text-emerald-400"
        >
          {openPayload ? 'Hide' : 'Show'} JSON
        </button>
        {openPayload && (
          <pre className="mt-1 p-2 rounded bg-zinc-950 text-zinc-400 text-xs overflow-x-auto max-w-md">
            {JSON.stringify(log.request_payload, null, 2)}
          </pre>
        )}
      </td>
      <td className="p-3">
        <button
          type="button"
          onClick={() => setOpenResponse(!openResponse)}
          className="text-xs text-emerald-500 hover:text-emerald-400"
        >
          {openResponse ? 'Hide' : 'Show'} JSON
        </button>
        {openResponse && (
          <pre className="mt-1 p-2 rounded bg-zinc-950 text-zinc-400 text-xs overflow-x-auto max-w-md">
            {JSON.stringify(log.response, null, 2)}
          </pre>
        )}
      </td>
      <td className="p-3">
        <span className={log.status >= 400 ? 'text-red-400' : 'text-emerald-400'}>{log.status}</span>
      </td>
      <td className="p-3 text-zinc-400">{log.latency_ms} ms</td>
    </tr>
  )
}
