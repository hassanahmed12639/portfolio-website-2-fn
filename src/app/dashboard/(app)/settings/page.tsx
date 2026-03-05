import { createClient } from '@/lib/supabase/server'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, dashboard_type, business_name')
    .eq('id', user!.id)
    .single()

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Settings</h1>
      <SettingsClient profile={profile} userId={user!.id} />
    </div>
  )
}
