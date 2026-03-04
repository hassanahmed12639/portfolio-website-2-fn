import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const hostname = request.headers.get('host') || ''
  const pathname = request.nextUrl.pathname

  // TrackHive subdomain
  const isTrackDomain =
    hostname.startsWith('track.') || hostname === 'track.itshassanahmed.com'

  // Portfolio domain
  const isPortfolioDomain =
    hostname === 'itshassanahmed.com' || hostname === 'www.itshassanahmed.com'

  // If on track.itshassanahmed.com and visiting root → redirect to /trackhive
  if (isTrackDomain && pathname === '/') {
    return NextResponse.redirect(new URL('/trackhive', request.url))
  }

  // If on itshassanahmed.com and visiting /trackhive, /dashboard, /admin etc → redirect to track subdomain
  const trackHiveRoutes = [
    '/trackhive',
    '/dashboard',
    '/admin',
    '/pricing',
    '/features',
    '/integrations',
    '/docs',
  ]
  const isTrackHiveRoute = trackHiveRoutes.some((r) => pathname.startsWith(r))

  if (isPortfolioDomain && isTrackHiveRoute) {
    return NextResponse.redirect(
      new URL(`https://track.itshassanahmed.com${pathname}`, request.url)
    )
  }

  // If on track.itshassanahmed.com and visiting portfolio routes → redirect to portfolio
  const portfolioRoutes = [
    '/project',
    '/about-me',
    '/resume',
    '/contact',
    '/my-process',
  ]
  const isPortfolioRoute = portfolioRoutes.some((r) => pathname.startsWith(r))

  if (isTrackDomain && isPortfolioRoute) {
    return NextResponse.redirect(
      new URL(`https://itshassanahmed.com${pathname}`, request.url)
    )
  }

  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isLogin = pathname === '/dashboard/login'
  const isSignup = pathname === '/dashboard/signup'
  const isAuthPage = isLogin || isSignup

  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'
  const isAdminLogout = pathname === '/admin/logout'
  const isAdminProtected = isAdminRoute && !isAdminLogin && !isAdminLogout

  if (isDashboardRoute && !isAuthPage && !session) {
    return NextResponse.redirect(new URL('/dashboard/login', request.url))
  }

  if (isAuthPage && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  if (isAdminProtected && !session) {
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$|api).*)',
  ],
}
