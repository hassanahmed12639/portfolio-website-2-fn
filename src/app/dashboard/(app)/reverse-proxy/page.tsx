import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import ReverseProxyClient from './ReverseProxyClient'

export default async function ReverseProxyPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key, plan, is_trial, trial_expires_at')
    .eq('id', user!.id)
    .single()

  const apiKey = profile?.api_key ?? ''
  const effectivePlan = getEffectivePlan(profile ?? {}) as PlanName
  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <div className="p-6 md:p-8">
      <FeatureGate
        feature="reverse_proxy"
        userPlan={effectivePlan}
        trialExpired={trialExpired}
      >
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Reverse Proxy</h1>
        <p className="text-[var(--dash-muted)] text-sm mb-8">
          Serve tracking scripts from your own domain so ad blockers do not block them.
        </p>
        <ReverseProxyClient apiKey={apiKey} />
      </FeatureGate>
    </div>
  )
}




