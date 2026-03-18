'use server'

import { createClient as createServerSupabaseClient } from '@/lib/supabase/server'
import { createClient as createSupabaseJsClient } from '@supabase/supabase-js'

export type CompleteOnboardingResult = { ok: true } | { ok: false; error: string }

export async function completeOnboarding(form: {
  business_name: string
  website_url: string
  business_type: string
  monthly_events: string
  ad_platforms: string[]
}, access_token?: string): Promise<CompleteOnboardingResult> {
  const serverSupabase = await createServerSupabaseClient()

  // Prefer cookie-based SSR session (normal case)
  const { data: { user: cookieUser } } = await serverSupabase.auth.getUser()
  if (!cookieUser) {
    // Fallback: if cookies aren't available on the server action request,
    // use the browser's current access token to prevent false "session expired" errors.
    if (!access_token) return { ok: false, error: 'Session expired. Please sign in again.' }

    const supabaseWithJwt = createSupabaseJsClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          headers: {
            Authorization: `Bearer ${access_token}`,
          },
        },
      }
    )

    const { data: { user: jwtUser } } = await supabaseWithJwt.auth.getUser()
    if (!jwtUser) return { ok: false, error: 'Session expired. Please sign in again.' }

    const dashboardType = form.business_type === 'leadgen' ? 'leadgen' : 'ecommerce'
    const { error } = await supabaseWithJwt
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
      .eq('id', jwtUser.id)

    if (error) return { ok: false, error: error.message || 'Setup failed. Please try again.' }
    return { ok: true }
  }

  const dashboardType = form.business_type === 'leadgen' ? 'leadgen' : 'ecommerce'
  const { error } = await serverSupabase
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
    .eq('id', cookieUser.id)

  if (error) return { ok: false, error: error.message || 'Setup failed. Please try again.' }
  return { ok: true }
}

export async function createProfileAfterSignup() {
  const supabase = await createServerSupabaseClient()
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



