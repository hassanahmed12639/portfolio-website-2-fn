import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import AnomaliesClient from './AnomaliesClient'

export default async function AnomaliesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/dashboard/login')

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
      feature="anomaly_detection"
      userPlan={effectivePlan}
      trialExpired={trialExpired}
    >
      <AnomaliesClient />
    </FeatureGate>
  )
}
