'use client'

import { useState, useCallback } from 'react'
import { validatePayload, type ValidationResult } from '@/lib/payload-validator'
import { ShieldCheck, CheckCircle, XCircle, AlertTriangle, Lightbulb } from 'lucide-react'

const EXAMPLES: { label: string; payload: Record<string, unknown> }[] = [
  {
    label: 'Purchase Event',
    payload: {
      event_name: 'Purchase',
      email: 'customer@example.com',
      value: 99.99,
      currency: 'USD',
      event_id: 'evt_123',
      event_source_url: 'https://example.com/checkout',
    },
  },
  {
    label: 'Lead Event',
    payload: {
      event_name: 'Lead',
      email: 'lead@example.com',
      phone: '+1234567890',
      form_name: 'Contact Form',
      event_source_url: 'https://example.com/contact',
    },
  },
  {
    label: 'PageView Event',
    payload: {
      event_name: 'PageView',
      event_source_url: 'https://example.com/product',
      event_id: 'evt_page_1',
    },
  },
  {
    label: 'AddToCart Event',
    payload: {
      event_name: 'AddToCart',
      value: 49.99,
      currency: 'USD',
      product_id: 'sku_123',
      product_name: 'Widget',
      event_source_url: 'https://example.com/product/sku_123',
    },
  },
  {
    label: 'Complete Registration',
    payload: {
      event_name: 'CompleteRegistration',
      email: 'user@example.com',
      first_name: 'Jane',
      last_name: 'Doe',
      event_source_url: 'https://example.com/signup',
    },
  },
]

const DEFAULT_JSON = `{
  "event_name": "Purchase",
  "email": "customer@example.com",
  "value": 99.99,
  "currency": "USD"
}`

const MATCH_RATE_FIELDS: { key: string; label: string; pct: number }[] = [
  { key: 'email', label: 'email', pct: 35 },
  { key: 'phone', label: 'phone', pct: 25 },
  { key: 'fbp', label: 'fbp', pct: 20 },
  { key: 'fbc', label: 'fbc', pct: 10 },
  { key: 'name', label: 'name', pct: 10 },
  { key: 'location', label: 'location', pct: 3 },
  { key: 'fbclid', label: 'fbclid', pct: 2 },
]

function getMatchRatePresent(payload: Record<string, unknown>, key: string): boolean {
  if (key === 'name') return !!(payload.first_name && payload.last_name)
  if (key === 'location') return !!(payload.city || payload.zip)
  return !!payload[key as keyof typeof payload]
}

