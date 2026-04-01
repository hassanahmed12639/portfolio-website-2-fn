'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { CURRENCY_OPTIONS } from '@/lib/utils'
import type { DashboardMode } from '@/lib/dashboard-mode'

type Profile = {
  id: string
  dashboard_type?: string | null
  business_type?: string | null
  business_name?: string | null
  display_currency?: string | null
}

export default function SettingsClient({
  profile,
  userId,
  resolvedMode,
}: {
  profile: Profile
  userId: string
  resolvedMode: DashboardMode
}) {
  const router = useRouter()
  const [currentDashboardType, setCurrentDashboardType] = useState<DashboardMode>(resolvedMode)
  const [currentCurrency, setCurrentCurrency] = useState<string>(profile?.display_currency ?? 'USD')
  const [saving, setSaving] = useState(false)
  const [currencySaving, setCurrencySaving] = useState(false)
  const [dashboardError, setDashboardError] = useState<string | null>(null)
  const DASHBOARD_OPTIONS: { type: DashboardMode; label: string; desc: string }[] = [
    { type: 'ecommerce', label: 'E-Commerce', desc: 'Purchase tracking, revenue, ROAS' },
    { type: 'leadgen', label: 'Lead Generation', desc: 'Lead scoring, funnel, Meta feedback' },
  ]

  useEffect(() => {
    setCurrentDashboardType(resolvedMode)
    setCurrentCurrency(profile.display_currency ?? 'USD')
  }, [resolvedMode, profile.display_currency])

  const handleSwitchDashboard = async (type: DashboardMode) => {
    if (type === currentDashboardType) return
    setDashboardError(null)
    setSaving(true)
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          dashboard_type: type,
          business_type: type,
        }),
      })
      if (!res.ok) {
        const err = await res.json().catch(() => ({}))
        setDashboardError((err as { error?: string })?.error ?? `Failed to switch (${res.status})`)
        return
      }
      setCurrentDashboardType(type)
      // Use a hard navigation to avoid intermittent stale RSC/prefetch state.
      window.location.assign('/dashboard')
    } catch (e) {
      setDashboardError(e instanceof Error ? e.message : 'Network error')
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = async (code: string) => {
    setCurrencySaving(true)
    try {
      const res = await fetch('/api/dashboard/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ display_currency: code }),
      })
      if (!res.ok) return
      setCurrentCurrency(code)
      router.refresh()
    } finally {
      setCurrencySaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div
        className="dash-card dash-card-gradient-top rounded-2xl border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5"
        style={{ background: 'var(--dash-card)' }}
      >
        <p className="font-semibold text-[var(--dash-text)] mb-1">Display Currency</p>
        <p className="text-sm text-[var(--dash-muted)] mb-4">Choose how revenue and monetary values are displayed across the dashboard</p>
        <select
          value={currentCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          disabled={currencySaving}
          className="w-full max-w-xs rounded-lg border border-[var(--dash-border)] px-3 py-2 text-sm font-medium text-[var(--dash-text)] bg-[var(--dash-bg)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] focus:border-[var(--dash-primary)] disabled:opacity-60"
        >
          {CURRENCY_OPTIONS.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {currencySaving && <span className="ml-2 text-xs text-[var(--dash-muted)]">Saving…</span>}
      </div>

      <div
        className="dash-card dash-card-gradient-top rounded-2xl border border-[var(--dash-border)] shadow-[var(--dash-shadow)] p-5"
        style={{ background: 'var(--dash-card)' }}
      >
        <p className="font-semibold text-[var(--dash-text)] mb-1">Dashboard Mode</p>
        <p className="text-sm text-[var(--dash-muted)] mb-4">Switch between E-Commerce and Lead Gen dashboard views</p>
        <div className="grid grid-cols-2 gap-3">
          {DASHBOARD_OPTIONS.map(option => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSwitchDashboard(option.type)}
              disabled={saving}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-left disabled:opacity-60 ${
                currentDashboardType === option.type
                  ? 'border-[var(--dash-primary)] bg-[var(--dash-primary-soft)]'
                  : 'border-[var(--dash-border)] hover:border-[var(--dash-primary-soft-strong)]'
              }`}
            >
              <p className="font-bold text-[var(--dash-text)] text-sm">{option.label}</p>
              <p className="text-xs text-[var(--dash-muted)] mt-1">{option.desc}</p>
              {currentDashboardType === option.type && (
                <span className="text-xs text-[var(--dash-primary)] font-semibold mt-2 block">✓ Active</span>
              )}
            </button>
          ))}
        </div>
        {dashboardError && (
          <p className="mt-3 text-sm text-red-600">{dashboardError}</p>
        )}
      </div>
    </div>
  )
}
