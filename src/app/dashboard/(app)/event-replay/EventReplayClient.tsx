'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

type EventRow = {
  id: string
  event_name: string
  platform: string
  value: number | null
  status: string
  created_at: string
  retry_count: number | null
  next_retry_at: string | null
  validation_issues: string[] | null
}

type Summary = {
  totalFailed: number
  totalRecovered: number
  recoveryRate: number
  revenueAtRisk: number
}

type ScanResult = {
  pixels?: { metaPixel?: boolean; googleAds?: boolean; tiktokPixel?: boolean }
  capi?: { metaCapi?: boolean; googleEnhanced?: boolean }
}

const PLATFORM_LABEL: Record<string, string> = {
  meta: 'Meta',
  google: 'Google',
  tiktok: 'TikTok',
}

function formatDate(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })
}

function StatusBadge({ status }: { status: string }) {
  if (status === 'recovered') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-soft)] text-[var(--dash-success)]">
        Recovered
      </span>
    )
  }
  if (status === 'failed') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-danger)]/20 text-red-400">
        Failed
      </span>
    )
  }
  if (status === 'retrying') {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-warning)]/20 text-amber-400">
        Retrying
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]">
      {status}
    </span>
  )
}

export default function EventReplayClient() {
  const [tab, setTab] = useState<'failed' | 'capi'>('failed')
  const [events, setEvents] = useState<EventRow[]>([])
  const [summary, setSummary] = useState<Summary | null>(null)
  const [loading, setLoading] = useState(true)
  const [replayingId, setReplayingId] = useState<string | null>(null)
  const [replayAllLoading, setReplayAllLoading] = useState(false)
  const [capiUrl, setCapiUrl] = useState('')
  const [capiScanLoading, setCapiScanLoading] = useState(false)
  const [capiScan, setCapiScan] = useState<ScanResult | null>(null)
  const [integrations, setIntegrations] = useState<{ platform: string; pixel_id?: string; access_token?: string; tag_id?: string }[]>([])

  const fetchFailed = useCallback(async () => {
    const res = await fetch('/api/event-replay/failed')
    if (!res.ok) return
    const data = await res.json()
    setEvents(data.events ?? [])
    setSummary(data.summary ?? null)
    setLoading(false)
  }, [])

  useEffect(() => {
    if (tab === 'failed') {
      setLoading(true)
      fetchFailed()
    }
  }, [tab, fetchFailed])

  useEffect(() => {
    fetch('/api/dashboard/integrations')
      .then((r) => r.ok ? r.json() : null)
      .then((d) => d?.integrations && setIntegrations(d.integrations))
      .catch(() => {})
  }, [])

  async function handleReplay(eventId: string) {
    setReplayingId(eventId)
    try {
      const res = await fetch('/api/event-replay/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: eventId }),
      })
      const data = await res.json()
      if (data.success) {
        await fetchFailed()
      }
    } finally {
      setReplayingId(null)
    }
  }

  async function handleReplayAll() {
    const failed = events.filter((e) => e.status === 'failed')
    if (!failed.length) return
    setReplayAllLoading(true)
    for (const e of failed) {
      await fetch('/api/event-replay/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event_id: e.id }),
      })
    }
    await fetchFailed()
    setReplayAllLoading(false)
  }

  async function handleCapiCheck() {
    if (!capiUrl.trim()) return
    setCapiScanLoading(true)
    setCapiScan(null)
    try {
      const res = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: capiUrl.trim() }),
      })
      const data = await res.json()
      if (res.ok) setCapiScan(data)
    } finally {
      setCapiScanLoading(false)
    }
  }

  const failedOnly = events.filter((e) => e.status === 'failed')
  const metaIntegration = integrations.find((i) => i.platform === 'meta')
  const googleIntegration = integrations.find((i) => i.platform === 'google')
  const metaServerCapi = Boolean(metaIntegration?.pixel_id && metaIntegration?.access_token)
  const metaBrowserPixel = capiScan?.pixels?.metaPixel ?? null
  const metaCapiActive = capiScan?.capi?.metaCapi ?? null
  const googleBrowserTag = (capiScan?.pixels?.googleAds || capiScan?.pixels?.googleAds) ?? null
  const googleEnhanced = capiScan?.capi?.googleEnhanced ?? null
  const tiktokPixel = capiScan?.pixels?.tiktokPixel ?? null

  const metaFull = metaServerCapi && metaBrowserPixel && metaCapiActive
  const googleFull = Boolean(googleIntegration?.tag_id) && (googleBrowserTag ?? false) && (googleEnhanced ?? false)
  const channelsWithFullCoverage = [metaFull, googleFull].filter(Boolean).length
  const totalChannels = 4
  const totalTracked = (summary?.totalFailed ?? 0) + (summary?.totalRecovered ?? 0)
  const dataLossPct = summary && totalTracked > 0 ? Math.round((summary.totalFailed / totalTracked) * 100) : 0
  const revenueAtRisk = summary?.revenueAtRisk ?? 0

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Event Replay</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-6">
        Replay failed events and check which channels are missing server-side tracking.
      </p>

      <div className="flex gap-1 p-1 rounded-lg bg-[var(--dash-surface)] border border-[var(--dash-border)] w-fit mb-8">
        <button
          type="button"
          onClick={() => setTab('failed')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'failed' ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)]' : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'}`}
        >
          Failed Events Replay
        </button>
        <button
          type="button"
          onClick={() => setTab('capi')}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${tab === 'capi' ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-text)]' : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'}`}
        >
          Missing CAPI Detector
        </button>
      </div>

      {tab === 'failed' && (
        <>
          {summary && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                <p className="text-sm text-[var(--dash-muted)] mb-1">Total failed events</p>
                <p className="text-xl font-semibold text-[var(--dash-text)]">{summary.totalFailed}</p>
              </div>
              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                <p className="text-sm text-[var(--dash-muted)] mb-1">Total recovered</p>
                <p className="text-xl font-semibold text-[var(--dash-text)]">{summary.totalRecovered}</p>
              </div>
              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                <p className="text-sm text-[var(--dash-muted)] mb-1">Recovery rate</p>
                <p className="text-xl font-semibold text-[var(--dash-text)]">{summary.recoveryRate}%</p>
              </div>
              <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4">
                <p className="text-sm text-[var(--dash-muted)] mb-1">Revenue at risk</p>
                <p className="text-xl font-semibold text-[var(--dash-text)]">${summary.revenueAtRisk.toFixed(2)}</p>
              </div>
            </div>
          )}

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={handleReplayAll}
              disabled={replayAllLoading || failedOnly.length === 0}
              className="rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] px-4 py-2 text-sm font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {replayAllLoading ? 'Replaying…' : 'Replay All'}
            </button>
          </div>

          <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
            {loading && !events.length ? (
              <div className="py-16 text-center text-[var(--dash-muted)]">Loading…</div>
            ) : !failedOnly.length && events.length > 0 ? (
              <div className="py-16 text-center text-[var(--dash-muted)]">No failed events to replay.</div>
            ) : !events.length ? (
              <div className="py-16 text-center text-[var(--dash-muted)]">No failed or recovered events.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--dash-border)] text-left text-[var(--dash-muted)]">
                      <th className="px-4 py-3 font-medium">Event name</th>
                      <th className="px-4 py-3 font-medium">Platform</th>
                      <th className="px-4 py-3 font-medium">Failed at</th>
                      <th className="px-4 py-3 font-medium">Retry count</th>
                      <th className="px-4 py-3 font-medium">Error reason</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium w-24" />
                    </tr>
                  </thead>
                  <tbody>
                    {failedOnly.map((row) => (
                      <tr key={row.id} className="border-b border-[var(--dash-border)]/80 hover:bg-[var(--dash-surface-hover)]/30">
                        <td className="px-4 py-3 text-[var(--dash-text)]">{row.event_name}</td>
                        <td className="px-4 py-3 text-[var(--dash-muted)]">{PLATFORM_LABEL[row.platform] ?? row.platform}</td>
                        <td className="px-4 py-3 text-[var(--dash-muted)]">{formatDate(row.created_at)}</td>
                        <td className="px-4 py-3 text-[var(--dash-muted)]">{row.retry_count ?? 0}</td>
                        <td className="px-4 py-3 text-[var(--dash-muted)] max-w-[200px] truncate" title={row.validation_issues?.join(', ')}>
                          {row.validation_issues?.length ? row.validation_issues.join(', ') : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <StatusBadge status={replayingId === row.id ? 'retrying' : row.status} />
                        </td>
                        <td className="px-4 py-3">
                          {row.status === 'failed' && (
                            <button
                              type="button"
                              onClick={() => handleReplay(row.id)}
                              disabled={replayingId !== null}
                              className="text-sm font-medium text-[var(--dash-success)] hover:opacity-80 disabled:opacity-50"
                            >
                              {replayingId === row.id ? '…' : 'Replay'}
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
        </>
      )}

      {tab === 'capi' && (
        <>
          <div className="mb-6 flex flex-wrap gap-3">
            <input
              type="url"
              placeholder="Enter site URL to check coverage"
              value={capiUrl}
              onChange={(e) => setCapiUrl(e.target.value)}
              className="flex-1 min-w-[200px] rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-2 text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
            />
            <button
              type="button"
              onClick={handleCapiCheck}
              disabled={capiScanLoading || !capiUrl.trim()}
              className="rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] px-4 py-2 text-sm font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50"
            >
              {capiScanLoading ? 'Checking…' : 'Check coverage'}
            </button>
          </div>

          <div className="space-y-6 max-w-2xl">
            {/* Meta CAPI */}
            <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--dash-border)]">
                <h2 className="text-sm font-medium text-[var(--dash-muted)]">Meta CAPI</h2>
              </div>
              <ul className="p-4 space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Browser Pixel</span>
                  {capiScan ? (
                    <span className={capiScan.pixels?.metaPixel ? 'text-[var(--dash-success)]' : 'text-red-400'}>
                      {capiScan.pixels?.metaPixel ? '✅ Detected' : '❌ Not detected'}
                    </span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Server CAPI</span>
                  <span className={metaServerCapi ? 'text-[var(--dash-success)]' : 'text-red-400'}>
                    {metaServerCapi ? '✅ Active' : '❌ Missing'}
                  </span>
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Match Rate</span>
                  <span className="text-[var(--dash-muted)]">84% / Unknown</span>
                </li>
                <li className="flex items-center justify-between pt-2">
                  <span className="text-[var(--dash-muted)]">Status</span>
                  {metaServerCapi && (capiScan?.pixels?.metaPixel && capiScan?.capi?.metaCapi) ? (
                    <span className="text-[var(--dash-success)]">🟢 Full Coverage</span>
                  ) : !metaServerCapi || !capiScan?.capi?.metaCapi ? (
                    <span className="text-red-400">🔴 Missing Server Events</span>
                  ) : (
                    <span className="text-amber-400">🟡 Partial</span>
                  )}
                </li>
              </ul>
              {(!metaServerCapi || (capiScan && !capiScan.capi?.metaCapi)) && (
                <div className="px-4 pb-4">
                  <Link
                    href="/dashboard/integrations"
                    className="inline-block rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--dash-border)]"
                  >
                    Fix Now
                  </Link>
                </div>
              )}
            </div>

            {/* Google Ads */}
            <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--dash-border)]">
                <h2 className="text-sm font-medium text-[var(--dash-muted)]">Google Ads</h2>
              </div>
              <ul className="p-4 space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Browser Tag</span>
                  {capiScan ? (
                    <span className={capiScan.pixels?.googleAds ? 'text-[var(--dash-success)]' : 'text-red-400'}>
                      {capiScan.pixels?.googleAds ? '✅ Detected' : '❌ Not detected'}
                    </span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Enhanced Conversions</span>
                  <span className={googleEnhanced ? 'text-[var(--dash-success)]' : 'text-red-400'}>
                    {googleEnhanced ? '✅ Active' : '❌ Missing'}
                  </span>
                </li>
                <li className="flex items-center justify-between pt-2">
                  <span className="text-[var(--dash-muted)]">Status</span>
                  {googleIntegration?.tag_id && googleEnhanced ? (
                    <span className="text-[var(--dash-success)]">🟢 Full Coverage</span>
                  ) : (
                    <span className="text-red-400">🔴 Missing Enhanced Conv.</span>
                  )}
                </li>
              </ul>
              {(!googleIntegration?.tag_id || !googleEnhanced) && (
                <div className="px-4 pb-4">
                  <Link
                    href="/dashboard/integrations"
                    className="inline-block rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-3 py-1.5 text-sm font-medium hover:bg-[var(--dash-border)]"
                  >
                    Fix Now
                  </Link>
                </div>
              )}
            </div>

            {/* TikTok */}
            <div className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--dash-border)]">
                <h2 className="text-sm font-medium text-[var(--dash-muted)]">TikTok</h2>
              </div>
              <ul className="p-4 space-y-2 text-sm">
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Browser Pixel</span>
                  {capiScan ? (
                    <span className={tiktokPixel ? 'text-[var(--dash-success)]' : 'text-red-400'}>
                      {tiktokPixel ? '✅ Detected' : '❌ Not detected'}
                    </span>
                  ) : (
                    <span className="text-[var(--dash-muted)]">—</span>
                  )}
                </li>
                <li className="flex items-center justify-between">
                  <span className="text-[var(--dash-muted)]">Server Events</span>
                  <span className="text-red-400">❌ Missing</span>
                </li>
                <li className="flex items-center justify-between pt-2">
                  <span className="text-[var(--dash-muted)]">Status</span>
                  <span className="text-red-400">🔴 Not configured (Upgrade to Pro)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-8 rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-4 space-y-2">
            <p className="text-sm text-[var(--dash-muted)]">
              Channels with full coverage: <span className="text-[var(--dash-text)] font-medium">{channelsWithFullCoverage}/{totalChannels}</span>
            </p>
            <p className="text-sm text-[var(--dash-muted)]">
              Estimated data loss: <span className="text-[var(--dash-text)] font-medium">{dataLossPct}% of conversions</span>
            </p>
            <p className="text-sm text-[var(--dash-muted)]">
              Revenue at risk: <span className="text-[var(--dash-text)] font-medium">${revenueAtRisk.toFixed(2)}</span>
            </p>
          </div>
        </>
      )}
    </div>
  )
}




