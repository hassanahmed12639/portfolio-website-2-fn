import { createHash, timingSafeEqual } from 'crypto'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createSessionToken, getCookieName } from '@/lib/portfolio-auth'
import { rateLimit } from '@/lib/rate-limit'

function securePasswordCompare(given: string, expected: string): boolean {
  if (!expected) return false
  const h1 = createHash('sha256').update(given).digest()
  const h2 = createHash('sha256').update(expected).digest()
  if (h1.length !== h2.length) return false
  return timingSafeEqual(h1, h2)
}

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    request.headers.get('cf-connecting-ip') ??
    'unknown'
  )
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const limiterKey = `portfolio-auth:${ip}`
  const { success } = rateLimit(limiterKey, { windowMs: 15 * 60 * 1000, maxRequests: 5 })
  if (!success) {
    return NextResponse.json({ error: 'Too many attempts. Try again in 15 minutes.' }, { status: 429 })
  }

  let body: { password?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  const password = typeof body?.password === 'string' ? body.password : ''
  const adminPassword = process.env.PORTFOLIO_ADMIN_PASSWORD

  if (!adminPassword || adminPassword.length < 8) {
    return NextResponse.json({ error: 'Admin not configured' }, { status: 500 })
  }

  if (!securePasswordCompare(password, adminPassword)) {
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 })
  }

  const token = createSessionToken()
  const cookieStore = await cookies()
  cookieStore.set(getCookieName(), token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return NextResponse.json({ success: true })
}
