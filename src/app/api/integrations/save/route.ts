import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encrypt'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

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
    conversion_id?: string
    ga4_measurement_id?: string
    ga4_api_secret?: string
  }

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const {
    platform,
    pixel_id,
    access_token,
    tag_id,
    meta_test_event_code,
    conversion_label,
    conversion_id,
    ga4_measurement_id,
    ga4_api_secret,
  } = body
  if (!platform) {
    return NextResponse.json({ error: 'platform required' }, { status: 400 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
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
  if (access_token !== undefined) {
    const raw = access_token?.trim() || null
    row.access_token = raw ? await encrypt(raw) : null
  }
  if (tag_id !== undefined) row.tag_id = tag_id || null
  if (platform === 'meta' && meta_test_event_code !== undefined) row.meta_test_event_code = meta_test_event_code?.trim() || null
  if (platform === 'google') {
    if (conversion_label !== undefined) (row as Record<string, unknown>).conversion_label = conversion_label?.trim() || null
    if (conversion_id !== undefined) (row as Record<string, unknown>).conversion_id = conversion_id?.trim() || null
  }
  if (platform === 'ga4') {
    if (ga4_measurement_id !== undefined) (row as Record<string, unknown>).ga4_measurement_id = ga4_measurement_id?.trim() || null
    if (ga4_api_secret !== undefined) {
      const raw = ga4_api_secret?.trim() || null
      ;(row as Record<string, unknown>).ga4_api_secret = raw ? await encrypt(raw) : null
    }
  }

  const { data: existing } = await supabase
    .from('integrations')
    .select('id')
    .eq('user_id', user.id)
    .eq('platform', platform)
    .single()

  if (existing) {
    // Only update fields that were explicitly sent - never overwrite with undefined
    // to avoid wiping saved credentials (e.g. if form sent partial data)
    const updatePayload: Record<string, unknown> = { is_active: true }
    if (pixel_id !== undefined) updatePayload.pixel_id = pixel_id?.trim() || null
    if (access_token !== undefined) {
      const raw = access_token?.trim() || null
      updatePayload.access_token = raw ? await encrypt(raw) : null
    }
    if (tag_id !== undefined) updatePayload.tag_id = tag_id?.trim() || null
    if (platform === 'meta' && meta_test_event_code !== undefined) updatePayload.meta_test_event_code = meta_test_event_code?.trim() || null
    if (platform === 'google') {
      if (conversion_label !== undefined) updatePayload.conversion_label = conversion_label?.trim() || null
      if (conversion_id !== undefined) updatePayload.conversion_id = conversion_id?.trim() || null
    }
    if (platform === 'ga4') {
      if (ga4_measurement_id !== undefined) updatePayload.ga4_measurement_id = ga4_measurement_id?.trim() || null
      if (ga4_api_secret !== undefined) {
        const raw = ga4_api_secret?.trim() || null
        updatePayload.ga4_api_secret = raw ? await encrypt(raw) : null
      }
    }
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
