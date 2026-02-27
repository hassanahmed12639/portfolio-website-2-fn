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
  pixels: {
    metaPixel: boolean
    gtm: boolean
    googleAnalytics: boolean
    googleAds: boolean
    tiktokPixel: boolean
    trackhive: boolean
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
  ViewContent: '👀',
  Search: '🔍',
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

function ScoreCircle({ score }: { score: number }) {
  const color =
    score >= 80 ? 'text-emerald-400 stroke-emerald-400' : score >= 50 ? 'text-amber-400 stroke-amber-400' : 'text-red-400 stroke-red-400'
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
          className="text-zinc-700"
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
    <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
      <div className="px-4 py-3 border-b border-zinc-800">
        <h2 className="text-sm font-medium text-zinc-300">{title}</h2>
      </div>
      <div className="p-4 space-y-3">
        <div className="h-4 bg-zinc-800 rounded w-3/4 animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-1/2 animate-pulse" />
        <div className="h-4 bg-zinc-800 rounded w-5/6 animate-pulse" />
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

  const smartEvents = (report?.smartEvents ?? []).reduce<SmartEvent[]>((acc, ev) => {
    if (!acc.some((e) => e.event === ev.event)) acc.push(ev)
    return acc
  }, [])
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
      (e) => e.priority === 'critical' || e.priority === 'recommended'
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
      <h1 className="text-xl font-semibold text-white mb-2">Website Scanner</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Enter any website URL to get a full tracking health report.
      </p>

      <form onSubmit={handleScan} className="mb-10">
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="url"
            placeholder="Enter your website URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="flex-1 rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-white placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !url.trim()}
            className="rounded-lg bg-white text-zinc-900 px-6 py-3 font-medium hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Scan Website
          </button>
        </div>
      </form>

      {error && (
        <div className="mb-8 rounded-xl bg-red-950/50 border border-red-800 p-4 text-red-300 text-sm">
          {error}
        </div>
      )}

      {loading && (
        <div className="space-y-6 mb-10">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden p-4">
            <div className="h-2 bg-zinc-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-zinc-500 rounded-full transition-all duration-500"
                style={{
                  width: `${((stepIndex + 1) / SCAN_STEPS.length) * 100}%`,
                }}
              />
            </div>
            <p className="mt-3 text-sm text-zinc-400">{SCAN_STEPS[stepIndex]}</p>
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
          {/* Section 1 — Overall Health Score */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Overall Health Score</h2>
            </div>
            <div className="p-6 flex flex-col sm:flex-row items-center gap-6">
              <ScoreCircle score={report.score} />
              <div>
                <p className="text-zinc-300 text-sm">{report.summary}</p>
                <p className="mt-1 text-zinc-500 text-xs">Scanned: {report.url}</p>
              </div>
            </div>
          </section>

          {/* Section 2 — Pixels Detected */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Pixels Detected</h2>
            </div>
            <ul className="p-4 space-y-2">
              {PIXEL_LABELS.map(({ key, label }) => (
                <li key={key} className="flex items-center gap-3 text-sm">
                  {report.pixels[key] ? (
                    <span className="text-emerald-400">✅</span>
                  ) : (
                    <span className="text-red-400">❌</span>
                  )}
                  <span className={report.pixels[key] ? 'text-zinc-200' : 'text-zinc-500'}>{label}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 3 — CAPI Status */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">CAPI Status</h2>
            </div>
            <ul className="p-4 space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-zinc-300">Meta CAPI active</span>
                {report.capi.metaCapi ? (
                  <span className="text-emerald-400 text-sm">Detected</span>
                ) : (
                  <span className="text-red-400 text-sm bg-red-950/50 px-2 py-0.5 rounded">Not detected — Fix this</span>
                )}
              </li>
              <li className="flex items-center justify-between">
                <span className="text-zinc-300">Google Enhanced Conversions</span>
                {report.capi.googleEnhanced ? (
                  <span className="text-emerald-400 text-sm">Detected</span>
                ) : (
                  <span className="text-red-400 text-sm bg-red-950/50 px-2 py-0.5 rounded">Not detected — Fix this</span>
                )}
              </li>
            </ul>
          </section>

          {/* Section 4 — Missing Events */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Recommended Events</h2>
            </div>
            <ul className="p-4 space-y-4">
              {report.recommendedEvents.map((ev) => (
                <li key={ev.name} className="border-b border-zinc-800 last:border-0 pb-4 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-medium text-zinc-200">{ev.name}</span>
                    <span
                      className={`shrink-0 text-xs px-2 py-0.5 rounded ${
                        ev.priority === 'High'
                          ? 'bg-amber-500/20 text-amber-400'
                          : ev.priority === 'Medium'
                            ? 'bg-zinc-600 text-zinc-300'
                            : 'bg-zinc-700 text-zinc-400'
                      }`}
                    >
                      {ev.priority}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-zinc-500">{ev.why}</p>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 5 — Page Speed & JS Health */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Page Speed & JS Health</h2>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-zinc-400">
                Total script tags: <span className="text-zinc-200">{report.scripts.totalScripts}</span>
              </p>
              <p className="text-sm text-zinc-400">
                Blocking scripts (no async/defer):{' '}
                <span className="text-zinc-200">{report.scripts.blockingScripts}</span>
              </p>
              {report.scripts.blockingWarning && (
                <p className="text-sm text-amber-400">
                  Warning: More than 5 blocking scripts may slow down the page.
                </p>
              )}
              <p className="text-sm text-zinc-400">
                Tracking overhead: <span className="text-zinc-200 capitalize">{report.scripts.trackingOverhead}</span>
              </p>
            </div>
          </section>

          {/* Section 6 — Quick Recommendations */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Quick Recommendations</h2>
            </div>
            <ol className="p-4 list-decimal list-inside space-y-3">
              {report.recommendations.map((rec, i) => (
                <li key={i} className="text-sm">
                  <span className="text-zinc-300">{rec.text}</span>
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded ${
                      rec.priority === 'Critical'
                        ? 'bg-red-500/20 text-red-400'
                        : rec.priority === 'Important'
                          ? 'bg-amber-500/20 text-amber-400'
                          : 'bg-zinc-600 text-zinc-400'
                    }`}
                  >
                    {rec.priority}
                  </span>
                </li>
              ))}
            </ol>
          </section>

          {/* Smart Events Auto-Detection */}
          <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-zinc-800">
              <h2 className="text-sm font-medium text-zinc-300">Smart Events Auto-Detection</h2>
              <p className="text-xs text-zinc-500 mt-0.5">Detected actions on website — enable and generate code</p>
            </div>
            <div className="p-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {smartEvents.map((ev) => {
                  const icon = EVENT_ICONS[ev.event] ?? '📌'
                  const enabled = enabledSet.has(ev.event)
                  const priorityClass =
                    ev.priority === 'critical'
                      ? 'bg-red-500/20 text-red-400'
                      : ev.priority === 'recommended'
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-zinc-600 text-zinc-400'
                  return (
                    <div
                      key={ev.event}
                      className="rounded-lg border border-zinc-800 bg-zinc-800/50 p-4 flex flex-col gap-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-2xl" aria-hidden>{icon}</span>
                        <span
                          className={`text-xs px-2 py-0.5 rounded capitalize ${priorityClass}`}
                        >
                          {ev.priority}
                        </span>
                      </div>
                      <h3 className="font-medium text-zinc-200">{ev.event}</h3>
                      <p className="text-xs text-zinc-500">{ev.reason}</p>
                      <div className="flex flex-wrap gap-1">
                        {ev.platforms?.map((p) => (
                          <span
                            key={p}
                            className="text-xs px-2 py-0.5 rounded bg-zinc-700 text-zinc-300 capitalize"
                          >
                            {p}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-auto pt-2 border-t border-zinc-700">
                        <button
                          type="button"
                          onClick={() => toggleEvent(ev.event)}
                          className="rounded-md bg-emerald-600 text-white px-3 py-1.5 text-xs font-medium hover:bg-emerald-500 transition-colors"
                        >
                          {enabled ? 'Enabled' : 'Enable with one click'}
                        </button>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <span className="text-xs text-zinc-400">On</span>
                          <input
                            type="checkbox"
                            checked={enabled}
                            onChange={() => toggleEvent(ev.event)}
                            className="rounded border-zinc-600 bg-zinc-800 text-emerald-500 focus:ring-emerald-500"
                          />
                        </label>
                      </div>
                    </div>
                  )
                })}
              </div>
              {smartEvents.length === 0 && (
                <p className="text-sm text-zinc-500 py-4">No events detected. Run a scan to see suggestions.</p>
              )}
              <div className="mt-6 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={enableAllRecommended}
                  className="rounded-lg bg-zinc-700 text-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-600 transition-colors"
                >
                  Enable All Recommended Events
                </button>
                <button
                  type="button"
                  onClick={() => openCodeModal('gtm')}
                  disabled={generatingCode}
                  className="rounded-lg bg-zinc-700 text-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors"
                >
                  Generate GTM Code
                </button>
                <button
                  type="button"
                  onClick={() => openCodeModal('script')}
                  disabled={generatingCode}
                  className="rounded-lg bg-zinc-700 text-zinc-200 px-4 py-2.5 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors"
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
            className="rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl w-full max-w-2xl max-h-[85vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
              <h3 className="text-sm font-medium text-zinc-300">
                {codeModalType === 'gtm' ? 'GTM dataLayer code' : 'TrackHive script code'}
              </h3>
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="text-zinc-400 hover:text-white transition-colors"
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-auto flex-1">
              {generatingCode ? (
                <div className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="inline-block w-4 h-4 border-2 border-zinc-500 border-t-zinc-300 rounded-full animate-spin" />
                  Generating...
                </div>
              ) : (
                <pre className="text-xs text-zinc-300 bg-zinc-950 rounded-lg p-4 overflow-x-auto whitespace-pre-wrap font-mono">
                  {generatedCode}
                </pre>
              )}
            </div>
            <div className="px-4 py-3 border-t border-zinc-800 flex gap-2">
              <button
                type="button"
                onClick={copyCode}
                disabled={generatingCode || !generatedCode}
                className="rounded-lg bg-zinc-700 text-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors"
              >
                {copyDone ? 'Copied!' : 'Copy'}
              </button>
              <button
                type="button"
                onClick={downloadAsJs}
                disabled={generatingCode || !generatedCode}
                className="rounded-lg bg-zinc-700 text-zinc-200 px-4 py-2 text-sm font-medium hover:bg-zinc-600 disabled:opacity-50 transition-colors"
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
