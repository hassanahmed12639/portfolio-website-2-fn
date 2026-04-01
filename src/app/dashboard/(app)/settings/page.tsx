import { headers } from 'next/headers'
import { unstable_noStore as noStore } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { fetchDashboardProfile } from '@/lib/dashboard-profile'
import { resolveDashboardMode } from '@/lib/dashboard-mode'
import SettingsClient from './SettingsClient'

export const dynamic = 'force-dynamic'

export default async function SettingsPage() {
  noStore()
  headers()
  const supabase = await await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const profile = await fetchDashboardProfile(user!.id)

  if (!profile) {
    return (
      <div className="p-6 md:p-8">
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Settings</h1>
        <p className="text-sm text-red-600">Could not load your profile. Try refreshing the page.</p>
      </div>
    )
  }

  const resolvedMode = resolveDashboardMode(profile)
  const profileSyncKey = `${profile.dashboard_type ?? 'null'}:${profile.business_type ?? 'null'}`

  return (
    <div className="p-6 md:p-8">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-6">Settings</h1>
      <SettingsClient
        key={profileSyncKey}
        profile={profile}
        userId={user!.id}
        resolvedMode={resolvedMode}
      />
    </div>
  )
}

