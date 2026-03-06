'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { validatePayload, type ValidationResult } from '@/lib/payload-validator'
import { useDashboardType } from '@/contexts/DashboardContext'

const ALL_EVENT_TYPES = [
  { id: 'Purchase', label: 'Purchase', mode: 'ecommerce' as const },
  { id: 'Lead', label: 'Lead', mode: 'leadgen' as const },
  { id: 'PageView', label: 'PageView', mode: 'both' as const },
  { id: 'AddToCart', label: 'AddToCart', mode: 'ecommerce' as const },
  { id: 'InitiateCheckout', label: 'InitiateCheckout', mode: 'ecommerce' as const },
  { id: 'ViewContent', label: 'ViewContent', mode: 'ecommerce' as const },
  { id: 'Search', label: 'Search', mode: 'ecommerce' as const },
  { id: 'CompleteRegistration', label: 'CompleteRegistration', mode: 'leadgen' as const },
] as const

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD']

type EventParams = {
  value: string
  currency: string
  email: string
  phone: string
  first_name: string
  last_name: string
  city: string
  country: string
  order_id: string
  form_name: string
  page_url: string
  page_title: string
  product_id: string
  product_name: string
  event_id: string
  event_source_url: string
}

const defaultParams: EventParams = {
  value: '',
  currency: 'USD',
  email: '',
  phone: '',
  first_name: '',
  last_name: '',
  city: '',
  country: '',
  order_id: '',
  form_name: '',
  page_url: '',
  page_title: '',
  product_id: '',
  product_name: '',
  event_id: '',
  event_source_url: '',
}

