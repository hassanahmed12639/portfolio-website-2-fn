import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

// Block common attack patterns
function isSuspiciousPath(pathname: string): boolean {
  const suspicious = [
    /\.\./,
    /%2e%2e/i,
    /\.env/,
    /\.git/,
    /\/wp-admin/i,
    /\/wp-login/i,
    /\/phpmyadmin/i,
    /\/adminer/i,
    /\.php$/i,
    /\.asp$/i,
  ]
  return suspicious.some((p) => p.test(pathname))
}

export async function middleware(req: NextRequest) {
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') ?? ''

  if (isSuspiciousPath(pathname)) {
    return new NextResponse(null, { status: 404 })
  }

  const res = NextResponse.next()

  // Skip static files and api/event (do NOT skip /_next/data - RSC requests need session refresh)
  if (
    pathname.startsWith('/_next/static') ||
    pathname.startsWith('/_next/image') ||
    pathname.startsWith('/api/event') ||
    pathname.startsWith('/api/proxy') ||
    pathname.includes('th.js') ||
    pathname.includes('favicon')
  ) {
    return res
  }

  const isTrackDomain = hostname.includes('track.itshassanahmed.com')
  const isPortfolioDomain = hostname === 'itshassanahmed.com' || hostname === 'www.itshassanahmed.com'

  // Portfolio domain /admin → portfolio admin (do not redirect to TrackHive)
  if (isPortfolioDomain && pathname.startsWith('/admin')) {
    return res
  }

  // Redirect portfolio domain to track subdomain for app routes
  const trackHiveRoutes = ['/trackhive', '/dashboard', '/onboarding', '/admin', '/pricing', '/features', '/integrations', '/docs']
  const isTrackHiveRoute = trackHiveRoutes.some((r) => pathname.startsWith(r))
  if (isPortfolioDomain && isTrackHiveRoute) {
    return NextResponse.redirect(new URL(`https://track.itshassanahmed.com${pathname}`, req.url))
  }

  // Redirect track domain root to /trackhive
  if (isTrackDomain && pathname === '/') {
    return NextResponse.redirect(new URL('/trackhive', req.url))
  }

  // Public routes — no auth needed
  const publicRoutes = [
    '/dashboard/login',
    '/dashboard/signup',
    '/dashboard/logout',
    '/dashboard/forgot-password',
    '/admin/login',
    '/onboarding',
    '/trackhive',
    '/pricing',
    '/features',
    '/integrations',
    '/docs',
    '/blog',
    '/auth',
    '/api',
    '/sitemap.xml',
    '/robots.txt',
  ]

  const isPublicRoute = publicRoutes.some((r) => pathname.startsWith(r))
  const isDashboardRoute = pathname.startsWith('/dashboard') || pathname.includes('/dashboard')
  const isAdminRoute = (pathname.startsWith('/admin') || pathname.includes('/admin')) && !pathname.includes('/admin/login')

  // Portfolio domain /admin: skip Supabase auth (portfolio uses cookie auth)
  if (isPortfolioDomain && pathname.startsWith('/admin')) {
    return res
  }

  // Not a protected route — skip auth
  if (isPublicRoute || (!isDashboardRoute && !isAdminRoute)) {
    return res
  }

  // Create supabase client — MUST pass both req and res for cookie handling
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

  // CRITICAL: Always call getSession to refresh cookie
  const { data: { session } } = await supabase.auth.getSession()

  if (!session) {
    if (isDashboardRoute) {
      const loginUrl = new URL('/dashboard/login', req.url)
      loginUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(loginUrl)
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Admin routes: require is_admin
  if (isAdminRoute && session?.user?.id) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single()
    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Plan-protected dashboard routes: require Pro or Agency
  if (session?.user?.id && isDashboardRoute) {
    const { getRequiredPlan, hasPlanAccess } = await import('@/lib/route-plan-config')
    const required = getRequiredPlan(pathname)
    if (required) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_trial, trial_expires_at')
        .eq('id', session.user.id)
        .single()
      const hasAccess = hasPlanAccess(
        profile?.plan,
        profile?.is_trial,
        profile?.trial_expires_at,
        required
      )
      if (!hasAccess) {
        const billingUrl = new URL('/dashboard/billing', req.url)
        billingUrl.searchParams.set('upgrade', required)
        return NextResponse.redirect(billingUrl)
      }
    }
  }

  // CRITICAL: Return res not NextResponse.next()
  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
