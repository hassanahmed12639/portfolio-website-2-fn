import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function asNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function GET(request: NextRequest) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const limit = Math.max(1, Math.min(200, Number(searchParams.get('limit') ?? 50)))
  const days = Math.max(1, Math.min(490, Number(searchParams.get('days') ?? 30)))

  const { data: property } = await supabase
    .from('gsc_properties')
    .select('id, site_url')
    .eq('user_id', user.id)
    .eq('is_selected', true)
    .eq('is_active', true)
    .maybeSingle()
  if (!property) return NextResponse.json({ selected_property: null, pages: [] })

  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const { data: rows, error } = await supabase
    .from('gsc_page_daily')
    .select('page, clicks, impressions, ctr, avg_position')
    .eq('user_id', user.id)
    .eq('property_id', property.id)
    .gte('metric_date', fromDate)
    .order('impressions', { ascending: false })
    .limit(5000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const map = new Map<string, { page: string; clicks: number; impressions: number; weightedPos: number }>()
  for (const row of rows ?? []) {
    const page = (row.page ?? '').trim() || '(unknown)'
    const existing = map.get(page) ?? { page, clicks: 0, impressions: 0, weightedPos: 0 }
    const impressions = asNumber(row.impressions)
    existing.clicks += asNumber(row.clicks)
    existing.impressions += impressions
    existing.weightedPos += asNumber(row.avg_position) * Math.max(1, impressions)
    map.set(page, existing)
  }

  const pages = Array.from(map.values())
    .map((p) => ({
      page: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: p.impressions > 0 ? p.clicks / p.impressions : 0,
      avg_position: p.impressions > 0 ? p.weightedPos / p.impressions : 0,
    }))
    .sort((a, b) => b.impressions - a.impressions)
    .slice(0, limit)

  return NextResponse.json({
    selected_property: property.site_url,
    range_days: days,
    pages,
  })
}

