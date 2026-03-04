'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'

type EventRow = {
  id: string
  user_id: string
  event_id?: string | null
  event_name: string
  platform: string
  value: number | null
  status: string
  ip: string | null
  created_at: string
  fbclid?: string | null
  fbc?: string | null
  data_quality_score?: number | null
  data_quality_label?: string | null
  data_quality_breakdown?: Record<string, boolean> | null
  meta_status?: string | null
  ga4_status?: string | null
  tiktok_status?: string | null
  google_status?: string | null
  [key: string]: unknown
}

type RetryJobMap = Record<string, { status: string; next_retry_at?: string }>

const QUALITY_FIELDS: { key: keyof EventRow; label: string; points: number }[] = [
  { key: 'email', label: 'Email', points: 20 },
  { key: 'fbp', label: 'fbp', points: 20 },
  { key: 'fbc', label: 'fbc', points: 15 },
  { key: 'phone', label: 'Phone', points: 15 },
  { key: 'name', label: 'Name', points: 10 },
  { key: 'location', label: 'Location', points: 10 },
  { key: 'fbclid', label: 'fbclid', points: 10 },
]

function QualityBadge({ row }: { row: EventRow }) {
  const score = row.data_quality_score ?? 0
  const label = row.data_quality_label ?? 'Poor'
  const breakdown = row.data_quality_breakdown ?? {}
  const badgeClass =
    score >= 80
      ? 'bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border-[var(--dash-success)]'
      : score >= 60
        ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border-[var(--dash-primary)]'
        : score >= 40
          ? 'bg-amber-950 text-amber-400 border-amber-800'
          : 'bg-red-950 text-red-400 border-red-800'
  return (
    <span
      title={`Data Quality: ${score}/100`}
      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border cursor-help ${badgeClass}`}
    >
      {label}
    </span>
  )
}

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 60) return 'Just now'
  if (sec < 3600) return `${Math.floor(sec / 60)} mins ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)} hours ago`
  if (sec < 604800) return `${Math.floor(sec / 86400)} days ago`
  return d.toLocaleDateString()
}

function formatRetryIn(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const sec = Math.floor((d.getTime() - now.getTime()) / 1000)
  if (sec <= 0) return 'any moment'
  if (sec < 60) return 'under a minute'
  if (sec < 3600) return `${Math.floor(sec / 60)} mins`
  return `${Math.floor(sec / 3600)} hours`
}

function RetryBadge({ row, retryMap }: { row: EventRow; retryMap: RetryJobMap }) {
  const eid = row.event_id
  if (!eid || typeof eid !== 'string') return null
  const job = retryMap[eid]
  if (!job) return null
  if (job.status === 'success') {
    return (
      <span
        title="Retry succeeded; event delivered to Meta."
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)] ml-1 cursor-help"
      >
        Recovered
      </span>
    )
  }
  if (job.status === 'pending' || job.status === 'retrying') {
    const retryIn = job.next_retry_at ? formatRetryIn(job.next_retry_at) : ''
    return (
      <span
        title={retryIn ? `Retry scheduled in ${retryIn}` : 'In retry queue'}
        className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950 text-amber-400 border border-amber-800 ml-1 cursor-help"
      >
        In Retry Queue
      </span>
    )
  }
  return null
}

function modeEventName(events: EventRow[]): string {
  if (!events.length) return '—'
  const counts: Record<string, number> = {}
  for (const e of events) {
    const n = e.event_name || 'Unknown'
    counts[n] = (counts[n] || 0) + 1
  }
  let max = 0
  let name = '—'
  for (const [n, c] of Object.entries(counts)) {
    if (c > max) {
      max = c
      name = n
    }
  }
  return name
}

const PLATFORMS = [
  { value: 'all', label: 'All' },
  { value: 'meta', label: 'Meta' },
  { value: 'google', label: 'Google' },
]

const EVENT_NAMES = [
  { value: 'all', label: 'All' },
  { value: 'Purchase', label: 'Purchase' },
  { value: 'Lead', label: 'Lead' },
  { value: 'PageView', label: 'PageView' },
  { value: 'AddToCart', label: 'AddToCart' },
]

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'success', label: 'Success' },
  { value: 'failed', label: 'Failed' },
]

const DATE_RANGES = [
  { value: 'today', label: 'Today' },
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
]

export default function LogsPage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [totalToday, setTotalToday] = useState(0)
  const [loading, setLoading] = useState(true)
  const [platform, setPlatform] = useState('all')
  const [eventName, setEventName] = useState('all')
  const [status, setStatus] = useState('all')
  const [dateRange, setDateRange] = useState('today')
  const [search, setSearch] = useState('')
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [newPulse, setNewPulse] = useState(false)
  const [prevCount, setPrevCount] = useState(0)
  const [matchRate, setMatchRate] = useState<{
    total_events?: number
    estimated_match_rate?: number
    avg_quality?: number
    coverage?: { fbclid?: number }
  } | null>(null)
  const [retryMap, setRetryMap] = useState<RetryJobMap>({})

  useEffect(() => {
    fetch('/api/meta/match-rate')
      .then((r) => r.json())
      .then(setMatchRate)
      .catch(() => setMatchRate(null))
  }, [])

  const fetchRetryMap = useCallback(() => {
    fetch('/api/dashboard/retry-queue')
      .then((r) => r.json())
      .then((data) => {
        const map: RetryJobMap = {}
        for (const j of data.jobs ?? []) {
          if (j.event_id) map[j.event_id] = { status: j.status, next_retry_at: j.next_retry_at }
        }
        setRetryMap(map)
      })
      .catch(() => setRetryMap({}))
  }, [])

  useEffect(() => {
    fetchRetryMap()
  }, [fetchRetryMap])

  useEffect(() => {
    const interval = setInterval(fetchRetryMap, 15000)
    return () => clearInterval(interval)
  }, [fetchRetryMap])

  const fetchEvents = useCallback(async () => {
    const params = new URLSearchParams()
    if (platform !== 'all') params.set('platform', platform)
    if (eventName !== 'all') params.set('event_name', eventName)
    if (status !== 'all') params.set('status', status)
    params.set('date_range', dateRange)
    if (search.trim()) params.set('search', search.trim())
    const res = await fetch(`/api/dashboard/events?${params}`)
    if (!res.ok) return
    const data = await res.json()
    const list: EventRow[] = data.events ?? []
    setEvents(list)
    setTotalToday(data.totalToday ?? 0)
    setLoading(false)
    if (list.length > prevCount && prevCount > 0) {
      setNewPulse(true)
      setTimeout(() => setNewPulse(false), 4000)
    }
    setPrevCount(list.length)
  }, [platform, eventName, status, dateRange, search, prevCount])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  useEffect(() => {
    const interval = setInterval(fetchEvents, 10000)
    return () => clearInterval(interval)
  }, [fetchEvents])

  const successCount = events.filter((e) => e.status === 'success').length
  const successRate = events.length ? Math.round((successCount / events.length) * 100) : 0
  const mostFired = modeEventName(events)
  const lastEventTime = events[0]?.created_at
    ? formatRelative(events[0].created_at)
    : '—'

  return (
    <div className="p-6 md:p-8">
      <div className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] px-4 py-3 mb-6 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-[var(--dash-muted)]">
        <span>
          This month: <span className="text-[var(--dash-text)] font-medium">{matchRate?.total_events ?? 0}</span> events
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span>
          Est. Match Rate: <span className="text-[var(--dash-text)] font-medium">{matchRate?.estimated_match_rate ?? 0}%</span>
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span>
          Avg Quality: <span className="text-[var(--dash-text)] font-medium">{matchRate?.avg_quality ?? 0}/100</span>
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span>
          Ad Clicks: <span className="text-[var(--dash-text)] font-medium">{matchRate?.coverage?.fbclid ?? 0}%</span>
        </span>
      </div>
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--dash-text)]">Event logs</h1>
        {newPulse && (
          <span
            className="flex h-2 w-2 rounded-full bg-[var(--dash-success)] animate-pulse"
            title="New events"
            aria-hidden
          />
        )}
        {!newPulse && (
          <span
            className="flex h-2 w-2 rounded-full bg-[var(--dash-success)]/50"
            title="Live"
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
        >
          {PLATFORMS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
        >
          {EVENT_NAMES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
        >
          {STATUSES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <select
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
        >
          {DATE_RANGES.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <input
          type="search"
          placeholder="Search event name or IP..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-[var(--dash-text)] px-3 py-2 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)] placeholder:text-[var(--dash-muted)]"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Total events today</p>
          <p className="text-xl font-semibold text-[var(--dash-text)]">{totalToday}</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Success rate</p>
          <p className="text-xl font-semibold text-[var(--dash-text)]">{successRate}%</p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Most fired event</p>
          <p className="text-xl font-semibold text-[var(--dash-text)] truncate" title={mostFired}>
            {mostFired}
          </p>
        </div>
        <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Last event</p>
          <p className="text-xl font-semibold text-[var(--dash-text)]">{lastEventTime}</p>
        </div>
      </div>

      <div className="rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 border border-blue-100/60 shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
        {loading && !events.length ? (
          <div className="py-16 text-center">
            <p className="text-[var(--dash-muted)] animate-pulse">Waiting for events...</p>
          </div>
        ) : !events.length ? (
          <div className="py-16 text-center">
            <p className="text-[var(--dash-muted)] animate-pulse">Waiting for events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                  <th className="px-4 py-3 font-medium w-8">Status</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Platforms</th>
                  <th className="px-4 py-3 font-medium">Quality</th>
                  <th className="px-4 py-3 font-medium">IP</th>
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium w-20" />
                </tr>
              </thead>
              <tbody>
                {events.map((row) => (
                  <Fragment key={row.id}>
                    <tr
                      key={row.id}
                      className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30"
                    >
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center flex-wrap gap-1">
                          <span
                            className={`inline-block h-2 w-2 rounded-full shrink-0 ${
                              row.status === 'success' ? 'bg-[var(--dash-success)]' : 'bg-[var(--dash-danger)]'
                            }`}
                            title={row.status}
                          />
                          <RetryBadge row={row} retryMap={retryMap} />
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-text)]">{row.event_name}</td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">
                        {row.platform === 'meta' ? (
                          <span className="font-serif text-base">𝕗</span>
                        ) : row.platform === 'google' ? (
                          <span className="font-semibold">G</span>
                        ) : (
                          row.platform
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {row.fbclid ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
                            Ad Click
                          </span>
                        ) : row.fbc ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-primary)]">
                            Returning
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]">
                            Organic
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">
                        {row.value != null ? row.value : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              (row.meta_status === 'sent' || (row.platform === 'meta' && row.status === 'success')) ? 'bg-blue-50 text-blue-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            Meta
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              row.ga4_status === 'sent' ? 'bg-orange-50 text-orange-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            GA4
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              row.tiktok_status === 'sent' ? 'bg-pink-50 text-pink-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            TikTok
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded font-medium ${
                              row.google_status === 'sent' ? 'bg-green-50 text-green-600' : 'bg-slate-100 text-slate-400'
                            }`}
                          >
                            Google
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <QualityBadge row={row} />
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)] font-mono text-xs">
                        {row.ip ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">
                        {formatRelative(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === row.id ? null : row.id)
                          }
                          className="text-[var(--dash-muted)] hover:text-[var(--dash-text)] text-xs font-medium"
                        >
                          {expandedId === row.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr key={`${row.id}-exp`} className="bg-[var(--dash-bg)]">
                        <td colSpan={11} className="px-4 py-3">
                          <pre className="text-xs text-[var(--dash-muted)] overflow-auto rounded bg-[var(--dash-surface)] p-4 max-h-48">
                            {JSON.stringify(row, null, 2)}
                          </pre>
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}




