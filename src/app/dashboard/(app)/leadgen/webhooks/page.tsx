import { createClient } from '@/lib/supabase/server'
import { fetchDashboardProfile } from '@/lib/dashboard-profile'
import { resolveDashboardMode } from '@/lib/dashboard-mode'
import Link from 'next/link'
import { Lock } from 'lucide-react'
import WebhooksClient from './WebhooksClient'

export const dynamic = 'force-dynamic'

export default async function LeadgenWebhooksPage() {
  const supabase = await await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const profile = await fetchDashboardProfile(user!.id)

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <p className="text-red-600">
          Could not load your profile right now. Please refresh and try again.
        </p>
      </div>
    )
  }

  if (resolveDashboardMode(profile) !== 'leadgen') {
    return (
      <div className="p-6 md:p-8 max-w-lg mx-auto">
        <div
          className="dash-card dash-card-gradient-top rounded-2xl border border-[var(--dash-border)] p-8 shadow-[var(--dash-shadow)] text-center"
          style={{ background: 'var(--dash-card)' }}
        >
          <div className="w-14 h-14 rounded-full bg-[var(--dash-surface-hover)] flex items-center justify-center mx-auto mb-4">
            <Lock className="h-7 w-7 text-[var(--dash-muted)]" />
          </div>
          <h1 className="text-xl font-bold text-[var(--dash-text)] mb-2">
            Webhooks
          </h1>
          <p className="text-[var(--dash-muted)] mb-6">
            Webhooks are available when your dashboard mode is set to Lead Generation.
          </p>
          <Link
            href="/dashboard/settings"
            className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--dash-primary)] text-white hover:bg-[var(--dash-accent-hover)] transition-colors"
          >
            Switch to Lead Gen in Settings
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <WebhooksClient />
    </div>
  )
}

