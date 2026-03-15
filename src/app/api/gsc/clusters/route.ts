import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const limit = Math.min(Math.max(Number(new URL(request.url).searchParams.get('limit') ?? 200), 1), 1000)

  const { data, error } = await supabase
    .from('seo_clusters')
    .select('id, cluster_name, centroid_keyword, keywords, pages, updated_at')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false })
    .limit(limit)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ clusters: data ?? [] })
}
