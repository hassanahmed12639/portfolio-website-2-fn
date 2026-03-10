'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlan } from '@/hooks/usePlan'

type Pixel = {
  id: string
  pixel_id: string
  name: string
  platform: string
  is_active: boolean
  is_primary: boolean
  created_at: string
}

const pixelLimits = {
  free: 1,
  pro: 3,
  agency: 25,
}

const platformOptions = {
  free: ['meta'],
  pro: ['meta', 'tiktok'],
  agency: ['meta', 'tiktok', 'ga4', 'google'],
}

export default function PixelsPage() {
  const { plan, isFree, isPro, isAgency } = usePlan()
  const [pixels, setPixels] = useState<Pixel[]>([])
  const [loading, setLoading] = useState(true)
  const [form, setForm] = useState({ name: 'My Pixel', pixel_id: '', access_token: '', platform: 'meta' })
  const [adding, setAdding] = useState(false)
  const [addError, setAddError] = useState<string | null>(null)
  const [updating, setUpdating] = useState<string | null>(null)

  const allowedPlatforms = platformOptions[plan as keyof typeof platformOptions] || ['meta']
  const pixelLimit = pixelLimits[plan as keyof typeof pixelLimits] || 1

  function loadPixels() {
    fetch('/api/pixels')
      .then((r) => r.json())
      .then((res) => {
        setPixels(res.pixels || [])
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadPixels()
  }, [])

  useEffect(() => {
    if (!allowedPlatforms.includes(form.platform)) {
      setForm((f) => ({ ...f, platform: allowedPlatforms[0] || 'meta' }))
    }
  }, [allowedPlatforms.join(','), form.platform])

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
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pixel Manager</h1>
          <p className="text-slate-500 text-sm mt-1">
            Manage your tracking pixels across platforms
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${
              isAgency
                ? 'bg-purple-50 text-purple-700 border-purple-200'
                : isPro
                ? 'bg-blue-50 text-blue-700 border-blue-200'
                : 'bg-slate-50 text-slate-600 border-slate-200'
            }`}
          >
            {plan === 'free' && '1 pixel — Free Plan'}
            {plan === 'pro' && `${pixels.length} / 3 pixels — Pro Plan`}
            {plan === 'agency' && `${pixels.length} / 25 pixels — Agency Plan`}
          </div>
        </div>
      </div>

      {/* Platform availability banner */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
        <p className="text-sm font-semibold text-slate-700 mb-3">Available Platforms on Your Plan</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { id: 'meta', label: 'Meta CAPI', description: 'Facebook & Instagram ads' },
            { id: 'tiktok', label: 'TikTok Events API', description: 'TikTok conversion tracking' },
            { id: 'ga4', label: 'Google Analytics 4', description: 'GA4 measurement protocol' },
            { id: 'google', label: 'Google Enhanced', description: 'Google Ads conversions' },
          ].map((platform) => {
            const isAvailable = allowedPlatforms.includes(platform.id)
            return (
              <div
                key={platform.id}
                className={`rounded-xl p-3 border ${
                  isAvailable ? 'bg-white border-slate-200' : 'bg-slate-50 border-slate-100 opacity-60'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-slate-800">{platform.label}</span>
                  {isAvailable ? (
                    <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">
                      Available
                    </span>
                  ) : (
                    <span className="text-xs bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded font-medium">
                      Locked
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400">{platform.description}</p>
                {!isAvailable && (
                  <p className="text-xs text-blue-500 mt-1 font-medium">
                    {platform.id === 'tiktok' ? 'Pro+ required' : 'Agency required'}
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Add New Pixel Form */}
      {pixels.length < pixelLimit ? (
        <div className="bg-white rounded-xl border border-slate-100 p-6 mb-6">
          <h2 className="font-semibold text-slate-900 mb-4">Add New Pixel</h2>
          <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Pixel Name</label>
                <input
                  type="text"
                  placeholder="e.g. Main Store Pixel"
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">Platform</label>
                <select
                  value={form.platform}
                  onChange={(e) => setForm((f) => ({ ...f, platform: e.target.value }))}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                >
                  {allowedPlatforms.includes('meta') && (
                    <option value="meta">Meta CAPI (Facebook / Instagram)</option>
                  )}
                  {allowedPlatforms.includes('tiktok') && (
                    <option value="tiktok">TikTok Events API</option>
                  )}
                  {allowedPlatforms.includes('ga4') && (
                    <option value="ga4">Google Analytics 4</option>
                  )}
                  {allowedPlatforms.includes('google') && (
                    <option value="google">Google Enhanced Conversions</option>
                  )}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  {form.platform === 'meta' && 'Meta Pixel ID'}
                  {form.platform === 'tiktok' && 'TikTok Pixel ID'}
                  {form.platform === 'ga4' && 'GA4 Measurement ID'}
                  {form.platform === 'google' && 'Google Ads Conversion ID'}
                </label>
                <input
                  type="text"
                  placeholder={
                    form.platform === 'meta'
                      ? 'e.g. 123456789'
                      : form.platform === 'tiktok'
                      ? 'e.g. C4A1B2C3D4E5F6'
                      : form.platform === 'ga4'
                      ? 'e.g. G-XXXXXXXXXX'
                      : 'e.g. AW-XXXXXXXXX'
                  }
                  value={form.pixel_id}
                  onChange={(e) => setForm((f) => ({ ...f, pixel_id: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-slate-700 block mb-1">
                  {form.platform === 'meta' && 'Meta Access Token'}
                  {form.platform === 'tiktok' && 'TikTok Access Token'}
                  {form.platform === 'ga4' && 'GA4 API Secret'}
                  {form.platform === 'google' && 'Conversion Label'}
                </label>
                <input
                  type="password"
                  placeholder="Paste your access token"
                  value={form.access_token}
                  onChange={(e) => setForm((f) => ({ ...f, access_token: e.target.value }))}
                  required
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm"
                />
              </div>
            </div>

            {addError && <p className="text-sm text-red-500">{addError}</p>}
            <button
              type="submit"
              disabled={adding || !form.name || !form.pixel_id || !form.access_token}
              className="mt-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              {adding ? 'Adding…' : 'Add Pixel'}
            </button>
          </form>
        </div>
      ) : (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-5 mb-6 flex items-start gap-4">
          <div className="flex-1">
            <p className="font-semibold text-orange-800 mb-1">
              Pixel limit reached ({pixelLimit}/{pixelLimit})
            </p>
            <p className="text-sm text-orange-600">
              {plan === 'free' && 'Upgrade to Pro for 3 pixels across Meta and TikTok.'}
              {plan === 'pro' && 'Upgrade to Agency for 25 pixels across all platforms.'}
              {plan === 'agency' && 'You have reached the maximum of 25 pixels.'}
            </p>
          </div>
          {plan !== 'agency' && (
            <Link
              href="/pricing"
              className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-orange-600 transition-colors flex-shrink-0"
            >
              Upgrade
            </Link>
          )}
        </div>
      )}

      {/* Pixels List */}
      <div className="bg-white rounded-xl border border-slate-100 p-6">
        <h2 className="font-semibold text-slate-900 mb-4">
          Your Pixels ({pixels.length}/{pixelLimit})
        </h2>

        {pixels.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-slate-400 text-sm">No pixels yet. Add one above.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {pixels.map((pixel) => (
              <div
                key={pixel.id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full flex-shrink-0 ${
                      pixel.is_active ? 'bg-green-500' : 'bg-slate-300'
                    }`}
                  />
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{pixel.name}</p>
                    <p className="text-xs text-slate-400">{pixel.pixel_id}</p>
                  </div>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                      pixel.platform === 'meta'
                        ? 'bg-blue-50 text-blue-600 border-blue-200'
                        : pixel.platform === 'tiktok'
                        ? 'bg-slate-900 text-white border-slate-700'
                        : pixel.platform === 'ga4'
                        ? 'bg-orange-50 text-orange-600 border-orange-200'
                        : 'bg-green-50 text-green-600 border-green-200'
                    }`}
                  >
                    {pixel.platform === 'meta' && 'Meta CAPI'}
                    {pixel.platform === 'tiktok' && 'TikTok'}
                    {pixel.platform === 'ga4' && 'GA4'}
                    {pixel.platform === 'google' && 'Google Ads'}
                    {!pixel.platform && 'Meta CAPI'}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleUpdate(pixel.id, { is_active: !pixel.is_active })}
                    disabled={!!updating}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-colors ${
                      pixel.is_active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200'
                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                    }`}
                  >
                    {pixel.is_active ? 'Active' : 'Inactive'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(pixel.id)}
                    disabled={!!updating}
                    className="text-xs px-3 py-1.5 rounded-lg font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* How it works */}
      <section className="rounded-xl bg-white border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-6">
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
