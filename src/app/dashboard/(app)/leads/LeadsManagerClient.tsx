'use client'

import Link from 'next/link'
import { useState, useMemo } from 'react'

type Lead = {
  id: string
  first_name?: string | null
  last_name?: string | null
  email?: string | null
  phone?: string | null
  source_url?: string | null
  source?: string | null
  source_display?: string | null
  webhook_id?: string | null
  event_name?: string | null
  value?: number | null
  currency?: string | null
  score?: string | null
  stage?: string | null
  meta_feedback_sent?: boolean | null
  meta_feedback_at?: string | null
  meta_feedback_failed?: boolean | null
  created_at?: string | null
}

const SCORE_PILL_STYLES: Record<string, string> = {
  good: 'bg-green-100 text-green-800',
  bad: 'bg-red-100 text-red-800',
  hot: 'bg-orange-100 text-orange-800',
  converted: 'bg-purple-100 text-purple-800',
  new: 'bg-slate-100 text-slate-600',
}

export default function LeadsManagerClient({ initialLeads }: { initialLeads: Lead[] }) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [scoringLoading, setScoringLoading] = useState(false)
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null)
  const [showScoreWarning, setShowScoreWarning] = useState(false)
  const [pendingScore, setPendingScore] = useState<string | null>(null)
  const [metaFeedbackSending, setMetaFeedbackSending] = useState(false)
  const [stageSavedToast, setStageSavedToast] = useState(false)

  const duplicateEmails = useMemo(() => {
    const counts = new Map<string, number>()
    leads.forEach((l) => {
      const e = (l.email ?? '').trim().toLowerCase()
      if (e) counts.set(e, (counts.get(e) ?? 0) + 1)
    })
    return new Set([...counts.entries()].filter(([, n]) => n > 1).map(([e]) => e))
  }, [leads])

  const summary = useMemo(() => {
    const total = leads.length
    const good = leads.filter((l) => l.score === 'good').length
    const bad = leads.filter((l) => l.score === 'bad').length
    const hot = leads.filter((l) => l.score === 'hot').length
    const pending = leads.filter((l) => !l.score || l.score === 'new').length
    return { total, good, bad, hot, pending }
  }, [leads])

  const handleScoreLead = async (leadId: string, score: string) => {
    const currentScore = selectedLead?.score

    // If already scored (not 'new') show warning first
    if (currentScore && currentScore !== 'new' && currentScore !== score) {
      setPendingScore(score)
      setShowScoreWarning(true)
      return
    }

    // First time scoring — proceed directly
    await submitScore(leadId, score)
  }

  const submitScore = async (leadId: string, score: string) => {
    setScoringLoading(true)
    try {
      const res = await fetch('/api/leads', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: leadId, score })
      })
      if (!res.ok) throw new Error('Failed to update score')

      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, score } : l))
      )
      setSelectedLead((prev) =>
        prev?.id === leadId ? { ...prev, score } : prev
      )

      setMetaFeedbackSending(true)
      const metaRes = await fetch('/api/leads/meta-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ leadId, score })
      })
      const metaJson = metaRes.ok ? await metaRes.json() : null
      const now = metaJson?.meta_feedback_at ?? new Date().toISOString()

      if (!metaRes.ok) {
        setSelectedLead((prev) =>
          prev?.id === leadId
            ? { ...prev, meta_feedback_failed: true }
            : prev
        )
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId ? { ...l, meta_feedback_failed: true } : l
          )
        )
      } else {
        setSelectedLead((prev) =>
          prev?.id === leadId
            ? {
                ...prev,
                meta_feedback_sent: true,
                meta_feedback_at: now,
                meta_feedback_failed: false
              }
            : prev
        )
        setLeads((prev) =>
          prev.map((l) =>
            l.id === leadId
              ? {
                  ...l,
                  meta_feedback_sent: true,
                  meta_feedback_at: now,
                  meta_feedback_failed: false
                }
              : l
          )
        )
      }
    } catch (error) {
      console.error('Error scoring lead:', error)
      setSelectedLead((prev) =>
        prev?.id === leadId
          ? { ...prev, meta_feedback_failed: true }
          : prev
      )
      setLeads((prev) =>
        prev.map((l) =>
          l.id === leadId ? { ...l, meta_feedback_failed: true } : l
        )
      )
      alert('Failed to score lead. Please try again.')
    } finally {
      setScoringLoading(false)
      setMetaFeedbackSending(false)
      setShowScoreWarning(false)
      setPendingScore(null)
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
      setStageSavedToast(true)
      setTimeout(() => setStageSavedToast(false), 2000)
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
        {/* Quality Summary Bar */}
        <div className="flex flex-wrap items-center gap-4 mb-4 p-3 rounded-xl bg-slate-50 border border-slate-100 text-sm">
          <span className="font-medium text-slate-700">
            Total: <span className="text-slate-900">{summary.total}</span>
          </span>
          <span className="text-slate-500">|</span>
          <span>
            Good: <span className="font-semibold text-green-700">{summary.good}</span>
            {summary.total > 0 && (
              <span className="text-slate-500 ml-0.5">
                ({Math.round((summary.good / summary.total) * 100)}%)
              </span>
            )}
          </span>
          <span>
            Bad: <span className="font-semibold text-red-700">{summary.bad}</span>
            {summary.total > 0 && (
              <span className="text-slate-500 ml-0.5">
                ({Math.round((summary.bad / summary.total) * 100)}%)
              </span>
            )}
          </span>
          <span>
            Hot: <span className="font-semibold text-orange-700">{summary.hot}</span>
          </span>
          <span>
            Pending: <span className="font-semibold text-slate-600">{summary.pending}</span>
          </span>
        </div>

        <div className="rounded-xl bg-white border border-slate-100 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-slate-500">
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Phone</th>
                <th className="px-4 py-3 font-medium">Score</th>
                <th className="px-4 py-3 font-medium">Stage</th>
                <th className="px-4 py-3 font-medium">Meta feedback</th>
                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>
            <tbody>
              {leads.map((lead) => {
                const scoreVal = lead.score ?? 'new'
                const metaStatus =
                  lead.meta_feedback_failed
                    ? 'failed'
                    : lead.meta_feedback_sent
                      ? 'sent'
                      : 'pending'
                const isDuplicate = lead.email
                  ? duplicateEmails.has(String(lead.email).trim().toLowerCase())
                  : false
                return (
                  <tr
                    key={lead.id}
                    onClick={() => setSelectedLead(lead)}
                    className={`border-b border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors ${
                      selectedLead?.id === lead.id ? 'bg-blue-50/50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-slate-900">
                      <span className="inline-flex items-center gap-1.5 flex-wrap">
                        {[lead.first_name, lead.last_name].filter(Boolean).join(' ') || '—'}
                        {lead.source === 'webhook' && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title={lead.source_display ?? 'Webhook'}>
                            Webhook{lead.source_display ? `: ${lead.source_display}` : ''}
                          </span>
                        )}
                        {isDuplicate && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                            Duplicate
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.email ?? '—'}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.phone ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          SCORE_PILL_STYLES[scoreVal] ?? SCORE_PILL_STYLES.new
                        }`}
                      >
                        {scoreVal === 'new' ? 'New' : scoreVal.charAt(0).toUpperCase() + scoreVal.slice(1)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.stage ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      {metaStatus === 'sent' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          Sent
                        </span>
                      )}
                      {metaStatus === 'pending' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-600">
                          Pending
                        </span>
                      )}
                      {metaStatus === 'failed' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {lead.created_at
                        ? new Date(lead.created_at).toLocaleString()
                        : '—'}
                    </td>
                  </tr>
                )
              })}
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
              {(selectedLead.source === 'webhook' || selectedLead.source_url) && (
              <p className="text-sm text-slate-900">
                <span className="text-slate-600 font-medium">Source:</span>{' '}
                {selectedLead.source === 'webhook' ? (
                  <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    Webhook{selectedLead.source_display ? ` — ${selectedLead.source_display}` : ''}
                  </span>
                ) : selectedLead.source_url ? (
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
              )}
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
              {stageSavedToast && (
                <p className="mt-1.5 text-xs font-medium text-green-600">Saved</p>
              )}
            </div>

            {/* Platform Feedback */}
            <div className="bg-slate-50 rounded-xl p-3 space-y-2">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Platform Feedback
              </p>

              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-600">Meta CAPI</span>
                {metaFeedbackSending ? (
                  <span className="text-xs text-slate-500 font-medium">
                    Sending...
                  </span>
                ) : selectedLead.meta_feedback_failed ? (
                  <span className="text-xs text-red-600 font-medium">
                    Failed — retry
                  </span>
                ) : selectedLead.meta_feedback_sent ? (
                  <span className="text-xs text-green-600 font-medium">
                    Sent ✓ {selectedLead.meta_feedback_at
                      ? new Date(selectedLead.meta_feedback_at).toLocaleTimeString()
                      : ''}
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

      {/* Score Change Warning Dialog */}
      {showScoreWarning && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-slate-900">Change Lead Score?</h3>
                <p className="text-xs text-slate-500">This lead has already been scored</p>
              </div>
            </div>

            <p className="text-sm text-slate-600 mb-2">
              Changing the score from <span className="font-semibold text-slate-900">{selectedLead?.score}</span> to <span className="font-semibold text-slate-900">{pendingScore}</span> will send a new signal to Meta CAPI.
            </p>

            <p className="text-sm text-amber-600 bg-amber-50 rounded-xl p-3 mb-5">
              ⚠️ Sending multiple conflicting signals for the same lead may confuse Meta&apos;s optimization algorithm.
            </p>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowScoreWarning(false)
                  setPendingScore(null)
                }}
                className="flex-1 border border-slate-200 rounded-xl py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => selectedLead && pendingScore && submitScore(selectedLead.id, pendingScore)}
                disabled={scoringLoading}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-white rounded-xl py-2.5 text-sm font-semibold transition-colors disabled:opacity-50"
              >
                {scoringLoading ? 'Updating...' : 'Yes Change It'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
