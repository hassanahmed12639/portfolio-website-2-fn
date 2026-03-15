import { randomUUID } from 'crypto'
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { buildGoogleOAuthUrl } from '@/lib/gsc'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/dashboard/login', process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000'))
  }

  const state = randomUUID()
  const oauthUrl = buildGoogleOAuthUrl(state)
  const response = NextResponse.redirect(oauthUrl)
  response.cookies.set('gsc_oauth_state', state, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 600,
    path: '/',
  })
  return response
}
