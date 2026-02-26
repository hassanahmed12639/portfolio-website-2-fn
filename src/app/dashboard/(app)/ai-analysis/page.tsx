'use client'

import { useState, useCallback } from 'react'

type AnalyzeReport = {
  health_score?: number
  missing_events?: { event: string; reason: string; priority: string }[]
  duplicate_events?: { event: string; count: number; fix: string }[]
  events_missing_value?: { event: string; count: number; impact: string }[]
  funnel_analysis?: { stage: string; count: number; dropoff_percent: number }[]
  recommendations?: { title: string; description: string; code_snippet: string; impact: string }[]
  quick_win?: { title: string; description: string; code_snippet: string }
  summary?: string
}

type UtmResult = {
  original_url?: string
  cleaned_url?: string
  issues?: string[]
  normalized_utms?: Record<string, unknown>
  recommendations?: string[]
}

function CopyBtn({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }, [text])
  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 px-3 py-1.5 rounded-md bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm font-medium transition-colors"
    >
      {copied ? 'Copied' : label}
    </button>
  )
}

function HealthRing({ score }: { score: number }) {
  const clamped = Math.min(100, Math.max(0, score))
  const r = 56
  const circ = 2 * Math.PI * r
  const stroke = (clamped / 100) * circ
  const color = clamped >= 70 ? 'stroke-emerald-500' : clamped >= 40 ? 'stroke-amber-500' : 'stroke-red-500'
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg className="w-36 h-36 -rotate-90" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="10"
          className="text-zinc-800"
        />
        <circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={circ}
          strokeDashoffset={circ - stroke}
          className={color}
          style={{ transition: 'stroke-dashoffset 0.6s ease-out' }}
        />
      </svg>
      <span className="absolute text-2xl font-bold text-white">{clamped}</span>
    </div>
  )
}

