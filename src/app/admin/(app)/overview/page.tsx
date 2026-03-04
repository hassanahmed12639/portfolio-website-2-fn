'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

type Stats = {
  totalUsers: number
  totalEvents: number
  plans: { free: number; pro: number; agency: number; trial: number }
  mrr: number
  arr: number
  recentUsers: { id: string; email: string | null; plan: string; created_at: string; api_key?: string }[]
  signupsByDay: Record<string, number>
  todaySignups: number
}

export default function AdminOverviewPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/admin/stats')
      .then((res) => (res.ok ? res.json() : null))
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const signupsChartData = stats?.signupsByDay
    ? Object.entries(stats.signupsByDay)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date))
    : []

  if (loading) {
    return (
      <div>
        <p className="text-slate-500 animate-pulse">Loading...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-900">Admin Overview</h1>
        <p className="text-sm text-slate-500">
          Your SaaS at a glance — {new Date().toLocaleDateString()}
        </p>
      </div>

      {/* Row 1 — 5 stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Total Users
          </p>
          <p className="text-3xl font-bold text-slate-900">{stats?.totalUsers ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">All time signups</p>
        </div>
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-sm p-5 text-white">
          <p className="text-xs font-semibold text-blue-200 uppercase tracking-wider mb-2">MRR</p>
          <p className="text-3xl font-bold">${stats?.mrr ?? 0}</p>
          <p className="text-xs text-blue-200 mt-1">Monthly recurring revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">ARR</p>
          <p className="text-3xl font-bold text-slate-900">${stats?.arr ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">Annual recurring revenue</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Pro Users
          </p>
          <p className="text-3xl font-bold text-slate-900">{stats?.plans?.pro ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">@ $10/mo each</p>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Agency Users
          </p>
          <p className="text-3xl font-bold text-slate-900">{stats?.plans?.agency ?? 0}</p>
          <p className="text-xs text-slate-400 mt-1">@ $25/mo each</p>
        </div>
      </div>

      {/* Row 2 — Plan breakdown + Today + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Free
            </p>
            <p className="text-xl font-bold text-slate-900">{stats?.plans?.free ?? 0} users</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Trial
            </p>
            <p className="text-xl font-bold text-slate-900">{stats?.plans?.trial ?? 0} users</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Pro
            </p>
            <p className="text-xl font-bold text-slate-900">
              {stats?.plans?.pro ?? 0} users @ $10/mo
            </p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Agency
            </p>
            <p className="text-xl font-bold text-slate-900">
              {stats?.plans?.agency ?? 0} users @ $25/mo
            </p>
          </div>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5">
          <p className="font-semibold text-blue-900 mb-3">Today</p>
          <p className="text-sm text-blue-700">
            New signups: <strong>{stats?.todaySignups ?? 0}</strong>
          </p>
          <p className="text-sm text-blue-700 mt-1">
            Total events: <strong>{stats?.totalEvents ?? 0}</strong>
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="font-semibold text-slate-900 mb-4">Quick Actions</p>
        <div className="space-y-2">
          <Link
            href="/admin/users"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-700">Manage Users</span>
            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link
            href="/admin/revenue"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-700">View Revenue</span>
            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
          <Link
            href="/admin/system"
            className="flex items-center justify-between p-3 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors group"
          >
            <span className="text-sm text-slate-700">System Health</span>
            <span className="text-blue-600 group-hover:translate-x-0.5 transition-transform">→</span>
          </Link>
        </div>
      </div>

      {/* Row 3 — Signups chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
        <p className="text-sm font-semibold text-slate-900 mb-4">Signups — Last 30 days</p>
        <div className="h-64">
          {signupsChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={signupsChartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis
                  dataKey="date"
                  tick={{ fill: '#94a3b8', fontSize: 11 }}
                  axisLine={false}
                />
                <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#fff',
                    border: '1px solid #e2e8f0',
                    borderRadius: 8,
                  }}
                  labelStyle={{ color: '#334155' }}
                />
                <Line
                  type="monotone"
                  dataKey="count"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  name="Signups"
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-slate-500 text-sm flex items-center h-full">No signup data yet.</p>
          )}
        </div>
      </div>

      {/* Row 4 — Recent users table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <p className="font-semibold text-slate-900">Recent Signups</p>
          <Link
            href="/admin/users"
            className="text-xs text-blue-600 hover:text-blue-700 font-medium"
          >
            View all →
          </Link>
        </div>
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Plan
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Joined
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {(stats?.recentUsers ?? []).map((user) => (
              <tr
                key={user.id}
                className="border-t border-slate-50 hover:bg-slate-50 transition-colors"
              >
                <td className="px-5 py-3 text-sm text-slate-700">{user.email ?? '-'}</td>
                <td className="px-5 py-3">
                  <span
                    className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                      user.plan === 'pro'
                        ? 'bg-blue-50 text-blue-700'
                        : user.plan === 'agency'
                          ? 'bg-purple-50 text-purple-700'
                          : user.plan === 'trial'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {user.plan || 'free'}
                  </span>
                </td>
                <td className="px-5 py-3 text-sm text-slate-500">
                  {new Date(user.created_at).toLocaleDateString()}
                </td>
                <td className="px-5 py-3">
                  <Link
                    href="/admin/users"
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Manage →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