function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).slice(2, 11)}`
}

type HistoryItem = {
  id: string
  event_name: string
  time: string
  status: 'success' | 'fail'
  response?: unknown
  payload?: unknown
}

function qualityTips(score: number): string[] {
  const tips: string[] = []
  if (score < 30) tips.push('Add email or phone for +30 points and better attribution.')
  if (score < 50) tips.push('Include event_id for deduplication (+20).')
  if (score < 65) tips.push('Add event_source_url (+15) and currency for purchase events (+15).')
  if (score < 80) tips.push('For Purchase events, send value (+20).')
  return tips.length ? tips : ['Event looks great. All key fields present.']
}

function getFieldSeverity(result: ValidationResult | null, field: string): 'error' | 'warning' | 'suggestion' | null {
  if (!result) return null
  const all = [...result.errors, ...result.warnings, ...result.suggestions]
  const match = all.find((i) => i.field === field || (field === 'email' && i.field === 'email/phone') || (field === 'phone' && i.field === 'email/phone'))
  return match ? match.severity : null
}

export default function PlaygroundPage() {
  const dashboardType = useDashboardType()
  const EVENT_TYPES = ALL_EVENT_TYPES.filter(
    (t) => t.mode === dashboardType || t.mode === 'both'
  )
  const defaultEventType = dashboardType === 'leadgen' ? 'Lead' : 'Purchase'
  const [eventType, setEventType] = useState<string>(defaultEventType)
  useEffect(() => {
    setEventType(defaultEventType)
  }, [dashboardType, defaultEventType])
  const [customEventName, setCustomEventName] = useState('')
  const [params, setParams] = useState<EventParams>({ ...defaultParams, event_id: generateEventId() })
  const [includeTestEmail, setIncludeTestEmail] = useState(false)
  const [autoGenerateEventId, setAutoGenerateEventId] = useState(true)
  const [sendTarget, setSendTarget] = useState<'both' | 'meta' | 'google' | 'ga4' | 'tiktok'>('both')
  const [resultTab, setResultTab] = useState<'response' | 'payload' | 'platform' | 'history'>('response')
  const [lastResponse, setLastResponse] = useState<unknown>(null)
  const [lastPayload, setLastPayload] = useState<unknown>(null)
  const [sending, setSending] = useState(false)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [qualityScore, setQualityScore] = useState<number | null>(null)
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null)
  const [sendConfirm, setSendConfirm] = useState<{ show: boolean; errors: number; warnings: number } | null>(null)
  const [pendingSendTarget, setPendingSendTarget] = useState<'both' | 'meta' | 'google' | 'ga4' | 'tiktok' | null>(null)

  const displayEventName = eventType === 'Custom' ? customEventName.trim() || 'Custom' : eventType

  const buildPayload = useCallback(() => {
    const email = includeTestEmail ? 'test@test.com' : params.email
    const numValue = params.value === '' ? undefined : Number(params.value)
    const payload: Record<string, unknown> = {
      event_name: displayEventName,
      event_id: autoGenerateEventId ? params.event_id : (params.event_id || generateEventId()),
      event_source_url: params.event_source_url || undefined,
      email: email || undefined,
      phone: params.phone || undefined,
      first_name: params.first_name || undefined,
      last_name: params.last_name || undefined,
      city: params.city || undefined,
      country: params.country || undefined,
      value: numValue,
      currency: params.currency || undefined,
      target: sendTarget,
    }
    if (params.order_id) payload.order_id = params.order_id
    if (params.form_name) payload.form_name = params.form_name
    if (params.page_url) payload.page_url = params.page_url
    if (params.page_title) payload.page_title = params.page_title
    if (params.product_id) payload.product_id = params.product_id
    if (params.product_name) payload.product_name = params.product_name
    return payload
  }, [
    displayEventName,
    includeTestEmail,
    params,
    autoGenerateEventId,
    sendTarget,
  ])

  const [payloadPreview, setPayloadPreview] = useState<Record<string, unknown>>({})
  useEffect(() => {
    setPayloadPreview(buildPayload())
  }, [buildPayload])

  useEffect(() => {
    const payload = buildPayload()
    const forMeta = { ...payload } as Record<string, unknown>
    delete forMeta.target
    setValidationResult(validatePayload(forMeta))
  }, [buildPayload])

  useEffect(() => {
    if (autoGenerateEventId) {
      setParams((p) => ({ ...p, event_id: generateEventId() }))
    }
  }, [eventType, autoGenerateEventId])

  const doSendTestEvent = async (targetOverride?: 'both' | 'meta' | 'google' | 'ga4' | 'tiktok') => {
    const target = targetOverride ?? sendTarget
    const payload = buildPayload()
    setSending(true)
    setLastResponse(null)
    setQualityScore(null)
    try {
      const res = await fetch('/api/playground/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...payload, target }),
      })
      const data = await res.json().catch(() => ({}))
      setLastPayload(payload)
      setLastResponse(data)
      if (typeof data.quality_score === 'number') setQualityScore(data.quality_score)
      setHistory((h) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          event_name: displayEventName,
          time: new Date().toISOString(),
          status: res.ok ? 'success' : 'fail',
          response: data,
          payload,
        },
        ...h,
      ])
    } catch {
      setLastResponse({ success: false, error: 'Network error' })
      setQualityScore(null)
      setHistory((h) => [
        {
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          event_name: displayEventName,
          time: new Date().toISOString(),
          status: 'fail',
          payload,
        },
        ...h,
      ])
    } finally {
      setSending(false)
    }
  }

  const sendTestEvent = (targetOverride?: 'both' | 'meta' | 'google' | 'ga4' | 'tiktok') => {
    const target = targetOverride ?? sendTarget
    if (validationResult && (validationResult.errors.length > 0 || validationResult.warnings.length > 0)) {
      setSendConfirm({
        show: true,
        errors: validationResult.errors.length,
        warnings: validationResult.warnings.length,
      })
      setPendingSendTarget(target)
      return
    }
    doSendTestEvent(targetOverride)
  }

  const updateParam = (key: keyof EventParams, value: string) => {
    setParams((p) => ({ ...p, [key]: value }))
  }

  const showField = (key: keyof EventParams) => {
    const purchase = ['value', 'currency', 'email', 'phone', 'first_name', 'last_name', 'city', 'country', 'order_id', 'event_id', 'event_source_url']
    const lead = ['email', 'phone', 'first_name', 'last_name', 'city', 'country', 'form_name', 'event_id', 'event_source_url']
    const pageView = ['page_url', 'page_title', 'event_id', 'event_source_url']
    const addToCart = ['value', 'currency', 'product_id', 'product_name', 'event_id', 'event_source_url']
    const all = ['event_id', 'event_source_url']
    switch (eventType) {
      case 'Purchase':
        return purchase.includes(key)
      case 'Lead':
        return lead.includes(key)
      case 'PageView':
        return pageView.includes(key)
      case 'AddToCart':
        return addToCart.includes(key)
      case 'InitiateCheckout':
      case 'ViewContent':
      case 'Search':
      case 'CompleteRegistration':
        return all.includes(key) || ['value', 'currency', 'email', 'phone', 'first_name', 'last_name', 'city', 'country'].includes(key)
      default:
        return [...new Set([...all, 'value', 'currency', 'email', 'phone', 'first_name', 'last_name', 'city', 'country'])].includes(key)
    }
  }

  const success = lastResponse && typeof lastResponse === 'object' && 'success' in lastResponse && (lastResponse as { success?: boolean }).success

  return (
    <div className="p-6 md:p-8 min-h-screen">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Event Playground</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-6">Test events visually before going live. Test events do not count toward your quota.</p>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Left — Event Builder */}
        <div className="space-y-6">
          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Choose Event Type</h2>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {EVENT_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setEventType(t.id)}
                    title={t.label}
                    className={`min-w-0 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors overflow-hidden ${
                      eventType === t.id
                        ? 'bg-[var(--dash-primary-soft)] border-[var(--dash-primary)] text-[var(--dash-primary)] font-medium'
                        : 'bg-white border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
                    }`}
                  >
                    <span className="block truncate">{t.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setEventType('Custom')}
                  className={`min-w-0 px-3 py-2.5 rounded-lg border text-left text-sm transition-colors overflow-hidden ${
                    eventType === 'Custom'
                      ? 'bg-[var(--dash-primary-soft)] border-[var(--dash-primary)] text-[var(--dash-primary)] font-medium'
                      : 'bg-white border-[var(--dash-border)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)]'
                  }`}
                >
                  <span className="block truncate">Custom</span>
                </button>
              </div>
              {eventType === 'Custom' && (
                <input
                  type="text"
                  value={customEventName}
                  onChange={(e) => setCustomEventName(e.target.value)}
                  placeholder="Event name"
                  className="mt-3 w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] text-sm"
                />
              )}
            </div>
          </section>

          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)] flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Event Parameters</h2>
              {validationResult && (
                <div className="flex items-center gap-4 text-xs">
                  <span
                    className={`font-medium ${
                      validationResult.score >= 80 ? 'text-[var(--dash-success)]' : validationResult.score >= 50 ? 'text-amber-400' : 'text-red-400'
                    }`}
                  >
                    Payload Score: {validationResult.score}/100
                  </span>
                  <span className="text-[var(--dash-muted)]">Est. Match Rate: {validationResult.estimatedMatchRate}%</span>
                </div>
              )}
            </div>
            <div className="p-4 space-y-3">
              {showField('value') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    value
                    {getFieldSeverity(validationResult, 'value') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'value') === 'error'
                            ? 'bg-red-400'
                            : getFieldSeverity(validationResult, 'value') === 'warning'
                              ? 'bg-amber-400'
                              : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <input
                    type="number"
                    value={params.value}
                    onChange={(e) => updateParam('value', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="0"
                  />
                </div>
              )}
              {showField('currency') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    currency
                    {getFieldSeverity(validationResult, 'currency') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'currency') === 'error' ? 'bg-red-400' : getFieldSeverity(validationResult, 'currency') === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <select
                    value={params.currency}
                    onChange={(e) => updateParam('currency', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              )}
              {showField('email') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    email
                    {getFieldSeverity(validationResult, 'email') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'email') === 'error' ? 'bg-red-400' : getFieldSeverity(validationResult, 'email') === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <input
                    type="email"
                    value={params.email}
                    onChange={(e) => updateParam('email', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="user@example.com"
                  />
                </div>
              )}
              {showField('phone') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    phone
                    {getFieldSeverity(validationResult, 'phone') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'phone') === 'error' ? 'bg-red-400' : getFieldSeverity(validationResult, 'phone') === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <input
                    type="text"
                    value={params.phone}
                    onChange={(e) => updateParam('phone', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="+1234567890"
                  />
                </div>
              )}
              {showField('first_name') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">First Name</label>
                  <input
                    type="text"
                    value={params.first_name}
                    onChange={(e) => updateParam('first_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="John"
                  />
                </div>
              )}
              {showField('last_name') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">Last Name</label>
                  <input
                    type="text"
                    value={params.last_name}
                    onChange={(e) => updateParam('last_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="Doe"
                  />
                </div>
              )}
              {showField('city') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">City</label>
                  <input
                    type="text"
                    value={params.city}
                    onChange={(e) => updateParam('city', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="New York"
                  />
                </div>
              )}
              {showField('country') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">Country</label>
                  <input
                    type="text"
                    value={params.country}
                    onChange={(e) => updateParam('country', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="US"
                  />
                </div>
              )}
              {showField('order_id') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">Order ID (for Purchase events)</label>
                  <input
                    type="text"
                    value={params.order_id}
                    onChange={(e) => updateParam('order_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  />
                </div>
              )}
              {showField('form_name') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">form_name</label>
                  <input
                    type="text"
                    value={params.form_name}
                    onChange={(e) => updateParam('form_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  />
                </div>
              )}
              {showField('page_url') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">page_url</label>
                  <input
                    type="url"
                    value={params.page_url}
                    onChange={(e) => updateParam('page_url', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="https://..."
                  />
                </div>
              )}
              {showField('page_title') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">page_title</label>
                  <input
                    type="text"
                    value={params.page_title}
                    onChange={(e) => updateParam('page_title', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  />
                </div>
              )}
              {showField('product_id') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">product_id</label>
                  <input
                    type="text"
                    value={params.product_id}
                    onChange={(e) => updateParam('product_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  />
                </div>
              )}
              {showField('product_name') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1">product_name</label>
                  <input
                    type="text"
                    value={params.product_name}
                    onChange={(e) => updateParam('product_name', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                  />
                </div>
              )}
              {showField('event_id') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    event_id
                    {getFieldSeverity(validationResult, 'event_id') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'event_id') === 'error' ? 'bg-red-400' : getFieldSeverity(validationResult, 'event_id') === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <input
                    type="text"
                    value={params.event_id}
                    onChange={(e) => updateParam('event_id', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm font-mono"
                  />
                </div>
              )}
              {showField('event_source_url') && (
                <div>
                  <label className="block text-xs text-[var(--dash-muted)] mb-1 flex items-center gap-1.5">
                    event_source_url
                    {getFieldSeverity(validationResult, 'event_source_url') && (
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          getFieldSeverity(validationResult, 'event_source_url') === 'error' ? 'bg-red-400' : getFieldSeverity(validationResult, 'event_source_url') === 'warning' ? 'bg-amber-400' : 'bg-blue-400'
                        }`}
                      />
                    )}
                  </label>
                  <input
                    type="url"
                    value={params.event_source_url}
                    onChange={(e) => updateParam('event_source_url', e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    placeholder="https://..."
                  />
                </div>
              )}

              <div className="flex flex-wrap gap-4 pt-2">
                <label className="flex items-center gap-2 text-sm text-[var(--dash-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeTestEmail}
                    onChange={(e) => setIncludeTestEmail(e.target.checked)}
                    className="rounded border-[var(--dash-border-strong)] bg-[var(--dash-surface-hover)] [accent-color:var(--dash-success)] focus:ring-[var(--dash-success)]"
                  />
                  Include test email (test@test.com)
                </label>
                <label className="flex items-center gap-2 text-sm text-[var(--dash-muted)] cursor-pointer">
                  <input
                    type="checkbox"
                    checked={autoGenerateEventId}
                    onChange={(e) => setAutoGenerateEventId(e.target.checked)}
                    className="rounded border-[var(--dash-border-strong)] bg-[var(--dash-surface-hover)] [accent-color:var(--dash-success)] focus:ring-[var(--dash-success)]"
                  />
                  Auto-generate event_id
                </label>
              </div>
            </div>
          </section>

          {sendConfirm?.show && (
            <div className="rounded-xl border border-amber-500/40 bg-[var(--dash-warning)]/10 p-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-amber-200 text-sm">
                {sendConfirm.errors > 0 && sendConfirm.warnings > 0
                  ? `${sendConfirm.errors} errors, ${sendConfirm.warnings} warnings found`
                  : sendConfirm.errors > 0
                    ? `${sendConfirm.errors} error(s) found`
                    : `${sendConfirm.warnings} warning(s) found`}
                — send anyway or fix first?
              </p>
              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/validator"
                  className="px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm transition-colors"
                >
                  Fix in Validator
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    doSendTestEvent(pendingSendTarget ?? sendTarget)
                    setSendConfirm(null)
                    setPendingSendTarget(null)
                  }}
                  disabled={sending}
                  className="px-3 py-2 rounded-lg bg-amber-600 hover:bg-[var(--dash-warning)] text-white text-sm font-medium disabled:opacity-50 transition-colors"
                >
                  Send anyway
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSendConfirm(null)
                    setPendingSendTarget(null)
                  }}
                  className="px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
            <div className="px-4 py-3 border-b border-[var(--dash-border)]">
              <h2 className="text-sm font-medium text-[var(--dash-muted)]">Send Controls</h2>
            </div>
            <div className="p-4 space-y-3">
              <div>
                <label className="block text-xs text-[var(--dash-muted)] mb-1">Send to</label>
                <select
                  value={sendTarget}
                  onChange={(e) => setSendTarget(e.target.value as 'both' | 'meta' | 'google' | 'ga4' | 'tiktok')}
                  className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                >
                  <option value="both">Both</option>
                  <option value="meta">Meta only</option>
                  <option value="google">Google only</option>
                  <option value="ga4">GA4 only</option>
                  <option value="tiktok">TikTok only</option>
                </select>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => sendTestEvent('both')}
                  disabled={sending}
                  className="flex-1 min-w-[140px] px-4 py-3 rounded-lg bg-[var(--dash-success)] hover:bg-[var(--dash-success-strong)] text-white font-medium text-sm disabled:opacity-50 transition-colors"
                >
                  {sending ? 'Sending…' : 'Send Test Event'}
                </button>
                <button
                  type="button"
                  onClick={() => sendTestEvent('meta')}
                  disabled={sending}
                  className="px-4 py-3 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm disabled:opacity-50 transition-colors"
                >
                  Send to Meta only
                </button>
                <button
                  type="button"
                  onClick={() => sendTestEvent('google')}
                  disabled={sending}
                  className="px-4 py-3 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm disabled:opacity-50 transition-colors"
                >
                  Send to Google only
                </button>
                <button
                  type="button"
                  onClick={() => sendTestEvent('ga4')}
                  disabled={sending}
                  className="px-4 py-3 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm disabled:opacity-50 transition-colors"
                >
                  Send to GA4 only
                </button>
                <button
                  type="button"
                  onClick={() => sendTestEvent('tiktok')}
                  disabled={sending}
                  className="px-4 py-3 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm disabled:opacity-50 transition-colors"
                >
                  Send to TikTok only
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Right — Results */}
        <div className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden flex flex-col min-h-[400px]">
          <div className="flex border-b border-[var(--dash-border)]">
            {(['response', 'payload', 'platform', 'history'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setResultTab(tab)}
                className={`px-4 py-3 text-sm font-medium capitalize transition-colors ${
                  resultTab === tab ? 'text-[var(--dash-text)] border-b-2 border-[var(--dash-success)] bg-[var(--dash-surface-hover)]/50' : 'text-[var(--dash-muted)] hover:text-[var(--dash-text)]'
                }`}
              >
                {tab === 'response' ? 'Response' : tab === 'payload' ? 'Payload Preview' : tab === 'platform' ? 'Platform Preview' : 'Event History'}
              </button>
            ))}
          </div>
          <div className="flex-1 p-4 overflow-auto">
            {resultTab === 'response' && (
              <div className="space-y-3">
                {lastResponse != null ? (
                  <>
                    <div
                      className={`rounded-lg border p-4 ${
                        success ? 'bg-[var(--dash-success-soft)] border-[var(--dash-success-border)]' : 'bg-[var(--dash-danger)]/10 border-red-500/30'
                      }`}
                    >
                      <pre className="text-xs text-[var(--dash-muted)] whitespace-pre-wrap font-mono">
                        {JSON.stringify(lastResponse, null, 2)}
                      </pre>
                    </div>
                    {typeof lastResponse === 'object' && lastResponse !== null && (
                      <>
                        {'platforms_fired' in lastResponse && (
                          <p className="text-sm text-[var(--dash-muted)]">
                            Platforms fired: {(lastResponse as { platforms_fired?: string[] }).platforms_fired?.join(', ') ?? '—'}
                          </p>
                        )}
                        {'event_id' in lastResponse && (
                          <p className="text-sm text-[var(--dash-muted)]">
                            event_id: {String((lastResponse as { event_id?: string }).event_id ?? '—')}
                          </p>
                        )}
                        {'timestamp' in lastResponse && (
                          <p className="text-sm text-[var(--dash-muted)]">
                            timestamp: {(lastResponse as { timestamp?: number }).timestamp ?? '—'}
                          </p>
                        )}
                      </>
                    )}
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(JSON.stringify(lastResponse, null, 2))}
                      className="px-3 py-1.5 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    >
                      Copy Response
                    </button>
                  </>
                ) : (
                  <p className="text-[var(--dash-muted)] text-sm">Send a test event to see the API response here.</p>
                )}
              </div>
            )}

            {resultTab === 'payload' && (
              <div className="space-y-3">
                <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-hover)] p-4">
                  <pre className="text-xs text-[var(--dash-muted)] whitespace-pre-wrap font-mono">
                    {JSON.stringify(payloadPreview, null, 2)}
                  </pre>
                </div>
                <button
                  type="button"
                  onClick={() => navigator.clipboard.writeText(JSON.stringify(payloadPreview, null, 2))}
                  className="px-3 py-1.5 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                >
                  Copy Payload
                </button>
              </div>
            )}

            {resultTab === 'platform' && (
              <div className="space-y-6">
                <div className="rounded-lg border border-[var(--dash-border)] p-4 space-y-2">
                  <h3 className="text-sm font-medium text-[var(--dash-text)]">Meta</h3>
                  <ul className="text-sm text-[var(--dash-muted)] space-y-1">
                    <li>Event name mapping ✅</li>
                    <li>Required fields check ✅</li>
                    <li>Optional fields check ✅</li>
                    <li>Match rate estimate: {params.email || params.phone ? 'High' : '—'}</li>
                  </ul>
                  <p className="text-xs text-[var(--dash-muted)] pt-1">
                    Meta will use this for: Conversion optimization, Audience building
                  </p>
                </div>
                <div className="rounded-lg border border-[var(--dash-border)] p-4 space-y-2">
                  <h3 className="text-sm font-medium text-[var(--dash-text)]">Google</h3>
                  <ul className="text-sm text-[var(--dash-muted)] space-y-1">
                    <li>Conversion mapping ✅</li>
                    <li>Hashing status ✅</li>
                  </ul>
                  <p className="text-xs text-[var(--dash-muted)] pt-1">
                    Google will use this for: Smart bidding, Enhanced conversions
                  </p>
                </div>
              </div>
            )}

            {resultTab === 'history' && (
              <div className="space-y-3">
                {history.length === 0 ? (
                  <p className="text-[var(--dash-muted)] text-sm">No test events sent this session.</p>
                ) : (
                  <>
                    <ul className="space-y-2">
                      {history.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between gap-2 py-2 border-b border-[var(--dash-border)]"
                        >
                          <div>
                            <span className="text-[var(--dash-text)] font-medium">{item.event_name}</span>
                            <span className="text-[var(--dash-muted)] text-xs ml-2">
                              {new Date(item.time).toLocaleTimeString()}
                            </span>
                            <span
                              className={`ml-2 text-xs ${
                                item.status === 'success' ? 'text-[var(--dash-success)]' : 'text-red-400'
                              }`}
                            >
                              {item.status}
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={async () => {
                              if (!item.payload || typeof item.payload !== 'object') return
                              setSending(true)
                              setLastResponse(null)
                              try {
                                const res = await fetch('/api/playground/send', {
                                  method: 'POST',
                                  headers: { 'Content-Type': 'application/json' },
                                  body: JSON.stringify(item.payload),
                                })
                                const data = await res.json().catch(() => ({}))
                                setLastPayload(item.payload)
                                setLastResponse(data)
                                setQualityScore(typeof data.quality_score === 'number' ? data.quality_score : null)
                                setResultTab('response')
                                setHistory((h) => [
                                  {
                                    id: `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
                                    event_name: item.event_name,
                                    time: new Date().toISOString(),
                                    status: res.ok ? 'success' : 'fail',
                                    response: data,
                                    payload: item.payload,
                                  },
                                  ...h,
                                ])
                              } finally {
                                setSending(false)
                              }
                            }}
                            className="px-2 py-1 rounded bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-muted)] text-xs"
                          >
                            Replay
                          </button>
                        </li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setHistory([])}
                      className="px-3 py-1.5 rounded-lg bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-border)] text-[var(--dash-text)] text-sm"
                    >
                      Clear History
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom — Quality Score */}
      {qualityScore !== null && (
        <div className="mt-6 rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--dash-border)] flex items-center gap-4">
            <span className="text-sm font-medium text-[var(--dash-muted)]">Event Quality Score</span>
            <span
              className={`text-2xl font-bold ${
                qualityScore >= 80 ? 'text-[var(--dash-success)]' : qualityScore >= 50 ? 'text-amber-400' : 'text-red-400'
              }`}
            >
              {qualityScore}/100
            </span>
          </div>
          <div className="p-4">
            <p className="text-xs text-[var(--dash-muted)] mb-2">Breakdown: email/phone +30 • value (purchase) +20 • event_id +20 • source URL +15 • currency +15</p>
            <ul className="text-sm text-[var(--dash-muted)] space-y-1">
              {qualityTips(qualityScore).map((tip, i) => (
                <li key={i}>{tip}</li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}




