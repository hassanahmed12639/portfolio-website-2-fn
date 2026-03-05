'use client'

import { useEffect, useState, useRef, useMemo } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Session } from '@supabase/supabase-js'

const MAX_EVENTS = 50
const GAUGE_EVENTS = 10
const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'Purchase', label: 'Purchase' },
  { id: 'PageView', label: 'PageView' },
  { id: 'AddToCart', label: 'AddToCart' },
  { id: 'failed', label: 'Failed Only' },
  { id: 'poor', label: 'Poor Quality' },
] as const

type EventRow = {
  id: string
  user_id: string
  event_name: string
  platform: string
  value: number | null
  status: string
  created_at: string
  data_quality_score?: number | null
  data_quality_label?: string | null
  [key: string]: unknown
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const sec = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (sec < 5) return `${sec}s ago`
  if (sec < 60) return `${sec}s ago`
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`
  return `${Math.floor(sec / 86400)}d ago`
}

function StatusDot({ event }: { event: EventRow }) {
  if (event.status === 'failed') {
    return <span className="inline-block h-2 w-2 rounded-full bg-[var(--dash-danger)] shrink-0" title="Failed" />
  }
  if (event.status === 'deduplicated') {
    return <span className="inline-block h-2 w-2 rounded-full bg-[var(--dash-warning)] shrink-0" title="Deduplicated" />
  }
  return <span className="inline-block h-2 w-2 rounded-full bg-[var(--dash-success)] shrink-0" title="Success" />
}

function QualityBar({ score }: { score: number }) {
  const pct = Math.min(100, Math.max(0, score))
  const fill =
    score >= 80 ? 'bg-[var(--dash-success)]' : score >= 60 ? 'bg-[var(--dash-primary)]' : score >= 40 ? 'bg-[var(--dash-warning)]' : 'bg-[var(--dash-danger)]'
  return (
    <div className="w-20 h-1.5 rounded-full bg-[var(--dash-surface-hover)] overflow-hidden flex">
      <span className={`${fill} transition-all`} style={{ width: `${pct}%` }} />
    </div>
  )
}

function QualityGauge({ score, label }: { score: number; label: string }) {
  const normalized = Math.min(100, Math.max(0, score))
  const circumference = 2 * Math.PI * 36
  const strokeDash = (normalized / 100) * circumference
  const strokeColor =
    score >= 80 ? '#2563eb' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#ef4444'
  return (
    <div className="flex flex-col items-center">
      <svg width="100" height="100" className="-rotate-90">
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-[var(--dash-text-soft)]"
        />
        <circle
          cx="50"
          cy="50"
          r="36"
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - strokeDash}
          className="transition-all duration-300"
        />
      </svg>
      <p className="text-2xl font-semibold text-[var(--dash-text)] mt-1">{score}/100</p>
      <p className="text-sm text-[var(--dash-muted)]">{label}</p>
    </div>
  )
}

export default function LivePage() {
  const [events, setEvents] = useState<EventRow[]>([])
  const [connected, setConnected] = useState(false)
  const [status, setStatus] = useState<'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED'>('CLOSED')
  const [filter, setFilter] = useState<string>('all')
  const [now, setNow] = useState(Date.now())
  const [lastAddedId, setLastAddedId] = useState<string | null>(null)
  const userIdRef = useRef<string | null>(null)
  const channelRef = useRef<ReturnType<ReturnType<typeof createClient>['channel']> | null>(null)
  const supabase = createClient()

  useEffect(() => {
    let mounted = true
    const loadInitial = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const user = session?.user
      if (user) userIdRef.current = user.id
      if (!user || !mounted) return

      const { data } = await supabase
        .from('events')
        .select('id, user_id, event_name, platform, value, status, created_at, data_quality_score, data_quality_label')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data && mounted) setEvents(data as EventRow[])
    }

    loadInitial()

    const channel = supabase
      .channel('live-events')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        (payload: { new: EventRow }) => {
          const row = payload.new
          supabase.auth.getSession().then((res: { data: { session: Session | null } }) => {
            const s = res.data.session
            const u = s?.user
            if (!u || row.user_id !== u.id) return
            setLastAddedId(row.id)
            setTimeout(() => setLastAddedId(null), 400)
            setEvents((prev) => [row, ...prev].slice(0, MAX_EVENTS))
          })
        }
      )
      .subscribe((s: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => {
        setStatus(s)
        setConnected(s === 'SUBSCRIBED')
      })

    channelRef.current = channel

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [supabase])


  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(t)
  }, [])

  const reconnect = () => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current)
      channelRef.current = null
    }
    setConnected(false)
    setStatus('CLOSED')
    const channel = supabase
      .channel('live-events-' + Date.now())
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'events',
        },
        (payload: { new: EventRow }) => {
          const row = payload.new
          if (userIdRef.current && row.user_id !== userIdRef.current) return
          setLastAddedId(row.id)
          setTimeout(() => setLastAddedId(null), 400)
          setEvents((prev) => [row, ...prev].slice(0, MAX_EVENTS))
        }
      )
      .subscribe((s: 'SUBSCRIBED' | 'CHANNEL_ERROR' | 'TIMED_OUT' | 'CLOSED') => {
        setStatus(s)
        setConnected(s === 'SUBSCRIBED')
      })
    channelRef.current = channel
  }

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      if (filter === 'all') return true
      if (filter === 'failed') return e.status === 'failed'
      if (filter === 'poor') return (e.data_quality_score ?? 100) < 40
      return e.event_name?.toLowerCase() === filter.toLowerCase()
    })
  }, [events, filter])

  const startOfToday = useMemo(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d.getTime()
  }, [])

  const eventsToday = events.filter((e) => new Date(e.created_at).getTime() >= startOfToday).length
  const successCount = events.filter((e) => e.status === 'success').length
  const successRate = events.length ? Math.round((successCount / events.length) * 100) : 0
  const avgQuality =
    events.length ? Math.round(events.reduce((s, e) => s + (e.data_quality_score ?? 0), 0) / events.length) : 0
  const lastEvent = events[0]
  const lastEventAgo = lastEvent ? formatTimeAgo(lastEvent.created_at) : '—'

  const last10 = events.slice(0, GAUGE_EVENTS)
  const sessionScore =
    last10.length > 0
      ? Math.round(last10.reduce((s, e) => s + (e.data_quality_score ?? 0), 0) / last10.length)
      : 0
  const sessionLabel =
    sessionScore >= 80 ? 'Excellent' : sessionScore >= 60 ? 'Good' : sessionScore >= 40 ? 'Fair' : 'Poor'

  const statusText =
    status === 'SUBSCRIBED'
      ? 'Connected — receiving events live'
      : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT'
        ? 'Reconnecting...'
        : 'Disconnected — click to reconnect'

  return (
    <div className="p-6 md:p-8 flex flex-col h-full">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-xl font-semibold text-[var(--dash-text)]">Live Event Stream</h1>
          <p className="text-sm text-[var(--dash-muted)] mt-0.5">Watch your events fire in real-time</p>
        </div>
        <button
          type="button"
          onClick={reconnect}
          disabled={status === 'SUBSCRIBED'}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
            status === 'SUBSCRIBED'
              ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-success)] cursor-default'
              : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)]'
          }`}
          title={statusText}
        >
          <span
            className={`inline-block h-2 w-2 rounded-full shrink-0 ${
              status === 'SUBSCRIBED' ? 'bg-[var(--dash-success)]' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'bg-[var(--dash-warning)] animate-pulse' : 'bg-[var(--dash-danger)]'
            }`}
          />
          {status === 'SUBSCRIBED' ? 'Connected' : status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' ? 'Reconnecting...' : 'Disconnected'}
        </button>
      </div>

      <div className="flex flex-wrap gap-4 mb-4 p-3 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] text-sm">
        <span className="text-[var(--dash-muted)]">
          Events today: <span className="text-[var(--dash-text)] font-medium">{eventsToday}</span>
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span className="text-[var(--dash-muted)]">
          Last event: <span className="text-[var(--dash-text)] font-medium">{lastEventAgo}</span>
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span className="text-[var(--dash-muted)]">
          Success rate: <span className="text-[var(--dash-text)] font-medium">{successRate}%</span>
        </span>
        <span className="text-[var(--dash-muted)]">|</span>
        <span className="text-[var(--dash-muted)]">
          Avg Quality: <span className="text-[var(--dash-text)] font-medium">{avgQuality}/100</span>
        </span>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filter === f.id ? 'bg-[var(--dash-primary)] text-white' : 'bg-white border border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="flex gap-6 flex-1 min-h-0">
        <div className="flex-1 min-w-0 rounded-xl bg-white border border-slate-100 overflow-hidden flex flex-col">
          <div className="bg-slate-50 border-b border-slate-100 px-4 py-3 text-xs text-slate-700 font-mono">
            Live feed (newest at top)
          </div>
          <div className="flex-1 overflow-auto p-2 font-mono text-sm">
            {filteredEvents.length === 0 ? (
              <p className="text-[var(--dash-muted)] py-8 text-center">No events yet. Fire some events to see them here.</p>
            ) : (
              <div className="space-y-0.5">
                {filteredEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className={`flex items-center gap-4 px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${
                      lastAddedId === ev.id ? 'animate-slide-down' : ''
                    }`}
                  >
                    <StatusDot event={ev} />
                    <span className="text-xs text-slate-700 w-14 shrink-0">{formatTimeAgo(ev.created_at)}</span>
                    <span className="text-sm font-medium text-slate-900 shrink-0 w-24">{ev.event_name}</span>
                    <span className="text-xs text-slate-700 shrink-0 w-14">
                      {ev.event_name === 'Purchase' && ev.value != null ? `$${Number(ev.value).toFixed(2)}` : '—'}
                    </span>
                    <QualityBar score={ev.data_quality_score ?? 0} />
                    <span className="text-xs text-slate-700 w-12 shrink-0">{ev.data_quality_score ?? 0}/100</span>
                    <span className="text-xs text-slate-700 shrink-0">{ev.data_quality_label ?? '—'}</span>
                    <span className="text-xs text-slate-700 shrink-0 capitalize">{ev.platform}</span>
                    {ev.status === 'failed' && (
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-100">
                        FAILED
                      </span>
                    )}
                    {ev.status === 'deduplicated' && (
                      <span className="shrink-0 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 text-amber-700 border border-amber-100">
                        Deduplicated
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="w-48 shrink-0 rounded-xl bg-white border border-slate-200 p-4 flex flex-col items-center shadow-sm">
          <p className="text-xs text-[var(--dash-muted)] mb-3 text-center">Current Session Quality</p>
          <QualityGauge score={sessionScore} label={sessionLabel} />
          <p className="text-xs text-[var(--dash-muted)] mt-3 text-center">Based on last {GAUGE_EVENTS} events</p>
        </div>
      </div>
    </div>
  )
}




