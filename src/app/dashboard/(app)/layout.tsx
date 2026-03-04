import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/dashboard/DashboardShell'
import SessionProvider from '@/components/SessionProvider'

export default async function DashboardAppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/dashboard/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at')
    .eq('id', user.id)
    .single()

  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <SessionProvider>
      <DashboardShell user={user} trialExpired={trialExpired}>
        {children}
      </DashboardShell>
    </SessionProvider>
  )
}




