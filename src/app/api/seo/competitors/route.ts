import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data: keywords, error: kwError } = await supabase
    .from('competitor_keywords')
    .select('competitor_domain, keyword, rank, search_volume, difficulty, fetched_at')
    .eq('user_id', user.id)
    .order('fetched_at', { ascending: false })
    .limit(200)
  if (kwError) return NextResponse.json({ error: kwError.message }, { status: 500 })

  const { data: features, error: fError } = await supabase
    .from('serp_features_daily')
    .select('keyword, feature_date, country, device, features')
    .eq('user_id', user.id)
    .order('feature_date', { ascending: false })
    .limit(200)
  if (fError) return NextResponse.json({ error: fError.message }, { status: 500 })

  return NextResponse.json({
    competitor_keywords: keywords ?? [],
    serp_features: features ?? [],
  })
}

