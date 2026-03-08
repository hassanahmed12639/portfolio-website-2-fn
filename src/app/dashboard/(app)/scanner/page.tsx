'use client'

import { useState } from 'react'

const SCAN_STEPS = [
  'Fetching page...',
  'Analyzing pixels...',
  'Checking GTM...',
  'AI analyzing detected actions...',
  'Generating report...',
]

type SmartEvent = {
  event: string
  reason: string
  priority: string
  platforms: string[]
  gtm_code?: string
  script_code?: string
}

type Report = {
  url: string
  score: number
  summary: string
  siteType?: 'ecommerce' | 'leadgen'
  ecomScore?: number
  leadGenScore?: number
  pixels: {
    metaPixel: boolean
    gtm: boolean
    googleAnalytics: boolean
    googleAds: boolean
    tiktokPixel: boolean
    trackhive: boolean
  }
  detection?: {
    mode: 'strict-html-only' | 'broad-with-fallback' | string
    strictMatches: {
      metaPixel: boolean
      googleTagManager: boolean
      googleAnalytics: boolean
      googleAds: boolean
      tiktokPixel: boolean
      trackhive: boolean
    }
    broadMatches: {
      metaPixel: boolean
      googleTagManager: boolean
      googleAnalytics: boolean
      googleAds: boolean
      tiktokPixel: boolean
      trackhive: boolean
    }
    pixelConfidence: {
      metaPixel: 'high' | 'medium' | 'low'
      gtm: 'high' | 'medium' | 'low'
      googleAnalytics: 'high' | 'medium' | 'low'
      googleAds: 'high' | 'medium' | 'low'
      tiktokPixel: 'high' | 'medium' | 'low'
      trackhive: 'high' | 'medium' | 'low'
    }
  }
  capi: { metaCapi: boolean; googleEnhanced: boolean }
  recommendedEvents: { name: string; why: string; priority: string }[]
  smartEvents?: SmartEvent[]
  scripts: {
    totalScripts: number
    blockingScripts: number
    blockingWarning: boolean
    trackingOverhead: string
  }
  recommendations: { text: string; priority: string }[]
}

const EVENT_ICONS: Record<string, string> = {
  AddToCart: '🛒',
  InitiateCheckout: '💳',
  Purchase: '💰',
  Lead: '👤',
  Contact: '📞',
  ViewContent: '👀',
  Search: '🔍',
  Schedule: '📅',
  Subscribe: '📧',
  'WhatsApp Click': '📱',
  'Phone Click': '📞',
  'Email Click': '📧',
  'Video Watch': '🎥',
  PageView: '📄',
  'Scroll Depth': '📜',
  'Button Click': '🖱️',
  CompleteRegistration: '📝',
}

const PIXEL_LABELS: { key: keyof Report['pixels']; label: string }[] = [
  { key: 'metaPixel', label: 'Meta Pixel' },
  { key: 'gtm', label: 'Google Tag Manager' },
  { key: 'googleAnalytics', label: 'Google Analytics' },
  { key: 'googleAds', label: 'Google Ads' },
  { key: 'tiktokPixel', label: 'TikTok Pixel' },
  { key: 'trackhive', label: 'TrackHive' },
]

const CONFIDENCE_CLASS: Record<'high' | 'medium' | 'low', string> = {
  high: 'bg-emerald-100 text-emerald-700',
  medium: 'bg-amber-100 text-amber-700',
  low: 'bg-slate-200 text-slate-600',
}

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-[var(--dash-success)] stroke-[var(--dash-success)]' : score >= 50 ? 'text-amber-400 stroke-amber-400' : 'text-red-400 stroke-red-400'
  const circumference = 2 * Math.PI * 45
  const offset = circumference - (score / 100) * circumference
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="h-32 w-32 -rotate-90" viewBox="0 0 100 100">
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          stroke="currentColor"
          strokeWidth="8"
          className="text-[var(--dash-text)]"
        />
        <circle
          cx="50"
          cy="50"
          r="45"
          fill="none"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={`transition-all duration-700 ${color}`}
        />
      </svg>
      <span className={`absolute text-2xl font-bold ${color}`}>{score}</span>
    </div>
  )
}

function SkeletonSection({ title }: { title: string }) {
  return (
    <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
      <div className="px-4 py-3 border-b border-[var(--dash-border)]">
        <h2 className="text-sm font-medium text-[var(--dash-muted)]">{title}</h2>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-[var(--dash-surface-hover)] rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-[var(--dash-surface-hover)] rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-[var(--dash-surface-hover)] rounded w-5/6 animate-pulse" />
      </div>
    </section>
  )
}

