import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: jobs, error } = await supabase
    .from('retry_queue')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const pending = (jobs ?? []).filter((j) => j.status === 'pending').length
  const retrying = (jobs ?? []).filter((j) => j.status === 'retrying').length
  const recovered = (jobs ?? []).filter((j) => j.status === 'success').length
  const exhausted = (jobs ?? []).filter((j) => j.status === 'exhausted').length

  return NextResponse.json({
    jobs: jobs ?? [],
    stats: { pending, retrying, recovered, exhausted },
  })
}
