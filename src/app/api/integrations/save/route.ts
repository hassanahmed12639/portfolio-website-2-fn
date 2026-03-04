import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const serverClient = await createServerClient()
  const { data: { user } } = await serverClient.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: {
    platform?: string
    pixel_id?: string
    access_token?: string
    tag_id?: string
    meta_test_event_code?: string
    conversion_label?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const { platform, pixel_id, access_token, tag_id, meta_test_event_code, conversion_label } = body
  if (!platform) {
    return NextResponse.json({ error: 'platform required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const row: Record<string, unknown> = {
    user_id: user.id,
    platform,
    is_active: true,
  }
  if (pixel_id !== undefined) row.pixel_id = pixel_id || null
  if (access_token !== undefined) row.access_token = access_token || null
  if (tag_id !== undefined) row.tag_id = tag_id || null
  if (platform === 'meta' && meta_test_event_code !== undefined) row.meta_test_event_code = meta_test_event_code?.trim() || null
  if (platform === 'google' && conversion_label !== undefined) (row as Record<string, unknown>).conversion_label = conversion_label?.trim() || null

  const { data: existing } = await supabase
    .from('integrations')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .single()

  if (existing) {
    const updatePayload: Record<string, unknown> = {
      pixel_id: row.pixel_id,
      access_token: row.access_token,
      tag_id: row.tag_id,
      is_active: true,
    }
    if (platform === 'meta' && meta_test_event_code !== undefined) updatePayload.meta_test_event_code = meta_test_event_code?.trim() || null
    if (platform === 'google' && conversion_label !== undefined) updatePayload.conversion_label = conversion_label?.trim() || null
    const { error } = await supabase
      .from('integrations')
      .update(updatePayload)
      .eq('id', existing.id)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  } else {
    const { error } = await supabase.from('integrations').insert(row)
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
  }

  return NextResponse.json({ success: true })
}
