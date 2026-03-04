import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'crypto'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

const ONE_BY_ONE_GIF = Buffer.from(
  'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
  'base64'
)

export async function GET(request: NextRequest) {
  if (!serviceRoleKey || !supabaseUrl) {
    return new NextResponse(ONE_BY_ONE_GIF, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    })
  }

  const apiKey = request.nextUrl.searchParams.get('api_key')
  if (!apiKey) {
    return new NextResponse(ONE_BY_ONE_GIF, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('api_key', apiKey)
    .single()

  if (!profile) {
    return new NextResponse(ONE_BY_ONE_GIF, {
      status: 200,
      headers: { 'Content-Type': 'image/gif' },
    })
  }

  const { data: settings } = await supabase
    .from('cookie_settings')
    .select('cookie_lifetime_days, cookie_name, is_active')
    .eq('user_id', profile.id)
    .single()

  const lifetimeDays = settings?.is_active !== false
    ? (settings?.cookie_lifetime_days ?? 180)
    : 7
  const cookieName = (settings?.cookie_name?.trim() || '_th_uid').replace(/[^a-zA-Z0-9_-]/g, '_') || '_th_uid'

  const existingVisitorId = request.cookies.get(cookieName)?.value
  const visitorId = existingVisitorId || randomUUID()
  const maxAgeSeconds = lifetimeDays * 24 * 60 * 60

  const headers = new Headers()
  headers.set('Content-Type', 'image/gif')
  headers.set(
    'Set-Cookie',
    [
      `${cookieName}=${visitorId}`,
      `Max-Age=${maxAgeSeconds}`,
      'Path=/',
      'HttpOnly=false',
      'SameSite=Lax',
      'Secure',
    ].join('; ')
  )

  const now = new Date().toISOString()
  const { data: existing } = await supabase
    .from('cookie_visitors')
    .select('id, visit_count')
    .eq('user_id', profile.id)
    .eq('visitor_id', visitorId)
    .single()

  if (existing) {
    await supabase
      .from('cookie_visitors')
      .update({
        last_seen: now,
        visit_count: (existing.visit_count ?? 1) + 1,
      })
      .eq('id', existing.id)
  } else {
    await supabase.from('cookie_visitors').insert({
      user_id: profile.id,
      visitor_id: visitorId,
      first_seen: now,
      last_seen: now,
      visit_count: 1,
    })
  }

  return new NextResponse(ONE_BY_ONE_GIF, { status: 200, headers })
}
