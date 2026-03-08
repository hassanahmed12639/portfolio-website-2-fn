import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AlertRule } from '@/lib/email-alerts'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

export const dynamic = 'force-dynamic'

const RULES_PATH = path.join(process.cwd(), 'src', 'data', 'alert-rules.json')

async function readRules(): Promise<AlertRule[]> {
  const raw = await readFile(RULES_PATH, 'utf-8').catch(() => '[]')
  return JSON.parse(raw)
}

async function writeRules(rules: AlertRule[]) {
  await writeFile(RULES_PATH, JSON.stringify(rules, null, 2))
}

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rules = await readRules()
  return NextResponse.json(rules)
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const rule: AlertRule = {
    id: crypto.randomUUID(),
    name: body.name ?? 'Unnamed',
    enabled: body.enabled ?? true,
    condition: body.condition ?? 'score_below',
    threshold: body.threshold != null ? Number(body.threshold) : 70,
    eventName: body.eventName,
    notifyEmail: body.notifyEmail ?? '',
    cooldownMinutes: Number(body.cooldownMinutes) ?? 60,
    lastTriggeredAt: null,
    createdAt: new Date().toISOString(),
    condition_group: body.condition_group,
    platform: body.platform ?? 'all',
    pixel_id: body.pixel_id ?? 'all',
    time_window: body.time_window ?? '1hour',
    currency: body.currency ?? 'USD',
    threshold_hours: body.threshold_hours != null ? Number(body.threshold_hours) : 24,
    custom_event_name: body.custom_event_name,
    custom_field: body.custom_field,
    custom_operator: body.custom_operator,
    custom_value: body.custom_value,
    frequency: body.frequency ?? 'immediately',
  }
  const rules = await readRules()
  rules.push(rule)
  await writeRules(rules)
  return NextResponse.json(rule)
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const id = body.id
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const rules = await readRules()
  const idx = rules.findIndex((r) => r.id === id)
  if (idx === -1) return NextResponse.json({ error: 'Rule not found' }, { status: 404 })

  rules[idx] = { ...rules[idx], ...body, id: rules[idx].id }
  await writeRules(rules)
  return NextResponse.json(rules[idx])
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const id = request.nextUrl.searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id required' }, { status: 400 })

  const rules = await readRules()
  const filtered = rules.filter((r) => r.id !== id)
  if (filtered.length === rules.length) return NextResponse.json({ error: 'Rule not found' }, { status: 404 })
  await writeRules(filtered)
  return NextResponse.json({ ok: true })
}
