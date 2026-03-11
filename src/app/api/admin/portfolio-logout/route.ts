import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST() {
  const cookieStore = await cookies()
  cookieStore.delete('portfolio_admin_auth')

  const baseUrl = process.env.NEXT_PUBLIC_PORTFOLIO_URL || 'https://itshassanahmed.com'
  return NextResponse.redirect(new URL('/admin/login', baseUrl))
}
