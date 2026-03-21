import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

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
    .select(
      'id, email, full_name, api_key, plan, plan_activated_at, dashboard_type, display_currency, business_name, website_url, business_type, events_this_month, events_used, events_reset_at, created_at, avatar_type, avatar_url, trial_started_at, trial_expires_at, is_trial'
    )
    .eq('id', user.id)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const eventsThisMonth = profile?.events_this_month ?? profile?.events_used ?? 0
  const fullName = profile?.full_name ?? user.user_metadata?.full_name ?? null
  const email = profile?.email ?? user.email ?? null

  // Return flat object for account page compatibility; also support legacy nested format for billing etc.
  const flatProfile = {
    id: profile?.id ?? user.id,
    email,
    full_name: fullName,
    api_key: profile?.api_key ?? null,
    plan: profile?.plan ?? 'free',
    plan_activated_at: profile?.plan_activated_at ?? null,
    dashboard_type: profile?.dashboard_type ?? 'ecommerce',
    display_currency: profile?.display_currency ?? 'USD',
    business_name: profile?.business_name ?? null,
    website_url: profile?.website_url ?? null,
    business_type: profile?.business_type ?? null,
    events_this_month: eventsThisMonth,
    events_used: profile?.events_used ?? 0,
    events_reset_at: profile?.events_reset_at ?? null,
    created_at: profile?.created_at ?? user.created_at ?? null,
    avatar_type: profile?.avatar_type ?? 'initials',
    avatar_url: profile?.avatar_url ?? null,
    trial_started_at: profile?.trial_started_at ?? null,
    trial_expires_at: profile?.trial_expires_at ?? null,
    is_trial: profile?.is_trial ?? false,
  }

  // Return flat object for account page; nested profile for billing and other consumers
  return NextResponse.json({
    ...flatProfile,
    profile: {
      plan: flatProfile.plan,
      plan_activated_at: flatProfile.plan_activated_at,
      dashboard_type: flatProfile.dashboard_type,
      events_this_month: flatProfile.events_this_month,
      events_used: flatProfile.events_used,
      events_reset_at: flatProfile.events_reset_at,
      trial_started_at: flatProfile.trial_started_at,
      trial_expires_at: flatProfile.trial_expires_at,
      is_trial: flatProfile.is_trial,
    },
  })
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient()
    const supabaseAdmin = createAdminClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const allowed = [
      'full_name', 'business_name', 'website_url', 'business_type',
      'dashboard_type', 'display_currency', 'avatar_type', 'avatar_url',
    ] as const
    const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
    for (const key of allowed) {
      if (body[key] !== undefined && body[key] !== null) {
        updates[key] = body[key]
      }
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error)
      return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
