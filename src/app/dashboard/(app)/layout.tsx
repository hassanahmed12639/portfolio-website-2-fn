import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import SessionProvider from '@/components/SessionProvider'
import DashboardShell from '@/components/dashboard/DashboardShell'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    redirect('/dashboard/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at, dashboard_type, is_admin')
    .eq('id', session.user.id)
    .single()

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
