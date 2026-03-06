import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data } = await supabase
    .from('cookie_settings')
    .select('cookie_lifetime_days, cookie_name, is_active')
    .eq('user_id', user.id)
    .single()

  return NextResponse.json({
    cookie_lifetime_days: data?.cookie_lifetime_days ?? 180,
    cookie_name: data?.cookie_name ?? '_th_uid',
    is_active: data?.is_active ?? true,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: { cookie_lifetime_days?: number; cookie_name?: string; is_active?: boolean }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const cookie_lifetime_days = body.cookie_lifetime_days ?? 180
  const cookie_name = (body.cookie_name?.trim() || '_th_uid').replace(/[^a-zA-Z0-9_-]/g, '_') || '_th_uid'
  const is_active = body.is_active ?? true

  const clampedDays = Math.min(365, Math.max(7, cookie_lifetime_days))

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const row = {
    user_id: user.id,
    cookie_lifetime_days: clampedDays,
    cookie_name,
    is_active,
  }

  const { data: existing } = await admin
    .from('cookie_settings')
    .select('user_id')
    .eq('user_id', user.id)
    .maybeSingle()

  const { error } = existing
    ? await admin.from('cookie_settings').update(row).eq('user_id', user.id)
    : await admin.from('cookie_settings').insert(row)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
