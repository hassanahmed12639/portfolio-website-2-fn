'use client'

import { useState, useEffect } from 'react'

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<Record<string, number> | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/revenue')
      .then((r) => r.json())
      .then((data) => {
        setStats(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Revenue</h1>
        <p className="text-sm text-slate-500">PayPal subscription revenue overview</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Monthly Recurring Revenue', value: loading ? '...' : `$${stats?.mrr ?? 0}` },
          { label: 'Total Subscribers', value: loading ? '...' : (stats?.subscribers ?? 0) },
          { label: 'Pro Plan Users', value: loading ? '...' : (stats?.proUsers ?? 0) },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            <p className="text-sm text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-900 mb-4">Subscribers by Plan</p>
        <div className="space-y-3">
          {[
            { plan: 'Free', count: stats?.freeUsers ?? 0, color: 'bg-slate-200' },
            { plan: 'Pro — $10/mo', count: stats?.proUsers ?? 0, color: 'bg-blue-400' },
            { plan: 'Agency — $25/mo', count: stats?.agencyUsers ?? 0, color: 'bg-purple-400' },
          ].map((item) => (
            <div key={item.plan} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span className="text-sm text-slate-700 flex-1">{item.plan}</span>
              <span className="text-sm font-semibold text-slate-900">
                {loading ? '...' : item.count} users
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
