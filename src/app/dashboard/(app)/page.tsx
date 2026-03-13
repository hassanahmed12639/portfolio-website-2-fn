import { createClient } from '@/lib/supabase/server'
import EcommerceDashboard from '@/components/dashboard/EcommerceDashboard'
import LeadGenDashboard from '@/components/dashboard/LeadGenDashboard'
import WelcomeBanner from '@/components/dashboard/WelcomeBanner'
export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  // Auth is enforced by middleware; no duplicate check here to avoid race conditions

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user!.id)
    .single()

  const dashboardType = (profile?.dashboard_type as string) || 'ecommerce'

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
