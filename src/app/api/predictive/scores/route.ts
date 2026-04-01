import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get('limit') ?? 200), 1), 1000)

  const { data, error } = await supabase
    .from('predictive_scores')
    .select('id, keyword, page, probability_top3, expected_click_uplift, expected_revenue_uplift, model_version, generated_at')
    .eq('user_id', user.id)
    .order('generated_at', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ scores: data ?? [] })
}

