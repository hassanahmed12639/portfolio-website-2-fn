import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // Hostname routing
  const isTrackDomain = hostname.includes('track.itshassanahmed.com')
  const isPortfolioDomain =
    hostname === 'itshassanahmed.com' ||
    hostname === 'www.itshassanahmed.com'
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

  // Redirect portfolio domain to track subdomain for app routes
  const trackHiveRoutes = [
    '/trackhive',
    '/dashboard',
    '/onboarding',
    '/admin',
    '/pricing',
    '/features',
    '/integrations',
    '/docs',
  ]
  const isTrackHiveRoute = trackHiveRoutes.some((r) => pathname.startsWith(r))

  if (isPortfolioDomain && isTrackHiveRoute) {
    return NextResponse.redirect(new URL(`https://track.itshassanahmed.com${pathname}`, req.url))
  }

  // Redirect track domain root to /trackhive
  if (isTrackDomain && !isLocalhost && pathname === '/') {
    return NextResponse.redirect(new URL('/trackhive', req.url))
  }

  // Auth protection for dashboard and onboarding routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isOnboardingPage = pathname === '/onboarding'
  const isAuthPage =
    pathname === '/dashboard/login' ||
    pathname === '/dashboard/signup' ||
    pathname === '/dashboard/logout'

  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminAuthPage =
    pathname === '/admin/login' ||
    pathname === '/admin/logout'

  // Skip auth check for public routes
  if (!isDashboardRoute && !isAdminRoute && !isOnboardingPage) {
    return res
  }

  // Skip auth check for auth pages
  if (isAuthPage || isAdminAuthPage) {
    return res
  }

  // Create Supabase client that reads from request and writes to response — refreshes session via cookies
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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

  // IMPORTANT: getSession() refreshes the session and updates cookies on res
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error('[Middleware] Session error:', error.message)
  }

  // Redirect to login if no session
  if (!session) {
    if (isDashboardRoute || isOnboardingPage) {
      const loginUrl = new URL('/dashboard/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // After auth: redirect to onboarding if dashboard and onboarding not completed
  if (session && isDashboardRoute && !isAuthPage) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarding_completed')
      .eq('id', session.user.id)
      .single()

    if (!profile?.onboarding_completed && pathname !== '/onboarding') {
      return NextResponse.redirect(new URL('/onboarding', req.url))
    }
  }

  // Return res so cookie updates are persisted
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/event|api/proxy|th.js).*)',
  ],
}
