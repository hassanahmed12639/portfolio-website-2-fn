'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { CURRENCY_OPTIONS } from '@/lib/utils'

type Profile = { id: string; dashboard_type?: string | null; business_name?: string | null; display_currency?: string | null } | null

export default function SettingsClient({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter()
  const [currentDashboardType, setCurrentDashboardType] = useState<string>(profile?.dashboard_type ?? 'ecommerce')
  const [currentCurrency, setCurrentCurrency] = useState<string>(profile?.display_currency ?? 'USD')
  const [saving, setSaving] = useState(false)
  const [currencySaving, setCurrencySaving] = useState(false)

  const handleSwitchDashboard = async (type: string) => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ dashboard_type: type })
        .eq('id', userId)
      if (!error) {
        setCurrentDashboardType(type)
        router.refresh()
      }
    } finally {
      setSaving(false)
    }
  }

  const handleCurrencyChange = async (code: string) => {
    setCurrencySaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('profiles')
        .update({ display_currency: code })
        .eq('id', userId)
      if (!error) {
        setCurrentCurrency(code)
        router.refresh()
      }
    } finally {
      setCurrencySaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-900 mb-1">Display Currency</p>
        <p className="text-sm text-slate-500 mb-4">Choose how revenue and monetary values are displayed across the dashboard</p>
        <select
          value={currentCurrency}
          onChange={(e) => handleCurrencyChange(e.target.value)}
          disabled={currencySaving}
          className="w-full max-w-xs rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-60"
        >
          {CURRENCY_OPTIONS.map(({ code, label }) => (
            <option key={code} value={code}>{label}</option>
          ))}
        </select>
        {currencySaving && <span className="ml-2 text-xs text-slate-500">Saving…</span>}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-900 mb-1">Dashboard Mode</p>
        <p className="text-sm text-slate-500 mb-4">Switch between E-Commerce and Lead Gen dashboard views</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'ecommerce', label: 'E-Commerce', desc: 'Purchase tracking, revenue, ROAS' },
            { type: 'leadgen', label: 'Lead Generation', desc: 'Lead scoring, funnel, Meta feedback' }
          ].map(option => (
            <button
              key={option.type}
              type="button"
              onClick={() => handleSwitchDashboard(option.type)}
              disabled={saving}
              className={`border-2 rounded-xl p-4 cursor-pointer transition-all text-left disabled:opacity-60 ${
                currentDashboardType === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              <p className="font-bold text-slate-900 text-sm">{option.label}</p>
              <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
              {currentDashboardType === option.type && (
                <span className="text-xs text-blue-600 font-semibold mt-2 block">✓ Active</span>
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
