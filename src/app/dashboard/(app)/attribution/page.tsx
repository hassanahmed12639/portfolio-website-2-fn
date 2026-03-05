import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import AttributionClient from './AttributionClient'

export default async function AttributionPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at')
    .eq('id', user.id)
    .single()

  const effectivePlan = getEffectivePlan(profile ?? {}) as PlanName
  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <FeatureGate
      feature="attribution"
      userPlan={effectivePlan}
      trialExpired={trialExpired}
    >
      <AttributionClient />
    </FeatureGate>
  )
}




