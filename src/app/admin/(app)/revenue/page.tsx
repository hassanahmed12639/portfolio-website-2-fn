'use client'

import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'

type Stats = {
  totalUsers: number
  plans: { free: number; pro: number; agency: number; trial: number }
  mrr: number
  arr: number
}

const PLAN_COLORS = ['#94a3b8', '#2563eb', '#8b5cf6', '#eab308']

export default function AdminRevenuePage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    )
  }

  const proRev = (stats?.plans?.pro ?? 0) * 10
  const agencyRev = (stats?.plans?.agency ?? 0) * 25

  const pieData = [
    { name: 'Free', value: stats?.plans?.free ?? 0 },
    { name: 'Pro', value: stats?.plans?.pro ?? 0 },
    { name: 'Agency', value: stats?.plans?.agency ?? 0 },
    { name: 'Trial', value: stats?.plans?.trial ?? 0 },
  ].filter((d) => d.value > 0)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Revenue</h1>
        <p className="text-sm text-slate-500">MRR and ARR overview</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">MRR</p>
          <p className="text-3xl font-bold text-slate-900">${stats?.mrr ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ARR</p>
          <p className="text-3xl font-bold text-slate-900">${stats?.arr ?? 0}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Breakdown</h2>
        <ul className="space-y-2 text-slate-600">
          <li>
            Pro: {stats?.plans?.pro ?? 0} users × $10 = ${proRev}/mo
          </li>
          <li>
            Agency: {stats?.plans?.agency ?? 0} users × $25 = ${agencyRev}/mo
          </li>
        </ul>
        <p className="text-slate-500 text-sm mt-4">Connect Stripe for real payment tracking</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Plan Distribution</h2>
        <div className="h-64">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PLAN_COLORS[i % PLAN_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#334155' }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm flex items-center h-full">No plan data yet.</p>
          )}
        </div>
      </div>
    </div>
  )
}
