import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enforceRateLimit } from '@/lib/request-security'

export const dynamic = 'force-dynamic'
const MAX_NAME_LENGTH = 100
const MAX_EVENT_NAME_LENGTH = 80
const MAX_FIELD_MAP_KEYS = 50
const MAX_PIXELS_PER_WEBHOOK = 20

export async function GET(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-read', 60, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('id, user_id, name, token, event_name, event_value, pixel_ids, field_map, is_active, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('[webhooks] List error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = webhooks ?? []
  const ids = list.map((w: { id: string }) => w.id)
  const countByWebhook: Record<string, number> = {}
  if (ids.length) {
    const { data: logs } = await supabase
      .from('webhook_logs')
      .select('webhook_id')
      .eq('user_id', user.id)
      .in('webhook_id', ids)
    ids.forEach((id: string) => { countByWebhook[id] = 0 })
    ;(logs ?? []).forEach((row: { webhook_id: string }) => {
      countByWebhook[row.webhook_id] = (countByWebhook[row.webhook_id] ?? 0) + 1
    })
  }
  const webhooksWithHits = list.map((w: { id: string } & Record<string, unknown>) => ({
    ...w,
    hit_count: countByWebhook[w.id] ?? 0,
  }))

  return NextResponse.json({ webhooks: webhooksWithHits })
}

export async function POST(req: NextRequest) {
  const rateLimitResponse = enforceRateLimit(req, 'webhooks-write', 20, 60_000)
  if (rateLimitResponse) return rateLimitResponse

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, event_name, event_value, pixel_ids, field_map, is_active, signing_secret } = body

  const normalizedName = ((name && String(name).trim()) || 'Unnamed webhook').slice(0, MAX_NAME_LENGTH)
  const normalizedEventName = String(event_name ?? 'Lead').trim().slice(0, MAX_EVENT_NAME_LENGTH) || 'Lead'
  const normalizedEventValue = Number(event_value)
  const normalizedPixelIds = Array.isArray(pixel_ids) ? pixel_ids.slice(0, MAX_PIXELS_PER_WEBHOOK) : []
  const normalizedFieldMap =
    field_map && typeof field_map === 'object' ? field_map : {}
  if (Object.keys(normalizedFieldMap as Record<string, unknown>).length > MAX_FIELD_MAP_KEYS) {
    return NextResponse.json({ error: 'field_map is too large' }, { status: 400 })
  }
  const normalizedSigningSecret =
    typeof signing_secret === 'string' && signing_secret.trim().length >= 16
      ? signing_secret.trim().slice(0, 256)
      : null

  const insert: Record<string, unknown> = {
    user_id: user.id,
    name: normalizedName,
    event_name: normalizedEventName,
    event_value: Number.isFinite(normalizedEventValue) ? normalizedEventValue : 0,
    pixel_ids: normalizedPixelIds,
    field_map: normalizedFieldMap,
    is_active: is_active !== false,
  }
  if (normalizedSigningSecret) insert.signing_secret = normalizedSigningSecret

  const { data: webhook, error } = await supabase
    .from('webhooks')
    .insert(insert)
    .select()
    .single()

  if (error) {
    console.error('[webhooks] Create error:', error.message)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ webhook })
}
