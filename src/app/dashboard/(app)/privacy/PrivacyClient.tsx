'use client'

import { useState, useEffect, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { PrivacySettings, IpModification } from '@/app/api/privacy/settings/route'

const RETENTION_OPTIONS = [7, 30, 60, 90, 180, 365]

const IP_MODIFICATION_OPTIONS: { value: IpModification; label: string; sub: string }[] = [
  { value: 'full', label: 'Full IP', sub: 'store complete IP — 192.168.1.100 (not recommended)' },
  { value: 'anonymized', label: 'Anonymized IP', sub: 'remove last octet — 192.168.1.0 (recommended)' },
  { value: 'partial', label: 'Partial Mask', sub: 'show first two octets — 192.168.x.x' },
  { value: 'full_mask', label: 'Full Mask', sub: 'never store IP — store "0.0.0.0"' },
]

function ipPreview(ipMode: IpModification, sampleIp: string = '192.168.1.100'): string {
  if (ipMode === 'full') return sampleIp
  if (ipMode === 'anonymized') return sampleIp.split('.').slice(0, 3).join('.') + '.0'
  if (ipMode === 'partial') return sampleIp.split('.').slice(0, 2).join('.') + '.x.x'
  return '0.0.0.0'
}

export default function PrivacyClient() {
  const [settings, setSettings] = useState<PrivacySettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')
  const [deleteSubmitting, setDeleteSubmitting] = useState(false)
  const [deleteResult, setDeleteResult] = useState<{ success: boolean; deleted_count?: number; error?: string } | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/privacy/settings')
    if (res.ok) {
      const data = await res.json()
      setSettings(data)
    } else {
      setSettings({
        ip_anonymization: true,
        data_retention_days: 90,
        consent_mode: true,
        pii_masking: true,
        gdpr_mode: false,
        ccpa_mode: false,
        auto_delete_enabled: true,
        data_minimization: false,
        ip_modification: 'anonymized',
        anonymize_email: true,
        anonymize_phone: true,
        strip_query_params: false,
        anonymize_user_agent: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchSettings().finally(() => setLoading(false))
  }, [fetchSettings])

  const updateSetting = useCallback(
    async (patch: Partial<PrivacySettings>) => {
      if (!settings) return
      const next = { ...settings, ...patch } as PrivacySettings
      setSettings(next)
      setSaveError(null)
      setSaving(true)
      try {
        const res = await fetch('/api/privacy/settings', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(next),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setSaveError((data.error as string) || 'Failed to save')
          setSettings(settings)
        }
      } catch {
        setSaveError('Network error')
        setSettings(settings)
      } finally {
        setSaving(false)
      }
    },
    [settings]
  )

  const saveAllPrivacySettings = useCallback(async () => {
    if (!settings) return
    setSaveError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/privacy/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setSaveError((data.error as string) || 'Failed to save')
      }
    } catch {
      setSaveError('Network error')
    } finally {
      setSaving(false)
    }
  }, [settings])

  const handleDeleteAll = async () => {
    if (deleteConfirm !== 'DELETE') return
    setDeleteSubmitting(true)
    setDeleteResult(null)
    try {
      const res = await fetch('/api/privacy/delete-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmation: 'DELETE' }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setDeleteResult({ success: true, deleted_count: data.deleted_count })
        setDeleteModalOpen(false)
        setDeleteConfirm('')
      } else {
        setDeleteResult({ success: false, error: data.error ?? 'Failed' })
      }
    } catch {
      setDeleteResult({ success: false, error: 'Request failed' })
    } finally {
      setDeleteSubmitting(false)
    }
  }

  if (loading || !settings) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-zinc-400">Loading privacy settings…</p>
      </div>
    )
  }

  const complianceItems: { ok: boolean; label: string; enable?: () => void }[] = [
    { ok: settings.ip_anonymization, label: 'IP Anonymization enabled' },
    { ok: settings.pii_masking, label: 'PII is hashed before storage' },
    { ok: true, label: `Data retention policy set (${settings.data_retention_days} days)` },
    {
      ok: settings.gdpr_mode,
      label: 'GDPR mode enabled',
      enable: () => updateSetting({ gdpr_mode: true }),
    },
    {
      ok: settings.consent_mode,
      label: 'Consent mode configured',
      enable: () => updateSetting({ consent_mode: true }),
    },
    { ok: settings.auto_delete_enabled, label: 'Auto-deletion enabled' },
  ]
  const complianceScore = Math.round(
    (complianceItems.filter((c) => c.ok).length / complianceItems.length) * 100
  )

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-white mb-2">Privacy Configuration</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Control compliance modes, data retention, and how event data is stored and forwarded.
      </p>

      {saveError && (
        <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-center justify-between gap-4">
          <span>{saveError}</span>
          <button
            type="button"
            onClick={() => setSaveError(null)}
            className="text-red-400 hover:text-red-200 shrink-0"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1 — Compliance Mode */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Compliance Mode
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            className={`rounded-xl border p-5 transition-colors ${
              settings.gdpr_mode
                ? 'border-emerald-600/50 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">GDPR Mode</span>
              {settings.gdpr_mode && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-400">
                  EU Compliant
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Enables EU compliance features including IP anonymization, consent checking, and data
              minimization
            </p>
            <Switch
              checked={settings.gdpr_mode}
              onCheckedChange={(v) => updateSetting({ gdpr_mode: v })}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div
            className={`rounded-xl border p-5 transition-colors ${
              settings.ccpa_mode
                ? 'border-emerald-600/50 bg-zinc-900'
                : 'border-zinc-800 bg-zinc-900/50'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium text-white">CCPA Mode</span>
              {settings.ccpa_mode && (
                <span className="text-xs font-medium px-2 py-0.5 rounded bg-emerald-600/30 text-emerald-400">
                  CCPA Compliant
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 mb-4">
              Enables California privacy compliance including opt-out support and data deletion
              rights
            </p>
            <Switch
              checked={settings.ccpa_mode}
              onCheckedChange={(v) => updateSetting({ ccpa_mode: v })}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
        {saving && (
          <p className="text-xs text-zinc-500 mt-2">Saving…</p>
        )}
      </section>

      {/* Section 2 — Data Privacy Settings */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Data Privacy Settings
        </h2>
        <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">IP Anonymization</p>
              <p className="text-sm text-zinc-400">
                Remove last octet of IP addresses (192.168.1.100 → 192.168.1.0)
              </p>
            </div>
            <Switch
              checked={settings.ip_anonymization}
              onCheckedChange={(v) => updateSetting({ ip_anonymization: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">PII Auto-Masking</p>
              <p className="text-sm text-zinc-400">
                Automatically hash emails and phone numbers before storing
              </p>
            </div>
            <Switch
              checked={settings.pii_masking}
              onCheckedChange={(v) => updateSetting({ pii_masking: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Consent Mode</p>
              <p className="text-sm text-zinc-400">
                Respect user consent signals. Events from users who rejected cookies will be logged
                but not forwarded to Meta/Google
              </p>
            </div>
            <Switch
              checked={settings.consent_mode}
              onCheckedChange={(v) => updateSetting({ consent_mode: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Data Minimization</p>
              <p className="text-sm text-zinc-400">
                Only collect data necessary for tracking. Strip unnecessary parameters
              </p>
            </div>
            <Switch
              checked={settings.data_minimization ?? false}
              onCheckedChange={(v) => updateSetting({ data_minimization: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
        </div>
      </section>

      {/* Section 3 — Data Retention */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Data Retention
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-5">
          <div>
            <p className="text-sm text-zinc-300 mb-2">
              Data retention period: <strong className="text-white">{settings.data_retention_days} days</strong>
            </p>
            <p className="text-sm text-zinc-400 mb-3">
              Events older than {settings.data_retention_days} days will be automatically deleted
            </p>
            <div className="flex flex-wrap gap-2">
              {RETENTION_OPTIONS.map((d) => (
                <button
                  key={d}
                  type="button"
                  onClick={() => updateSetting({ data_retention_days: d })}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    settings.data_retention_days === d
                      ? 'bg-emerald-600 text-white'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
            {settings.data_retention_days === 365 && (
              <p className="text-amber-500 text-sm mt-2">
                Storing data longer increases compliance risk
              </p>
            )}
          </div>
          <div className="flex items-center justify-between pt-2 border-t border-zinc-800">
            <div>
              <p className="font-medium text-white">Enable automatic deletion</p>
              <p className="text-sm text-zinc-400">Delete events older than retention period</p>
            </div>
            <Switch
              checked={settings.auto_delete_enabled}
              onCheckedChange={(v) => updateSetting({ auto_delete_enabled: v })}
              className="data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div>
            <Button
              variant="destructive"
              onClick={() => setDeleteModalOpen(true)}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete All Data Now
            </Button>
          </div>
        </div>
      </section>

      <div className="mb-10">
        <Button
          onClick={saveAllPrivacySettings}
          disabled={saving}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {saving ? 'Saving…' : 'Save All Privacy Settings'}
        </Button>
      </div>

      {/* Section 4 — Compliance Status */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">
          Compliance Status
        </h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex items-center gap-4 mb-4">
            <span className="text-sm text-zinc-400">Overall score</span>
            <div className="flex-1 h-3 rounded-full bg-zinc-800 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${
                  complianceScore >= 80 ? 'bg-emerald-500' : complianceScore >= 50 ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${complianceScore}%` }}
              />
            </div>
            <span className="text-sm font-medium text-white w-10">{complianceScore}/100</span>
          </div>
          <ul className="space-y-2">
            {complianceItems.map((item, i) => (
              <li key={i} className="flex items-center gap-2 text-sm">
                {item.ok ? (
                  <span className="text-emerald-500">✅</span>
                ) : (
                  <span className="text-amber-500">⚠️</span>
                )}
                {item.enable && !item.ok ? (
                  <button
                    type="button"
                    onClick={item.enable}
                    className="text-left text-amber-400 hover:text-amber-300 underline"
                  >
                    {item.label} (click to enable)
                  </button>
                ) : (
                  <span className={item.ok ? 'text-zinc-300' : 'text-zinc-400'}>{item.label}</span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Delete confirmation modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete all events data?</h3>
            <p className="text-sm text-zinc-400 mb-4">
              Are you sure? This will permanently delete all your events data. This cannot be undone.
            </p>
            <p className="text-sm text-zinc-400 mb-2">Type DELETE to confirm:</p>
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="DELETE"
              className="mb-4 bg-zinc-800 border-zinc-700 text-white"
              autoFocus
            />
            {deleteResult && !deleteResult.success && (
              <p className="text-red-400 text-sm mb-2">{deleteResult.error}</p>
            )}
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false)
                  setDeleteConfirm('')
                  setDeleteResult(null)
                }}
                disabled={deleteSubmitting}
                className="border-zinc-600 text-zinc-300"
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteAll}
                disabled={deleteConfirm !== 'DELETE' || deleteSubmitting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteSubmitting ? 'Deleting…' : 'Confirm'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
