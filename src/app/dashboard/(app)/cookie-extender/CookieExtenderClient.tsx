'use client'

import { useState, useEffect } from 'react'
import CopyButton from '../setup/CopyButton'

const TRACK_BASE = 'https://track.itshassanahmed.com'

type Settings = {
  cookie_lifetime_days: number
  cookie_name: string
  is_active: boolean
}

type Stats = {
  total_visitors: number
  returning_visitors: number
  avg_cookie_age_days: number
  visitors_saved: number
}

export default function CookieExtenderClient({
  apiKey,
  initialSettings,
}: {
  apiKey: string
  initialSettings: Settings
}) {
  const [isActive, setIsActive] = useState(initialSettings.is_active)
  const [lifetimeDays, setLifetimeDays] = useState(initialSettings.cookie_lifetime_days)
  const [cookieName, setCookieName] = useState(initialSettings.cookie_name)
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [stats, setStats] = useState<Stats | null>(null)

  useEffect(() => {
    fetch('/api/cookie/stats')
      .then((r) => r.json())
      .then(setStats)
      .catch(() => setStats({
        total_visitors: 0,
        returning_visitors: 0,
        avg_cookie_age_days: 0,
        visitors_saved: 0,
      }))
  }, [])

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaveMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/cookie/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          is_active: isActive,
          cookie_lifetime_days: lifetimeDays,
          cookie_name: cookieName || '_th_uid',
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        setSaveMsg({ type: 'success', text: 'Settings saved.' })
      } else {
        setSaveMsg({ type: 'error', text: data.error ?? 'Save failed' })
      }
    } catch {
      setSaveMsg({ type: 'error', text: 'Request failed' })
    } finally {
      setSaving(false)
    }
  }

  const snippet = `<!-- Cookie Lifetime Extender: loads pixel that sets server-side cookie -->
<img src="${TRACK_BASE}/api/cookie/set?api_key=${apiKey}" width="1" height="1" alt="" style="position:absolute;width:1px;height:1px;" />`

  return (
    <div className="space-y-8">
      {/* Section 1 — Status Card */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Status</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300">Enable Cookie Lifetime Extender</span>
            <button
              type="button"
              role="switch"
              aria-checked={isActive}
              onClick={() => setIsActive((v) => !v)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors focus:outline-none focus:ring-2 focus:ring-zinc-500 focus:ring-offset-2 focus:ring-offset-zinc-900 ${
                isActive ? 'bg-emerald-600 border-emerald-500' : 'bg-zinc-700 border-zinc-600'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                  isActive ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-zinc-400">Current status:</span>
            <span
              className={`px-2 py-0.5 rounded text-xs font-medium ${
                isActive
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                  : 'bg-red-950 text-red-400 border border-red-800'
              }`}
            >
              {isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div>
            <label htmlFor="lifetime" className="block text-sm font-medium text-zinc-300 mb-2">
              Cookie lifetime: {lifetimeDays} days
            </label>
            <input
              id="lifetime"
              type="range"
              min={7}
              max={365}
              value={lifetimeDays}
              onChange={(e) => setLifetimeDays(Number(e.target.value))}
              className="w-full h-2 rounded-full bg-zinc-700 appearance-none cursor-pointer accent-emerald-500"
            />
            <div className="flex justify-between text-xs text-zinc-500 mt-1">
              <span>7 days</span>
              <span>365 days</span>
            </div>
          </div>
          <div>
            <label htmlFor="cookie-name" className="block text-sm font-medium text-zinc-300 mb-1.5">
              Cookie name
            </label>
            <input
              id="cookie-name"
              type="text"
              value={cookieName}
              onChange={(e) => setCookieName(e.target.value)}
              placeholder="_th_uid"
              className="w-full max-w-xs px-4 py-2.5 rounded-lg bg-zinc-800 border border-zinc-700 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600"
            />
          </div>
          {saveMsg && (
            <p className={saveMsg.type === 'success' ? 'text-emerald-400 text-sm' : 'text-red-400 text-sm'}>
              {saveMsg.text}
            </p>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-4 py-2 rounded-lg bg-white text-zinc-900 font-medium hover:bg-zinc-200 disabled:opacity-50 text-sm"
          >
            {saving ? 'Saving…' : 'Save Settings'}
          </button>
        </div>
      </section>

      {/* Section 2 — How It Works */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">How It Works</h2>
        </div>
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-semibold text-sm">
                1
              </span>
              <div>
                <p className="font-medium text-white">Visitor lands on website</p>
                <p className="text-sm text-zinc-400">Your site loads TrackHive and the cookie pixel.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-semibold text-sm">
                2
              </span>
              <div>
                <p className="font-medium text-white">TrackHive sets server-side cookie</p>
                <p className="text-sm text-zinc-400">Our server sets a long-lived cookie (e.g. 180 days).</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-zinc-300 font-semibold text-sm">
                3
              </span>
              <div>
                <p className="font-medium text-white">Cookie persists</p>
                <p className="text-sm text-zinc-400">Survives ITP, ad blockers, and browser restrictions.</p>
              </div>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-zinc-700">
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium"></th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium">Browser Cookie</th>
                  <th className="text-left py-2 px-3 text-zinc-400 font-medium">TrackHive Server Cookie</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium text-zinc-200">Safari ITP</td>
                  <td className="py-2 px-3">7 days max</td>
                  <td className="py-2 px-3 text-emerald-400">180 days</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium text-zinc-200">Firefox ETP</td>
                  <td className="py-2 px-3">1 day</td>
                  <td className="py-2 px-3 text-emerald-400">180 days</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium text-zinc-200">Ad Blockers</td>
                  <td className="py-2 px-3">Often blocked</td>
                  <td className="py-2 px-3 text-emerald-400">Never blocked</td>
                </tr>
                <tr className="border-b border-zinc-800">
                  <td className="py-2 px-3 font-medium text-zinc-200">iOS Chrome</td>
                  <td className="py-2 px-3">7 days</td>
                  <td className="py-2 px-3 text-emerald-400">180 days</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Section 3 — Cookie Stats */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800">
          <h2 className="text-sm font-medium text-zinc-300">Cookie Stats</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Total unique visitors</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats?.total_visitors ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Returning visitors</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats?.returning_visitors ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Avg cookie age (days)</p>
              <p className="text-2xl font-semibold text-white mt-1">{stats?.avg_cookie_age_days ?? '—'}</p>
            </div>
            <div className="rounded-lg bg-zinc-800/50 border border-zinc-700 p-4">
              <p className="text-xs text-zinc-500 uppercase tracking-wider">Visitors saved (without extender)</p>
              <p className="text-2xl font-semibold text-emerald-400 mt-1">{stats?.visitors_saved ?? '—'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Section 4 — Implementation */}
      <section className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
        <div className="px-4 py-3 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="text-sm font-medium text-zinc-300">Implementation</h2>
          <CopyButton text={snippet} />
        </div>
        <div className="p-4">
          <p className="text-zinc-400 text-sm mb-3">
            Add this snippet to your site. It calls the cookie set endpoint so the server can set a long-lived cookie.
          </p>
          <pre className="bg-zinc-950 rounded-lg border border-zinc-800 p-4 text-sm text-zinc-300 font-mono overflow-x-auto whitespace-pre">
            {snippet}
          </pre>
          <p className="mt-3 text-zinc-500 text-sm">
            If you already use the main TrackHive snippet (th.js), it will call this endpoint automatically. This img tag is for custom setups.
          </p>
        </div>
      </section>
    </div>
  )
}
