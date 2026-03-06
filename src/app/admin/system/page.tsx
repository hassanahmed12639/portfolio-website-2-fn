'use client'

import { useEffect, useState } from 'react'

type EnvCheck = {
  name: string
  key: string
  configured: boolean
  status: 'ok' | 'error' | 'warning'
  detail: string
}
type SystemStats = {
  envChecks: EnvCheck[]
  supabaseConnection: 'ok' | 'error'
  retryPending: number
  failedToday: number
  totalPixels: number
}

export default function AdminSystemPage() {
  const [data, setData] = useState<SystemStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/system')
      .then((res) => (res.ok ? res.json() : null))
      .then(setData)
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div>
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    )
  }

  const connectionChecks = [
    { name: 'Supabase Connection', status: data?.supabaseConnection ?? 'error', detail: data?.supabaseConnection === 'ok' ? 'Connected' : 'Disconnected' },
    ...(data?.envChecks ?? []).map((c) => ({ name: c.name, status: c.status, detail: c.detail })),
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">System Health</h1>
        <p className="text-sm text-slate-500">Environment and operational checks</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <h2 className="text-sm font-semibold text-slate-900 mb-4">Environment Variables</h2>
        <div className="space-y-2">
          {connectionChecks.map((check) => (
            <div
              key={check.name}
              className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-100"
            >
              <span className="text-sm font-medium text-slate-700">{check.name}</span>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">{check.detail}</span>
                {check.status === 'ok' && <span className="text-green-600">✅</span>}
                {check.status === 'error' && <span className="text-red-600">❌</span>}
                {check.status === 'warning' && <span className="text-amber-600">⚠️</span>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Retry queue
          </p>
          <p className="text-2xl font-bold text-slate-900">{data?.retryPending ?? 0} pending jobs</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Failed events today
          </p>
          <p className="text-2xl font-bold text-slate-900">{data?.failedToday ?? 0}</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Total pixels configured
          </p>
          <p className="text-2xl font-bold text-slate-900">{data?.totalPixels ?? 0}</p>
        </div>
      </div>
    </div>
  )
}
