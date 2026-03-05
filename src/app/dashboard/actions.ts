'use server'

import { createClient } from '@/lib/supabase/server'

export type CompleteOnboardingResult = { ok: true } | { ok: false; error: string }

export async function completeOnboarding(form: {
  business_name: string
  website_url: string
  business_type: string
  monthly_events: string
  ad_platforms: string[]
}): Promise<CompleteOnboardingResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: 'Session expired. Please sign in again.' }

  const dashboardType = form.business_type === 'leadgen' ? 'leadgen' : 'ecommerce'

  const { error } = await supabase
    .from('profiles')
    .update({
      business_name: form.business_name,
      website_url: form.website_url,
      business_type: form.business_type,
      monthly_events: parseInt(form.monthly_events) || 0,
      ad_platforms: form.ad_platforms,
      dashboard_type: dashboardType,
      onboarding_completed: true,
    })
    .eq('id', user.id)

  if (error) return { ok: false, error: error.message || 'Setup failed. Please try again.' }
  return { ok: true }
}

export async function createProfileAfterSignup() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  const user = session?.user

  if (!user) {
    return
  }

  const apiKey = crypto.randomUUID()

  await supabase.from('profiles').upsert(
    {
      id: user.id,
      email: user.email ?? '',
      api_key: apiKey,
    },
    { onConflict: 'id' }
  )
}



