'use client'

import { useEffect, useState, useCallback, Fragment } from 'react'
import * as Tooltip from '@radix-ui/react-tooltip'

type EventRow = {
  id: string
  user_id: string
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
  [key: string]: unknown
}

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
      ? 'bg-emerald-950 text-emerald-400 border-emerald-800'
      : score >= 60
        ? 'bg-blue-950 text-blue-400 border-blue-800'
        : score >= 40
          ? 'bg-amber-950 text-amber-400 border-amber-800'
          : 'bg-red-950 text-red-400 border-red-800'
  return (
    <Tooltip.Provider delayDuration={200}>
      <Tooltip.Root>
        <Tooltip.Trigger asChild>
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border cursor-default ${badgeClass}`}
          >
            {label}
          </span>
        </Tooltip.Trigger>
        <Tooltip.Portal>
          <Tooltip.Content
            side="left"
            className="z-50 max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 shadow-xl"
            sideOffset={6}
          >
            <p className="font-medium text-white mb-2">
              Data Quality: {score}/100
            </p>
            <ul className="space-y-1">
              {QUALITY_FIELDS.map(({ key, label: l, points }) => {
                const present = breakdown[key as string]
                return (
                  <li key={key} className="flex items-center gap-2">
                    {present ? (
                      <>✅ {l} present</>
                    ) : (
                      <>❌ {l} missing (+{points})</>
                    )}
                  </li>
                )
              })}
            </ul>
          </Tooltip.Content>
        </Tooltip.Portal>
      </Tooltip.Root>
    </Tooltip.Provider>
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
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-white">Event logs</h1>
        {newPulse && (
          <span
            className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"
            title="New events"
            aria-hidden
          />
        )}
        {!newPulse && (
          <span
            className="flex h-2 w-2 rounded-full bg-emerald-500/50"
            title="Live"
            aria-hidden
          />
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-6">
        <select
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
          className="rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          className="rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          className="rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          className="rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500"
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
          className="rounded-lg bg-zinc-900 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm min-w-[200px] focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500"
        />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Total events today</p>
          <p className="text-xl font-semibold text-white">{totalToday}</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Success rate</p>
          <p className="text-xl font-semibold text-white">{successRate}%</p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Most fired event</p>
          <p className="text-xl font-semibold text-white truncate" title={mostFired}>
            {mostFired}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
          <p className="text-sm text-zinc-400 mb-1">Last event</p>
          <p className="text-xl font-semibold text-white">{lastEventTime}</p>
        </div>
      </div>

      <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <Tooltip.Provider delayDuration={200}>
        {loading && !events.length ? (
          <div className="py-16 text-center">
            <p className="text-zinc-400 animate-pulse">Waiting for events...</p>
          </div>
        ) : !events.length ? (
          <div className="py-16 text-center">
            <p className="text-zinc-400 animate-pulse">Waiting for events...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
                  <th className="px-4 py-3 font-medium w-8">Status</th>
                  <th className="px-4 py-3 font-medium">Event</th>
                  <th className="px-4 py-3 font-medium">Platform</th>
                  <th className="px-4 py-3 font-medium">Source</th>
                  <th className="px-4 py-3 font-medium">Value</th>
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
                      className="border-b border-zinc-800/80 hover:bg-zinc-800/30"
                    >
                      <td className="px-4 py-3">
                        <span
                          className={`inline-block h-2 w-2 rounded-full ${
                            row.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'
                          }`}
                          title={row.status}
                        />
                      </td>
                      <td className="px-4 py-3 text-white">{row.event_name}</td>
                      <td className="px-4 py-3 text-zinc-300">
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
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-emerald-950 text-emerald-400 border border-emerald-800">
                            Ad Click
                          </span>
                        ) : row.fbc ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-950 text-blue-400 border border-blue-800">
                            Returning
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-zinc-800 text-zinc-400">
                            Organic
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-zinc-300">
                        {row.value != null ? row.value : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <QualityBadge row={row} />
                      </td>
                      <td className="px-4 py-3 text-zinc-500 font-mono text-xs">
                        {row.ip ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-zinc-500">
                        {formatRelative(row.created_at)}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() =>
                            setExpandedId(expandedId === row.id ? null : row.id)
                          }
                          className="text-zinc-400 hover:text-white text-xs font-medium"
                        >
                          {expandedId === row.id ? 'Hide' : 'Details'}
                        </button>
                      </td>
                    </tr>
                    {expandedId === row.id && (
                      <tr key={`${row.id}-exp`} className="bg-zinc-950">
                        <td colSpan={10} className="px-4 py-3">
                          <pre className="text-xs text-zinc-400 overflow-auto rounded bg-zinc-900 p-4 max-h-48">
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
        </Tooltip.Provider>
      </div>
    </div>
  )
}
