'use client'

import { useState, useEffect, useCallback } from 'react'
import { Switch } from '@/components/ui/switch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import type { HeaderSettings, CustomHeader } from '@/app/api/headers/settings/route'

const SAMPLE_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
const SAMPLE_IP = '192.168.1.0'
const SAMPLE_REFERER = 'https://theirsite.com/checkout'

const ACTION_SOURCE_OPTIONS = [
  { value: 'website', label: 'website' },
  { value: 'app', label: 'app' },
  { value: 'email', label: 'email' },
  { value: 'phone_call', label: 'phone_call' },
  { value: 'chat', label: 'chat' },
  { value: 'physical_store', label: 'physical_store' },
  { value: 'system_generated', label: 'system_generated' },
  { value: 'other', label: 'other' },
]

function buildPreviewLines(
  s: HeaderSettings | null,
  userAgent: string,
  ip: string,
  referer: string
): string[] {
  const lines: string[] = ['Content-Type: application/json']
  if (!s) return lines
  const ua = s.override_user_agent && s.custom_user_agent ? s.custom_user_agent : userAgent
  if (s.forward_user_agent) lines.push(`User-Agent: ${ua.slice(0, 40)}…`)
  if (s.forward_ip) lines.push(`X-Forwarded-For: ${ip}`)
  if (s.forward_referer && referer) lines.push(`Referer: ${referer}`)
  if (s.forward_origin && referer) {
    try {
      const origin = new URL(referer).origin
      lines.push(`Origin: ${origin}`)
    } catch {
      lines.push('Origin: (from referer)')
    }
  }
  if (Array.isArray(s.custom_headers)) {
    for (const h of s.custom_headers) {
      if (h?.name?.trim()) lines.push(`${h.name}: ${h.value || ''}`)
    }
  }
  return lines
}