export default function ScannerPage() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [stepIndex, setStepIndex] = useState(0)
  const [report, setReport] = useState<Report | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [enabledEvents, setEnabledEvents] = useState<Set<string>>(new Set())
  const [codeModalOpen, setCodeModalOpen] = useState(false)
  const [codeModalType, setCodeModalType] = useState<'gtm' | 'script'>('gtm')
  const [generatedCode, setGeneratedCode] = useState('')
  const [generatingCode, setGeneratingCode] = useState(false)
  const [copyDone, setCopyDone] = useState(false)

  // Use API response directly — no hardcoded event arrays
  const recommendedEvents = report?.recommendedEvents ?? []
  const siteType = report?.siteType ?? 'ecommerce'
  const smartEvents: SmartEvent[] = recommendedEvents.map((ev) => ({
    event: ev.name,
    reason: ev.why,
    priority: ev.priority.toLowerCase(),
    platforms: ['meta', 'google'],
  }))
  const enabledSet = new Set(enabledEvents)

  function toggleEvent(eventName: string) {
    setEnabledEvents((prev) => {
      const next = new Set(prev)
      if (next.has(eventName)) next.delete(eventName)
      else next.add(eventName)
      return next
    })
  }

  function enableAllRecommended() {
    const recommended = smartEvents.filter(
      (e) => e.priority === 'critical' || e.priority === 'high'
    )
    setEnabledEvents((prev) => {
      const next = new Set(prev)
      recommended.forEach((e) => next.add(e.event))
      return next
    })
  }

  async function openCodeModal(type: 'gtm' | 'script') {
    const events = Array.from(enabledSet)
    if (events.length === 0) {
      setGeneratedCode('// Enable at least one event above, then generate code.')
      setCodeModalType(type)
      setCodeModalOpen(true)
      return
    }
    setGeneratingCode(true)
    setCodeModalType(type)
    setCodeModalOpen(true)
    try {
      const res = await fetch('/api/scanner/generate-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events: events.map((e) => ({ event: e })), type }),
      })
      const data = await res.json()
      if (res.ok) setGeneratedCode(type === 'gtm' ? data.gtm_code : data.script_code)
      else setGeneratedCode('// Failed to generate code.')
    } catch {
      setGeneratedCode('// Network error.')
    } finally {
      setGeneratingCode(false)
    }
  }

  function copyCode() {
    if (generatedCode) {
      navigator.clipboard.writeText(generatedCode)
      setCopyDone(true)
      setTimeout(() => setCopyDone(false), 2000)
    }
  }

  function downloadAsJs() {
    if (!generatedCode) return
    const blob = new Blob([generatedCode], { type: 'text/javascript' })
    const a = document.createElement('a')
    a.href = URL.createObjectURL(blob)
    a.download = codeModalType === 'gtm' ? 'trackhive-gtm-events.js' : 'trackhive-events.js'
    a.click()
    URL.revokeObjectURL(a.href)
  }

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setError(null)
    setReport(null)
    setEnabledEvents(new Set())
    setLoading(true)
    setStepIndex(0)
    const stepInterval = setInterval(() => {
      setStepIndex((i) => (i < SCAN_STEPS.length - 1 ? i + 1 : i))
    }, 800)
    try {
      const res = await fetch('/api/scanner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Scan failed')
        return
      }
      setReport(data)
    } catch {
      setError('Network error')
    } finally {
      clearInterval(stepInterval)
      setLoading(false)
    }
  }

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Website Scanner</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">
        Enter any website URL to get a full tracking health report.
      </p>

      <form onSubmit={handleScan} className="mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Enter your website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface)] px-4 py-3 text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:border-[var(--dash-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--dash-primary)]"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-lg bg-[var(--dash-surface)] text-[var(--dash-text)] px-6 py-3 font-medium hover:bg-[var(--dash-surface-hover)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Scan Website
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-8 rounded-xl bg-[var(--dash-danger-soft)] border border-red-800 p-4 text-[var(--dash-danger-strong)] text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-6 mb-10">
          <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden p-4">
            <div className="h-2 bg-[var(--dash-surface-hover)] rounded-full overflow-hidden">
              <div
                className="h-full bg-[var(--dash-muted)] rounded-full transition-all duration-500"
                style={{
                  width: `${((stepIndex + 1) / SCAN_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <p className="mt-3 text-sm text-[var(--dash-muted)]">{SCAN_STEPS[stepIndex]}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {['Overall Health', 'Pixels Detected', 'CAPI Status', 'Missing Events', 'Page Speed', 'Recommendations'].map(
              (title) => (
                <SkeletonSection key={title} title={title} />
              )
            )}
          </div>
        </div>
      )}

      {!loading && report && (
        <div className="space-y-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-slate-500">Detected site type:</span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                report.siteType === 'ecommerce'
                  ? 'bg-blue-100 text-blue-700'
                  : 'bg-orange-100 text-orange-700'
              }`}
            >
              {report.siteType === 'ecommerce' ? '🛒 E-Commerce' : '📋 Lead Generation'}
            </span>
            <span className="text-xs text-slate-400">
              (confidence: ecom {report.ecomScore ?? 0} vs leadgen {report.leadGenScore ?? 0})
            </span>
          </div>

          {/* Section 1 — Overall Health Score */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Overall Health Score</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle score={report.score} />
              <div>
                <p className="text-[var(--dash-muted)] text-sm">{report.summary}</p>
                <p className="mt-1 text-[var(--dash-muted)] text-xs">Scanned: {report.url}</p>
              </div>
            </div>
          </section>

          {/* Section 2 — Pixels Detected */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Pixels Detected</h2>
            </div>
            <ul className="p-4 space-y-2">
              {PIXEL_LABELS.map(({ key, label }) => (
                <li key={key} className="flex items-center gap-3 text-sm">
                  {report.pixels[key] ? (
                    <span className="text-[var(--dash-success)]">✅</span>
                  ) : (
                    <span className="text-red-400">❌</span>
                  )}
                  <span className={report.pixels[key] ? 'text-[var(--dash-text)]' : 'text-[var(--dash-muted)]'}>{label}</span>
                  {report.detection?.pixelConfidence?.[key] && (
                    <span
                      className={`ml-auto rounded px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                        CONFIDENCE_CLASS[report.detection.pixelConfidence[key]]
                      }`}
                    >
                      {report.detection.pixelConfidence[key]}
                    </span>
                  )}
                </li>
              ))}
            </ul>
            {report.detection?.mode && (
              <p className="px-4 text-[11px] text-slate-500">
                Detection mode: {report.detection.mode === 'broad-with-fallback' ? 'Broad + script fallback' : report.detection.mode}
              </p>
            )}
            <p className="px-4 pb-4 text-xs text-slate-400">
              Note: Some pixels loaded via React or GTM may not be detected in static HTML scan. Server-side pixels (CAPI) are detected separately.
            </p>
          </section>

          {/* Section 3 — CAPI Status */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">CAPI Status</h2>
            </div>
            <ul className="p-4 space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-[var(--dash-muted)]">Meta CAPI active</span>
                {report.capi.metaCapi ? (
                  <span className="text-[var(--dash-success)] text-sm">Detected</span>
                ) : (
                  <span className="text-red-400 text-sm bg-[var(--dash-danger-soft)] px-2 py-0.5 rounded">Not detected — Fix this</span>
                )}
              </li>
              <li className="flex items-center justify-between">
                <span className="text-[var(--dash-muted)]">Google Enhanced Conversions</span>
                {report.capi.googleEnhanced ? (
                  <span className="text-[var(--dash-success)] text-sm">Detected</span>
                ) : (
                  <span className="text-red-400 text-sm bg-[var(--dash-danger-soft)] px-2 py-0.5 rounded">Not detected — Fix this</span>
                )}
              </li>
            </ul>
          </section>

          {/* Section 4 — Missing Events */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Recommended Events</h2>
            </div>
            <ul className="p-4 space-y-4">
              {report.recommendedEvents.map((ev) => (
                <li key={ev.name} className="border-b border-[var(--dash-border)] last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-[var(--dash-text)]">{ev.name}</span>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded ${
                        ev.priority === 'High'
                          ? 'bg-[var(--dash-warning)]/20 text-amber-400'
                          : ev.priority === 'Medium'
                            ? 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'
                            : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'
                      }`}
                    >
                      {ev.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-[var(--dash-muted)]">{ev.why}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5 — Page Speed & JS Health */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Page Speed & JS Health</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-[var(--dash-muted)]">
                Total script tags: <span className="text-[var(--dash-text)]">{report.scripts.totalScripts}</span>
              </p>
              <p className="text-sm text-[var(--dash-muted)]">
                Blocking scripts (no async/defer):{' '}
                <span className="text-[var(--dash-text)]">{report.scripts.blockingScripts}</span>
              </p>
              {report.scripts.blockingWarning && (
                <p className="text-sm text-amber-400">
                  Warning: More than 5 blocking scripts may slow down the page.
                </p>
              )}
              <p className="text-sm text-[var(--dash-muted)]">
                Tracking overhead: <span className="text-[var(--dash-text)] capitalize">{report.scripts.trackingOverhead}</span>
              </p>
            </div>
          </section>

          {/* Section 6 — Quick Recommendations */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Quick Recommendations</h2>
            </div>
            <ol className="p-4 list-decimal list-inside space-y-3">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="text-sm">
                  <span className="text-[var(--dash-muted)]">{rec.text}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      rec.priority === 'Critical'
                        ? 'bg-[var(--dash-danger)]/20 text-red-400'
                        : rec.priority === 'Important'
                          ? 'bg-[var(--dash-warning)]/20 text-amber-400'
                          : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Smart Events Auto-Detection */}
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Smart Events Auto-Detection</h2>
              <p className="text-xs text-[var(--dash-muted)] mt-0.5">
                {siteType === 'ecommerce'
                  ? 'E-commerce event set detected — enable and generate code'
                  : 'Lead generation event set detected — enable and generate code'}
              </p>
            </div>
            <div className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {smartEvents.map((ev) => {
                  const icon = EVENT_ICONS[ev.event] ?? '📌'
                  const enabled = enabledSet.has(ev.event)
                  const priorityClass =
                    ev.priority === 'critical'
                      ? 'bg-[var(--dash-danger)]/20 text-red-400'
                      : ev.priority === 'high'
                        ? 'bg-[var(--dash-warning)]/20 text-amber-400'
                        : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'
                  return (
                    <div
                      key={ev.event}
                      className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-hover)]/50 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl" aria-hidden>{icon}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize ${priorityClass}`}
                        >
                          {ev.priority}
                        </span>
                      </div>
                      <h3 className="font-medium text-[var(--dash-text)]">{ev.event}</h3>
                      <p className="text-xs text-[var(--dash-muted)]">{ev.reason}</p>
                      <div className="flex flex-wrap gap-1">
                        {ev.platforms?.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 rounded bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-[var(--dash-border)]">
                        <button
                          type="button"
                          onClick={() => toggleEvent(ev.event)}
                          className="rounded-md bg-[var(--dash-success)] text-white px-3 py-1.5 text-xs font-medium hover:bg-[var(--dash-success-strong)] transition-colors"
                        >
                          {enabled ? 'Enabled' : 'Enable with one click'}
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-[var(--dash-muted)]">On</span>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleEvent(ev.event)}
                            className="rounded border-[var(--dash-border-strong)] bg-[var(--dash-surface-hover)] [accent-color:var(--dash-success)] focus:ring-[var(--dash-success)]"
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
              {smartEvents.length === 0 && (
                <p className="text-sm text-[var(--dash-muted)] py-4">No events detected. Run a scan to see suggestions.</p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enableAllRecommended}
                  className="rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--dash-border)] transition-colors"
                >
                  Enable All Recommended Events
                </button>
                <button
                  type="button"
                  onClick={() => openCodeModal('gtm')}
                  disabled={generatingCode}
                  className="rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 transition-colors"
                >
                  Generate GTM Code
                </button>
                <button
                  type="button"
                  onClick={() => openCodeModal('script')}
                  disabled={generatingCode}
                  className="rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-4 py-2.5 text-sm font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 transition-colors"
                >
                  Generate Script Tag Code
                </button>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* Code Generation Modal */}
      {codeModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setCodeModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Generated code"
        >
          <div
            className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center justify-between">
              <h3 className="text-sm font-medium text-[var(--dash-muted)]">
                {codeModalType === 'gtm' ? 'GTM dataLayer code' : 'TrackHive script code'}
              </h3>
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="text-[var(--dash-muted)] hover:text-[var(--dash-text)] transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {generatingCode ? (
                <div className="flex items-center gap-2 text-[var(--dash-muted)] text-sm">
                  <span className="inline-block w-4 h-4 border-2 border-[var(--dash-border-strong)] border-t-slate-300 rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <pre className="text-xs text-[var(--dash-muted)] bg-[var(--dash-surface-hover)] rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                  {generatedCode}
                </pre>
              )}
            </div>
            <div className="px-4 py-3 border-t border-[var(--dash-border)] flex gap-2">
              <button
                type="button"
                onClick={copyCode}
                disabled={generatingCode || !generatedCode}
                className="rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-4 py-2 text-sm font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 transition-colors"
              >
                {copyDone ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={downloadAsJs}
                disabled={generatingCode || !generatedCode}
                className="rounded-lg bg-[var(--dash-surface-hover)] text-[var(--dash-text)] px-4 py-2 text-sm font-medium hover:bg-[var(--dash-border)] disabled:opacity-50 transition-colors"
              >
                Download as .js file
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}




