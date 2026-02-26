'use client'

import { useState } from 'react'

const SCAN_STEPS = [
  'Fetching page...',
  'Analyzing pixels...',
  'Checking GTM...',
  'Generating report...',
]

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
  scripts: {
    totalScripts: number
    blockingScripts: number
    blockingWarning: boolean
    trackingOverhead: string
  }
  recommendations: { text: string; priority: string }[]
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

  async function handleScan(e: React.FormEvent) {
    e.preventDefault()
    if (!url.trim()) return
    setError(null)
    setReport(null)
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
        </div>
      )}
    </div>
  )
}
