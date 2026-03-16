'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Copy,
  Pencil,
  Trash2,
  Plus,
  ArrowRight,
  Webhook,
  ChevronRight,
  X,
} from 'lucide-react'
import Link from 'next/link'

const EVENT_PILL: Record<string, string> = {
  Lead: 'bg-slate-100 text-slate-700',
  Purchase: 'bg-green-100 text-green-800',
  Schedule: 'bg-blue-100 text-blue-800',
  CompleteRegistration: 'bg-purple-100 text-purple-800',
  'Qualified Lead': 'bg-orange-100 text-orange-800',
}

type WebhookRow = {
  id: string
  name: string
  token: string
  event_name: string
  event_value: number
  pixel_ids: string[]
  field_map: Record<string, string>
  is_active: boolean
  created_at: string
  hit_count?: number
}

type PixelRow = {
  id: string
  pixel_id: string
  name: string
  platform: string
  is_active: boolean
}

type LogRow = {
  id: string
  webhook_id: string
  webhook_name: string | null
  status: string
  platform_responses: Record<string, unknown>
  lead_id: string | null
  created_at: string
}

const TRACKHIVE_FIELD_OPTIONS = [
  { value: 'email', label: 'Email' },
  { value: 'phone', label: 'Phone' },
  { value: 'first_name', label: 'First name' },
  { value: 'last_name', label: 'Last name' },
  { value: 'value', label: 'Value' },
  { value: 'currency', label: 'Currency' },
  { value: 'order_id', label: 'Order ID' },
  { value: 'city', label: 'City' },
  { value: 'zip', label: 'Zip' },
  { value: 'ignore', label: 'Ignore' },
]

const EVENT_OPTIONS = [
  { id: 'Lead', label: 'Lead', sub: 'form fill, signup' },
  { id: 'Purchase', label: 'Purchase', sub: 'payment completed' },
  { id: 'Schedule', label: 'Schedule', sub: 'booking, demo call' },
  { id: 'CompleteRegistration', label: 'Complete Registration', sub: 'onboarding done' },
  { id: 'Qualified Lead', label: 'Qualified Lead', sub: 'CRM stage change' },
  { id: 'Custom', label: 'Custom', sub: 'your own event name' },
]

function getBaseUrl() {
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  const envUrl = process.env.NEXT_PUBLIC_APP_URL
  if (envUrl) return envUrl.replace(/\/$/, '') // allow trailing slash in env
  return 'https://track.itshassanahmed.com/trackhive'
}

