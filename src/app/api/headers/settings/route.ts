import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export type CustomHeader = { name: string; value: string }

export type HeaderSettings = {
  id?: string
  user_id?: string
  custom_headers: CustomHeader[]
  forward_user_agent: boolean
  forward_ip: boolean
  forward_referer: boolean
  forward_origin: boolean
  custom_user_agent: string | null
  override_user_agent: boolean
  is_active: boolean
  meta_send_test_event_code?: boolean
  meta_test_event_code?: string | null
  meta_send_action_source?: boolean
  meta_action_source?: string
  google_send_x_forwarded_for?: boolean
  google_send_user_agent_override?: boolean
  tiktok_send_tt_user_data?: boolean
  created_at?: string
}

const defaults: HeaderSettings = {
  custom_headers: [],
  forward_user_agent: true,
  forward_ip: true,
  forward_referer: true,
  forward_origin: true,
  custom_user_agent: null,
  override_user_agent: false,
  is_active: true,
  meta_send_test_event_code: false,
  meta_test_event_code: null,
  meta_send_action_source: true,
  meta_action_source: 'website',
  google_send_x_forwarded_for: true,
  google_send_user_agent_override: true,
  tiktok_send_tt_user_data: false,
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: row, error } = await supabase
    .from('header_settings')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error && error.code !== 'PGRST116') {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const settings: HeaderSettings = row
    ? {
        ...defaults,
        ...row,
        custom_headers: Array.isArray(row.custom_headers) ? row.custom_headers : [],
      }
    : { ...defaults }

  return NextResponse.json(settings)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Partial<HeaderSettings>
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const customHeaders = Array.isArray(body.custom_headers)
    ? body.custom_headers.filter((h: CustomHeader) => h?.name?.trim())
    : []

  const row = {
    user_id: user.id,
    custom_headers: customHeaders.map((h: CustomHeader) => ({ name: String(h.name).trim(), value: String(h.value ?? '').trim() })),
    forward_user_agent: body.forward_user_agent ?? true,
    forward_ip: body.forward_ip ?? true,
    forward_referer: body.forward_referer ?? true,
    forward_origin: body.forward_origin ?? true,
    custom_user_agent: body.custom_user_agent?.trim() || null,
    override_user_agent: body.override_user_agent ?? false,
    is_active: body.is_active ?? true,
    meta_send_test_event_code: body.meta_send_test_event_code ?? false,
    meta_test_event_code: body.meta_test_event_code?.trim() || null,
    meta_send_action_source: body.meta_send_action_source ?? true,
    meta_action_source: body.meta_action_source ?? 'website',
    google_send_x_forwarded_for: body.google_send_x_forwarded_for ?? true,
    google_send_user_agent_override: body.google_send_user_agent_override ?? true,
    tiktok_send_tt_user_data: body.tiktok_send_tt_user_data ?? false,
  }

  const { data: existing } = await supabase
    .from('header_settings')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existing?.id) {
    const { data: updated, error } = await supabase
      .from('header_settings')
      .update(row)
      .eq('user_id', user.id)
      .select()
      .single()
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json(updated ?? row)
  }

  const { data: inserted, error } = await supabase
    .from('header_settings')
    .insert(row)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(inserted ?? row)
}
