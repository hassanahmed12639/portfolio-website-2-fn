'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePlan } from '@/hooks/usePlan'

type Lead = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  score?: string
  meta_feedback_sent?: boolean
}

const SCORE_CONFIG: Record<string, { color: string }> = {
  new: { color: 'bg-slate-100 text-slate-600' },
  good: { color: 'bg-green-50 text-green-700' },
  bad: { color: 'bg-red-50 text-red-600' },
  hot: { color: 'bg-orange-50 text-orange-700' },
  converted: { color: 'bg-purple-50 text-purple-700' }
}

export default function LeadGenDashboard({ profile }: { profile: Record<string, unknown> | null }) {
  const {
    eventsThisMonth,
    eventsLimit,
    eventsPercent,
    isNearLimit,
    isAtLimit,
    isUnlimited,
    plan,
  } = usePlan()
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  const [firstPixelId, setFirstPixelId] = useState<string | null>(null)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/leads?limit=5').then(r => r.json()),
      fetch('/api/pixels').then(r => r.json())
    ]).then(([statsData, leadsData, pixelsData]) => {
      setStats(statsData)
      setRecentLeads((leadsData.leads as Lead[]) || [])
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
            Welcome back{profile?.business_name ? `, ${String(profile.business_name)}` : ''}
          </h1>
          <p className="text-sm text-slate-500">Here&apos;s your lead generation overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-[var(--dash-primary-soft)] text-[var(--dash-primary-strong)] border border-[var(--dash-accent-border)] px-2.5 py-1 rounded-full font-semibold">
            Lead Gen
          </span>
          <Link
            href="/dashboard/settings"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Switch mode
          </Link>
        </div>
      </div>

      {/* Events Usage Bar */}
      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-slate-100 dark:border-zinc-800 p-6 mb-6">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Events This Month
            </h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400">
              {isUnlimited
                ? 'Unlimited'
                : `${eventsThisMonth.toLocaleString()} / ${eventsLimit.toLocaleString()}`}
            </p>
          </div>
          {!isUnlimited && isNearLimit && !isAtLimit && (
            <Link
              href="/dashboard/billing"
              className="bg-orange-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-orange-600"
            >
              Upgrade Plan
            </Link>
          )}
          {!isUnlimited && isAtLimit && (
            <Link
              href="/dashboard/billing"
              className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-red-600"
            >
              Limit Reached!
            </Link>
          )}
        </div>
        {!isUnlimited && (
          <div className="w-full bg-slate-100 dark:bg-zinc-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-orange-400' : 'bg-blue-500'
              }`}
              style={{ width: `${eventsPercent}%` }}
            />
          </div>
        )}
        <p className="text-xs text-slate-400 dark:text-zinc-500 mt-2 capitalize">
          Current plan: {plan} ·{' '}
          <Link href="/dashboard/billing" className="text-blue-500 hover:underline">
            Upgrade
          </Link>
        </p>
      </div>

      {/* Row 1 — Lead stats + Events this month + Match rate */}
      <div className="grid grid-cols-2 lg:grid-cols-7 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: stats?.totalLeads ?? 0, color: 'bg-[var(--dash-card)] border-[var(--dash-border)]' },
          { label: 'Hot Leads', value: stats?.hotLeads ?? 0, color: 'bg-[var(--dash-primary-soft)] border-[var(--dash-accent-border)]' },
          { label: 'Good Leads', value: stats?.goodLeads ?? 0, color: 'bg-[var(--dash-success-soft)] border-[var(--dash-success-border)]' },
          { label: 'Converted', value: stats?.convertedLeads ?? 0, color: 'bg-[var(--dash-primary-soft)] border-[var(--dash-accent-border)]' },
          { label: 'Meta Signals Sent', value: stats?.metaFeedbackSent ?? 0, color: 'bg-[var(--dash-card)] border-[var(--dash-border)]' },
          { label: 'Events This Month', value: Number(stats?.totalEvents ?? 0).toLocaleString(), color: 'bg-[var(--dash-card)] border-[var(--dash-border)]' },
          { label: 'Match Rate', value: `${stats?.matchRate ?? 0}%`, color: 'bg-[var(--dash-primary-soft)] border-[var(--dash-accent-border)]' }
        ].map(stat => (
          <div key={stat.label} className={`dash-card dash-card-gradient-top ${stat.color} rounded-2xl border p-4 shadow-[var(--dash-shadow)]`}>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : String(stat.value)}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Platform status: Meta CAPI, TikTok Events API, Google Enhanced */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        {[
          { name: 'Meta CAPI', status: 'connected', events: Number(stats?.metaEvents ?? 0) },
          { name: 'TikTok Events API', status: 'connected', events: Number(stats?.tiktokEvents ?? 0) },
          { name: 'Google Enhanced Data Quality', status: 'connected', events: Number(stats?.googleEvents ?? 0) }
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

      {/* Row 2 — Funnel visualization */}
      <div className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] p-5 shadow-[var(--dash-shadow)] mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-slate-900">Lead Funnel</p>
          <Link href="/dashboard/leads" className="text-xs font-medium text-[var(--dash-primary-strong)] hover:text-[var(--dash-primary)]">Manage leads →</Link>
        </div>
        <div className="flex items-center gap-2">
          {[
            { stage: 'New', count: stats?.stageNew ?? 0, color: 'bg-slate-200' },
            { stage: 'Contacted', count: stats?.stageContacted ?? 0, color: 'bg-[var(--dash-primary-soft-strong)]' },
            { stage: 'Qualified', count: stats?.stageQualified ?? 0, color: 'bg-[var(--dash-primary-soft)]' },
            { stage: 'Proposal', count: stats?.stageProposal ?? 0, color: 'bg-[var(--dash-primary-soft-strong)]' },
            { stage: 'Converted', count: stats?.stageConverted ?? 0, color: 'bg-[var(--dash-success-soft)]' }
          ].map((stage) => (
            <div key={stage.stage} className="flex-1 text-center">
              <div className={`${stage.color} rounded-lg py-3 mb-2`}>
                <p className="font-bold text-slate-900 text-lg">{loading ? '...' : Number(stage.count)}</p>
              </div>
              <p className="text-xs text-slate-500">{stage.stage}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Row 3 — Recent leads + Quick actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">

        {/* Recent leads */}
        <div className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] shadow-[var(--dash-shadow)] overflow-hidden">
          <div className="px-5 py-4 border-b border-[var(--dash-border)] flex items-center justify-between" style={{ background: 'var(--dash-gradient-header)' }}>
            <p className="font-semibold text-slate-900">Recent Leads</p>
            <Link href="/dashboard/leads" className="text-xs font-medium text-[var(--dash-primary-strong)] hover:text-[var(--dash-primary)]">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="p-6 text-center">
                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                  <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <p className="text-sm text-slate-500">No leads yet</p>
                <p className="text-xs text-slate-400 mt-1">Leads appear when your tracking script captures Lead events</p>
              </div>
            ) : recentLeads.map(lead => (
              <div key={lead.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    {lead.first_name ? `${lead.first_name} ${lead.last_name || ''}`.trim() : lead.email || 'Anonymous'}
                  </p>
                  <p className="text-xs text-slate-400">{lead.email || lead.phone || 'No contact info'}</p>
                </div>
                <div className="flex items-center gap-2">
                  {lead.score && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${SCORE_CONFIG[lead.score]?.color ?? 'bg-slate-100 text-slate-600'}`}>
                      {lead.score}
                    </span>
                  )}
                  {lead.meta_feedback_sent && (
                    <svg className="w-4 h-4 text-green-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead gen quick actions */}
        <div className="dash-card dash-card-gradient-top bg-[var(--dash-card)] rounded-2xl border border-[var(--dash-border)] p-5 shadow-[var(--dash-shadow)]">
          <p className="font-semibold text-slate-900 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { href: '/dashboard/leads', icon: 'user', label: 'Lead Manager', desc: 'Score and manage your leads' },
              { href: '/dashboard/playground', icon: 'flask', label: 'Send Test Lead', desc: 'Fire a test Lead event' },
              { href: '/dashboard/logs', icon: 'clipboard', label: 'Event Logs', desc: 'See all captured events' },
              { href: '/dashboard/pixels', icon: 'settings', label: 'Manage Pixels', desc: 'Add or configure your pixels' },
              { href: '/dashboard/data-quality', icon: 'chart', label: 'Check Match Rate', desc: 'See your Meta match rate' },
              { href: '/dashboard/live', icon: 'live', label: 'Live Stream', desc: 'Watch leads come in real-time' },
              { href: '/dashboard/billing', icon: 'upgrade', label: 'Upgrade Plan', desc: 'Unlock more leads per month' }
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 bg-[var(--dash-surface-hover)] hover:bg-[var(--dash-primary-soft)] rounded-xl transition-colors group"
              >
                <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center border border-slate-100 shrink-0">
                  {action.icon === 'user' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  )}
                  {action.icon === 'flask' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                  )}
                  {action.icon === 'clipboard' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  )}
                  {action.icon === 'settings' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                  {action.icon === 'chart' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  )}
                  {action.icon === 'live' && (
                    <span className="w-2.5 h-2.5 bg-red-500 rounded-full" />
                  )}
                  {action.icon === 'upgrade' && (
                    <svg className="w-4 h-4 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-700">{action.desc}</p>
                </div>
                <span className="text-slate-300 group-hover:text-[var(--dash-primary)] group-hover:translate-x-0.5 transition-all">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 — Meta match rate (Data Quality) + Install Tracking Script */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Meta match rate / Data quality */}
        <div className="dash-card-hero rounded-xl p-5 border border-[var(--dash-border)]" style={{ background: 'linear-gradient(135deg, rgba(170,255,0,0.2) 0%, rgba(170,255,0,0.06) 50%, rgba(15,15,15,0.04) 100%)' }}>
          <p className="font-bold text-lg mb-1 text-slate-900">Data Quality Score</p>
          <p className="text-slate-600 text-sm mb-4">Your current Meta match rate</p>
          <p className="text-5xl font-black mb-1 text-slate-900">{loading ? '...' : `${stats?.matchRate ?? 0}%`}</p>
          <p className="text-slate-600 text-xs mb-4">
            {Number(stats?.matchRate ?? 0) >= 70 ? 'Good' : Number(stats?.matchRate ?? 0) >= 50 ? 'Average' : 'Needs improvement'}
          </p>
          <Link
            href="/dashboard/data-quality"
            className="bg-[var(--dash-primary)] hover:bg-[var(--dash-accent-hover)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Improve Score →
          </Link>
        </div>

        {/* Install Tracking Script */}
        <div className="dash-card bg-[#0F0F0F] rounded-xl p-5 border border-slate-700">
          <p className="font-bold mb-1 text-white">Install Tracking Script</p>
          <p className="text-slate-400 text-sm mb-3">Add to your website&apos;s &lt;head&gt; tag</p>
          <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-white mb-3 overflow-x-auto">
            {`<script src="https://track.itshassanahmed.com/th.js?id=${firstPixelId || 'YOUR_PIXEL_ID'}"></script>`}
          </div>
          <Link
            href="/dashboard/pixels"
            className="bg-[var(--dash-primary)] hover:bg-[var(--dash-accent-hover)] text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Get Your Pixel ID →
          </Link>
        </div>
      </div>
    </div>
  )
}
