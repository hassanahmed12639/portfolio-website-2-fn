'use client'

import { useEffect, useState, useCallback } from 'react'
import { getRetryLabel } from '@/lib/retry-queue'
import type { RetryJob } from '@/lib/retry-queue'
import { RefreshCw } from 'lucide-react'

type JobRow = RetryJob & { payload?: Record<string, unknown> }

type Stats = { pending: number; retrying: number; recovered: number; exhausted: number }

function formatRelative(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const sec = Math.floor((d.getTime() - now.getTime()) / 1000)
  if (sec < 0) return 'Due now'
  if (sec < 60) return 'In under a minute'
  if (sec < 3600) return `In ${Math.floor(sec / 60)} mins`
  if (sec < 86400) return `In ${Math.floor(sec / 3600)} hours`
  return d.toLocaleString()
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'pending')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-950 text-amber-400 border border-amber-800">
        Waiting
      </span>
    )
  if (status === 'retrying')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-primary-soft)] text-[var(--dash-primary)] border border-[var(--dash-primary)]">
        Retrying
      </span>
    )
  if (status === 'success')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)] border border-[var(--dash-success)]">
        Recovered ✅
      </span>
    )
  if (status === 'exhausted')
    return (
      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-950 text-red-400 border border-red-800">
        Failed ❌
      </span>
    )
  return <span className="text-[var(--dash-muted)] text-xs">{status}</span>
}

function RetryTimeline({ job }: { job: JobRow }) {
  const eventName = (job.payload?.event_name as string) ?? 'Event'
  const labels = [getRetryLabel(1), getRetryLabel(2), getRetryLabel(3), getRetryLabel(4)]
  return (
    <div className="rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 text-sm">
      <p className="font-medium text-[var(--dash-text)] mb-3">{eventName}</p>
      <ul className="space-y-1.5 text-[var(--dash-muted)]">
        {[1, 2, 3, 4].map((attempt) => {
          const isPast = attempt < job.attempt
          const isCurrent = attempt === job.attempt
          const isFuture = attempt > job.attempt
          const exhaustedAtThis = job.status === 'exhausted' && attempt === job.attempt
          return (
            <li key={attempt} className="flex items-center gap-2 flex-wrap">
              <span className="text-[var(--dash-muted)]">├──</span>
              <span className="text-[var(--dash-muted)]">Attempt {attempt}:</span>
              {isPast && <span>Failed — {job.last_error?.slice(0, 50)}{job.last_error && job.last_error.length > 50 ? '…' : ''}</span>}
              {isCurrent && job.status === 'pending' && (
                <span className="text-amber-400">Scheduled in {formatRelative(job.next_retry_at)}</span>
              )}
              {isCurrent && job.status === 'retrying' && (
                <span className="text-[var(--dash-primary)]">Retrying now</span>
              )}
              {isFuture && <span>Will retry in ~{labels[attempt - 1]} if needed</span>}
              {exhaustedAtThis && (
                <span className="text-red-400">Failed — {job.last_error?.slice(0, 60)}{job.last_error && job.last_error.length > 60 ? '…' : ''}</span>
              )}
            </li>
          )
        })}
      </ul>
    </div>
  )
}

export default function RetryQueuePage() {
  const [jobs, setJobs] = useState<JobRow[]>([])
  const [stats, setStats] = useState<Stats>({ pending: 0, retrying: 0, recovered: 0, exhausted: 0 })
  const [loading, setLoading] = useState(true)
  const [requeueId, setRequeueId] = useState<string | null>(null)

  const fetchQueue = useCallback(async () => {
    const res = await fetch('/api/dashboard/retry-queue')
    if (!res.ok) return
    const data = await res.json()
    setJobs(data.jobs ?? [])
    setStats(data.stats ?? { pending: 0, retrying: 0, recovered: 0, exhausted: 0 })
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchQueue()
  }, [fetchQueue])

  useEffect(() => {
    const interval = setInterval(fetchQueue, 15000)
    return () => clearInterval(interval)
  }, [fetchQueue])

  const handleRequeue = async (id: string) => {
    setRequeueId(id)
    try {
      const res = await fetch('/api/dashboard/retry-queue/requeue', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) await fetchQueue()
    } finally {
      setRequeueId(null)
    }
  }

  const pendingJobs = jobs.filter((j) => j.status === 'pending')

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-xl font-semibold text-[var(--dash-text)]">Retry Queue</h1>
        <button
          type="button"
          onClick={() => {
            setLoading(true)
            fetchQueue()
          }}
          className="p-2 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Pending</p>
          <p className="text-xl font-semibold text-amber-400">{stats.pending}</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Retrying</p>
          <p className="text-xl font-semibold text-[var(--dash-primary)]">{stats.retrying}</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Recovered</p>
          <p className="text-xl font-semibold text-[var(--dash-success)]">{stats.recovered}</p>
        </div>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-4">
          <p className="text-sm text-[var(--dash-muted)] mb-1">Exhausted</p>
          <p className="text-xl font-semibold text-red-400">{stats.exhausted}</p>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-lg font-medium text-[var(--dash-text)] mb-4">Queue</h2>
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          {loading && !jobs.length ? (
            <div className="py-12 text-center text-[var(--dash-muted)]">Loading...</div>
          ) : !jobs.length ? (
            <div className="py-12 text-center text-[var(--dash-muted)]">No retry jobs</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                    <th className="px-4 py-3 font-medium">Event Name</th>
                    <th className="px-4 py-3 font-medium">Platform</th>
                    <th className="px-4 py-3 font-medium">Attempt</th>
                    <th className="px-4 py-3 font-medium">Next Retry</th>
                    <th className="px-4 py-3 font-medium">Last Error</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium w-24" />
                  </tr>
                </thead>
                <tbody>
                  {jobs.map((job) => (
                    <tr key={job.id} className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30">
                      <td className="px-4 py-3 text-[var(--dash-text)]">
                        {String((job.payload as Record<string, unknown>)?.event_name ?? '—')}
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">{job.platform}</td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">
                        {job.attempt} / {job.max_attempts}
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)]">
                        {job.status === 'pending' || job.status === 'retrying'
                          ? formatRelative(job.next_retry_at)
                          : '—'}
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)] max-w-[200px] truncate" title={job.last_error ?? ''}>
                        {job.last_error ?? '—'}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge status={job.status} />
                      </td>
                      <td className="px-4 py-3">
                        {job.status === 'exhausted' && (
                          <button
                            type="button"
                            onClick={() => handleRequeue(job.id)}
                            disabled={requeueId === job.id}
                            className="px-3 py-1.5 rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] text-xs font-medium hover:bg-[var(--dash-border)] disabled:opacity-50"
                          >
                            {requeueId === job.id ? '…' : 'Retry Now'}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {pendingJobs.length > 0 && (
        <section className="mb-8">
          <h2 className="text-lg font-medium text-[var(--dash-text)] mb-4">Retry Timeline</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingJobs.slice(0, 6).map((job) => (
              <RetryTimeline key={job.id} job={job} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}




