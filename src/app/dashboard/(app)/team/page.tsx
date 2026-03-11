'use client'

export const dynamic = 'force-dynamic'

import { useState, useEffect } from 'react'
import { usePlan } from '@/hooks/usePlan'
import { FeatureGate } from '@/components/FeatureGate'

export default function TeamPage() {
  const { plan } = usePlan()
  const [members, setMembers] = useState<
    Array<{
      id: string
      member_email: string
      role: string
      status: string
    }>
  >([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState('viewer')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetch('/api/team')
      .then((r) => r.json())
      .then((d) => setMembers(d.members ?? []))
      .catch(() => setMembers([]))
  }, [])

  const inviteMember = async () => {
    if (!inviteEmail) return
    setLoading(true)
    setError(null)
    const res = await fetch('/api/team/invite', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
    })
    const data = await res.json()
    if (res.ok && data.success) {
      setInviteEmail('')
      setMembers(data.members ?? members)
    } else {
      setError(data.error ?? 'Failed to invite')
    }
    setLoading(false)
  }

  const removeMember = async (memberId: string) => {
    const res = await fetch('/api/team/remove', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ memberId }),
    })
    if (res.ok) {
      setMembers((m) => m.filter((x) => x.id !== memberId))
    }
  }

  return (
    <FeatureGate feature="team_members" requiredPlan="agency">
      <div className="p-6 max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-[var(--dash-text)] mb-1">
          Team Members
        </h1>
        <p className="text-[var(--dash-muted)] mb-6">
          Invite team members to collaborate on your TrackHive account.
        </p>

        {/* Invite form */}
        <div className="dash-card rounded-xl p-6 mb-6">
          <h2 className="font-semibold text-[var(--dash-text)] mb-4">
            Invite Member
          </h2>
          <div className="flex gap-3 flex-wrap">
            <input
              type="email"
              placeholder="colleague@company.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              className="flex-1 min-w-[200px] border border-[var(--dash-border)] rounded-lg px-3 py-2 text-sm bg-[var(--dash-surface)] text-[var(--dash-text)] placeholder:text-[var(--dash-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] focus:border-transparent"
            />
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="border border-[var(--dash-border)] rounded-lg px-3 py-2 text-sm bg-[var(--dash-surface)] text-[var(--dash-text)] focus:outline-none focus:ring-2 focus:ring-[var(--dash-primary)] focus:border-transparent"
            >
              <option value="viewer">Viewer</option>
              <option value="admin">Admin</option>
            </select>
            <button
              onClick={inviteMember}
              disabled={loading}
              className="bg-[var(--dash-primary)] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[var(--dash-primary-strong)] disabled:opacity-50 transition-colors"
            >
              {loading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
          {error && (
            <p className="text-sm text-[var(--dash-danger)] mt-2">{error}</p>
          )}
          <p className="text-xs text-[var(--dash-muted)] mt-2">
            They will receive an email invitation to join your team. Max 5
            members.
          </p>
        </div>

        {/* Members list */}
        <div className="dash-card rounded-xl p-6">
          <h2 className="font-semibold text-[var(--dash-text)] mb-4">
            Members ({members.length}/5)
          </h2>
          {members.length === 0 ? (
            <p className="text-[var(--dash-muted)] text-sm">
              No team members yet. Invite someone above.
            </p>
          ) : (
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between py-2 border-b border-[var(--dash-border)] last:border-0"
                >
                  <div>
                    <p className="font-medium text-[var(--dash-text)] text-sm">
                      {member.member_email}
                    </p>
                    <p className="text-xs text-[var(--dash-muted)] capitalize">
                      {member.role} · {member.status}
                    </p>
                  </div>
                  <button
                    onClick={() => removeMember(member.id)}
                    className="text-[var(--dash-danger)] hover:text-[var(--dash-danger-strong)] text-xs font-medium transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </FeatureGate>
  )
}
