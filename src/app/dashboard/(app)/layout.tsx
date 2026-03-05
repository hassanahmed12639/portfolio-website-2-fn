import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import SessionProvider from '@/components/SessionProvider'
import { redirect } from 'next/navigation'

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at, dashboard_type')
    .eq('id', user.id)
    .single()

  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <SessionProvider>
      <DashboardShell user={user} trialExpired={trialExpired} profile={profile ?? undefined}>
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}




