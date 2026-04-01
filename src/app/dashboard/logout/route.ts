import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const LOGIN_REDIRECT_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://track.itshassanahmed.com'

export async function GET() {
  const supabase = await await createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(`${LOGIN_REDIRECT_URL}/dashboard/login`)
}




