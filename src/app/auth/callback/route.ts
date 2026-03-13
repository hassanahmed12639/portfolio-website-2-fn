import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const loginUrl = new URL('/dashboard/login', origin)
  const dashboardUrl = new URL('/dashboard', origin)

  if (!code) {
    loginUrl.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(loginUrl)
  }

  try {
    const res = NextResponse.redirect(dashboardUrl)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: 'trackhive-auth-token' },
        cookies: {
          getAll() {
            return req.cookies.getAll()
          },
          setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
            cookiesToSet.forEach(({ name, value, options }) =>
              res.cookies.set(name, value, (options ?? {}) as Record<string, string | number | boolean | Date>)
            )
          },
        },
      }
    )

    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    if (exchangeError) {
      console.error('[auth/callback] exchangeCodeForSession error:', exchangeError.message)
      loginUrl.searchParams.set('error', 'auth_failed')
      return NextResponse.redirect(loginUrl)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile) {
        const now = new Date()
        const trialEnds = new Date(now)
        trialEnds.setDate(trialEnds.getDate() + 7)
        await supabase.from('profiles').upsert(
          {
            id: user.id,
            email: user.email ?? '',
            api_key: crypto.randomUUID(),
            plan: 'pro',
            is_trial: true,
            trial_started_at: now.toISOString(),
            trial_ends_at: trialEnds.toISOString(),
          },
          { onConflict: 'id' }
        )
      }

      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!updatedProfile?.onboarding_completed) {
        res.headers.set('Location', new URL('/onboarding', origin).toString())
      } else {
        res.headers.set('Location', dashboardUrl.toString())
      }
    }

    return res
  } catch (err) {
    console.error('[auth/callback] Unexpected error:', err)
    loginUrl.searchParams.set('error', 'auth_failed')
    return NextResponse.redirect(loginUrl)
  }
}
