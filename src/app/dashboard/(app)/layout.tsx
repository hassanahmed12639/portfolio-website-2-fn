export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { fetchDashboardProfile } from '@/lib/dashboard-profile'
import { unstable_noStore as noStore } from 'next/cache'
import { redirect } from 'next/navigation'
import SessionProvider from '@/components/SessionProvider'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  noStore()
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/dashboard/login')
  }

  const profile = await fetchDashboardProfile(session.user.id)

  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <SessionProvider>
      <DashboardShell
        user={session.user}
        trialExpired={trialExpired}
        profile={profile ?? undefined}
      >
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}
