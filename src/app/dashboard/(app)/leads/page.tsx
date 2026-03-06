import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import LeadsManagerClient from './LeadsManagerClient'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('dashboard_type')
    .eq('id', user!.id)
    .single()

  if (profile?.dashboard_type !== 'leadgen') {
    return (
      <div className="p-6 md:p-8">
        <p className="text-[var(--dash-muted)] mb-4">
          Lead Manager is available when your dashboard mode is set to Lead Generation.
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

  const { data: leads } = await supabase
    .from('leads')
    .select('*')
    .eq('user_id', user!.id)
    .order('created_at', { ascending: false })
    .limit(50)

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Lead Manager</h1>
      <LeadsManagerClient initialLeads={leads ?? []} />
    </div>
  )
}
