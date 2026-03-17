import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit } from '@/lib/request-security'

export const dynamic = 'force-dynamic'
const MAX_NAME_LENGTH = 100
const MAX_EVENT_NAME_LENGTH = 80
const MAX_FIELD_MAP_KEYS = 50
const MAX_PIXELS_PER_WEBHOOK = 20

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-read', 60, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .select('id, user_id, name, token, event_name, event_value, pixel_ids, field_map, is_active, created_at')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !webhook) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 })
  }
  return NextResponse.json({ webhook })
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-write', 30, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const updates: Record<string, unknown> = {}
  if (body.name !== undefined) updates.name = String(body.name).trim().slice(0, MAX_NAME_LENGTH)
  if (body.event_name !== undefined) updates.event_name = String(body.event_name).trim().slice(0, MAX_EVENT_NAME_LENGTH)
  if (body.event_value !== undefined) {
    const normalized = Number(body.event_value)
    updates.event_value = Number.isFinite(normalized) ? normalized : 0
  }
  if (body.pixel_ids !== undefined) {
    updates.pixel_ids = Array.isArray(body.pixel_ids)
      ? body.pixel_ids.slice(0, MAX_PIXELS_PER_WEBHOOK)
      : []
  }
  if (body.field_map !== undefined) {
    const normalizedFieldMap =
      body.field_map && typeof body.field_map === 'object' ? body.field_map : {}
    if (Object.keys(normalizedFieldMap as Record<string, unknown>).length > MAX_FIELD_MAP_KEYS) {
      return NextResponse.json({ error: 'field_map is too large' }, { status: 400 })
    }
    updates.field_map = normalizedFieldMap
  }
  if (body.is_active !== undefined) updates.is_active = Boolean(body.is_active)
  if (body.signing_secret !== undefined) {
    if (body.signing_secret === null || body.signing_secret === '') {
      updates.signing_secret = null
    } else {
      const normalized = String(body.signing_secret).trim()
      if (normalized.length < 16) {
        return NextResponse.json({ error: 'signing_secret must be at least 16 characters' }, { status: 400 })
      }
      updates.signing_secret = normalized.slice(0, 256)
    }
  }

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    console.error('[webhooks] Update error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ webhook })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-write', 20, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { error } = await supabase
    .from('webhooks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    console.error('[webhooks] Delete error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}
