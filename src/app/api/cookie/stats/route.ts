import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({
      total_visitors: 0,
      returning_visitors: 0,
      avg_cookie_age_days: 0,
      visitors_saved: 0,
    })
  }

  const admin = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  // Get visitor stats from visitors table by user_id
  // Visitors are keyed by user_id (resolved from profile.api_key or pixel when cookie/set is called)
  const { data: visitors } = await admin
    .from('visitors')
    .select('*')
    .eq('user_id', user.id)

  const totalVisitors = visitors?.length ?? 0
  const returningVisitors = visitors?.filter((v) => v.is_returning).length ?? 0

  // Calculate avg cookie age from first_seen
  const avgCookieAge =
    (visitors?.length ?? 0) > 0
      ? Math.round(
          (visitors ?? []).reduce(
            (sum, v) => {
              const firstSeen = v.first_seen
              if (!firstSeen) return sum
              const days = Math.floor(
                (Date.now() - new Date(firstSeen).getTime()) / (1000 * 60 * 60 * 24)
              )
              return sum + days
            },
            0
          ) / (visitors?.filter((v) => v.first_seen).length || 1)
        )
      : 0

  // Visitors saved = returning visitors who would have been lost without extender
  const visitorsSaved = returningVisitors

  return NextResponse.json({
    total_visitors: totalVisitors,
    returning_visitors: returningVisitors,
    avg_cookie_age_days: avgCookieAge,
    visitors_saved: visitorsSaved,
  })
}

