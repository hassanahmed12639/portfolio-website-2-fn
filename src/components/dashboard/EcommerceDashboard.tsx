'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function EcommerceDashboard({ profile }: { profile: Record<string, unknown> | null }) {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [recentEvents, setRecentEvents] = useState<Array<{ id: string; event_name: string; value?: number; created_at: string; meta_status?: string }>>([])
  const [loading, setLoading] = useState(true)
  const [firstPixelId, setFirstPixelId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/dashboard/events?limit=5').then(r => r.json()),
      fetch('/api/pixels').then(r => r.json())
    ]).then(([statsData, eventsData, pixelsData]) => {
      setStats(statsData)
      const events = (eventsData.events as Array<{ id: string; event_name: string; value?: number; created_at: string; meta_status?: string }>) || []
      setRecentEvents(events.slice(0, 5))
      const pixels = pixelsData?.pixels ?? []
      const first = pixels.find((p: { platform: string }) => p.platform === 'meta') ?? pixels[0]
      setFirstPixelId(first?.pixel_id ?? null)
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6 md:p-8">
      {/* Welcome header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back{profile?.business_name ? `, ${String(profile.business_name)}` : ''}!
          </h1>
          <p className="text-sm text-slate-500">Here&apos;s your e-commerce tracking overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs border px-2.5 py-1 rounded-full font-semibold bg-[var(--dash-primary-soft)] text-[var(--dash-primary-strong)] border-[var(--dash-accent-border)]">
            E-Commerce
          </span>
          <Link
            href="/dashboard/settings"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Switch mode
          </Link>
        </div>
      </div>

      {/* Row 1 — Key ecom metrics (overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          {
            label: 'Total Revenue Tracked',
            value: loading ? '...' : `$${Number(stats?.totalRevenue ?? 0).toLocaleString()}`,
            color: 'bg-[var(--dash-success-soft)] border-[var(--dash-success-border)]',
            textColor: 'text-[var(--dash-success-strong)]'
          },
          {
            label: 'Purchases',
            value: loading ? '...' : Number(stats?.purchases ?? 0),
            color: 'bg-[var(--dash-primary-soft)] border-[var(--dash-accent-border)]',
            textColor: 'text-[var(--dash-primary-strong)]'
          },
          {
            label: 'Events This Month',
            value: loading ? '...' : Number(stats?.totalEvents ?? 0).toLocaleString(),
            color: 'bg-[var(--dash-card)] border-[var(--dash-border)]',
            textColor: 'text-slate-900'
          },
          {
            label: 'Match Rate',
            value: loading ? '...' : `${stats?.matchRate ?? 0}%`,
            color: 'bg-[var(--dash-primary-soft)] border-[var(--dash-accent-border)]',
            textColor: 'text-[var(--dash-primary-strong)]'
          }
        ].map(stat => (
          <div key={stat.label} className={`dash-card dash-card-gradient-top ${stat.color} rounded-2xl border p-5 shadow-[var(--dash-shadow)]`}>
            <p className={`text-2xl font-bold ${stat.textColor}`}>{String(stat.value)}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Platform status */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { name: 'Meta CAPI', status: 'connected', events: Number(stats?.metaEvents ?? 0) },
          { name: 'TikTok Events API', status: 'connected', events: Number(stats?.tiktokEvents ?? 0) },
          { name: 'Google Enhanced', status: 'connected', events: Number(stats?.googleEvents ?? 0) }
        ].map(platform => (
          <div key={platform.name} className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] p-5 shadow-[var(--dash-shadow)]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-slate-900 text-sm">{platform.name}</p>
              </div>
              <span className="text-xs bg-[var(--dash-success-soft)] text-[var(--dash-success-strong)] px-2 py-0.5 rounded-full font-semibold">
                Live
              </span>
            </div>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : platform.events.toLocaleString()}</p>
            <p className="text-xs text-slate-400 mt-1">Events sent this month</p>
          </div>
        ))}
      </div>

      {/* Row 3 — Quick actions for ecom */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Recent events */}
        <div className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-center justify-between" style={{ background: 'var(--dash-gradient-header)' }}>
            <p className="font-semibold text-slate-900">Recent Events</p>
            <Link href="/dashboard/logs" className="text-xs font-medium text-[var(--dash-primary-strong)] hover:text-[var(--dash-primary)]">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-8 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : recentEvents.length === 0 ? (
              <div className="p-6 text-center text-slate-400 text-sm">No events yet</div>
            ) : recentEvents.map(event => (
              <div key={event.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">{event.event_name}</p>
                  <p className="text-xs text-slate-400">{new Date(event.created_at).toLocaleTimeString()}</p>
                </div>
                <div className="flex items-center gap-2">
                  {event.value != null && event.value > 0 && (
                    <span className="text-xs font-semibold text-[var(--dash-success-strong)] bg-[var(--dash-success-soft)] px-2 py-0.5 rounded-full">
                      ${event.value}
                    </span>
                  )}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    event.meta_status === 'sent' ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary-strong)]' : 'bg-slate-100 text-slate-400'
                  }`}>Meta</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Ecom quick actions */}
        <div className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] p-5 shadow-[var(--dash-shadow)]">
          <p className="font-semibold text-slate-900 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { href: '/dashboard/playground', label: 'Test an Event', desc: 'Fire a test Purchase or PageView' },
              { href: '/dashboard/pixels', label: 'Manage Pixels', desc: 'Add or configure your pixels' },
              { href: '/dashboard/data-quality', label: 'Check Match Rate', desc: 'See your Meta match rate' },
              { href: '/dashboard/live', label: 'Live Stream', desc: 'Watch events in real-time' },
              { href: '/dashboard/validator', label: 'Validate Payload', desc: 'Check your event data quality' },
              { href: '/dashboard/billing', label: 'Upgrade Plan', desc: 'Unlock more events per month' }
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-primary-soft)] rounded-xl transition-colors group"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
                <span className="text-slate-300 group-hover:text-[var(--dash-primary)] group-hover:translate-x-0.5 transition-all">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 — Ecom specific: Data quality + Install snippet */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Data quality card */}
        <div className="dash-card-hero rounded-xl p-5 border border-[var(--dash-border)]" style={{ background: 'linear-gradient(135deg, rgba(170,255,0,0.2) 0%, rgba(170,255,0,0.06) 50%, rgba(15,15,15,0.04) 100%)' }}>
          <p className="font-bold text-lg mb-1 text-slate-900">Data Quality Score</p>
          <p className="text-slate-600 text-sm mb-4">Your current Meta match rate</p>
          <p className="text-5xl font-black mb-1 text-slate-900">{loading ? '...' : `${stats?.matchRate ?? 0}%`}</p>
          <p className="text-slate-600 text-xs mb-4">
            {Number(stats?.matchRate ?? 0) >= 70 ? 'Good' : Number(stats?.matchRate ?? 0) >= 50 ? 'Average' : 'Needs improvement'}
          </p>
          <Link
            href="/dashboard/data-quality"
            className="bg-[var(--dash-primary)] hover:bg-[var(--dash-accent-hover)] text-[#0F0F0F] text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Improve Score →
          </Link>
        </div>

        {/* Install snippet */}
        <div className="dash-card bg-[#0F0F0F] rounded-xl p-5 border border-slate-700">
          <p className="font-bold mb-1 text-black">Install Tracking Script</p>
          <p className="text-slate-400 text-sm mb-3">Add to your website&apos;s &lt;head&gt; tag</p>
          <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-white mb-3 overflow-x-auto">
            {`<script src="https://track.itshassanahmed.com/th.js?id=${firstPixelId || 'YOUR_PIXEL_ID'}"></script>`}
          </div>
          <Link
            href="/dashboard/pixels"
            className="bg-[var(--dash-primary)] hover:bg-[var(--dash-accent-hover)] text-[#0F0F0F] text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Get Your Pixel ID →
          </Link>
        </div>
      </div>
    </div>
  )
}
