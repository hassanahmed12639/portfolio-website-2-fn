import { createClient } from '@/lib/supabase/server'
import { resolveDashboardMode } from '@/lib/dashboard-mode'
import Link from 'next/link'
import WebhooksClient from './WebhooksClient'

export const dynamic = 'force-dynamic'

export default async function LeadgenWebhooksPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('dashboard_type, business_type')
    .eq('id', user!.id)
    .single()

  if (resolveDashboardMode(profile) !== 'leadgen') {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)] mb-4">
          Webhooks are available when your dashboard mode is set to Lead Generation.
        </p>
        <Link
          href="/dashboard/settings"
          className="text-[var(--dash-primary)] hover:underline font-medium"
        >
          Switch to Lead Gen in Settings →
        </Link>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <WebhooksClient />
    </div>
  )
}
