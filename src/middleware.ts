import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next({ request: req })
  const hostname = req.headers.get('host') || ''
  const pathname = req.nextUrl.pathname

  // Hostname routing
  const isTrackDomain = hostname.includes('track.itshassanahmed.com')
  const isLocalhost =
    hostname.includes('localhost') || hostname.includes('127.0.0.1')
  const isPortfolioDomain =
    hostname === 'itshassanahmed.com' || hostname === 'www.itshassanahmed.com'

  if (isTrackDomain && !isLocalhost && pathname === '/') {
    return NextResponse.redirect(new URL('/trackhive', req.url))
  }

  const trackHiveRoutes = [
    '/trackhive',
    '/dashboard',
    '/admin',
    '/pricing',
    '/features',
    '/integrations',
    '/docs',
    '/api',
  ]
  const isTrackHiveRoute = trackHiveRoutes.some((r) => pathname.startsWith(r))

  if (isPortfolioDomain && isTrackHiveRoute) {
    return NextResponse.redirect(
      new URL(`https://track.itshassanahmed.com${pathname}`, req.url)
    )
  }

  // Auth check for dashboard routes
  const isDashboardRoute = pathname.startsWith('/dashboard')
  const isAuthPage =
    pathname === '/dashboard/login' || pathname === '/dashboard/signup'
  const isAdminRoute = pathname.startsWith('/admin')
  const isAdminLogin = pathname === '/admin/login'

  if (isDashboardRoute && !isAuthPage) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            res.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/dashboard/login', req.url))
    }
  }

  if (isAdminRoute && !isAdminLogin) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            res.cookies.set(name, value, options)
          },
          remove(name: string, options: any) {
            res.cookies.set(name, '', { ...options, maxAge: 0 })
          },
        },
      }
    )
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  return res
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
