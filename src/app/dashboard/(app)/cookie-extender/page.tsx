import { createClient } from '@/lib/supabase/server'
import { getEffectivePlan, type PlanName } from '@/lib/plans'
import { FeatureGate } from '@/components/FeatureGate'
import CookieExtenderClient from './CookieExtenderClient'

export default async function CookieExtenderPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user
  if (!user) return null

  const { data: profile } = await supabase
    .from('profiles')
    .select('api_key, plan, is_trial, trial_expires_at')
    .eq('id', user.id)
    .single()

  const { data: settings } = await supabase
    .from('cookie_settings')
    .select('cookie_lifetime_days, cookie_name, is_active')
    .eq('user_id', user.id)
    .single()

  const apiKey = profile?.api_key ?? ''
  const initialSettings = {
    cookie_lifetime_days: settings?.cookie_lifetime_days ?? 180,
    cookie_name: settings?.cookie_name ?? '_th_uid',
    is_active: settings?.is_active ?? true,
  }

  const effectivePlan = getEffectivePlan(profile ?? {}) as PlanName
  const trialExpired =
    !!profile?.is_trial &&
    !!profile?.trial_expires_at &&
    new Date(profile.trial_expires_at) <= new Date()

  return (
    <div className="p-6 md:p-8">
      <FeatureGate
        feature="cookie_extender"
        userPlan={effectivePlan}
        trialExpired={trialExpired}
      >
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Cookie Lifetime Extender</h1>
        <p className="text-[var(--dash-muted)] text-sm mb-8">
          Extend tracking window with server-side cookies. Browser cookies expire in ~7 days (Safari ITP); server cookies last up to 180 days.
        </p>
        <CookieExtenderClient apiKey={apiKey} initialSettings={initialSettings} />
      </FeatureGate>
    </div>
  )
}