function relativeTime(dateStr: string) {
  const d = new Date(dateStr)
  const now = new Date()
  const s = Math.floor((now.getTime() - d.getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)} min ago`
  if (s < 86400) return `${Math.floor(s / 3600)} hr ago`
  if (s < 604800) return `${Math.floor(s / 86400)} days ago`
  return d.toLocaleDateString()
}

function preMapKey(key: string): string {
  const k = key.toLowerCase()
  if (k.includes('email')) return 'email'
  if (k.includes('phone') || k.includes('mobile')) return 'phone'
  if (k.includes('first')) return 'first_name'
  if (k.includes('last')) return 'last_name'
  if (k.includes('amount') || k.includes('value') || k.includes('total')) return 'value'
  return 'ignore'
}

export default function WebhooksClient() {
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([])
  const [logs, setLogs] = useState<LogRow[]>([])
  const [pixels, setPixels] = useState<PixelRow[]>([])
  const [loading, setLoading] = useState(true)
  const [slideOpen, setSlideOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  const loadWebhooks = useCallback(() => {
    fetch('/api/webhooks')
      .then((r) => r.json())
      .then((res) => setWebhooks(res.webhooks ?? []))
      .catch(() => setWebhooks([]))
  }, [])

  const loadLogs = useCallback(() => {
    fetch('/api/webhooks/logs?limit=20')
      .then((r) => r.json())
      .then((res) => setLogs(res.logs ?? []))
      .catch(() => setLogs([]))
  }, [])

  const loadPixels = useCallback(() => {
    fetch('/api/pixels')
      .then((r) => r.json())
      .then((res) => setPixels(res.pixels ?? []))
      .catch(() => setPixels([]))
  }, [])

  useEffect(() => {
    loadWebhooks()
    loadPixels()
    setLoading(false)
  }, [loadWebhooks, loadPixels])

  useEffect(() => {
    loadLogs()
    const t = setInterval(loadLogs, 10000)
    return () => clearInterval(t)
  }, [loadLogs])

  const openCreate = () => {
    setEditingId(null)
    setSlideOpen(true)
  }

  const openEdit = (id: string) => {
    setEditingId(id)
    setSlideOpen(true)
  }

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/webhooks/${id}`, { method: 'DELETE' })
    if (res.ok) {
      loadWebhooks()
      setDeleteConfirm(null)
      setToast('Webhook deleted')
    }
  }

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(null), 3000)
  }

  return (
    <div className="max-w-full">
      {/* Top: Title + New webhook */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <h1 className="text-xl font-bold text-[var(--dash-text)]">Webhooks</h1>
        <button
          type="button"
          onClick={openCreate}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-accent-hover)] transition-colors"
        >
          <Plus className="h-4 w-4" />
          New webhook
        </button>
      </div>

      {/* Webhook list */}
      <div
        className="dash-card dash-card-gradient-top rounded-2xl border border-[var(--dash-border)] overflow-hidden shadow-[var(--dash-shadow)] mb-8"
        style={{ background: 'var(--dash-card)' }}
      >
        {loading ? (
          <div className="p-8 text-center text-[var(--dash-muted)]">Loading…</div>
        ) : webhooks.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--dash-surface-hover)] flex items-center justify-center mx-auto mb-4">
              <Webhook className="h-8 w-8 text-[var(--dash-muted)]" />
            </div>
            <p className="text-lg font-semibold text-[var(--dash-text)] mb-1">No webhooks yet</p>
            <p className="text-sm text-[var(--dash-muted)] mb-6 max-w-md mx-auto">
              Create a webhook URL and paste it into any CRM, form tool, or payment processor to
              capture leads server-side.
            </p>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-accent-hover)]"
            >
              Create your first webhook
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--dash-border)]" style={{ background: 'var(--dash-gradient-header)' }}>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Event</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Pixels</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Hits</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">URL</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold uppercase text-[var(--dash-muted)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {webhooks.map((w) => {
                  const url = `${getBaseUrl()}/api/wh/${w.token}`
                  const pixelCount = Array.isArray(w.pixel_ids) ? w.pixel_ids.length : 0
                  return (
                    <tr key={w.id} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]">
                      <td className="px-4 py-3 font-medium text-[var(--dash-text)]">{w.name}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            EVENT_PILL[w.event_name] ?? 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.event_name || 'Lead'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-muted)] text-sm">
                        {pixelCount} pixel{pixelCount !== 1 ? 's' : ''}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            w.is_active ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {w.is_active ? 'Active' : 'Paused'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[var(--dash-text)]">{w.hit_count ?? 0}</td>
                      <td className="px-4 py-3">
                        <span className="text-xs text-[var(--dash-muted)] font-mono truncate max-w-[180px] inline-block" title={url}>
                          {url.slice(0, 32)}…
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(url)
                            showToast('URL copied')
                          }}
                          className="ml-2 inline-flex p-1 rounded hover:bg-[var(--dash-surface-hover)]"
                          title="Copy URL"
                        >
                          <Copy className="h-3.5 w-3.5" />
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => openEdit(w.id)}
                          className="p-2 rounded-lg hover:bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        {deleteConfirm === w.id ? (
                          <span className="inline-flex items-center gap-1 ml-1">
                            <button
                              type="button"
                              onClick={() => handleDelete(w.id)}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Confirm
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirm(null)}
                              className="text-xs text-[var(--dash-muted)]"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setDeleteConfirm(w.id)}
                            className="p-2 rounded-lg hover:bg-red-50 text-[var(--dash-muted)] hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Recent activity */}
      <div
        className="dash-card dash-card-gradient-top rounded-2xl border border-[var(--dash-border)] overflow-hidden shadow-[var(--dash-shadow)]"
        style={{ background: 'var(--dash-card)' }}
      >
        <div className="px-5 py-4 border-b border-[var(--dash-border)]" style={{ background: 'var(--dash-gradient-header)' }}>
          <h2 className="font-semibold text-[var(--dash-text)]">Recent activity</h2>
        </div>
        <div className="overflow-x-auto">
          {logs.length === 0 ? (
            <div className="p-8 text-center text-[var(--dash-muted)] text-sm">No webhook activity yet</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--dash-border)]">
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--dash-muted)]">Webhook name</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--dash-muted)]">Lead</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--dash-muted)]">Status</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--dash-muted)]">Platforms</th>
                  <th className="text-left px-4 py-2 text-xs font-semibold text-[var(--dash-muted)]">Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id} className="border-b border-[var(--dash-border)] hover:bg-[var(--dash-surface-hover)]">
                    <td className="px-4 py-2 text-sm text-[var(--dash-text)]">{log.webhook_name ?? '—'}</td>
                    <td className="px-4 py-2 text-sm text-[var(--dash-muted)]">
                      {log.lead_id ? (
                        <Link href="/dashboard/leads" className="text-[var(--dash-primary)] hover:underline">
                          View lead
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${
                          log.status === 'sent' ? 'bg-green-100 text-green-800' : log.status === 'failed' ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {log.status === 'sent' ? 'Sent' : log.status === 'failed' ? 'Failed' : 'Received'}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--dash-muted)] max-w-[200px]">
                      {log.status === 'failed' && typeof log.platform_responses === 'object' && log.platform_responses !== null
                        ? (() => {
                            const entry = Object.entries(log.platform_responses).find(
                              ([, v]) => typeof v === 'object' && v !== null && v !== null && 'error' in (v as object)
                            )
                            const err = entry ? (entry[1] as { error?: string })?.error : (log.platform_responses as { error?: string })?.error
                            if (err) return <span className="text-red-600" title={err}>{String(err).slice(0, 60)}{String(err).length > 60 ? '…' : ''}</span>
                            return Object.keys(log.platform_responses).join(', ') || '—'
                          })()
                        : typeof log.platform_responses === 'object' && log.platform_responses !== null
                          ? Object.keys(log.platform_responses).join(', ') || '—'
                          : '—'}
                    </td>
                    <td className="px-4 py-2 text-xs text-[var(--dash-muted)]">{relativeTime(log.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Slide-over panel */}
      {slideOpen && (
        <WebhookSlideOver
          editingId={editingId}
          pixels={pixels}
          onClose={() => {
            setSlideOpen(false)
            setEditingId(null)
          }}
          onSaved={() => {
            loadWebhooks()
            loadLogs()
            setSlideOpen(false)
            setEditingId(null)
            showToast('Webhook created and ready')
          }}
          onUpdated={() => {
            loadWebhooks()
            setSlideOpen(false)
            setEditingId(null)
            showToast('Webhook updated')
          }}
        />
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 rounded-lg px-4 py-2 bg-[var(--dash-text)] text-white text-sm font-medium shadow-lg z-50">
          {toast}
        </div>
      )}
    </div>
  )
}

