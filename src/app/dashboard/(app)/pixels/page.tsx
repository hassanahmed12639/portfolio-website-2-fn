'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Pixel = {
  id: string
  pixel_id: string
  name: string
  platform: string
  is_active: boolean
  is_primary: boolean
  created_at: string
}

const LIMITS = { free: 1, pro: 3, agency: 10, trial: 3 }

export default function PixelsPage() {
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [plan, setPlan] = useState<string>('free')
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: 'My Pixel', pixel_id: '', access_token: '', platform: 'meta' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const limit = LIMITS[plan as keyof typeof LIMITS] ?? 1
  const activeCount = pixels.filter((p) => p.is_active).length

  function loadPixels() {
    fetch('/api/pixels')
      .then((r) => r.json())
      .then((res) => {
        setPixels(res.pixels || [])
        if (res.plan) setPlan(res.plan)
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPixels()
  }, [])

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setAddError(null)
    setAdding(true)
    try {
      const res = await fetch('/api/pixels', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim() || 'My Pixel',
          pixel_id: form.pixel_id.trim(),
          access_token: form.access_token.trim(),
          platform: form.platform,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setAddError(data.error ?? 'Failed to add pixel')
        return
      }
      setForm({ name: 'My Pixel', pixel_id: '', access_token: '', platform: 'meta' })
      loadPixels()
    } catch {
      setAddError('Request failed')
    } finally {
      setAdding(false)
    }
  }

  async function handleUpdate(id: string, updates: Partial<Pixel>) {
    setUpdating(id)
    try {
      const res = await fetch('/api/pixels', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...updates }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? 'Update failed')
      }
      loadPixels()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Update failed')
    } finally {
      setUpdating(null)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Remove this pixel? Events will no longer be sent to it.')) return
    try {
      const res = await fetch(`/api/pixels?id=${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error('Delete failed')
      loadPixels()
    } catch {
      alert('Delete failed')
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8 overflow-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-[var(--dash-surface-hover)] rounded w-64" />
          <div className="h-32 bg-[var(--dash-surface-hover)] rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Multi-Pixel Manager</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">
        Send every event to multiple Meta pixels simultaneously.
      </p>

      {/* Plan limit banner */}
      <div className="rounded-xl p-4 flex items-center justify-between bg-[var(--dash-success-soft)] border border-[var(--dash-success-border)] mb-8">
        <div>
          <p className="text-sm font-semibold text-[var(--dash-text)]">
            {plan === 'free' && 'Free Plan — 1 pixel allowed'}
            {plan === 'pro' && 'Pro Plan — 3 pixels allowed'}
            {plan === 'agency' && 'Agency Plan — 10 pixels allowed'}
            {plan === 'trial' && 'Trial — 3 pixels allowed'}
            {!LIMITS[plan as keyof typeof LIMITS] && `${plan} — ${limit} pixel(s) allowed`}
          </p>
          <p className="text-xs text-[var(--dash-muted)] mt-0.5">
            Upgrade to Pro for 3 pixels, Agency for 10 pixels
          </p>
        </div>
        <Link
          href="/dashboard/billing"
          className="shrink-0 px-4 py-2 rounded-lg bg-[var(--dash-success)] text-white text-sm font-medium hover:bg-[var(--dash-success-strong)] transition-colors"
        >
          Upgrade
        </Link>
      </div>

      {/* Add New Pixel form */}
      <section className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 mb-8">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Add New Pixel</h2>
        <form onSubmit={handleAdd} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">Pixel Name</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="My Store Pixel"
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">Pixel ID</label>
            <input
              type="text"
              value={form.pixel_id}
              onChange={(e) => setForm((f) => ({ ...f, pixel_id: e.target.value }))}
              placeholder="794821153304566"
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">Access Token</label>
            <input
              type="password"
              value={form.access_token}
              onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))}
              placeholder="EAAxxxxx..."
              required
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] placeholder-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-muted)] mb-1.5">Platform</label>
            <select
              value={form.platform}
              onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
              className="w-full px-4 py-2.5 rounded-lg bg-[var(--dash-surface-hover)] border border-[var(--dash-border)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)]"
            >
              <option value="meta">Meta CAPI</option>
            </select>
          </div>
          {addError && <p className="text-sm text-red-400">{addError}</p>}
          <button
            type="submit"
            disabled={adding || pixels.length >= limit}
            className="px-4 py-2.5 rounded-lg bg-[var(--dash-success)] text-white font-medium hover:bg-[var(--dash-success-strong)] disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
          >
            {adding ? 'Adding…' : 'Add Pixel'}
          </button>
        </form>
      </section>

      {/* Active Pixels list */}
      <section className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6 mb-8">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">Your Pixels</h2>
        {pixels.length === 0 ? (
          <p className="text-[var(--dash-muted)] text-sm">No pixels yet. Add one above.</p>
        ) : (
          <div className="space-y-4">
            {pixels.map((pixel) => (
              <div
                key={pixel.id}
                className={`rounded-lg border p-4 ${
                  pixel.is_active
                    ? 'border-[var(--dash-border)] bg-[var(--dash-surface)]'
                    : 'border-[var(--dash-border)] bg-[var(--dash-surface-hover)]/50 opacity-75'
                }`}
              >
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span
                    className={`inline-block h-2.5 w-2.5 rounded-full shrink-0 ${
                      pixel.is_active ? 'bg-[var(--dash-success)]' : 'bg-[var(--dash-muted)]'
                    }`}
                  />
                  <span className="font-medium text-[var(--dash-text)]">{pixel.name}</span>
                  {pixel.is_primary && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-success-badge-bg)] text-[var(--dash-success-badge-text)]">
                      Primary
                    </span>
                  )}
                  {!pixel.is_active && (
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-[var(--dash-muted)]/20 text-[var(--dash-muted)]">
                      Paused
                    </span>
                  )}
                </div>
                <p className="text-xs text-[var(--dash-muted)]">Pixel ID: {pixel.pixel_id}</p>
                <p className="text-xs text-[var(--dash-muted)]">Platform: Meta CAPI</p>
                <p className="text-xs text-[var(--dash-muted)] mt-1">
                  Status: {pixel.is_active ? 'Active — receiving events' : 'Paused — not receiving events'}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  {!pixel.is_primary && (
                    <button
                      type="button"
                      onClick={() => handleUpdate(pixel.id, { is_primary: true })}
                      disabled={!!updating}
                      className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-border)] disabled:opacity-50"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleUpdate(pixel.id, { is_active: !pixel.is_active })}
                    disabled={!!updating}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--dash-surface-hover)] text-[var(--dash-text)] hover:bg-[var(--dash-border)] disabled:opacity-50"
                  >
                    {pixel.is_active ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pixel.id)}
                    disabled={!!updating}
                    className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-50 text-red-600 hover:bg-red-100 disabled:opacity-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* How it works */}
      <section className="rounded-xl bg-[var(--dash-surface)] border border-[var(--dash-border)] p-6">
        <h2 className="text-sm font-medium text-[var(--dash-muted)] mb-4">How Multi-Pixel Works</h2>
        <div className="space-y-4 text-sm text-[var(--dash-text)]">
          <p>When TrackHive receives a Purchase event:</p>
          <div className="space-y-2 pl-4 border-l-2 border-[var(--dash-border)]">
            <p>1. Event received</p>
            <p>2. TrackHive processes & enriches</p>
            <p>3. Fires to ALL active pixels:</p>
          </div>
          <div className="rounded-lg border border-[var(--dash-border)] bg-[var(--dash-surface-hover)]/50 p-4 font-mono text-xs">
            {pixels.filter((p) => p.is_active).length > 0 ? (
              pixels
                .filter((p) => p.is_active)
                .map((p) => (
                  <p key={p.id} className="text-[var(--dash-success)]">
                    ✓ {p.name}
                  </p>
                ))
            ) : (
              <p className="text-[var(--dash-muted)]">No active pixels configured</p>
            )}
          </div>
          <p className="text-[var(--dash-muted)]">All pixels receive identical enriched data.</p>
        </div>
      </section>
    </div>
  )
}
