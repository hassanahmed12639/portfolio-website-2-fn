import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import TemplatesClient from './TemplatesClient'

export default async function TemplatesPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  const { data: profile } = await supabase
    .from('profiles')
    .select('plan, is_trial, trial_expires_at')
    .eq('id', user!.id)
    .single()

  const effectivePlan = getEffectivePlan(profile ?? {})
  const planForTemplates = effectivePlan as 'free' | 'pro' | 'agency'

  return (
    <FeatureGate feature="templates" requiredPlan="pro">
      <TemplatesClient
        userPlan={planForTemplates}
        rawPlan={(profile?.plan ?? 'free') as string}
        isTrial={!!profile?.is_trial}
      />
    </FeatureGate>
  )
}




