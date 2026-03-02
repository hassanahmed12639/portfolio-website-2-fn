'use client'

import { useEffect, useState, useCallback } from 'react'
import type { AlertRule, AlertLog } from '@/lib/email-alerts'
import { Bell } from 'lucide-react'

const CONDITION_OPTIONS: { value: AlertRule['condition']; label: string }[] = [
  { value: 'score_below', label: 'Data Quality Score drops below' },
  { value: 'match_rate_below', label: 'Match Rate drops below' },
  { value: 'error_spike', label: 'Error count exceeds' },
  { value: 'event_volume_drop', label: 'Event volume drops below' },
]

function conditionLabel(condition: string): string {
  const opt = CONDITION_OPTIONS.find((o) => o.value === condition)
  return opt?.label ?? condition
}

function thresholdPlaceholder(condition: string): string {
  if (condition === 'score_below') return 'e.g. 70'
  if (condition === 'match_rate_below') return 'e.g. 50'
  if (condition === 'error_spike') return 'e.g. 10'
  if (condition === 'event_volume_drop') return 'e.g. 100'
  return 'e.g. 70'
}

function triggerBadge(lastTriggeredAt: string | null | undefined) {
  if (!lastTriggeredAt) return { label: 'Never', className: 'text-zinc-500' }
  const last = new Date(lastTriggeredAt)
  const diffMs = Date.now() - last.getTime()
  const diffHours = diffMs / 3600000
  if (diffHours < 1) return { label: 'Triggered recently', className: 'bg-red-500/20 text-red-400' }
  if (diffHours < 24) return { label: 'Triggered in last 24h', className: 'bg-amber-500/20 text-amber-400' }
  return { label: 'Healthy', className: 'bg-emerald-500/20 text-emerald-400' }
}

