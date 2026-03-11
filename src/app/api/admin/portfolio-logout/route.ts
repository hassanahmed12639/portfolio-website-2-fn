import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { getCookieName } from '@/lib/portfolio-auth'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete(getCookieName())

  const baseUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'https://itshassanahmed.com'
  return NextResponse.redirect(new URL('/admin/login', baseUrl))
}
