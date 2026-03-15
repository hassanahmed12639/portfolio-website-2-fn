import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const today = new Date().toISOString().split('T')[0]
  const { data: recent } = await admin
    .from('competitor_keywords')
    .select('user_id, keyword, country, device, your_position')
    .order('captured_at', { ascending: false })
    .limit(5000)

  const rows = (recent ?? []).map((r) => ({
    user_id: r.user_id,
    keyword: r.keyword,
    country: r.country ?? 'global',
    device: r.device ?? 'all',
    metric_date: today,
    has_featured_snippet: Number(r.your_position ?? 99) <= 3,
    has_video: Number(r.your_position ?? 99) <= 10,
    has_image_pack: true,
    has_local_pack: false,
    your_url: null,
    your_position: r.your_position,
  }))
  if (rows.length > 0) {
    await admin.from('serp_features_daily').upsert(rows, {
      onConflict: 'user_id,keyword,country,device,metric_date',
    })
  }

  return NextResponse.json({ success: true, upserted: rows.length })
}
import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) return true
  return request.headers.get('x-cron-secret') === expected
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'SERP_API_KEY is not configured' }, { status: 400 })
  const admin = createAdminClient()

  const maxQueries = Math.max(1, Math.min(20, Number(new URL(request.url).searchParams.get('max') ?? 5)))
  const { data: seeds, error: seedError } = await admin
    .from('gsc_query_page_daily')
    .select('user_id, query')
    .order('impressions', { ascending: false })
    .limit(200)
  if (seedError) return NextResponse.json({ error: seedError.message }, { status: 500 })

  const picked: Array<{ user_id: string; query: string }> = []
  const seen = new Set<string>()
  for (const row of seeds ?? []) {
    const query = (row.query ?? '').trim()
    if (!query) continue
    const key = `${row.user_id}__${query.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    picked.push({ user_id: row.user_id, query })
    if (picked.length >= maxQueries) break
  }

  let inserted = 0
  for (const item of picked) {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(item.query)}&api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    const features: string[] = []
    if ((data as { answer_box?: unknown }).answer_box) features.push('answer_box')
    if ((data as { related_questions?: unknown[] }).related_questions?.length) features.push('people_also_ask')
    if ((data as { inline_videos?: unknown[] }).inline_videos?.length) features.push('videos')
    if ((data as { shopping_results?: unknown[] }).shopping_results?.length) features.push('shopping')
    if ((data as { local_results?: unknown }).local_results) features.push('local_pack')
    if ((data as { images_results?: unknown[] }).images_results?.length) features.push('images')

    const { error } = await admin.from('serp_features_daily').upsert(
      {
        user_id: item.user_id,
        keyword: item.query,
        feature_date: new Date().toISOString().slice(0, 10),
        country: 'us',
        device: 'desktop',
        features,
        source_engine: 'serpapi',
      },
      { onConflict: 'user_id,keyword,feature_date,country,device' }
    )
    if (!error) inserted += 1
  }

  return NextResponse.json({ success: true, processed_queries: picked.length, upserted_rows: inserted })
}
