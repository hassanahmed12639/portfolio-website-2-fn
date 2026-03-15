import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function asNumber(value: unknown) {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const requestedLimit = Number(searchParams.get('limit') ?? 100000)
  const limit = Math.max(1, Math.min(200000, requestedLimit))
  const allRows = searchParams.get('all') === '1'
  const days = Math.max(1, Math.min(490, Number(searchParams.get('days') ?? 30)))
  const top10Only = searchParams.get('top10') === '1'

  const { data: property } = await supabase
    .from('gsc_properties')
    .select('id, site_url')
    .eq('user_id', user.id)
    .eq('is_selected', true)
    .eq('is_active', true)
    .maybeSingle()
  if (!property) return NextResponse.json({ selected_property: null, keywords: [] })

  const fromDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const rows: Array<{ query: string | null; clicks: number | null; impressions: number | null; ctr: number | null; position: number | null }> = []
  const batchSize = 1000
  const maxSourceRows = 250000

  for (let offset = 0; offset < maxSourceRows; offset += batchSize) {
    const { data, error } = await supabase
      .from('gsc_query_page_daily')
      .select('query, clicks, impressions, ctr, position')
      .eq('user_id', user.id)
      .eq('property_id', property.id)
      .gte('metric_date', fromDate)
      .order('impressions', { ascending: false })
      .range(offset, offset + batchSize - 1)
    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    const chunk = data ?? []
    rows.push(...chunk)
    if (chunk.length < batchSize) break
  }

  const map = new Map<string, { query: string; clicks: number; impressions: number; weightedPos: number }>()
  for (const row of rows ?? []) {
    const query = (row.query ?? '').trim()
    if (!query) continue
    const existing = map.get(query) ?? { query, clicks: 0, impressions: 0, weightedPos: 0 }
    const impressions = asNumber(row.impressions)
    existing.clicks += asNumber(row.clicks)
    existing.impressions += impressions
    existing.weightedPos += asNumber(row.position) * Math.max(1, impressions)
    map.set(query, existing)
  }

  const keywords = Array.from(map.values())
    .map((k) => ({
      query: k.query,
      clicks: k.clicks,
      impressions: k.impressions,
      ctr: k.impressions > 0 ? k.clicks / k.impressions : 0,
      position: k.impressions > 0 ? k.weightedPos / k.impressions : 0,
    }))
    .filter((k) => k.position > 0)
    .filter((k) => (top10Only ? k.position <= 10 : true))
    .sort((a, b) => b.impressions - a.impressions)

  const output = allRows ? keywords : keywords.slice(0, limit)

  return NextResponse.json({
    selected_property: property.site_url,
    range_days: days,
    top10_only: top10Only,
    source_rows_scanned: rows.length,
    total_keywords: keywords.length,
    returned_keywords: output.length,
    keywords: output,
  })
}
