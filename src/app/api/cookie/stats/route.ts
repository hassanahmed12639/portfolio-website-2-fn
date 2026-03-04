import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ total_visitors: 0, returning_visitors: 0, avg_cookie_age_days: 0, visitors_saved: 0 })
  }

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const { data: visitors } = await admin
    .from('cookie_visitors')
    .select('first_seen, last_seen, visit_count')
    .eq('user_id', user.id)

  const total = visitors?.length ?? 0
  const returning = visitors?.filter((v) => (v.visit_count ?? 0) > 1).length ?? 0
  const now = Date.now()
  let sumDays = 0
  let countWithAge = 0
  let visitorsSaved = 0
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000

  for (const v of visitors ?? []) {
    const first = v.first_seen ? new Date(v.first_seen).getTime() : 0
    if (first) {
      const ageDays = (now - first) / (24 * 60 * 60 * 1000)
      sumDays += ageDays
      countWithAge += 1
      if (ageDays > 7) visitorsSaved += 1
    }
  }

  const avgCookieAgeDays = countWithAge > 0 ? Math.round(sumDays / countWithAge) : 0

  return NextResponse.json({
    total_visitors: total,
    returning_visitors: returning,
    avg_cookie_age_days: avgCookieAgeDays,
    visitors_saved: visitorsSaved,
  })
}
