import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  let body: { api_key?: string; visitor_id?: string }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { api_key, visitor_id } = body
  if (!api_key || !visitor_id) {
    return NextResponse.json({ error: 'api_key and visitor_id required' }, { status: 400 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('api_key', api_key)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Invalid API key' }, { status: 401 })
  }

  const { data: visitor } = await supabase
    .from('cookie_visitors')
    .select('first_seen, last_seen, visit_count')
    .eq('user_id', profile.id)
    .eq('visitor_id', visitor_id)
    .single()

  if (!visitor) {
    return NextResponse.json({
      is_returning_visitor: false,
      first_seen: null,
      visit_count: 0,
      days_since_first_visit: null,
    })
  }

  const firstSeen = visitor.first_seen ? new Date(visitor.first_seen) : null
  const daysSinceFirst = firstSeen
    ? Math.floor((Date.now() - firstSeen.getTime()) / (24 * 60 * 60 * 1000))
    : null

  return NextResponse.json({
    is_returning_visitor: (visitor.visit_count ?? 0) > 1,
    first_seen: visitor.first_seen,
    visit_count: visitor.visit_count ?? 1,
    days_since_first_visit: daysSinceFirst,
  })
}