export default function AlertsPage() {
  const [rules, setRules] = useState<AlertRule[]>([])
  const [logs, setLogs] = useState<AlertLog[]>([])
  const [loadingRules, setLoadingRules] = useState(true)
  const [loadingLogs, setLoadingLogs] = useState(true)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null)
  const [testEmail, setTestEmail] = useState('')

  const [form, setForm] = useState({
    name: '',
    condition: 'score_below' as AlertRule['condition'],
    threshold: 70,
    notifyEmail: '',
    cooldownMinutes: 60,
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

  useEffect(() => {
    fetchRules()
  }, [fetchRules])
  useEffect(() => {
    fetchLogs()
  }, [fetchLogs])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 3000)
    return () => clearTimeout(t)
  }, [toast])

  const createRule = (e: React.FormEvent) => {
    e.preventDefault()
    fetch('/api/alerts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name || 'Unnamed',
        condition: form.condition,
        threshold: form.threshold,
        notifyEmail: form.notifyEmail,
        cooldownMinutes: form.cooldownMinutes,
        enabled: true,
      }),
    })
      .then((r) => {
        if (!r.ok) throw new Error('Failed to create')
        return r.json()
      })
      .then(() => {
        setForm({ name: '', condition: 'score_below', threshold: 70, notifyEmail: '', cooldownMinutes: 60 })
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
        setToast({ type: 'success', message: 'Test email sent.' })
      })
      .catch(() => setToast({ type: 'error', message: 'Failed to send test email.' }))
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-xl font-semibold text-white flex items-center gap-2">
          <Bell className="w-5 h-5" />
          Email Alerts
        </h1>
        <p className="text-zinc-400 mt-1">Get notified when your tracking quality drops</p>
      </div>

      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-2 rounded-lg text-sm font-medium ${
            toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
          }`}
        >
          {toast.message}
        </div>
      )}

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Create New Alert Rule</h2>
        <form onSubmit={createRule} className="space-y-4 max-w-lg">
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Alert Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="e.g. Low score alert"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Condition</label>
            <select
              value={form.condition}
              onChange={(e) => setForm((f) => ({ ...f, condition: e.target.value as AlertRule['condition'] }))}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {CONDITION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Threshold</label>
            <input
              type="number"
              value={form.threshold}
              onChange={(e) => setForm((f) => ({ ...f, threshold: Number(e.target.value) || 0 }))}
              placeholder={thresholdPlaceholder(form.condition)}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Notify Email</label>
            <input
              type="email"
              value={form.notifyEmail}
              onChange={(e) => setForm((f) => ({ ...f, notifyEmail: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="you@example.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-zinc-400 mb-1">Don&apos;t re-alert for X minutes</label>
            <input
              type="number"
              value={form.cooldownMinutes}
              onChange={(e) => setForm((f) => ({ ...f, cooldownMinutes: Number(e.target.value) || 60 }))}
              min={1}
              className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
          >
            Create Alert Rule
          </button>
        </form>
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Active Alert Rules</h2>
        {loadingRules ? (
          <p className="text-zinc-500 animate-pulse">Loading rules...</p>
        ) : rules.length === 0 ? (
          <p className="text-zinc-500">No alert rules yet. Create one above.</p>
        ) : (
          <div className="space-y-4">
            {rules.map((rule) => {
              const badge = triggerBadge(rule.lastTriggeredAt)
              return (
                <div
                  key={rule.id}
                  className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-zinc-800/50 border border-zinc-700"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-white">🔔 {rule.name}</span>
                      <button
                        type="button"
                        onClick={() => toggleRule(rule)}
                        className={`text-xs px-2 py-1 rounded ${rule.enabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-600 text-zinc-400'}`}
                      >
                        {rule.enabled ? 'On' : 'Off'}
                      </button>
                    </div>
                    <p className="text-sm text-zinc-400 mt-1">
                      Condition: {conditionLabel(rule.condition)} {rule.threshold}
                    </p>
                    <p className="text-sm text-zinc-500">
                      Notify: {rule.notifyEmail} | Cooldown: {rule.cooldownMinutes} min
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      Last triggered: {rule.lastTriggeredAt ? new Date(rule.lastTriggeredAt).toLocaleString() : 'Never'}
                      {badge.label !== 'Never' && (
                        <span className={`ml-2 px-2 py-0.5 rounded text-xs ${badge.className}`}>{badge.label}</span>
                      )}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => deleteRule(rule.id)}
                    className="text-sm text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <h2 className="px-4 py-3 border-b border-zinc-800 text-sm font-medium text-zinc-300">Alert History</h2>
        {loadingLogs ? (
          <p className="p-4 text-zinc-500 animate-pulse">Loading logs...</p>
        ) : logs.length === 0 ? (
          <p className="p-4 text-zinc-500">No alert emails sent yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-800 text-left text-zinc-400">
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
                  <tr key={log.id} className="border-b border-zinc-800/80 hover:bg-zinc-800/30">
                    <td className="px-4 py-3 text-zinc-300">
                      {new Date(log.triggeredAt).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-white">{log.ruleName}</td>
                    <td className="px-4 py-3 text-zinc-300">{log.condition}</td>
                    <td className="px-4 py-3 text-zinc-300">{log.value}</td>
                    <td className="px-4 py-3 text-zinc-300">{log.threshold}</td>
                    <td className="px-4 py-3">
                      {log.status === 'sent' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-emerald-500/20 text-emerald-400">sent</span>
                      )}
                      {log.status === 'failed' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-red-500/20 text-red-400">failed</span>
                      )}
                      {log.status === 'suppressed' && (
                        <span className="px-2 py-0.5 rounded text-xs bg-zinc-500/20 text-zinc-400">suppressed</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-xl bg-zinc-900 border border-zinc-800 p-6">
        <h2 className="text-sm font-medium text-zinc-300 mb-4">Send Test Alert</h2>
        <p className="text-zinc-400 text-sm mb-3">
          Send a test email to verify your Resend setup. Use the email below or from your first enabled rule.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="email"
            value={testEmail}
            onChange={(e) => setTestEmail(e.target.value)}
            placeholder={rules.find((r) => r.enabled)?.notifyEmail || 'you@example.com'}
            className="px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 w-64"
          />
          <button
            type="button"
            onClick={sendTest}
            className="px-4 py-2 rounded-lg bg-emerald-600 text-white font-medium hover:bg-emerald-500 transition-colors"
          >
            Send Test Email
          </button>
        </div>
      </section>
    </div>
  )
}
