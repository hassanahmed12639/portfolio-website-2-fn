import { createAdminClient } from '@/lib/supabase/admin'

type GscRow = {
  query: string
  page: string
  clicks: number
  impressions: number
  ctr: number
  position: number
}

function tokenizeKeyword(query: string): string[] {
  return query
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
}

function keywordClusterName(query: string): string {
  const tokens = tokenizeKeyword(query)
  return tokens.slice(0, 2).join(' ') || query.toLowerCase()
}

export async function computeSeoIntelligence(userId: string, propertyId: string, days = 90) {
  const admin = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const sinceDate = since.toISOString().split('T')[0]

  const { data, error } = await admin
    .from('gsc_query_page_daily')
    .select('query, page, clicks, impressions, ctr, position')
    .eq('user_id', userId)
    .eq('property_id', propertyId)
    .gte('metric_date', sinceDate)
  if (error) throw new Error(error.message)
  const rows = (data ?? []) as GscRow[]

  // Aggregate fragmented daily/country/device rows first so we score true query-page performance.
  const perfMap = new Map<
    string,
    {
      query: string
      page: string
      clicks: number
      impressions: number
      weightedPosition: number
    }
  >()
  for (const row of rows) {
    const query = (row.query ?? '').trim()
    const page = (row.page ?? '').trim()
    if (!query || !page) continue
    const key = `${query}__${page}`
    const existing = perfMap.get(key) ?? {
      query,
      page,
      clicks: 0,
      impressions: 0,
      weightedPosition: 0,
    }
    const impressions = Number(row.impressions ?? 0)
    const clicks = Number(row.clicks ?? 0)
    const position = Number(row.position ?? 0)
    existing.clicks += clicks
    existing.impressions += impressions
    existing.weightedPosition += position * Math.max(1, impressions)
    perfMap.set(key, existing)
  }

  const aggregatedRows = Array.from(perfMap.values()).map((v) => ({
    query: v.query,
    page: v.page,
    clicks: v.clicks,
    impressions: v.impressions,
    ctr: v.impressions > 0 ? v.clicks / v.impressions : 0,
    position: v.impressions > 0 ? v.weightedPosition / v.impressions : 0,
  }))

  const opportunities: Array<Record<string, unknown>> = []
  for (const row of aggregatedRows) {
    if (row.impressions >= 30 && row.ctr < 0.08) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'low_ctr_high_impr',
        page: row.page,
        keyword: row.query,
        priority_score: Math.min(100, row.impressions / 20),
        impact_score: Math.min(100, row.impressions * Math.max(0.005, 0.06 - row.ctr)),
        recommendation: `Improve title/meta for "${row.query}" on ${row.page} to raise CTR.`,
        recommendation_json: {
          action: 'meta_refresh',
          target_ctr: 0.06,
          current_ctr: row.ctr,
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    if (row.position >= 4 && row.position <= 20 && row.impressions >= 10) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'pos_5_20',
        page: row.page,
        keyword: row.query,
        priority_score: Math.min(100, (21 - row.position) * 4 + row.impressions / 100),
        impact_score: Math.min(100, row.impressions / 20),
        recommendation: `Expand content for "${row.query}" and improve internal links to push into top 3.`,
        recommendation_json: {
          action: 'content_upgrade',
          target_position: 3,
          current_position: row.position,
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    if (row.position > 0 && row.position <= 10 && row.impressions >= 10 && row.ctr < 0.12) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'top10_ctr_upgrade',
        page: row.page,
        keyword: row.query,
        priority_score: Math.min(100, row.impressions / 15),
        impact_score: Math.min(100, row.impressions * Math.max(0.003, 0.07 - row.ctr)),
        recommendation: `This keyword is already top 10. Improve snippet and intent-match to raise CTR quickly.`,
        recommendation_json: {
          action: 'ctr_quick_win',
          current_position: row.position,
          current_ctr: row.ctr,
          target_ctr: 0.07,
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    if (row.position > 10 && row.position <= 30 && row.impressions >= 5) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'pos_11_30',
        page: row.page,
        keyword: row.query,
        priority_score: Math.min(100, (31 - row.position) * 3 + row.impressions / 20),
        impact_score: Math.min(100, row.impressions / 10),
        recommendation: `This keyword can enter top 10 with stronger on-page relevance and internal links.`,
        recommendation_json: {
          action: 'top10_push',
          current_position: row.position,
          target_position: 10,
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
    if (row.position > 0 && row.position <= 30 && row.impressions >= 10 && row.ctr < 0.15) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'ctr_growth',
        page: row.page,
        keyword: row.query,
        priority_score: Math.min(100, row.impressions / 10),
        impact_score: Math.min(100, row.impressions * Math.max(0.002, 0.15 - row.ctr)),
        recommendation: `CTR is below potential for this ranking band. Refresh title, meta, and SERP intent match.`,
        recommendation_json: {
          action: 'ctr_growth',
          current_position: row.position,
          current_ctr: row.ctr,
          target_ctr: 0.15,
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  const byKeywordPages = new Map<string, Set<string>>()
  for (const row of aggregatedRows) {
    const set = byKeywordPages.get(row.query) ?? new Set<string>()
    set.add(row.page)
    byKeywordPages.set(row.query, set)
  }
  for (const [keyword, pages] of byKeywordPages) {
    if (pages.size > 1) {
      opportunities.push({
        user_id: userId,
        property_id: propertyId,
        opportunity_type: 'cannibalization',
        page: Array.from(pages)[0] ?? null,
        keyword,
        priority_score: Math.min(100, pages.size * 20),
        impact_score: Math.min(100, pages.size * 15),
        recommendation: `Multiple pages rank for "${keyword}". Consolidate intent and internal linking.`,
        recommendation_json: {
          action: 'cannibalization_fix',
          pages: Array.from(pages),
        },
        status: 'open',
        detected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
    }
  }

  const dedupeOppMap = new Map<string, Record<string, unknown>>()
  for (const item of opportunities) {
    const key = `${String(item.opportunity_type ?? '')}__${String(item.keyword ?? '')}__${String(item.page ?? '')}`
    dedupeOppMap.set(key, item)
  }
  const dedupedOpportunities = Array.from(dedupeOppMap.values())
    .sort((a, b) => Number(b.priority_score ?? 0) - Number(a.priority_score ?? 0))
    .slice(0, 20000)

  await admin.from('seo_opportunities').delete().eq('user_id', userId).eq('property_id', propertyId)
  if (dedupedOpportunities.length > 0) {
    await admin.from('seo_opportunities').insert(dedupedOpportunities)
  }

  // Clusters
  const clusterMap = new Map<
    string,
    { cluster_name: string; centroid_keyword: string; keywords: Set<string>; pages: Set<string> }
  >()
  for (const row of aggregatedRows) {
    const cluster = keywordClusterName(row.query)
    const entry = clusterMap.get(cluster) ?? {
      cluster_name: cluster,
      centroid_keyword: row.query,
      keywords: new Set<string>(),
      pages: new Set<string>(),
    }
    entry.keywords.add(row.query)
    entry.pages.add(row.page)
    clusterMap.set(cluster, entry)
  }

  const clusters = Array.from(clusterMap.values()).map((c) => ({
    user_id: userId,
    property_id: propertyId,
    cluster_name: c.cluster_name,
    centroid_keyword: c.centroid_keyword,
    keywords: Array.from(c.keywords),
    pages: Array.from(c.pages),
    updated_at: new Date().toISOString(),
  }))
  await admin.from('seo_clusters').delete().eq('user_id', userId).eq('property_id', propertyId)
  if (clusters.length > 0) {
    await admin.from('seo_clusters').insert(clusters.slice(0, 500))
  }

  const cannibalizationRows = Array.from(byKeywordPages.entries())
    .filter(([, pages]) => pages.size > 1)
    .map(([keyword, pages]) => ({
      user_id: userId,
      property_id: propertyId,
      keyword,
      pages: Array.from(pages),
      severity: Math.min(100, pages.size * 25),
      detected_at: new Date().toISOString(),
    }))
  await admin.from('seo_cannibalization').delete().eq('user_id', userId).eq('property_id', propertyId)
  if (cannibalizationRows.length > 0) {
    await admin.from('seo_cannibalization').insert(cannibalizationRows.slice(0, 500))
  }

  return {
    analyzed_rows: aggregatedRows.length,
    opportunities: dedupedOpportunities.length,
    clusters: clusters.length,
    cannibalization: cannibalizationRows.length,
  }
}
