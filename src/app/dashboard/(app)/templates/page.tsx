import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
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

  const effectivePlan = getEffectivePlan(profile ?? {}) as PlanName
  const planForTemplates =
    effectivePlan === 'trial' ? 'trial' : (effectivePlan as 'free' | 'pro' | 'agency')

  return <TemplatesClient userPlan={planForTemplates} />
}




