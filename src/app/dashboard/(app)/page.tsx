import { createClient } from '@/lib/supabase/server'
import { fetchDashboardProfile } from '@/lib/dashboard-profile'
import { unstable_noStore as noStore } from 'next/cache'
import { resolveDashboardMode } from '@/lib/dashboard-mode'
import EcommerceDashboard from '@/components/dashboard/EcommerceDashboard'
import LeadGenDashboard from '@/components/dashboard/LeadGenDashboard'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  noStore()
  const supabase = await await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  // Auth is enforced by middleware; no duplicate check here to avoid race conditions

  const profile = await fetchDashboardProfile(user!.id)

  const dashboardType = resolveDashboardMode(profile)

  const content =
    dashboardType === 'leadgen' ? (
      <LeadGenDashboard profile={profile} />
    ) : (
      <EcommerceDashboard profile={profile} />
    )

  return (
    <>
      <div className="px-6 md:px-8 pt-6 md:pt-8">
        <WelcomeBanner />
      </div>
      {content}
    </>
  )
}

