import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const [
    { count: totalUsers },
    { count: totalEvents },
    { data: allProfiles },
    { data: recentUsers },
  ] = await Promise.all([
    admin.from('profiles').select('id', { count: 'exact', head: true }),
    admin.from('events').select('id', { count: 'exact', head: true }),
    admin.from('profiles').select('plan, created_at'),
    admin
      .from('profiles')
      .select('id, email, plan, created_at, api_key')
      .order('created_at', { ascending: false })
      .limit(50),
  ])

  const plans = { free: 0, pro: 0, agency: 0, trial: 0 }
  allProfiles?.forEach((p) => {
    const plan = (p.plan || 'free') as keyof typeof plans
    if (plans[plan] !== undefined) plans[plan]++
  })

  const mrr = plans.pro * 10 + plans.agency * 25
  const arr = mrr * 12

  const signupsByDay: Record<string, number> = {}
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
  allProfiles?.forEach((u) => {
    if (new Date(u.created_at) > thirtyDaysAgo) {
      const day = u.created_at.split('T')[0]
      signupsByDay[day] = (signupsByDay[day] || 0) + 1
    }
  })

  const today = new Date().toISOString().split('T')[0]
  const todaySignups = signupsByDay[today] || 0

  return NextResponse.json({
    totalUsers: totalUsers || 0,
    totalEvents: totalEvents || 0,
    plans,
    mrr,
    arr,
    recentUsers: recentUsers || [],
    signupsByDay,
    todaySignups,
  })
}