export default function HeadersClient() {
  const [settings, setSettings] = useState<HeaderSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [openAccordion, setOpenAccordion] = useState<string | null>(null)

  const fetchSettings = useCallback(async () => {
    const res = await fetch('/api/headers/settings')
    if (res.ok) {
      const data = await res.json()
      setSettings(data)
    } else {
      setSettings({
        custom_headers: [
          { name: 'X-TrackHive-Version', value: '1.0' },
          { name: 'X-Event-Source', value: 'server' },
        ],
        forward_user_agent: true,
        forward_ip: true,
        forward_referer: true,
        forward_origin: true,
        custom_user_agent: null,
        override_user_agent: false,
        is_active: true,
        meta_send_test_event_code: false,
        meta_test_event_code: null,
        meta_send_action_source: true,
        meta_action_source: 'website',
        google_send_x_forwarded_for: true,
        google_send_user_agent_override: true,
        tiktok_send_tt_user_data: false,
      })
    }
  }, [])

  useEffect(() => {
    fetchSettings().finally(() => setLoading(false))
  }, [fetchSettings])

  const updateSetting = useCallback(
    async (patch: Partial<HeaderSettings>) => {
      if (!settings) return
      const next = { ...settings, ...patch } as HeaderSettings
      setSettings(next)
      setSaveError(null)
      setSaving(true)
      try {
        const res = await fetch('/api/headers/settings', {
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

  const addHeader = useCallback(() => {
    if (!settings) return
    const next: CustomHeader[] = [...(settings.custom_headers || []), { name: '', value: '' }]
    updateSetting({ custom_headers: next })
  }, [settings, updateSetting])

  const updateHeader = useCallback(
    (index: number, field: 'name' | 'value', value: string) => {
      if (!settings) return
      const next = [...(settings.custom_headers || [])]
      if (!next[index]) next[index] = { name: '', value: '' }
      next[index] = { ...next[index], [field]: value }
      updateSetting({ custom_headers: next })
    },
    [settings, updateSetting]
  )

  const removeHeader = useCallback(
    (index: number) => {
      if (!settings) return
      const next = (settings.custom_headers || []).filter((_, i) => i !== index)
      updateSetting({ custom_headers: next })
    },
    [settings, updateSetting]
  )

  const saveHeaders = useCallback(async () => {
    if (!settings) return
    setSaveError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/headers/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) setSaveError((data.error as string) || 'Failed to save')
    } catch {
      setSaveError('Network error')
    } finally {
      setSaving(false)
    }
  }, [settings])

  if (loading || !settings) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-zinc-400">Loading header settings…</p>
      </div>
    )
  }

  const previewLines = buildPreviewLines(settings, SAMPLE_UA, SAMPLE_IP, SAMPLE_REFERER)

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      <h1 className="text-xl font-semibold text-white mb-2">HTTP Headers Management</h1>
      <p className="text-zinc-400 text-sm mb-8">
        Customize headers sent with every server-side event to Meta, Google, TikTok, and Snapchat to improve match rates.
      </p>

      {saveError && (
        <div className="mb-6 p-3 rounded-lg bg-red-900/30 border border-red-800 text-red-300 text-sm flex items-center justify-between gap-4">
          <span>{saveError}</span>
          <button type="button" onClick={() => setSaveError(null)} className="text-red-400 hover:text-red-200 shrink-0">
            Dismiss
          </button>
        </div>
      )}

      {/* Section 1 — Default Headers */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Default Headers</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Forward User-Agent</p>
              <p className="text-sm text-zinc-400">Send visitor&apos;s browser info to ad platforms for better matching</p>
              <p className="text-xs text-zinc-500 mt-1 font-mono">&quot;{SAMPLE_UA}…&quot;</p>
            </div>
            <Switch
              checked={settings.forward_user_agent}
              onCheckedChange={(v) => updateSetting({ forward_user_agent: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Forward IP Address</p>
              <p className="text-sm text-zinc-400">Send visitor IP to ad platforms (subject to your IP modification settings)</p>
            </div>
            <Switch
              checked={settings.forward_ip}
              onCheckedChange={(v) => updateSetting({ forward_ip: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Forward Referer</p>
              <p className="text-sm text-zinc-400">Send the page URL where the event happened</p>
            </div>
            <Switch
              checked={settings.forward_referer}
              onCheckedChange={(v) => updateSetting({ forward_referer: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="font-medium text-white">Forward Origin</p>
              <p className="text-sm text-zinc-400">Send your website domain as origin header</p>
            </div>
            <Switch
              checked={settings.forward_origin}
              onCheckedChange={(v) => updateSetting({ forward_origin: v })}
              className="shrink-0 data-[state=checked]:bg-emerald-600"
            />
          </div>
          <div className="pt-4 border-t border-zinc-800">
            <div className="flex items-center gap-3 mb-3">
              <Switch
                checked={settings.override_user_agent}
                onCheckedChange={(v) => updateSetting({ override_user_agent: v })}
                className="data-[state=checked]:bg-emerald-600"
              />
              <span className="font-medium text-white">Override User Agent</span>
            </div>
            <Input
              value={settings.custom_user_agent ?? ''}
              onChange={(e) => updateSetting({ custom_user_agent: e.target.value })}
              placeholder="Mozilla/5.0 (compatible; TrackHive/1.0)"
              className="bg-zinc-800 border-zinc-700 text-white"
            />
            <p className="text-xs text-zinc-500 mt-1">Leave empty to use visitor&apos;s actual user agent</p>
          </div>
        </div>
      </section>

      {/* Section 2 — Custom Headers */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Custom Headers</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-zinc-400">Add custom headers sent with every API call</span>
            <Button type="button" onClick={addHeader} variant="outline" className="border-zinc-600 text-zinc-300">
              Add Header
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left p-2 text-zinc-400 font-medium">Header Name</th>
                  <th className="text-left p-2 text-zinc-400 font-medium">Header Value</th>
                  <th className="w-10" />
                </tr>
              </thead>
              <tbody>
                {(settings.custom_headers || []).map((h, i) => (
                  <tr key={i} className="border-b border-zinc-800/50">
                    <td className="p-2">
                      <Input
                        value={h.name}
                        onChange={(e) => updateHeader(i, 'name', e.target.value)}
                        placeholder="X-Custom-Source"
                        className="bg-zinc-800 border-zinc-700 text-white text-sm h-8"
                      />
                    </td>
                    <td className="p-2">
                      <Input
                        value={h.value}
                        onChange={(e) => updateHeader(i, 'value', e.target.value)}
                        placeholder="my-website"
                        className="bg-zinc-800 border-zinc-700 text-white text-sm h-8"
                      />
                    </td>
                    <td className="p-2">
                      <button
                        type="button"
                        onClick={() => removeHeader(i)}
                        className="text-red-400 hover:text-red-300 p-1"
                        aria-label="Delete"
                      >
                        ✕
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Button
            type="button"
            onClick={saveHeaders}
            disabled={saving}
            className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {saving ? 'Saving…' : 'Save Headers'}
          </Button>
        </div>
      </section>

      {/* Section 3 — Headers Preview */}
      <section className="mb-10">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Headers Preview</h2>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5 space-y-6">
          <div>
            <p className="text-sm text-zinc-300 mb-2">Headers sent to Meta CAPI:</p>
            <pre className="text-xs text-zinc-400 font-mono bg-zinc-950 rounded-lg p-4 overflow-x-auto">
              {previewLines.map((line, i) => (
                <span key={i}>{i === 0 ? '' : '\n'}├── {line}</span>
              ))}
              {previewLines.length > 0 && '\n└──'}
            </pre>
          </div>
          <div>
            <p className="text-sm text-zinc-300 mb-2">Headers sent to Google:</p>
            <pre className="text-xs text-zinc-400 font-mono bg-zinc-950 rounded-lg p-4 overflow-x-auto">
              {previewLines.map((line, i) => (
                <span key={i}>{i === 0 ? '' : '\n'}├── {line}</span>
              ))}
              {previewLines.length > 0 && '\n└──'}
            </pre>
          </div>
        </div>
      </section>

      {/* Section 4 — Platform Specific */}
      <section className="mb-8">
        <h2 className="text-sm font-medium text-zinc-400 uppercase tracking-wider mb-4">Platform Specific Headers</h2>
        <div className="space-y-2">
          {[
            {
              id: 'meta',
              label: 'Meta CAPI',
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-300">Send test_event_code header (for testing)</span>
                    <Switch
                      checked={settings.meta_send_test_event_code ?? false}
                      onCheckedChange={(v) => updateSetting({ meta_send_test_event_code: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  {settings.meta_send_test_event_code && (
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">Test Event Code</label>
                      <Input
                        value={settings.meta_test_event_code ?? ''}
                        onChange={(e) => updateSetting({ meta_test_event_code: e.target.value })}
                        placeholder="TEST12345"
                        className="bg-zinc-800 border-zinc-700 text-white"
                      />
                    </div>
                  )}
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-300">Send action_source header</span>
                    <Switch
                      checked={settings.meta_send_action_source ?? true}
                      onCheckedChange={(v) => updateSetting({ meta_send_action_source: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  {settings.meta_send_action_source && (
                    <div>
                      <label className="block text-xs text-zinc-400 mb-1">action_source value</label>
                      <select
                        value={settings.meta_action_source ?? 'website'}
                        onChange={(e) => updateSetting({ meta_action_source: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-800 border border-zinc-700 text-white text-sm"
                      >
                        {ACTION_SOURCE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              ),
            },
            {
              id: 'google',
              label: 'Google',
              children: (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-300">Send X-Forwarded-For</span>
                    <Switch
                      checked={settings.google_send_x_forwarded_for ?? true}
                      onCheckedChange={(v) => updateSetting({ google_send_x_forwarded_for: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-300">Send user-agent override</span>
                    <Switch
                      checked={settings.google_send_user_agent_override ?? true}
                      onCheckedChange={(v) => updateSetting({ google_send_user_agent_override: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              ),
            },
            {
              id: 'tiktok',
              label: 'TikTok',
              children: (
                <div className="pt-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-sm text-zinc-300">Send tt_user_data header</span>
                    <Switch
                      checked={settings.tiktok_send_tt_user_data ?? false}
                      onCheckedChange={(v) => updateSetting({ tiktok_send_tt_user_data: v })}
                      className="data-[state=checked]:bg-emerald-600"
                    />
                  </div>
                </div>
              ),
            },
          ].map(({ id, label, children }) => (
            <div key={id} className="rounded-xl border border-zinc-800 bg-zinc-900/50 overflow-hidden">
              <button
                type="button"
                onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-zinc-800/50"
              >
                <span className="font-medium text-white">{label}</span>
                <span className="text-zinc-400">{openAccordion === id ? '▼' : '▶'}</span>
              </button>
              {openAccordion === id && <div className="px-4 pb-4 border-t border-zinc-800">{children}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
