'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import type { AlertRule, AlertLog } from '@/lib/email-alerts'
import { formatLocalTimestamp } from '@/lib/utils'
import { Bell, ChevronDown } from 'lucide-react'

const ALERT_CONDITIONS = [
  {
    group: 'Performance',
    conditions: [
      { value: 'data_quality_below', label: 'Data Quality Score drops below', description: 'Alert when overall data quality score drops', fields: ['threshold_percent'] as const },
      { value: 'match_rate_below', label: 'Match Rate drops below', description: 'Alert when Meta CAPI match rate drops', fields: ['threshold_percent', 'platform'] as const },
      { value: 'event_volume_drops', label: 'Event volume drops below', description: 'Alert when events per hour/day drop unexpectedly', fields: ['threshold_number', 'time_window'] as const },
      { value: 'event_volume_spikes', label: 'Event volume spikes above', description: 'Alert on suspicious traffic spikes', fields: ['threshold_number', 'time_window'] as const },
    ],
  },
  {
    group: 'Errors',
    conditions: [
      { value: 'error_count_exceeds', label: 'Error count exceeds', description: 'Alert when API errors exceed threshold', fields: ['threshold_number', 'time_window'] as const },
      { value: 'retry_queue_exceeds', label: 'Retry queue size exceeds', description: 'Alert when failed events pile up in retry queue', fields: ['threshold_number'] as const },
      { value: 'platform_down', label: 'Platform stops receiving events', description: 'Alert when a platform has no events for X minutes', fields: ['platform', 'time_window'] as const },
      { value: 'dedup_rate_high', label: 'Duplicate event rate exceeds', description: 'Alert when too many duplicate events detected', fields: ['threshold_percent'] as const },
    ],
  },
  {
    group: 'Leads',
    conditions: [
      { value: 'new_lead', label: 'New lead received', description: 'Get notified every time a new lead comes in', fields: ['pixel_id'] as const },
      { value: 'lead_score_changed', label: 'Lead marked as Hot or Converted', description: 'Alert when a lead status changes to hot or converted', fields: ['pixel_id'] as const },
      { value: 'no_leads_for', label: 'No new leads for', description: 'Alert when no leads received in X hours', fields: ['threshold_hours', 'pixel_id'] as const },
    ],
  },
  {
    group: 'Revenue',
    conditions: [
      { value: 'revenue_drops', label: 'Daily revenue drops below', description: 'Alert when tracked purchase revenue drops', fields: ['threshold_number', 'currency'] as const },
      { value: 'high_value_purchase', label: 'High value purchase detected', description: 'Alert when a purchase exceeds a value', fields: ['threshold_number', 'currency'] as const },
    ],
  },
  {
    group: 'Plan',
    conditions: [
      { value: 'events_limit_warning', label: 'Monthly events limit reaches', description: 'Alert when approaching monthly event limit', fields: ['threshold_percent'] as const },
    ],
  },
  {
    group: 'Custom',
    conditions: [
      { value: 'custom', label: 'Custom Alert', description: 'Build your own alert with custom conditions', fields: ['custom_event_name', 'custom_field', 'custom_operator', 'custom_value'] as const },
    ],
  },
]

const LEGACY_CONDITION_LABELS: Record<string, string> = {
  score_below: 'Data Quality Score drops below',
  match_rate_below: 'Match Rate drops below',
  error_spike: 'Error count exceeds',
  event_volume_drop: 'Event volume drops below',
}

function getConditionFields(conditionValue: string): readonly string[] {
  for (const group of ALERT_CONDITIONS) {
    const condition = group.conditions.find((c) => c.value === conditionValue)
    if (condition) return condition.fields
  }
  return ['threshold_percent']
}

function conditionLabel(condition: string): string {
  for (const group of ALERT_CONDITIONS) {
    const c = group.conditions.find((c) => c.value === condition)
    if (c) return c.label
  }
  return LEGACY_CONDITION_LABELS[condition] ?? condition
}

function formatRuleSummary(rule: AlertRule): string {
  const parts: string[] = [conditionLabel(rule.condition)]
  if (rule.threshold != null) parts.push(String(rule.threshold))
  if (rule.platform && rule.platform !== 'all') parts.push(`(${rule.platform})`)
  if (rule.time_window) parts.push(rule.time_window)
  if (rule.threshold_hours) parts.push(`${rule.threshold_hours}h`)
  if (rule.currency) parts.push(rule.currency)
  return parts.join(' ')
}

