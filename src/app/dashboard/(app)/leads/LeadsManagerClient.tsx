'use client'

import Link from 'next/link'
import { useState } from 'react'

type Lead = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  source_url?: string | null
  event_name?: string | null
  value?: number | null
  currency?: string | null
  score?: string | null
  stage?: string | null
  meta_feedback_sent?: boolean | null
  meta_feedback_at?: string | null
  created_at?: string | null
}

export default function LeadsManagerClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [scoringLoading, setScoringLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)

  const handleScoreLead = async (leadId: string, score: string) => {
    setScoringLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, score })
      })

      if (!res.ok) throw new Error('Failed to update score')

      if (score !== 'bad') {
        const feedbackRes = await fetch('/api/leads/meta-feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ leadId, score })
        })
        if (!feedbackRes.ok) {
          const err = await feedbackRes.json().catch(() => ({}))
          console.warn('Meta feedback failed:', err)
        }
      }

      const now = new Date().toISOString()
      setSelectedLead((prev) =>
        prev?.id === leadId
          ? {
              ...prev,
              score,
              meta_feedback_sent: score !== 'bad',
              meta_feedback_at: score !== 'bad' ? now : prev.meta_feedback_at
            }
          : prev
      )
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId
            ? {
                ...l,
                score,
                meta_feedback_sent: score !== 'bad',
                meta_feedback_at: score !== 'bad' ? now : l.meta_feedback_at
              }
            : l
        )
      )

      alert(
        `Lead scored as ${score}${score !== 'bad' ? ' - Meta signal sent!' : ''}`
      )
    } catch (error) {
      console.error('Error scoring lead:', error)
      alert('Failed to score lead. Please try again.')
    } finally {
      setScoringLoading(false)
    }
  }

  const handleUpdateStage = async (leadId: string, stage: string) => {
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, stage })
      })
      if (!res.ok) throw new Error('Failed to update stage')
      setSelectedLead((prev) => (prev?.id === leadId ? { ...prev, stage } : prev))
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, stage } : l))
      )
    } catch (error) {
      console.error('Error updating stage:', error)
      alert('Failed to update stage. Please try again.')
    }
  }

  if (!leads.length) {
    return (
      <div className="rounded-xl bg-white border border-slate-100 shadow-sm p-8 text-center">
        <p className="text-slate-500">
          No leads yet. Leads appear when your tracking script captures Lead
          events.
        </p>
        <Link
          href="/dashboard/playground"
          className="text-blue-600 hover:underline font-medium mt-2 inline-block"
        >
          Send a test Lead event →
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className={selectedLead ? 'lg:col-span-2' : 'lg:col-span-3'}>
        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Meta feedback</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => (
                <tr
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                    selectedLead?.id === lead.id ? 'bg-blue-50/50' : ''
                  }`}
                >
                  <td className="px-4 py-3 text-slate-900">
                    {[lead.first_name, lead.last_name].filter(Boolean).join(' ') ||
                      '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.email ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.score ?? '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.stage ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    {lead.meta_feedback_sent ? '✓' : '—'}
                  </td>
                  <td className="px-4 py-3 text-slate-600">
                    {lead.created_at
                      ? new Date(lead.created_at).toLocaleString()
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lead Detail Panel */}
      {selectedLead && (
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-6 sticky top-6">
            <h3 className="font-bold text-slate-900 mb-4">Lead Details</h3>

            <div className="space-y-2 mb-6 text-slate-900">
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Name:</span>{' '}
                {selectedLead.first_name} {selectedLead.last_name}
              </p>
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Email:</span>{' '}
                {selectedLead.email}
              </p>
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Phone:</span>{' '}
                {selectedLead.phone || 'N/A'}
              </p>
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Source:</span>{' '}
                {selectedLead.source_url ? (
                  <a
                    href={selectedLead.source_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline truncate max-w-xs inline-block align-baseline"
                  >
                    {(() => {
                      try {
                        const u = new URL(selectedLead.source_url)
                        return u.hostname + u.pathname
                      } catch {
                        return selectedLead.source_url
                      }
                    })()}
                  </a>
                ) : (
                  <span className="text-slate-500">Direct / Unknown</span>
                )}
              </p>
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Event:</span>{' '}
                {selectedLead.event_name ?? 'N/A'}
              </p>
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Value:</span> $
                {selectedLead.value ?? 0}
              </p>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Score This Lead
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  {
                    score: 'good',
                    label: 'Good',
                    color:
                      'bg-green-50 border-green-200 text-green-700 hover:bg-green-100'
                  },
                  {
                    score: 'bad',
                    label: 'Bad',
                    color:
                      'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  },
                  {
                    score: 'hot',
                    label: 'Hot',
                    color:
                      'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100'
                  },
                  {
                    score: 'converted',
                    label: 'Converted',
                    color:
                      'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
                  }
                ].map((option) => (
                  <button
                    key={option.score}
                    onClick={() =>
                      handleScoreLead(selectedLead.id, option.score)
                    }
                    disabled={
                      scoringLoading ||
                      selectedLead.score === option.score
                    }
                    className={`border rounded-xl py-2.5 px-3 text-sm font-semibold transition-all ${option.color} ${
                      selectedLead.score === option.score
                        ? 'ring-2 ring-offset-1'
                        : ''
                    } disabled:opacity-50`}
                  >
                    {selectedLead.score === option.score ? '✓ ' : ''}
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                Funnel Stage
              </p>
              <select
                value={selectedLead.stage ?? 'new'}
                onChange={(e) =>
                  handleUpdateStage(selectedLead.id, e.target.value)
                }
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="qualified">Qualified</option>
                <option value="proposal">Proposal</option>
                <option value="converted">Converted</option>
                <option value="lost">Lost</option>
              </select>
            </div>

            {/* Platform Feedback */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Platform Feedback
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Meta CAPI</span>
                {selectedLead.meta_feedback_sent ? (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Signal sent
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">Pending score</span>
                )}
              </div>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Google Ads</span>
                {selectedLead.score === 'converted' &&
                selectedLead.meta_feedback_sent ? (
                  <span className="text-xs text-green-600 font-medium">
                    ✓ Conversion sent
                  </span>
                ) : (
                  <span className="text-xs text-slate-500">
                    {selectedLead.score === 'converted'
                      ? 'Sending...'
                      : 'Mark as Converted'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
