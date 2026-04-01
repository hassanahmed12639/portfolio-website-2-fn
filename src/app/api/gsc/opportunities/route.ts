import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const url = new URL(request.url)
  const limit = Math.min(Math.max(Number(url.searchParams.get('limit') ?? 5000), 1), 50000)
  const allRows = url.searchParams.get('all') === '1'

  let query = supabase
    .from('seo_opportunities')
    .select('id, opportunity_type, page, keyword, priority_score, impact_score, recommendation, recommendation_json, status, detected_at')
    .eq('user_id', user.id)
    .order('priority_score', { ascending: false })
  if (!allRows) {
    query = query.limit(limit)
  }

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const opportunities = data ?? []
  return NextResponse.json({
    total_opportunities: opportunities.length,
    returned_opportunities: opportunities.length,
    opportunities,
  })
}

export async function POST() {
  return NextResponse.json(
    { success: false, error: 'SEO intelligence has been removed.' },
    { status: 410 }
  )
}