function triggerBadge(lastTriggeredAt: string | null | undefined) {
  if (!lastTriggeredAt) return { label: 'Never', className: 'text-[var(--dash-muted)]' }
  const last = new Date(lastTriggeredAt)
  const diffMs = Date.now() - last.getTime()
  const diffHours = diffMs / 3600000
  if (diffHours < 1) return { label: 'Triggered recently', className: 'bg-[var(--dash-danger)]/20 text-red-400' }
  if (diffHours < 24) return { label: 'Triggered in last 24h', className: 'bg-[var(--dash-warning)]/20 text-amber-400' }
  return { label: 'Healthy', className: 'bg-[var(--dash-success-soft)] text-[var(--dash-success)]' }
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [logs, setLogs] = useState<AlertLog[]>([])
  const [loadingRules, setLoadingRules] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')
  const [testEmailSent, setTestEmailSent] = useState(false)

  const [pixels, setPixels] = useState<{ pixel_id: string; name?: string }[]>([])
  const [conditionDropdownOpen, setConditionDropdownOpen] = useState(false)
  const conditionDropdownRef = useRef<HTMLDivElement>(null)
  const [form, setForm] = useState({
    name: '',
    condition: '',
    threshold: 70,
    notifyEmail: '',
    cooldownMinutes: 60,
    platform: 'all',
    pixel_id: 'all',
    time_window: '1hour',
    currency: 'USD',
    threshold_hours: 24,
    frequency: 'immediately' as 'immediately' | 'hourly' | 'daily',
    custom_event_name: '',
    custom_field: 'value',
    custom_operator: 'greater_than',
    custom_value: '',
  })

  const fetchRules = useCallback(() => {
    fetch('/api/alerts')
      .then((r) => r.json())
      .then(setRules)
      .finally(() => setLoadingRules(false))
  }, [])

  const fetchLogs = useCallback(() => {
    fetch('/api/alerts/logs')
      .then((r) => r.json())
      .then(setLogs)
      .finally(() => setLoadingLogs(false))
  }, [])

  const fetchPixels = useCallback(() => {
    fetch('/api/pixels')
      .then((r) => r.json())
      .then((res) => setPixels(res.pixels ?? []))
      .catch(() => setPixels([]))
  }, [])

  useEffect(() => { fetchRules() }, [fetchRules])
  useEffect(() => { fetchLogs() }, [fetchLogs])
  useEffect(() => { fetchPixels() }, [fetchPixels])
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (conditionDropdownRef.current && !conditionDropdownRef.current.contains(e.target as Node)) {
        setConditionDropdownOpen(false)
      }
    }
    if (conditionDropdownOpen) document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [conditionDropdownOpen])
  useEffect(() => {
    if (!testEmailSent) return
    const t = setTimeout(() => setTestEmailSent(false), 15000)
    return () => clearTimeout(t)
  }, [testEmailSent])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const defaultForm = {
    name: '',
    condition: '',
    threshold: 70,
    notifyEmail: '',
    cooldownMinutes: 60,
    platform: 'all',
    pixel_id: 'all',
    time_window: '1hour',
    currency: 'USD',
    threshold_hours: 24,
    frequency: 'immediately' as const,
    custom_event_name: '',
    custom_field: 'value',
    custom_operator: 'greater_than',
    custom_value: '',
  }

  const createRule = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.condition) {
      setToast({ type: 'error', message: 'Select a condition.' })
      return
    }
    const payload = {
      name: form.name || 'Unnamed',
      condition: form.condition,
      threshold: form.threshold,
      notifyEmail: form.notifyEmail,
      cooldownMinutes: form.cooldownMinutes,
      enabled: true,
      platform: form.platform,
      pixel_id: form.pixel_id,
      time_window: form.time_window,
      currency: form.currency,
      threshold_hours: form.threshold_hours,
      frequency: form.frequency,
      custom_event_name: form.custom_event_name || undefined,
      custom_field: form.custom_field || undefined,
      custom_operator: form.custom_operator || undefined,
      custom_value: form.custom_value || undefined,
    }
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to create')
        return r.json()
      })
      .then(() => {
        setForm(defaultForm)
        fetchRules()
        setToast({ type: 'success', message: 'Alert rule created.' })
      })
      .catch(() => setToast({ type: 'error', message: 'Failed to create rule.' }))
  }

  const toggleRule = (rule: AlertRule) => {
    fetch('/api/alerts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...rule, enabled: !rule.enabled }),
    })
      .then((r) => r.ok ? fetchRules() : Promise.reject())
      .catch(() => setToast({ type: 'error', message: 'Failed to update rule.' }))
  }

  const deleteRule = (id: string) => {
    if (!confirm('Delete this alert rule?')) return
    fetch(`/api/alerts?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
      .then((r) => r.ok ? fetchRules() : Promise.reject())
      .then(() => setToast({ type: 'success', message: 'Rule deleted.' }))
      .catch(() => setToast({ type: 'error', message: 'Failed to delete.' }))
  }

  const sendTest = () => {
    if (testEmailSent) return
    const email = testEmail || rules.find((r) => r.enabled)?.notifyEmail
    if (!email) {
      setToast({ type: 'error', message: 'Enter an email or create an enabled rule first.' })
      return
    }
    fetch('/api/alerts/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ruleId: 'test',
        ruleName: 'Test Alert',
        condition: 'score_below',
        value: 55,
        threshold: 70,
        email,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Send failed')
        fetchLogs()
        setTestEmailSent(true)
        setToast({ type: 'success', message: 'Test email sent.' })
      })
      .catch(() => setToast({ type: 'error', message: 'Failed to send test email.' }))
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-[var(--dash-text)] flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Email Alerts
        </h1>
        <p className="text-[var(--dash-muted)] mt-1">Get notified when your tracking quality drops</p>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-[var(--dash-success)] text-white' : 'bg-[var(--dash-danger)] text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Create New Alert Rule</h2>
        <form onSubmit={createRule} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Alert Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
              placeholder="e.g. Low score alert"
            />
          </div>
          <div ref={conditionDropdownRef} className="relative">
            <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Condition</label>
            <button
              type="button"
              onClick={() => setConditionDropdownOpen((o) => !o)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)] flex items-center justify-between text-left"
            >
              <span className={form.condition ? '' : 'text-[var(--dash-muted)]'}>
                {form.condition
                  ? (() => {
                      for (const g of ALERT_CONDITIONS) {
                        const c = g.conditions.find((x) => x.value === form.condition)
                        if (c) return c.label
                      }
                      return form.condition
                    })()
                  : 'Select a condition...'}
              </span>
              <ChevronDown className={`h-4 w-4 shrink-0 text-[var(--dash-muted)] transition-transform ${conditionDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {conditionDropdownOpen && (
              <div
                className="alerts-condition-dropdown absolute top-full left-0 right-0 mt-1 z-50 max-h-72 overflow-y-auto rounded-lg border border-[var(--dash-border)] bg-white shadow-lg [scrollbar-width:none] [-ms-overflow-style:none]"
                style={{ minWidth: '100%' }}
              >
                {ALERT_CONDITIONS.map((group) => (
                  <div key={group.group}>
                    <div className="px-3 py-2 text-xs font-semibold text-[var(--dash-muted)] bg-[var(--dash-surface-hover)]/50 border-b border-[var(--dash-border)]/50">
                      {group.group}
                    </div>
                    {group.conditions.map((c) => (
                      <button
                        key={c.value}
                        type="button"
                        onClick={() => {
                          setForm((f) => ({ ...f, condition: c.value }))
                          setConditionDropdownOpen(false)
                        }}
                        className={`w-full px-3 py-2.5 text-left text-sm hover:bg-[var(--dash-surface-hover)] flex items-center gap-2 ${
                          form.condition === c.value ? 'bg-[var(--dash-success-soft)]/30 text-[var(--dash-success)]' : 'text-[var(--dash-text)]'
                        }`}
                      >
                        <span>{c.label}</span>
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {form.condition && (() => {
            const fields = getConditionFields(form.condition)
            return (
              <div className="space-y-4 p-4 rounded-lg bg-[var(--dash-surface-hover)]/30 border border-[var(--dash-border)]/50">
                {fields.includes('threshold_percent') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Threshold (%)</label>
                    <input
                      type="number"
                      min={1}
                      max={100}
                      value={form.threshold}
                      onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) || 0 }))}
                      placeholder="e.g. 70"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    />
                  </div>
                )}
                {fields.includes('threshold_number') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Threshold</label>
                    <input
                      type="number"
                      min={1}
                      value={form.threshold}
                      onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) || 0 }))}
                      placeholder="e.g. 100"
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    />
                  </div>
                )}
                {fields.includes('threshold_hours') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Hours without leads</label>
                    <select
                      value={form.threshold_hours}
                      onChange={(e) => setForm((f) => ({ ...f, threshold_hours: Number(e.target.value) }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    >
                      <option value={1}>1 hour</option>
                      <option value={2}>2 hours</option>
                      <option value={6}>6 hours</option>
                      <option value={12}>12 hours</option>
                      <option value={24}>24 hours</option>
                    </select>
                  </div>
                )}
                {fields.includes('time_window') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Time Window</label>
                    <select
                      value={form.time_window}
                      onChange={(e) => setForm((f) => ({ ...f, time_window: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    >
                      <option value="15min">Last 15 minutes</option>
                      <option value="1hour">Last 1 hour</option>
                      <option value="6hours">Last 6 hours</option>
                      <option value="24hours">Last 24 hours</option>
                    </select>
                  </div>
                )}
                {fields.includes('platform') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Platform</label>
                    <select
                      value={form.platform}
                      onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    >
                      <option value="all">All Platforms</option>
                      <option value="meta">Meta CAPI</option>
                      <option value="tiktok">TikTok</option>
                      <option value="ga4">GA4</option>
                      <option value="google">Google Ads</option>
                    </select>
                  </div>
                )}
                {fields.includes('pixel_id') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Pixel</label>
                    <select
                      value={form.pixel_id}
                      onChange={(e) => setForm((f) => ({ ...f, pixel_id: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    >
                      <option value="all">All Pixels</option>
                      {pixels.map((p: { pixel_id: string; name?: string }) => (
                        <option key={p.pixel_id} value={p.pixel_id}>{p.name || p.pixel_id}</option>
                      ))}
                    </select>
                  </div>
                )}
                {fields.includes('currency') && (
                  <div>
                    <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Currency</label>
                    <select
                      value={form.currency}
                      onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                      className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                    >
                      <option value="USD">USD</option>
                      <option value="EUR">EUR</option>
                      <option value="GBP">GBP</option>
                      <option value="PKR">PKR</option>
                    </select>
                  </div>
                )}
                {fields.includes('custom_event_name') && (
                  <div className="space-y-3 bg-[var(--dash-surface-hover)]/50 rounded-xl p-4">
                    <p className="text-sm font-semibold text-[var(--dash-text)]">Custom Alert Builder</p>
                    <div>
                      <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Event Name</label>
                      <input
                        type="text"
                        value={form.custom_event_name}
                        onChange={(e) => setForm((f) => ({ ...f, custom_event_name: e.target.value }))}
                        placeholder="e.g. Purchase, Lead, PageView"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Field to Monitor</label>
                      <select
                        value={form.custom_field}
                        onChange={(e) => setForm((f) => ({ ...f, custom_field: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                      >
                        <option value="value">Purchase Value</option>
                        <option value="count">Event Count</option>
                        <option value="match_score">Match Score</option>
                        <option value="has_email">Has Email</option>
                        <option value="has_phone">Has Phone</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Condition</label>
                      <select
                        value={form.custom_operator}
                        onChange={(e) => setForm((f) => ({ ...f, custom_operator: e.target.value }))}
                        className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                      >
                        <option value="greater_than">Is greater than</option>
                        <option value="less_than">Is less than</option>
                        <option value="equals">Equals</option>
                        <option value="not_equals">Does not equal</option>
                        <option value="contains">Contains</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Value</label>
                      <input
                        type="text"
                        value={form.custom_value}
                        onChange={(e) => setForm((f) => ({ ...f, custom_value: e.target.value }))}
                        placeholder="e.g. 100"
                        className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
                      />
                    </div>
                  </div>
                )}
              </div>
            )
          })()}

          <div>
            <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Notify Email</label>
            <input
              type="email"
              value={form.notifyEmail}
              onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
              placeholder="alerts@yourdomain.com"
              required
            />
            <p className="text-xs text-[var(--dash-muted)] mt-1">You can add multiple emails separated by comma</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Alert Frequency</label>
            <select
              value={form.frequency}
              onChange={(e) => setForm((f) => ({ ...f, frequency: e.target.value as 'immediately' | 'hourly' | 'daily' }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
            >
              <option value="immediately">Immediately</option>
              <option value="hourly">Max once per hour</option>
              <option value="daily">Max once per day</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-[var(--dash-muted)] mb-1">Don&apos;t re-alert for X minutes</label>
            <input
              type="number"
              value={form.cooldownMinutes}
              onChange={(e) => setForm((f) => ({ ...f, cooldownMinutes: Number(e.target.value) || 60 }))}
              min={1}
              className="w-full px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)]"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm transition-colors shadow-sm"
          >
            Create Alert Rule
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Active Alert Rules</h2>
        {loadingRules ? (
          <p className="text-[var(--dash-muted)] animate-pulse">Loading rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-[var(--dash-muted)]">No alert rules yet. Create one above.</p>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const badge = triggerBadge(rule.lastTriggeredAt)
              return (
                <div
                  key={rule.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[var(--dash-surface-hover)]/50 border border-[var(--dash-border)]"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-[var(--dash-text)]">{rule.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleRule(rule)}
                        className={`text-xs px-2 py-1 rounded ${rule.enabled ? 'bg-[var(--dash-success-soft)] text-[var(--dash-success)]' : 'bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]'}`}
                      >
                        {rule.enabled ? 'On' : 'Off'}
                      </button>
                    </div>
                    <p className="text-sm text-[var(--dash-muted)] mt-1">
                      Condition: {formatRuleSummary(rule)}
                    </p>
                    <p className="text-sm text-[var(--dash-muted)]">
                      Notify: {rule.notifyEmail} | Cooldown: {rule.cooldownMinutes} min
                    </p>
                    <p className="text-xs text-[var(--dash-muted)] mt-1">
                      Last triggered: {rule.lastTriggeredAt ? formatLocalTimestamp(rule.lastTriggeredAt) : 'Never'}
                      {badge.label !== 'Never' && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${badge.className}`}>{badge.label}</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    className="text-sm text-red-400 hover:text-[var(--dash-danger-strong)]"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
        <h2 className="px-4 py-3 border-b border-[var(--dash-border)] text-sm font-medium text-[var(--dash-muted)]">Alert History</h2>
        {loadingLogs ? (
          <p className="p-4 text-[var(--dash-muted)] animate-pulse">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="p-4 text-[var(--dash-muted)]">No alert emails sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-[var(--dash-muted)]">
                  <th className="px-4 py-3 font-medium">Time</th>
                  <th className="px-4 py-3 font-medium">Rule</th>
                  <th className="px-4 py-3 font-medium">Condition</th>
                  <th className="px-4 py-3 font-medium">Value</th>
                  <th className="px-4 py-3 font-medium">Threshold</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...logs].reverse().map((log) => (
                  <tr key={log.id} className="hover:bg-[var(--dash-surface-hover)]/30">
                    <td className="px-4 py-3 text-[var(--dash-muted)]">
                      {formatLocalTimestamp(log.triggeredAt)}
                    </td>
                    <td className="px-4 py-3 text-[var(--dash-text)]">{log.ruleName}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">{log.condition}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">{log.value}</td>
                    <td className="px-4 py-3 text-[var(--dash-muted)]">{log.threshold}</td>
                    <td className="px-4 py-3">
                      {log.status === 'sent' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[var(--dash-success-soft)] text-[var(--dash-success)]">sent</span>
                      )}
                      {log.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[var(--dash-danger)]/20 text-red-400">failed</span>
                      )}
                      {log.status === 'suppressed' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-[var(--dash-surface-hover)] text-[var(--dash-muted)]">suppressed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Send Test Alert</h2>
        <p className="text-[var(--dash-muted)] text-sm mb-3">
          Send a test email. Use the email below or from your first enabled rule.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder="your@example.com"
            className="px-3 py-2 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-success)] w-64"
          />
          <button
            type="button"
            onClick={sendTest}
            disabled={testEmailSent}
            className={`px-4 py-2 rounded-lg text-white font-medium text-sm transition-colors shadow-sm ${
              testEmailSent ? 'bg-green-600 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {testEmailSent ? 'Test Email Sent' : 'Send Test Email'}
          </button>
        </div>
      </section>
    </div>
  )
}




