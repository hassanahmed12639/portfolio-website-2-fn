import { createClient } from '@/lib/supabase/server'
import { resolveDashboardMode } from '@/lib/dashboard-mode'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Lock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function WebhooksPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.user) redirect('/dashboard/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('dashboard_type, business_type')
    .eq('id', session.user.id)
    .single()

  if (resolveDashboardMode(profile) === 'leadgen') {
    redirect('/dashboard/leadgen/webhooks')
  }

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
          Webhooks are available for lead gen campaigns only. Switch to your
          lead gen dashboard to use this feature.
        </p>
        <Link
          href="/dashboard/settings"
          className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-semibold bg-[var(--dash-primary)] text-black hover:bg-[var(--dash-accent-hover)] transition-colors"
        >
          Go to Lead Gen Dashboard
        </Link>
        <p className="text-xs text-[var(--dash-muted)] mt-4">
          In Settings, set your dashboard mode to &quot;Lead Generation&quot; to
          access Webhooks and Lead Manager.
        </p>
      </div>
    </div>
  )
}
