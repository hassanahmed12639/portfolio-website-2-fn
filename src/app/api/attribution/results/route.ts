import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const modelKey = url.searchParams.get('model_key') ?? 'last_click'
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 200), 1), 1000)

  const { data: model } = await supabase
    .from('attribution_models')
    .select('id')
    .eq('model_key', modelKey)
    .eq('is_active', true)
    .maybeSingle()
  if (!model) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

  const { data, error } = await supabase
    .from('attribution_results')
    .select('id, channel, credit_pct, revenue_allocated, computed_at, conversion_id')
    .eq('user_id', user.id)
    .eq('model_id', model.id)
    .order('computed_at', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const byChannel = new Map<string, { channel: string; revenue: number; conversions: number; credit: number }>()
  for (const row of data ?? []) {
    const channel = row.channel || 'direct'
    const entry = byChannel.get(channel) ?? { channel, revenue: 0, conversions: 0, credit: 0 }
    entry.revenue += Number(row.revenue_allocated ?? 0)
    entry.credit += Number(row.credit_pct ?? 0)
    entry.conversions += 1
    byChannel.set(channel, entry)
  }

  return NextResponse.json({
    model_key: modelKey,
    rows: data ?? [],
    channel_summary: Array.from(byChannel.values()).sort((a, b) => b.revenue - a.revenue),
  })
}
