import { createClient } from '@/lib/supabase/server'
import EcommerceDashboard from '@/components/dashboard/EcommerceDashboard'
import LeadGenDashboard from '@/components/dashboard/LeadGenDashboard'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const dashboardType = (profile?.dashboard_type as string) || 'ecommerce'

  return dashboardType === 'leadgen'
    ? <LeadGenDashboard profile={profile} />
    : <EcommerceDashboard profile={profile} />
}
