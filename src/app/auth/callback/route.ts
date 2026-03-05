import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const requestUrl = new URL(req.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = new URL('/dashboard', origin)

  if (code) {
    const res = NextResponse.redirect(redirectTo)

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookieOptions: { name: 'trackhive-auth-token' },
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: Record<string, unknown>) {
            res.cookies.set({ name, value, ...options })
          },
          remove(name: string, options: Record<string, unknown>) {
            res.cookies.set({ name, value: '', ...options, maxAge: 0 })
          },
        },
      }
    )

    await supabase.auth.exchangeCodeForSession(code)

    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .single()

      if (!profile) {
        await supabase.from('profiles').upsert(
          { id: user.id, email: user.email ?? '', api_key: crypto.randomUUID() },
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
      }
    }

    return res
  }

  return NextResponse.redirect(new URL('/dashboard/login', origin))
}
