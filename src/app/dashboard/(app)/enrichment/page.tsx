import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import EnrichmentClient from './EnrichmentClient'

export default async function EnrichmentPage() {
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

  const effectivePlan = getEffectivePlan(profile ?? {}) as PlanName
  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <div className="p-6 md:p-8">
      <FeatureGate
        feature="enrichment"
        userPlan={effectivePlan}
        trialExpired={trialExpired}
      >
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Real-time Data Enrichment</h1>
        <p className="text-[var(--dash-muted)] text-sm mb-8">
          Automatically enrich every event with geolocation, device type, customer type, LTV, and hashed PII for better attribution.
        </p>
        <EnrichmentClient />
      </FeatureGate>
    </div>
  )
}




