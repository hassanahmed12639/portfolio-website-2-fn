import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('seo_opportunities')
    .select('id, keyword, page, priority_score, impact_score, opportunity_type')
    .eq('user_id', user.id)
    .order('priority_score', { ascending: false })
    .limit(500)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    points: (data ?? []).map((r) => ({
      id: r.id,
      x: Number(r.priority_score ?? 0),
      y: Number(r.impact_score ?? 0),
      keyword: r.keyword,
      page: r.page,
      type: r.opportunity_type,
    })),
  })
}

