import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname
  const hostname = req.headers.get('host') || ''

  // Skip middleware for static files and api/event route
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/event') ||
    pathname.startsWith('/api/proxy') ||
    pathname.includes('th.js') ||
    pathname.includes('favicon')
  ) {
    return res
  }

  // Hostname routing
  const isTrackDomain = hostname.includes('track.itshassanahmed.com')
  const isPortfolioDomain = hostname === 'itshassanahmed.com' || hostname === 'www.itshassanahmed.com'
  const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')

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

  // Auth routes that don't need protection
  const publicRoutes = [
    '/auth',
    '/dashboard/login',
    '/dashboard/signup',
    '/dashboard/logout',
    '/admin/login',
    '/onboarding',
    '/trackhive',
    '/pricing',
    '/features',
    '/integrations',
    '/docs',
    '/blog'
  ]

  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')

  // Skip auth for public routes
  if (isPublicRoute || (!isDashboardRoute && !isAdminRoute)) {
    return res
  }

  // Create supabase client using getAll/setAll for proper cookie chunk handling
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
            res.cookies.set(name, value, options ?? {})
          )
        },
      },
    }
  )

  // CRITICAL: Use getUser (not getSession) to validate and refresh the token
  const { data: { user } } = await supabase.auth.getUser()

  // No user - redirect to login
  if (!user) {
    if (isDashboardRoute) {
      const url = new URL('/dashboard/login', req.url)
      url.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(url)
    }
    if (isAdminRoute) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // CRITICAL: Always return res (not NextResponse.next()) to persist cookie
  return res
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|api/event|api/proxy|th.js).*)'
  ]
}
