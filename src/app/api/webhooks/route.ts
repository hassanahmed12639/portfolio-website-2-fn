import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: webhooks, error } = await supabase
    .from('webhooks')
    .select('*')
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
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json().catch(() => ({}))
  const { name, event_name, event_value, pixel_ids, field_map, is_active } = body

  const insert: Record<string, unknown> = {
    user_id: user.id,
    name: (name && String(name).trim()) || 'Unnamed webhook',
    event_name: event_name ?? 'Lead',
    event_value: event_value != null ? Number(event_value) : 0,
    pixel_ids: Array.isArray(pixel_ids) ? pixel_ids : [],
    field_map: field_map && typeof field_map === 'object' ? field_map : {},
    is_active: is_active !== false,
  }

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
