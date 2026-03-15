import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: property } = await supabase
    .from('gsc_properties')
    .select('id, site_url')
    .eq('user_id', user.id)
    .eq('is_selected', true)
    .eq('is_active', true)
    .maybeSingle()
  if (!property) {
    return NextResponse.json({
      has_data: false,
      totals: { clicks: 0, impressions: 0, ctr: 0, avg_position: 0 },
      top_pages: [],
      top_keywords: [],
      selected_property: null,
    })
  }

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: dailyRows, error } = await supabase
    .from('gsc_page_daily')
    .select('page, clicks, impressions, ctr, avg_position, metric_date')
    .eq('user_id', user.id)
    .eq('property_id', property.id)
    .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  const { data: keywordRows, error: keywordError } = await supabase
    .from('gsc_query_page_daily')
    .select('query, clicks, impressions, metric_date')
    .eq('user_id', user.id)
    .eq('property_id', property.id)
    .gte('metric_date', thirtyDaysAgo.toISOString().split('T')[0])

  if (keywordError) {
    return NextResponse.json({ error: keywordError.message }, { status: 500 })
  }

  const rows = dailyRows ?? []
  const keywords = keywordRows ?? []
  const totals = rows.reduce(
    (acc, r) => {
      const clicks = Number(r.clicks ?? 0)
      const impressions = Number(r.impressions ?? 0)
      const avgPosition = Number(r.avg_position ?? 0)
      acc.clicks += clicks
      acc.impressions += impressions
      acc.weightedPosition += avgPosition * Math.max(1, impressions)
      return acc
    },
    { clicks: 0, impressions: 0, weightedPosition: 0 }
  )
  const ctr = totals.impressions > 0 ? totals.clicks / totals.impressions : 0
  const avgPosition = totals.impressions > 0 ? totals.weightedPosition / totals.impressions : 0

  const pageMap = new Map<string, { page: string; clicks: number; impressions: number }>()
  for (const r of rows) {
    const page = r.page || '(unknown)'
    const existing = pageMap.get(page) ?? { page, clicks: 0, impressions: 0 }
    existing.clicks += Number(r.clicks ?? 0)
    existing.impressions += Number(r.impressions ?? 0)
    pageMap.set(page, existing)
  }

  const topPages = Array.from(pageMap.values())
    .map((p) => ({
      page: p.page,
      clicks: p.clicks,
      impressions: p.impressions,
      ctr: p.impressions > 0 ? p.clicks / p.impressions : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  const keywordMap = new Map<string, { query: string; clicks: number; impressions: number }>()
  for (const r of keywords) {
    const query = (r.query || '').trim()
    if (!query) continue
    const existing = keywordMap.get(query) ?? { query, clicks: 0, impressions: 0 }
    existing.clicks += Number(r.clicks ?? 0)
    existing.impressions += Number(r.impressions ?? 0)
    keywordMap.set(query, existing)
  }

  const topKeywords = Array.from(keywordMap.values())
    .map((k) => ({
      query: k.query,
      clicks: k.clicks,
      impressions: k.impressions,
      ctr: k.impressions > 0 ? k.clicks / k.impressions : 0,
    }))
    .sort((a, b) => b.clicks - a.clicks)
    .slice(0, 10)

  return NextResponse.json({
    has_data: rows.length > 0 || keywords.length > 0,
    selected_property: property.site_url,
    totals: {
      clicks: totals.clicks,
      impressions: totals.impressions,
      ctr,
      avg_position: avgPosition,
    },
    top_pages: topPages,
    top_keywords: topKeywords,
  })
}
