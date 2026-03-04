import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('enrichment_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const defaults = {
    geo_enabled: true,
    device_enabled: true,
    customer_type_enabled: true,
    ltv_enabled: true,
    email_hash_enabled: true,
    phone_hash_enabled: true,
  }

  if (!data) {
    return NextResponse.json(defaults)
  }

  return NextResponse.json({
    geo_enabled: data.geo_enabled ?? true,
    device_enabled: data.device_enabled ?? true,
    customer_type_enabled: data.customer_type_enabled ?? true,
    ltv_enabled: data.ltv_enabled ?? true,
    email_hash_enabled: data.email_hash_enabled ?? true,
    phone_hash_enabled: data.phone_hash_enabled ?? true,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    geo_enabled?: boolean
    device_enabled?: boolean
    customer_type_enabled?: boolean
    ltv_enabled?: boolean
    email_hash_enabled?: boolean
    phone_hash_enabled?: boolean
  }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const now = new Date().toISOString()
  const row = {
    user_id: user.id,
    geo_enabled: body.geo_enabled ?? true,
    device_enabled: body.device_enabled ?? true,
    customer_type_enabled: body.customer_type_enabled ?? true,
    ltv_enabled: body.ltv_enabled ?? true,
    email_hash_enabled: body.email_hash_enabled ?? true,
    phone_hash_enabled: body.phone_hash_enabled ?? true,
    updated_at: now,
  }

  const { error } = await supabase
    .from('enrichment_settings')
    .upsert(row, { onConflict: 'user_id' })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(row)
}
