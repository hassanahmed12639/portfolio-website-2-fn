'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const HISTORY_STORAGE_KEY = 'pixelWarmupHistory'

type WarmupHistoryItem = {
  jobId: string
  eventType: string
  rows: number
  queued: number
  skipped: number
  sent?: number
  failed?: number
  status?: 'running' | 'completed'
  createdAt: string
}

export default function PixelWarmupHistoryPage() {
  const [history, setHistory] = React.useState<WarmupHistoryItem[]>([])

  React.useEffect(() => {
    const raw = window.localStorage.getItem(HISTORY_STORAGE_KEY)
    if (!raw) return

    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setHistory(parsed)
      }
    } catch {
      setHistory([])
    }
  }, [])

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] text-[var(--dash-text)] px-6 py-8">
      <div className="mx-auto max-w-6xl rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-card)] p-8 shadow-[var(--dash-shadow)]">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--dash-primary)] font-semibold">Dashboard Tool</p>
            <h1 className="text-3xl font-bold tracking-tight text-[var(--dash-text)]">Warmup history</h1>
            <p className="mt-2 text-sm text-[var(--dash-muted)]">Saved warmup jobs are stored in your browser so you can review them after a refresh.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard/pixel-warmup">
              <Button variant="secondary">Back to warmup</Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="outline">Back to dashboard</Button>
            </Link>
          </div>
        </div>

        <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-surface)] p-6">
          {history.length === 0 ? (
            <div className="rounded-3xl border border-[var(--dash-border)] bg-[var(--dash-bg)] p-8 text-center text-sm text-[var(--dash-muted)]">
              No warmup history found. Start a warmup job and it will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm">
                <thead>
                  <tr className="text-[var(--dash-muted)]">
                    <th className="px-3 py-3">Job ID</th>
                    <th className="px-3 py-3">Event type</th>
                    <th className="px-3 py-3">Rows</th>
                    <th className="px-3 py-3">Queued</th>
                    <th className="px-3 py-3">Sent</th>
                    <th className="px-3 py-3">Failed</th>
                    <th className="px-3 py-3">Skipped</th>
                    <th className="px-3 py-3">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr key={item.jobId} className="border-t border-[var(--dash-border)]">
                      <td className="px-3 py-4 font-medium text-[var(--dash-text)] break-all max-w-[180px]">{item.jobId}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.eventType}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.rows}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.queued}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.sent ?? 0}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.failed ?? 0}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{item.skipped}</td>
                      <td className="px-3 py-4 text-[var(--dash-text)]">{new Date(item.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