export default function ValidatorPage() {
  const [jsonInput, setJsonInput] = useState(DEFAULT_JSON)
  const [result, setResult] = useState<ValidationResult | null>(null)
  const [parseError, setParseError] = useState<string | null>(null)

  const runValidation = useCallback(() => {
    setParseError(null)
    try {
      const parsed = JSON.parse(jsonInput) as Record<string, unknown>
      setResult(validatePayload(parsed))
    } catch (e) {
      setParseError(e instanceof Error ? e.message : 'Invalid JSON')
      setResult(null)
    }
  }, [jsonInput])

  const loadExample = (payload: Record<string, unknown>) => {
    setJsonInput(JSON.stringify(payload, null, 2))
    setParseError(null)
    setResult(validatePayload(payload))
  }

  const clear = () => {
    setJsonInput('{}')
    setResult(null)
    setParseError(null)
  }

  const payloadForMatchRate = result
    ? (() => {
        try {
          return (JSON.parse(jsonInput) as Record<string, unknown>) || {}
        } catch {
          return {}
        }
      })()
    : {}

  return (
    <div className="p-6 md:p-8 min-h-screen max-w-6xl mx-auto">
      {/* Section 1 — Header */}
      <header className="mb-8">
        <div className="flex items-center gap-2 text-emerald-400 mb-2">
          <ShieldCheck className="w-6 h-6" />
          <h1 className="text-2xl font-bold text-white">Payload Validator</h1>
        </div>
        <p className="text-zinc-400 text-base mb-1">
          Test your event payload before sending to Meta
        </p>
        <p className="text-zinc-500 text-sm italic">
          Validate before you send — catch errors before they cost you money
        </p>
      </header>

      {/* Section 2 — Input */}
      <section className="mb-8">
        <div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div className="px-4 py-3 border-b border-zinc-800 flex flex-wrap items-center justify-between gap-3">
            <span className="text-sm font-medium text-zinc-300">Event payload (JSON)</span>
            <div className="flex flex-wrap items-center gap-2">
              <select
                className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-zinc-200 text-sm"
                value=""
                onChange={(e) => {
                  const idx = Number(e.target.value)
                  if (!Number.isNaN(idx) && EXAMPLES[idx]) loadExample(EXAMPLES[idx].payload)
                }}
              >
                <option value="">Load example…</option>
                {EXAMPLES.map((ex, i) => (
                  <option key={ex.label} value={i}>
                    {ex.label}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={clear}
                className="px-3 py-2 rounded-lg bg-zinc-700 hover:bg-zinc-600 text-zinc-200 text-sm transition-colors"
              >
                Clear
              </button>
              <button
                type="button"
                onClick={runValidation}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-sm transition-colors"
              >
                Validate Payload
              </button>
            </div>
          </div>
          <div className="p-4">
            <textarea
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className="w-full min-h-[220px] px-4 py-3 rounded-lg bg-zinc-950 border border-zinc-700 text-zinc-100 font-mono text-sm placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder='{"event_name": "Purchase", ...}'
              spellCheck={false}
            />
            {parseError && (
              <p className="mt-2 text-sm text-red-400">Parse error: {parseError}</p>
            )}
          </div>
        </div>
      </section>

      {/* Section 3 — Results */}
      {result && (
        <>
          <section className="mb-8">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Results</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div
                className={`rounded-xl border p-4 ${
                  result.willBeAccepted
                    ? 'bg-emerald-500/10 border-emerald-500/30'
                    : 'bg-red-500/10 border-red-500/30'
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  {result.willBeAccepted ? (
                    <CheckCircle className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400" />
                  )}
                  <span className="font-medium text-white">
                    {result.willBeAccepted ? 'Valid' : 'Invalid'}
                  </span>
                </div>
                <p className="text-xs text-zinc-400">
                  {result.willBeAccepted ? 'Meta will accept this event' : 'Fix errors before sending'}
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 mb-1">Score</p>
                <p
                  className={`text-2xl font-bold ${
                    result.score >= 80 ? 'text-emerald-400' : result.score >= 50 ? 'text-amber-400' : 'text-red-400'
                  }`}
                >
                  {result.score}/100
                </p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 mb-1">Match rate</p>
                <p className="text-2xl font-bold text-white">~{result.estimatedMatchRate}%</p>
              </div>
              <div className="rounded-xl border border-zinc-700 bg-zinc-900/50 p-4">
                <p className="text-xs text-zinc-500 mb-1">Warnings</p>
                <p className="text-2xl font-bold text-amber-400">{result.warnings.length}</p>
              </div>
            </div>
          </section>

          {/* Issues by severity */}
          <section className="mb-8 space-y-6">
            {result.errors.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-red-400 mb-2 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  ERRORS
                </h3>
                <ul className="space-y-2">
                  {result.errors.map((issue, i) => (
                    <li
                      key={`e-${i}`}
                      className="rounded-lg border border-red-500/30 bg-red-500/10 p-3 text-sm"
                    >
                      <span className="font-mono text-red-300">❌ {issue.field}</span>
                      <span className="text-red-200/90"> — {issue.message}</span>
                      <p className="text-red-300/80 text-xs mt-1">Impact: {issue.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.warnings.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-amber-400 mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  WARNINGS
                </h3>
                <ul className="space-y-2">
                  {result.warnings.map((issue, i) => (
                    <li
                      key={`w-${i}`}
                      className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 text-sm"
                    >
                      <span className="font-mono text-amber-300">⚠️ {issue.field}</span>
                      <span className="text-amber-200/90"> — {issue.message}</span>
                      <p className="text-amber-300/80 text-xs mt-1">Impact: {issue.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {result.suggestions.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-blue-400 mb-2 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4" />
                  SUGGESTIONS
                </h3>
                <ul className="space-y-2">
                  {result.suggestions.map((issue, i) => (
                    <li
                      key={`s-${i}`}
                      className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3 text-sm"
                    >
                      <span className="font-mono text-blue-300">💡 {issue.field}</span>
                      <span className="text-blue-200/90"> — {issue.message}</span>
                      <p className="text-blue-300/80 text-xs mt-1">Impact: {issue.impact}</p>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>

          {/* Section 4 — Match rate breakdown */}
          <section className="mb-8">
            <h2 className="text-sm font-medium text-zinc-400 mb-4">Match rate breakdown</h2>
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-4 space-y-3">
              {MATCH_RATE_FIELDS.map(({ key, label, pct }) => {
                const present = getMatchRatePresent(payloadForMatchRate, key)
                return (
                  <div key={key} className="flex items-center justify-between text-sm">
                    <span className="text-zinc-300 font-mono">{label}</span>
                    <span className={present ? 'text-emerald-400' : 'text-zinc-500'}>
                      {present ? '✅' : '❌'} +{pct}% {!present && '(missing)'}
                    </span>
                  </div>
                )
              })}
              <div className="pt-3 border-t border-zinc-800">
                <div className="flex justify-between text-xs text-zinc-500 mb-1">
                  <span>Estimated match rate</span>
                  <span>{result.estimatedMatchRate}%</span>
                </div>
                <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
                  <div
                    className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                    style={{ width: `${result.estimatedMatchRate}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Section 5 — Fix suggestions (code snippets) */}
          {(result.errors.length > 0 || result.warnings.length > 0 || result.suggestions.length > 0) && (
            <section>
              <h2 className="text-sm font-medium text-zinc-400 mb-4">Fix suggestions</h2>
              <div className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
                <p className="text-zinc-400 text-sm mb-3">
                  Add missing fields to your TrackHive.track() call:
                </p>
                <pre className="rounded-lg bg-zinc-900 border border-zinc-700 p-4 text-xs text-zinc-300 font-mono overflow-x-auto">
{`TrackHive.track('Purchase', {
  email: 'customer@example.com',
  phone: '+1234567890',  // ← Add phone for +15% match rate
  value: 99.99,
  currency: 'USD',
  event_id: 'evt_uniq_123',  // ← Deduplication
  event_source_url: window.location.href  // ← Attribution
})`}
                </pre>
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
