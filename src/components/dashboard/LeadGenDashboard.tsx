'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

type Lead = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  score?: string
  meta_feedback_sent?: boolean
}

const SCORE_CONFIG: Record<string, { emoji: string; color: string }> = {
  new: { emoji: '🔵', color: 'bg-slate-100 text-slate-600' },
  good: { emoji: '✅', color: 'bg-green-50 text-green-700' },
  bad: { emoji: '❌', color: 'bg-red-50 text-red-600' },
  hot: { emoji: '🔥', color: 'bg-orange-50 text-orange-700' },
  converted: { emoji: '💰', color: 'bg-purple-50 text-purple-700' }
}

export default function LeadGenDashboard({ profile }: { profile: Record<string, unknown> | null }) {
  const [stats, setStats] = useState<Record<string, unknown> | null>(null)
  const [recentLeads, setRecentLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      fetch('/api/dashboard/stats').then(r => r.json()),
      fetch('/api/leads?limit=5').then(r => r.json())
    ]).then(([statsData, leadsData]) => {
      setStats(statsData)
      setRecentLeads((leadsData.leads as Lead[]) || [])
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6 md:p-8">
      {/* Welcome header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">
            Welcome back{profile?.business_name ? `, ${String(profile.business_name)}` : ''}! 👋
          </h1>
          <p className="text-sm text-slate-500">Here&apos;s your lead generation overview</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-orange-50 text-orange-700 border border-orange-100 px-2.5 py-1 rounded-full font-semibold">
            🎯 Lead Gen
          </span>
          <Link
            href="/dashboard/settings"
            className="text-xs text-slate-400 hover:text-slate-600"
          >
            Switch mode
          </Link>
        </div>
      </div>

      {/* Row 1 — Lead stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {[
          { label: 'Total Leads', value: stats?.totalLeads ?? 0, icon: '👤', color: 'bg-white border-slate-100' },
          { label: '🔥 Hot Leads', value: stats?.hotLeads ?? 0, icon: '🔥', color: 'bg-orange-50 border-orange-100' },
          { label: '✅ Good Leads', value: stats?.goodLeads ?? 0, icon: '✅', color: 'bg-green-50 border-green-100' },
          { label: '💰 Converted', value: stats?.convertedLeads ?? 0, icon: '💰', color: 'bg-purple-50 border-purple-100' },
          { label: 'Meta Signals Sent', value: stats?.metaFeedbackSent ?? 0, icon: '📘', color: 'bg-blue-50 border-blue-100' }
        ].map(stat => (
          <div key={stat.label} className={`${stat.color} rounded-xl border p-4 shadow-sm`}>
            <p className="text-2xl font-bold text-slate-900">{loading ? '...' : Number(stat.value)}</p>
            <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Row 2 — Funnel visualization */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-6">
        <div className="flex items-center justify-between mb-4">
          <p className="font-semibold text-slate-900">Lead Funnel</p>
          <Link href="/dashboard/leads" className="text-xs text-blue-600">Manage leads →</Link>
        </div>
        <div className="flex items-center gap-2">
          {[
            { stage: 'New', count: stats?.stageNew ?? 0, color: 'bg-slate-200' },
            { stage: 'Contacted', count: stats?.stageContacted ?? 0, color: 'bg-blue-300' },
            { stage: 'Qualified', count: stats?.stageQualified ?? 0, color: 'bg-yellow-300' },
            { stage: 'Proposal', count: stats?.stageProposal ?? 0, color: 'bg-orange-300' },
            { stage: 'Converted', count: stats?.stageConverted ?? 0, color: 'bg-green-400' }
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
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <p className="font-semibold text-slate-900">Recent Leads</p>
            <Link href="/dashboard/leads" className="text-xs text-blue-600 hover:text-blue-700">View all →</Link>
          </div>
          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="p-4 space-y-2">
                {[1, 2, 3].map(i => <div key={i} className="h-10 bg-slate-100 rounded animate-pulse" />)}
              </div>
            ) : recentLeads.length === 0 ? (
              <div className="p-6 text-center">
                <p className="text-3xl mb-2">👤</p>
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
                      {SCORE_CONFIG[lead.score]?.emoji ?? '•'} {lead.score}
                    </span>
                  )}
                  {lead.meta_feedback_sent && (
                    <span className="text-xs text-green-600">📘</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Lead gen quick actions */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <p className="font-semibold text-slate-900 mb-4">Quick Actions</p>
          <div className="space-y-2">
            {[
              { href: '/dashboard/leads', icon: '👤', label: 'Lead Manager', desc: 'Score and manage your leads' },
              { href: '/dashboard/playground', icon: '🧪', label: 'Send Test Lead', desc: 'Fire a test Lead event' },
              { href: '/dashboard/logs', icon: '📋', label: 'Event Logs', desc: 'See all captured events' },
              { href: '/dashboard/pixels', icon: '📡', label: 'Manage Pixels', desc: 'Configure your tracking pixels' },
              { href: '/dashboard/live', icon: '🔴', label: 'Live Stream', desc: 'Watch leads come in real-time' },
              { href: '/dashboard/billing', icon: '💳', label: 'Upgrade Plan', desc: 'Unlock more leads per month' }
            ].map(action => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-orange-50 rounded-xl transition-colors group"
              >
                <span className="text-lg">{action.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{action.label}</p>
                  <p className="text-xs text-slate-400">{action.desc}</p>
                </div>
                <span className="text-slate-300 group-hover:text-orange-500 group-hover:translate-x-0.5 transition-all">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Row 4 — Meta feedback loop explainer + install */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

        {/* Meta feedback loop */}
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-5 text-white">
          <p className="font-bold text-lg mb-1">📘 Meta Feedback Loop</p>
          <p className="text-blue-200 text-sm mb-4">Send lead quality signals back to Meta</p>
          <div className="space-y-2 mb-4">
            {[
              { label: 'Signals sent this month', value: loading ? '...' : (stats?.metaFeedbackSent ?? 0) },
              { label: 'Conversion rate', value: loading ? '...' : `${stats?.conversionRate ?? 0}%` }
            ].map(item => (
              <div key={item.label} className="flex justify-between text-sm">
                <span className="text-blue-200">{item.label}</span>
                <span className="font-bold">{String(item.value)}</span>
              </div>
            ))}
          </div>
          <Link
            href="/dashboard/leads"
            className="bg-white/20 hover:bg-white/30 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            Score Your Leads →
          </Link>
        </div>

        {/* Install snippet */}
        <div className="bg-slate-900 rounded-xl p-5 text-white">
          <p className="font-bold mb-1">🔧 Capture Leads from Your Website</p>
          <p className="text-slate-400 text-sm mb-3">Fire Lead events from your form submissions</p>
          <div className="bg-slate-800 rounded-lg p-3 font-mono text-xs text-green-400 mb-3 overflow-x-auto">
            {`trackhive('track', 'Lead', {
  email: 'user@email.com',
  phone: '+1234567890'
});`}
          </div>
          <Link
            href="/docs"
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors inline-block"
          >
            View Documentation →
          </Link>
        </div>
      </div>
    </div>
  )
}
