import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('plan, plan_activated_at, dashboard_type, events_this_month, events_used, events_reset_at')
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const eventsThisMonth =
    profile?.events_this_month ?? profile?.events_used ?? 0

  return NextResponse.json({
    profile: {
      plan: profile?.plan ?? 'free',
      plan_activated_at: profile?.plan_activated_at ?? null,
      dashboard_type: profile?.dashboard_type ?? 'ecommerce',
      events_this_month: eventsThisMonth,
      events_used: profile?.events_used ?? 0,
      events_reset_at: profile?.events_reset_at ?? null,
    },
    plan: profile?.plan ?? 'free',
    events_this_month: eventsThisMonth,
    dashboard_type: profile?.dashboard_type ?? 'ecommerce',
  })
}
