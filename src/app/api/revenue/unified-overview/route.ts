import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const url = new URL(request.url)
  const modelKey = url.searchParams.get('model_key') ?? 'last_click'
  const days = Math.min(Math.max(Number(url.searchParams.get('days') ?? 30), 1), 730)
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceIso = since.toISOString()

  const { data: model } = await supabase
    .from('attribution_models')
    .select('id')
    .eq('model_key', modelKey)
    .eq('is_active', true)
    .maybeSingle()
  if (!model) return NextResponse.json({ error: 'Model not found' }, { status: 404 })

  const [{ data: conversions }, { data: results }, { data: campaigns }] = await Promise.all([
    supabase
      .from('conversions_fact')
      .select('id, value, conversion_at')
      .eq('user_id', user.id)
      .gte('conversion_at', sinceIso),
    supabase
      .from('attribution_results')
      .select('channel, revenue_allocated, computed_at')
      .eq('user_id', user.id)
      .eq('model_id', model.id)
      .gte('computed_at', sinceIso),
    supabase
      .from('ad_campaigns')
      .select('platform, spend, date_end')
      .eq('user_id', user.id)
      .gte('date_end', sinceIso.split('T')[0]),
  ])

  const exactTrackedRevenue = (conversions ?? []).reduce((sum, c) => sum + Number(c.value ?? 0), 0)
  const attributedRevenue = (results ?? []).reduce((sum, r) => sum + Number(r.revenue_allocated ?? 0), 0)
  const spendByChannel = new Map<string, number>()
  for (const c of campaigns ?? []) {
    const ch = c.platform === 'google' ? 'google_ads' : (c.platform ?? 'unknown')
    spendByChannel.set(ch, (spendByChannel.get(ch) ?? 0) + Number(c.spend ?? 0))
  }
  const revenueByChannel = new Map<string, number>()
  for (const r of results ?? []) {
    const ch = r.channel ?? 'direct'
    revenueByChannel.set(ch, (revenueByChannel.get(ch) ?? 0) + Number(r.revenue_allocated ?? 0))
  }

  const channels = Array.from(new Set([...spendByChannel.keys(), ...revenueByChannel.keys()])).map((channel) => {
    const spend = spendByChannel.get(channel) ?? 0
    const revenue = revenueByChannel.get(channel) ?? 0
    return {
      channel,
      spend,
      attributed_revenue: revenue,
      roas: spend > 0 ? revenue / spend : null,
    }
  })

  return NextResponse.json({
    model_key: modelKey,
    period_days: days,
    exact_tracked_revenue: exactTrackedRevenue,
    modeled_attributed_revenue: attributedRevenue,
    delta: exactTrackedRevenue - attributedRevenue,
    channels: channels.sort((a, b) => b.attributed_revenue - a.attributed_revenue),
  })
}

