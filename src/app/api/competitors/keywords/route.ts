import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { syncCompetitorIntelForUser } from '@/lib/competitor-intel'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 5000), 1), 10000)
  const maxPosition = Math.min(Math.max(Number(url.searchParams.get('max_competitor_position') ?? 10), 1), 100)

  let query = supabase
    .from('competitor_keywords')
    .select('id, competitor_domain, keyword, search_volume, competitor_position, your_position, difficulty, captured_at')
    .eq('user_id', user.id)
    .order('captured_at', { ascending: false })
    .order('competitor_position', { ascending: true })
    .limit(limit)

  if (Number.isFinite(maxPosition)) {
    query = query.lte('competitor_position', maxPosition)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ keywords: data ?? [] })
}

export async function POST(request: NextRequest) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  let body: { competitor_domain?: string; days?: number }
  try {
    body = await request.json()
  } catch {
    body = {}
  }
  const competitorDomain = body.competitor_domain?.trim().toLowerCase()
  if (!competitorDomain) {
    return NextResponse.json({ error: 'competitor_domain is required' }, { status: 400 })
  }
  const days = Math.min(Math.max(Number(body.days ?? 90), 1), 490)

  const result = await syncCompetitorIntelForUser(user.id, competitorDomain, days)
  return NextResponse.json({ success: true, ...result })
}

