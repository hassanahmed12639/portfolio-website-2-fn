'use client'

import { useEffect, useState } from 'react'

type User = {
  id: string
  email: string | null
  plan: string
  created_at: string
  api_key?: string
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [filter, setFilter] = useState('')
  const [planFilter, setPlanFilter] = useState<string>('all')
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  function fetchUsers() {
    fetch('/api/admin/users')
      .then((res) => (res.ok ? res.json() : { users: [] }))
      .then((data) => setUsers(data.users || []))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const filtered = users.filter((u) => {
    const matchesEmail = (u.email ?? '').toLowerCase().includes(filter.toLowerCase())
    const matchesPlan = planFilter === 'all' || (u.plan || 'free') === planFilter
    return matchesEmail && matchesPlan
  })

  function maskKey(key?: string) {
    if (!key) return '-'
    if (key.length <= 8) return '••••••••'
    return key.slice(0, 8) + '...'
  }

  const changePlan = async (userId: string, newPlan: string) => {
    setUpdating(userId)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, plan: newPlan }),
      })
      if (res.ok) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, plan: newPlan } : u))
        )
      }
    } finally {
      setUpdating(null)
    }
  }

  function exportToCsv() {
    const headers = ['Email', 'Plan', 'Joined', 'API Key (masked)']
    const rows = filtered.map((u) => [
      u.email ?? '',
      u.plan || 'free',
      new Date(u.created_at).toISOString().split('T')[0],
      maskKey(u.api_key),
    ])
    const csv = [headers.join(','), ...rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `trackhive-users-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div>
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Users</h1>
        <p className="text-sm text-slate-500">{users.length} total users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <input
            type="search"
            placeholder="Search by email"
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full sm:w-64 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <div className="flex flex-wrap gap-2">
            {['all', 'free', 'trial', 'pro', 'agency'].map((plan) => (
              <button
                key={plan}
                onClick={() => setPlanFilter(plan)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  planFilter === plan
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {plan === 'all' ? 'All' : plan.charAt(0).toUpperCase() + plan.slice(1)}
              </button>
            ))}
          </div>
        </div>
        <button
          onClick={exportToCsv}
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
        >
          Export to CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-semibold text-slate-400 uppercase">
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Plan</th>
                <th className="px-5 py-3">Joined</th>
                <th className="px-5 py-3">API Key</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-t border-slate-100 hover:bg-slate-50 transition-colors"
                >
                  <td className="px-5 py-3 text-sm text-slate-700">{u.email ?? '-'}</td>
                  <td className="px-5 py-3">
                    <select
                      value={u.plan || 'free'}
                      onChange={(e) => changePlan(u.id, e.target.value)}
                      disabled={updating === u.id}
                      className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="free">free</option>
                      <option value="trial">trial</option>
                      <option value="pro">pro</option>
                      <option value="agency">agency</option>
                    </select>
                    {updating === u.id && (
                      <span className="ml-2 text-xs text-slate-400">Saving...</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm">
                    {new Date(u.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-5 py-3 text-slate-500 text-sm font-mono">
                    {maskKey(u.api_key)}
                  </td>
                  <td className="px-5 py-3">
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this user?')) return
                        const res = await fetch(`/api/admin/users?id=${u.id}`, {
                          method: 'DELETE',
                        })
                        if (res.ok) setUsers((prev) => prev.filter((x) => x.id !== u.id))
                      }}
                      className="text-red-600 text-xs font-medium hover:underline"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