function WebhookSlideOver({
  editingId,
  pixels,
  onClose,
  onSaved,
  onUpdated,
}: {
  editingId: string | null
  pixels: PixelRow[]
  onClose: () => void
  onSaved: () => void
  onUpdated: () => void
}) {
  const [step, setStep] = useState(1)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    name: '',
    event_name: 'Lead',
    custom_event_name: '',
    event_value: 0,
    field_map: [] as { crmKey: string; trackhiveField: string }[],
    pixel_ids: [] as string[],
  })
  const [webhook, setWebhook] = useState<WebhookRow | null>(null)
  const [testPayloadKeys, setTestPayloadKeys] = useState<string[]>([])
  const [detectedCount, setDetectedCount] = useState<number | null>(null)

  const isEdit = !!editingId

  useEffect(() => {
    if (editingId) {
      fetch(`/api/webhooks/${editingId}`)
        .then((r) => r.json())
        .then((res) => {
          const w = res.webhook
          if (w) {
            setWebhook(w)
            setForm({
              name: w.name,
              event_name: w.event_name || 'Lead',
              custom_event_name: w.event_name && !EVENT_OPTIONS.find((e) => e.id === w.event_name) ? w.event_name : '',
              event_value: Number(w.event_value) || 0,
              field_map: Object.entries(w.field_map || {}).map(([crmKey, trackhiveField]) => ({ crmKey, trackhiveField: String(trackhiveField) })),
              pixel_ids: Array.isArray(w.pixel_ids) ? w.pixel_ids : [],
            })
          }
        })
    } else {
      setWebhook(null)
      setForm({
        name: '',
        event_name: 'Lead',
        custom_event_name: '',
        event_value: 0,
        field_map: [],
        pixel_ids: pixels.map((p) => p.id),
      })
      setStep(1)
    }
  }, [editingId, pixels.length])

  // Poll for test payload when creating and on step 3
  useEffect(() => {
    if (!webhook?.token || step !== 3 || isEdit) return
    const interval = setInterval(() => {
      fetch(`/api/webhooks/logs?webhook_id=${webhook.id}&limit=1`)
        .then((r) => r.json())
        .then((res) => {
          const logs = res.logs ?? []
          if (logs.length && logs[0].raw_payload) {
            const flat = flattenForKeys(logs[0].raw_payload as Record<string, unknown>)
            setTestPayloadKeys(flat)
            setDetectedCount(flat.length)
            const currentKeys = form.field_map.map((r) => r.crmKey)
            const newKeys = flat.filter((k) => !currentKeys.includes(k))
            if (newKeys.length) {
              setForm((f) => ({
                ...f,
                field_map: [
                  ...f.field_map,
                  ...newKeys.map((k) => ({ crmKey: k, trackhiveField: preMapKey(k) })),
                ],
              }))
            }
          }
        })
    }, 3000)
    return () => clearInterval(interval)
  }, [webhook?.id, webhook?.token, step, isEdit])

  function flattenForKeys(obj: Record<string, unknown>, prefix = '', out: string[] = []): string[] {
    for (const key of Object.keys(obj)) {
      const val = obj[key]
      const newKey = prefix ? `${prefix}.${key}` : key
      if (val && typeof val === 'object' && !Array.isArray(val)) {
        flattenForKeys(val as Record<string, unknown>, newKey, out)
      } else {
        out.push(newKey)
      }
    }
    return out
  }

  const eventName = form.event_name === 'Custom' ? form.custom_event_name.trim() || 'Lead' : form.event_name
  const webhookUrl = webhook ? `${getBaseUrl()}/api/wh/${webhook.token}` : ''

  const addFieldRow = () => {
    setForm((f) => ({ ...f, field_map: [...f.field_map, { crmKey: '', trackhiveField: 'ignore' }] }))
  }

  const removeFieldRow = (i: number) => {
    setForm((f) => ({
      ...f,
      field_map: f.field_map.filter((_, idx) => idx !== i),
    }))
  }

  const updateFieldRow = (i: number, crmKey: string, trackhiveField: string) => {
    setForm((f) => {
      const next = [...f.field_map]
      next[i] = { crmKey, trackhiveField }
      return { ...f, field_map: next }
    })
  }

  const togglePixel = (id: string) => {
    setForm((f) => ({
      ...f,
      pixel_ids: f.pixel_ids.includes(id) ? f.pixel_ids.filter((x) => x !== id) : [...f.pixel_ids, id],
    }))
  }

  const handleSave = async () => {
    setSaving(true)
    const fieldMap: Record<string, string> = {}
    form.field_map.forEach((row) => {
      if (row.crmKey.trim()) fieldMap[row.crmKey.trim()] = row.trackhiveField
    })
    const payload = {
      name: form.name.trim() || 'Unnamed webhook',
      event_name: eventName,
      event_value: form.event_value,
      pixel_ids: form.pixel_ids,
      field_map: fieldMap,
      is_active: true,
    }
    try {
      if (isEdit) {
        const res = await fetch(`/api/webhooks/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) onUpdated()
      } else {
        const res = await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        })
        if (res.ok) onSaved()
      }
    } finally {
      setSaving(false)
    }
  }

  const steps = ['Setup', 'Event', 'Fields', 'Pixels']
  const fieldMapRows = form.field_map.length ? form.field_map : [...Array(5)].map(() => ({ crmKey: '', trackhiveField: 'ignore' }))

  const goNext = async () => {
    if (step === 1 && !webhook && !isEdit && form.name.trim()) {
      setSaving(true)
      try {
        const res = await fetch('/api/webhooks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: form.name.trim(),
            event_name: 'Lead',
            event_value: 0,
            pixel_ids: [],
            field_map: {},
            is_active: true,
          }),
        })
        const data = await res.json()
        if (data.webhook) setWebhook(data.webhook)
      } finally {
        setSaving(false)
      }
    }
    setStep((s) => Math.min(4, s + 1))
  }

  return (
    <div className="fixed inset-0 z-40 overflow-hidden">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden />
      <div className="absolute right-0 top-0 bottom-0 w-full max-w-lg bg-[var(--dash-card)] border-l border-[var(--dash-border)] shadow-xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--dash-border)]" style={{ background: 'var(--dash-gradient-header)' }}>
          <h2 className="font-semibold text-[var(--dash-text)]">{isEdit ? 'Edit webhook' : 'New webhook'}</h2>
          <button type="button" onClick={onClose} className="p-2 rounded-lg hover:bg-[var(--dash-surface-hover)]">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-5 py-3 border-b border-[var(--dash-border)] flex gap-2">
          {steps.map((label, i) => (
            <button
              key={label}
              type="button"
              onClick={() => setStep(i + 1)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                step === i + 1 ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary-strong)]' : 'text-[var(--dash-muted)]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {step === 1 && (
            <>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-1">Webhook name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. GHL Lead Form, Stripe Payment, Calendly Booking"
                  className="w-full rounded-xl border border-[var(--dash-border)] bg-[var(--dash-bg)] px-3 py-2.5 text-sm"
                />
              </div>
              {webhook && (
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text)] mb-1">Your webhook URL</label>
                  <div className="flex gap-2 items-center">
                    <code className="flex-1 text-xs bg-[var(--dash-surface-hover)] rounded-lg p-2 truncate">{webhookUrl}</code>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(webhookUrl)}
                      className="shrink-0 px-3 py-2 rounded-lg bg-[var(--dash-primary)] text-white text-sm font-semibold"
                    >
                      Copy
                    </button>
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] mt-1">
                    Paste this URL into your CRM or tool. TrackHive will receive the data automatically.
                  </p>
                  <div className="mt-3 pt-3 border-t border-[var(--dash-border)]">
                    <p className="text-xs font-medium text-[var(--dash-muted)] mb-2">Use with</p>
                    <div className="flex flex-wrap gap-1.5">
                      {[
                        { name: 'Zapier', url: 'https://zapier.com/apps/webhook/integrations' },
                        { name: 'HubSpot', url: 'https://knowledge.hubspot.com/workflows/create-workflows#add-an-action' },
                        { name: 'GoHighLevel', url: 'https://help.gohighlevel.com/support/solutions/articles/48000070943-webhooks' },
                        { name: 'Make', url: 'https://www.make.com/en/help/tools/webhooks' },
                        { name: 'Calendly', url: 'https://help.calendly.com/hc/en-us/articles/223147027-Webhooks' },
                        { name: 'Stripe', url: 'https://dashboard.stripe.com/webhooks' },
                      ].map((tool) => (
                        <a
                          key={tool.name}
                          href={tool.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-primary-soft)] border border-[var(--dash-border)]"
                        >
                          {tool.name}
                        </a>
                      ))}
                    </div>
                    <p className="text-xs text-[var(--dash-muted)] mt-1.5">
                      Open the tool, add a webhook action, and paste the URL above.
                    </p>
                  </div>
                </div>
              )}
              {!webhook && !isEdit && (
                <div>
                  <p className="text-sm text-[var(--dash-muted)] mb-3">Click Next to create the webhook and get your URL.</p>
                  <p className="text-xs font-medium text-[var(--dash-muted)] mb-1.5">Works with</p>
                  <div className="flex flex-wrap gap-1.5">
                    {['Zapier', 'HubSpot', 'GoHighLevel', 'Make', 'Calendly', 'Stripe'].map((name) => (
                      <span
                        key={name}
                        className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-muted)] border border-[var(--dash-border)]"
                      >
                        {name}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-[var(--dash-muted)] mt-1.5">
                    Paste your URL in any of these tools to send leads or events to TrackHive.
                  </p>
                </div>
              )}
            </>
          )}

          {step === 2 && (
            <>
              <p className="text-sm font-medium text-[var(--dash-text)]">What conversion does this webhook represent?</p>
              <div className="grid grid-cols-2 gap-2">
                {EVENT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, event_name: opt.id }))}
                    className={`text-left p-3 rounded-xl border text-sm ${
                      form.event_name === opt.id ? 'border-[var(--dash-primary)] bg-[var(--dash-primary-soft)]' : 'border-[var(--dash-border)]'
                    }`}
                  >
                    <span className="font-medium block">{opt.label}</span>
                    <span className="text-xs text-[var(--dash-muted)]">{opt.sub}</span>
                  </button>
                ))}
              </div>
              {form.event_name === 'Custom' && (
                <input
                  type="text"
                  value={form.custom_event_name}
                  onChange={(e) => setForm((f) => ({ ...f, custom_event_name: e.target.value }))}
                  placeholder="Event name"
                  className="w-full rounded-xl border border-[var(--dash-border)] px-3 py-2 text-sm"
                />
              )}
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-1">Value to send to ad platforms (optional)</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={form.event_value || ''}
                  onChange={(e) => setForm((f) => ({ ...f, event_value: Number(e.target.value) || 0 }))}
                  placeholder="0"
                  className="w-full rounded-xl border border-[var(--dash-border)] px-3 py-2 text-sm"
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <p className="font-medium text-[var(--dash-text)]">Map your CRM fields</p>
              <p className="text-xs text-[var(--dash-muted)]">Send a test payload first, or map manually below.</p>
              {webhook && (
                <div className="rounded-xl border border-[var(--dash-border)] p-3 bg-[var(--dash-surface-hover)]">
                  <p className="text-xs text-[var(--dash-muted)] mb-2">
                    Paste the webhook URL into your CRM and trigger a test. TrackHive will auto-detect your fields below.
                  </p>
                  {detectedCount !== null ? (
                    <p className="text-sm font-medium text-green-700">Test payload received — {detectedCount} fields detected</p>
                  ) : (
                    <p className="text-sm text-[var(--dash-muted)] flex items-center gap-2">
                      <span className="inline-block w-2 h-2 rounded-full bg-[var(--dash-muted)] animate-pulse" />
                      Waiting for test payload…
                    </p>
                  )}
                </div>
              )}
              <div className="border border-[var(--dash-border)] rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--dash-border)] bg-[var(--dash-surface-hover)]">
                      <th className="text-left px-3 py-2 font-semibold text-[var(--dash-muted)]">Your CRM field</th>
                      <th className="w-8" />
                      <th className="text-left px-3 py-2 font-semibold text-[var(--dash-muted)]">TrackHive field</th>
                      <th className="w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {fieldMapRows.map((row, i) => (
                      <tr key={i} className="border-b border-[var(--dash-border)]">
                        <td className="px-3 py-2">
                          {testPayloadKeys.length ? (
                            <select
                              value={row.crmKey}
                              onChange={(e) => updateFieldRow(i, e.target.value, row.trackhiveField)}
                              className="w-full rounded border border-[var(--dash-border)] bg-[var(--dash-bg)] px-2 py-1.5 text-xs"
                            >
                              <option value="">—</option>
                              {testPayloadKeys.map((k) => (
                                <option key={k} value={k}>{k}</option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              value={row.crmKey}
                              onChange={(e) => updateFieldRow(i, e.target.value, row.trackhiveField)}
                              placeholder="e.g. contact.email"
                              className="w-full rounded border border-[var(--dash-border)] px-2 py-1.5 text-xs"
                            />
                          )}
                        </td>
                        <td className="px-1 py-2">
                          <ArrowRight className="h-4 w-4 text-[var(--dash-muted)]" />
                        </td>
                        <td className="px-3 py-2">
                          <select
                            value={row.trackhiveField}
                            onChange={(e) => updateFieldRow(i, row.crmKey, e.target.value)}
                            className="w-full rounded border border-[var(--dash-border)] bg-[var(--dash-bg)] px-2 py-1.5 text-xs"
                          >
                            {TRACKHIVE_FIELD_OPTIONS.map((opt) => (
                              <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-1 py-2">
                          {form.field_map.length > 0 && (
                            <button type="button" onClick={() => removeFieldRow(i)} className="text-[var(--dash-muted)] hover:text-red-600">
                              <X className="h-4 w-4" />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button type="button" onClick={addFieldRow} className="text-sm text-[var(--dash-primary)] hover:underline">
                Add manual row
              </button>
            </>
          )}

          {step === 4 && (
            <>
              <p className="font-medium text-[var(--dash-text)]">Which pixels should this webhook fire to?</p>
              <p className="text-xs text-[var(--dash-muted)]">Select all platforms you want to receive this event.</p>
              <div className="space-y-2">
                {pixels.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--dash-border)]"
                  >
                    <span className="font-medium text-sm">{p.name}</span>
                    <span className="text-xs text-[var(--dash-muted)] capitalize">{p.platform}</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={form.pixel_ids.includes(p.id)}
                      onClick={() => togglePixel(p.id)}
                      className={`relative w-10 h-6 rounded-full transition-colors ${
                        form.pixel_ids.includes(p.id) ? 'bg-[var(--dash-primary)]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${
                          form.pixel_ids.includes(p.id) ? 'left-5' : 'left-1'
                        }`}
                      />
                    </button>
                  </div>
                ))}
              </div>
              {pixels.length === 0 && (
                <p className="text-sm text-[var(--dash-muted)]">
                  <Link href="/dashboard/pixels" className="text-[var(--dash-primary)] hover:underline">Add pixels</Link> first to send events.
                </p>
              )}
              <p className="text-sm text-[var(--dash-muted)]">
                When a lead arrives → fire <strong>{eventName}</strong> to {form.pixel_ids.length} pixel(s).
              </p>
            </>
          )}
        </div>
        <div className="p-5 border-t border-[var(--dash-border)] flex gap-2">
          {step > 1 ? (
            <button type="button" onClick={() => setStep(step - 1)} className="px-4 py-2 rounded-xl border border-[var(--dash-border)] text-sm font-medium">
              Back
            </button>
          ) : null}
          {step < 4 ? (
            <button type="button" onClick={goNext} disabled={saving || (step === 1 && !form.name.trim())} className="px-4 py-2 rounded-xl bg-[var(--dash-primary)] text-white text-sm font-semibold disabled:opacity-50">
              {saving ? '…' : 'Next'}
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSave}
              disabled={saving || !form.name.trim()}
              className="px-4 py-2 rounded-xl bg-[var(--dash-primary)] text-white text-sm font-semibold disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save webhook'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
