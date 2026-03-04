'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Profile = { id: string; dashboard_type?: string | null; business_name?: string | null } | null

export default function SettingsClient({ profile, userId }: { profile: Profile; userId: string }) {
  const router = useRouter()
  const [currentDashboardType, setCurrentDashboardType] = useState<string>(profile?.dashboard_type ?? 'ecommerce')
  const [saving, setSaving] = useState(false)

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

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-900 mb-1">Dashboard Mode</p>
        <p className="text-sm text-slate-500 mb-4">Switch between E-Commerce and Lead Gen dashboard views</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { type: 'ecommerce', emoji: '🛍️', label: 'E-Commerce', desc: 'Purchase tracking, revenue, ROAS' },
            { type: 'leadgen', emoji: '🎯', label: 'Lead Generation', desc: 'Lead scoring, funnel, Meta feedback' }
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
              <p className="text-2xl mb-2">{option.emoji}</p>
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