function ReportView({ report }: { report: AnalyzeReport }) {
  const missing = report.missing_events ?? []
  const duplicates = report.duplicate_events ?? []
  const missingValue = report.events_missing_value ?? []
  const funnel = report.funnel_analysis ?? []
  const recs = report.recommendations ?? []
  const quickWin = report.quick_win
  const priorityBadge = (p: string) => {
    const c =
      p === 'high'
        ? 'bg-red-500/20 text-red-400 border-red-500/40'
        : p === 'medium'
          ? 'bg-amber-500/20 text-amber-400 border-amber-500/40'
          : 'bg-zinc-500/20 text-zinc-400 border-zinc-500/40'
    return (
      <span className={`text-xs font-medium px-2 py-0.5 rounded border ${c}`}>
        {p}
      </span>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-6 flex flex-col items-center">
        <h2 className="text-sm font-medium text-zinc-400 mb-3">Overall Tracking Health Score</h2>
        <HealthRing score={report.health_score ?? 0} />
        {report.summary && (
          <p className="mt-4 text-zinc-300 text-sm text-center max-w-xl">{report.summary}</p>
        )}
      </div>

      {missing.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
            Missing Funnel Events
          </h2>
          <ul className="divide-y divide-zinc-800">
            {missing.map((m, i) => (
              <li key={i} className="px-4 py-3 flex flex-wrap items-center gap-2">
                <span className="text-white font-medium">{m.event}</span>
                {priorityBadge(m.priority)}
                <span className="text-zinc-400 text-sm">{m.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {duplicates.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
            Duplicate Events Detected
          </h2>
          <ul className="divide-y divide-zinc-800">
            {duplicates.map((d, i) => (
              <li key={i} className="px-4 py-3">
                <span className="text-white font-medium">{d.event}</span>
                <span className="text-zinc-400 text-sm ml-2">× {d.count}</span>
                <p className="text-zinc-500 text-sm mt-1">{d.fix}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {missingValue.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
            Events Missing Value
          </h2>
          <ul className="divide-y divide-zinc-800">
            {missingValue.map((e, i) => (
              <li key={i} className="px-4 py-3">
                <span className="text-white font-medium">{e.event}</span>
                <span className="text-zinc-400 text-sm ml-2">× {e.count}</span>
                <p className="text-zinc-500 text-sm mt-1">{e.impact}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {funnel.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
            Funnel Drop-off Analysis
          </h2>
          <ul className="divide-y divide-zinc-800">
            {funnel.map((f, i) => (
              <li key={i} className="px-4 py-3 flex justify-between items-center">
                <span className="text-white">{f.stage}</span>
                <span className="text-zinc-400">
                  {f.count} · {f.dropoff_percent}% drop-off
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recs.length > 0 && (
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">
            AI Recommendations
          </h2>
          <ol className="divide-y divide-zinc-800 list-decimal list-inside">
            {recs.map((r, i) => (
              <li key={i} className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <span className="font-medium text-white">{r.title}</span>
                  {r.code_snippet && <CopyBtn text={r.code_snippet} />}
                </div>
                <p className="text-zinc-400 text-sm mt-1">{r.description}</p>
                {r.code_snippet && (
                  <pre className="mt-2 p-3 rounded-lg bg-zinc-950 text-xs text-zinc-400 overflow-x-auto">
                    {r.code_snippet}
                  </pre>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      {quickWin && (
        <div className="rounded-xl border-2 border-emerald-500/50 bg-emerald-950/30 p-4">
          <h2 className="text-sm font-medium text-emerald-400 mb-2">Quick Win</h2>
          <p className="font-medium text-white">{quickWin.title}</p>
          <p className="text-zinc-300 text-sm mt-1">{quickWin.description}</p>
          {quickWin.code_snippet && (
            <div className="mt-3 flex items-start gap-2">
              <pre className="flex-1 p-3 rounded-lg bg-zinc-900 text-xs text-zinc-300 overflow-x-auto">
                {quickWin.code_snippet}
              </pre>
              <CopyBtn text={quickWin.code_snippet} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}

const TABS = [
  { id: 'events', label: 'Event Analysis' },
  { id: 'upload', label: 'Upload Log Analysis' },
  { id: 'utm', label: 'UTM Cleaner' },
] as const

export default function AiAnalysisPage() {
  const [tab, setTab] = useState<(typeof TABS)[number]['id']>('events')
  const [analyzeLoading, setAnalyzeLoading] = useState(false)
  const [report, setReport] = useState<AnalyzeReport | null>(null)
  const [analyzeError, setAnalyzeError] = useState<string | null>(null)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [utmUrl, setUtmUrl] = useState('')
  const [utmLoading, setUtmLoading] = useState(false)
  const [utmResult, setUtmResult] = useState<UtmResult | null>(null)
  const [utmError, setUtmError] = useState<string | null>(null)

  const runEventAnalysis = useCallback(async () => {
    setAnalyzeError(null)
    setReport(null)
    setAnalyzeLoading(true)
    try {
      const res = await fetch('/api/dashboard/events?date_range=30')
      if (!res.ok) throw new Error('Failed to load events')
      const data = await res.json()
      const events = data.events ?? []
      const post = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ events }),
      })
      const json = await post.json()
      if (!post.ok) throw new Error(json.error || 'Analysis failed')
      setReport(json)
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setAnalyzeLoading(false)
    }
  }, [])

  const runUploadAnalysis = useCallback(async () => {
    if (!uploadFile) return
    setAnalyzeError(null)
    setReport(null)
    setAnalyzeLoading(true)
    try {
      const text = await uploadFile.text()
      const post = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploadedLog: text }),
      })
      const json = await post.json()
      if (!post.ok) throw new Error(json.error || 'Analysis failed')
      setReport(json)
    } catch (e) {
      setAnalyzeError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setAnalyzeLoading(false)
    }
  }, [uploadFile])

  const runUtmCleaner = useCallback(async () => {
    const url = utmUrl.trim()
    if (!url) return
    setUtmError(null)
    setUtmResult(null)
    setUtmLoading(true)
    try {
      const res = await fetch('/api/ai/utm-cleaner', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'UTM analysis failed')
      setUtmResult(json)
    } catch (e) {
      setUtmError(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setUtmLoading(false)
    }
  }, [utmUrl])

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-white mb-6">AI Event Analysis</h1>

      <div className="flex gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 w-fit mb-6">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              tab === t.id
                ? 'bg-zinc-700 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'events' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4">
            <button
              type="button"
              onClick={runEventAnalysis}
              disabled={analyzeLoading}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {analyzeLoading ? 'Analyzing…' : 'Analyze My Events'}
            </button>
            {analyzeLoading && (
              <p className="mt-3 text-zinc-400 text-sm flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                AI is analyzing your tracking data...
              </p>
            )}
          </div>
          {analyzeError && (
            <p className="text-red-400 text-sm rounded-lg bg-red-950/30 border border-red-800 p-3">
              {analyzeError}
            </p>
          )}
          {report && <ReportView report={report} />}
        </div>
      )}

      {tab === 'upload' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <input
              type="file"
              accept=".json,.csv,.txt"
              onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
              className="block w-full text-sm text-zinc-400 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-zinc-700 file:text-zinc-200 file:text-sm"
            />
            <button
              type="button"
              onClick={runUploadAnalysis}
              disabled={analyzeLoading || !uploadFile}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {analyzeLoading ? 'Analyzing…' : 'Analyze Uploaded Log'}
            </button>
            {analyzeLoading && (
              <p className="text-zinc-400 text-sm flex items-center gap-2">
                <span className="inline-block w-4 h-4 border-2 border-zinc-500 border-t-white rounded-full animate-spin" />
                AI is analyzing your tracking data...
              </p>
            )}
          </div>
          {analyzeError && (
            <p className="text-red-400 text-sm rounded-lg bg-red-950/30 border border-red-800 p-3">
              {analyzeError}
            </p>
          )}
          {report && <ReportView report={report} />}
        </div>
      )}

      {tab === 'utm' && (
        <div className="space-y-6">
          <div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 space-y-3">
            <label className="block text-sm text-zinc-400">Paste your full URL with UTMs</label>
            <textarea
              value={utmUrl}
              onChange={(e) => setUtmUrl(e.target.value)}
              placeholder="https://example.com/page?utm_source=google&utm_medium=cpc&..."
              rows={3}
              className="w-full rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-200 px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-zinc-500 placeholder:text-zinc-500 resize-none"
            />
            <button
              type="button"
              onClick={runUtmCleaner}
              disabled={utmLoading || !utmUrl.trim()}
              className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium text-sm transition-colors"
            >
              {utmLoading ? 'Analyzing…' : 'Clean & Analyze'}
            </button>
          </div>
          {utmError && (
            <p className="text-red-400 text-sm rounded-lg bg-red-950/30 border border-red-800 p-3">
              {utmError}
            </p>
          )}
          {utmResult && (
            <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden space-y-4 p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Original</p>
                  <p className="text-sm text-zinc-400 break-all font-mono">{utmResult.original_url ?? utmUrl}</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-500 mb-1">Cleaned URL</p>
                  <div className="flex items-start gap-2">
                    <p className="text-sm text-emerald-400 break-all font-mono flex-1">
                      {utmResult.cleaned_url ?? '—'}
                    </p>
                    {utmResult.cleaned_url && (
                      <CopyBtn text={utmResult.cleaned_url} label="Copy URL" />
                    )}
                  </div>
                </div>
              </div>
              {utmResult.issues && utmResult.issues.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-2">Issues found</p>
                  <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                    {utmResult.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
              {utmResult.recommendations && utmResult.recommendations.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-zinc-300 mb-2">Recommendations</p>
                  <ul className="list-disc list-inside text-sm text-zinc-400 space-y-1">
                    {utmResult.recommendations.map((rec, i) => (
                      <li key={i}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
