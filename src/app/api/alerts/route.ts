import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AlertRule } from '@/lib/email-alerts'

export const dynamic = 'force-dynamic'

function toClientRule(row: Record<string, unknown>): AlertRule {
  return {
    id: String(row.id),
    name: String(row.name ?? 'Unnamed'),
    enabled: Boolean(row.enabled ?? true),
    condition: String(row.condition ?? 'score_below'),
    threshold: row.threshold == null ? undefined : Number(row.threshold),
    eventName: typeof row.event_name === 'string' ? row.event_name : undefined,
    notifyEmail: String(row.notify_email ?? ''),
    cooldownMinutes: Number(row.cooldown_minutes ?? 60),
    lastTriggeredAt:
      row.last_triggered_at == null ? null : String(row.last_triggered_at),
    createdAt: String(row.created_at ?? new Date().toISOString()),
    condition_group:
      typeof row.condition_group === 'string' ? row.condition_group : undefined,
    platform: typeof row.platform === 'string' ? row.platform : undefined,
    pixel_id: typeof row.pixel_id === 'string' ? row.pixel_id : undefined,
    time_window:
      typeof row.time_window === 'string' ? row.time_window : undefined,
    currency: typeof row.currency === 'string' ? row.currency : undefined,
    threshold_hours:
      row.threshold_hours == null ? undefined : Number(row.threshold_hours),
    custom_event_name:
      typeof row.custom_event_name === 'string'
        ? row.custom_event_name
        : undefined,
    custom_field:
      typeof row.custom_field === 'string' ? row.custom_field : undefined,
    custom_operator:
      typeof row.custom_operator === 'string'
        ? row.custom_operator
        : undefined,
    custom_value:
      typeof row.custom_value === 'string' ? row.custom_value : undefined,
    frequency: typeof row.frequency === 'string' ? row.frequency : undefined,
  }
}

export async function GET() {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('alert_rules')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: true })
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json((data ?? []).map((r) => toClientRule(r as Record<string, unknown>)))
}

export async function POST(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const insertPayload = {
    user_id: user.id,
    name: body.name ?? 'Unnamed',
    enabled: body.enabled ?? true,
    condition: body.condition ?? 'score_below',
    threshold: body.threshold != null ? Number(body.threshold) : 70,
    event_name: body.eventName ?? null,
    notify_email: body.notifyEmail ?? '',
    cooldown_minutes: Number(body.cooldownMinutes) ?? 60,
    last_triggered_at: null,
    condition_group: body.condition_group ?? null,
    platform: body.platform ?? 'all',
    pixel_id: body.pixel_id ?? 'all',
    time_window: body.time_window ?? '1hour',
    currency: body.currency ?? 'USD',
    threshold_hours: body.threshold_hours != null ? Number(body.threshold_hours) : 24,
    custom_event_name: body.custom_event_name ?? null,
    custom_field: body.custom_field ?? null,
    custom_operator: body.custom_operator ?? null,
    custom_value: body.custom_value ?? null,
    frequency: body.frequency ?? 'immediately',
    updated_at: new Date().toISOString(),
  }
  const { data, error } = await supabase
    .from('alert_rules')
    .insert(insertPayload)
    .select('*')
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Create failed' }, { status: 500 })
  return NextResponse.json(toClientRule(data as Record<string, unknown>))
}

export async function PUT(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const id = body.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const updatePayload: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  }
  if (body.name !== undefined) updatePayload.name = body.name
  if (body.enabled !== undefined) updatePayload.enabled = body.enabled
  if (body.condition !== undefined) updatePayload.condition = body.condition
  if (body.threshold !== undefined) updatePayload.threshold = Number(body.threshold)
  if (body.eventName !== undefined) updatePayload.event_name = body.eventName
  if (body.notifyEmail !== undefined) updatePayload.notify_email = body.notifyEmail
  if (body.cooldownMinutes !== undefined) updatePayload.cooldown_minutes = Number(body.cooldownMinutes)
  if (body.lastTriggeredAt !== undefined) updatePayload.last_triggered_at = body.lastTriggeredAt
  if (body.condition_group !== undefined) updatePayload.condition_group = body.condition_group
  if (body.platform !== undefined) updatePayload.platform = body.platform
  if (body.pixel_id !== undefined) updatePayload.pixel_id = body.pixel_id
  if (body.time_window !== undefined) updatePayload.time_window = body.time_window
  if (body.currency !== undefined) updatePayload.currency = body.currency
  if (body.threshold_hours !== undefined) updatePayload.threshold_hours = Number(body.threshold_hours)
  if (body.custom_event_name !== undefined) updatePayload.custom_event_name = body.custom_event_name
  if (body.custom_field !== undefined) updatePayload.custom_field = body.custom_field
  if (body.custom_operator !== undefined) updatePayload.custom_operator = body.custom_operator
  if (body.custom_value !== undefined) updatePayload.custom_value = body.custom_value
  if (body.frequency !== undefined) updatePayload.frequency = body.frequency

  const { data, error } = await supabase
    .from('alert_rules')
    .update(updatePayload)
    .eq('id', id)
    .eq('user_id', user.id)
    .select('*')
    .single()
  if (error || !data) return NextResponse.json({ error: error?.message ?? 'Rule not found' }, { status: 404 })
  return NextResponse.json(toClientRule(data as Record<string, unknown>))
}

export async function DELETE(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const { error } = await supabase
    .from('alert_rules')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)
  if (error) return NextResponse.json({ error: error.message }, { status: 404 })
  return NextResponse.json({ ok: true })
}

