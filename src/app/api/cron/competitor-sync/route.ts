import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { syncCompetitorIntelForUser } from '@/lib/competitor-intel'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: users, error } = await admin.from('profiles').select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let processed = 0
  const failures: Array<{ user_id: string; reason: string }> = []
  for (const user of users ?? []) {
    try {
      await syncCompetitorIntelForUser(user.id, 'example-competitor.com', 90)
      processed += 1
    } catch (e) {
      failures.push({ user_id: user.id, reason: e instanceof Error ? e.message : 'failed' })
    }
  }

  return NextResponse.json({ success: true, processed_users: processed, failures })
}

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) return true
  return request.headers.get('x-cron-secret') === expected
}

function toDomain(input: string | undefined): string | null {
  if (!input) return null
  try {
    return new URL(input).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const apiKey = process.env.SERP_API_KEY
  if (!apiKey) return NextResponse.json({ error: 'SERP_API_KEY is not configured' }, { status: 400 })
  const admin = createAdminClient()

  const maxQueries = Math.max(1, Math.min(20, Number(new URL(request.url).searchParams.get('max') ?? 5)))

  const { data: seedRows, error: seedError } = await admin
    .from('gsc_query_page_daily')
    .select('user_id, property_id, query')
    .order('impressions', { ascending: false })
    .limit(200)
  if (seedError) return NextResponse.json({ error: seedError.message }, { status: 500 })

  const uniqueSeeds: Array<{ user_id: string; property_id: string; query: string }> = []
  const seen = new Set<string>()
  for (const row of seedRows ?? []) {
    const query = (row.query ?? '').trim()
    if (!query) continue
    const key = `${row.user_id}__${query.toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    uniqueSeeds.push({ user_id: row.user_id, property_id: row.property_id, query })
    if (uniqueSeeds.length >= maxQueries) break
  }

  let inserted = 0
  for (const seed of uniqueSeeds) {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(seed.query)}&api_key=${encodeURIComponent(apiKey)}`
    const res = await fetch(url, { cache: 'no-store' })
    const data = await res.json().catch(() => ({}))
    const organic = (data as { organic_results?: Array<{ position?: number; link?: string }> }).organic_results ?? []
    const rows = organic
      .slice(0, 10)
      .map((r) => {
        const domain = toDomain(r.link)
        if (!domain) return null
        return {
          user_id: seed.user_id,
          property_id: seed.property_id,
          competitor_domain: domain,
          keyword: seed.query,
          country: 'us',
          device: 'desktop',
          rank: Number(r.position ?? 0) || null,
          serp_url: r.link ?? null,
          fetched_at: new Date().toISOString(),
        }
      })
      .filter(Boolean)
    if (rows.length) {
      const { error } = await admin.from('competitor_keywords').insert(rows)
      if (!error) inserted += rows.length
    }
  }

  return NextResponse.json({ success: true, processed_queries: uniqueSeeds.length, inserted_rows: inserted })
}
