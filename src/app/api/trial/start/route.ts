import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let planParam: 'pro' | 'agency' = 'pro'
  try {
    const body = await req.json().catch(() => ({}))
    const p = body?.plan as string
    if (p === 'agency' || p === 'pro') planParam = p
  } catch {
    // default to pro
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, plan, is_trial, trial_started_at, trial_ends_at, trial_expires_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  const now = new Date()
  const trialEndsAt = profile.trial_ends_at ?? profile.trial_expires_at
  const isActiveTrial = profile.is_trial && trialEndsAt && new Date(trialEndsAt) > now
  const trialExpired = trialEndsAt && new Date(trialEndsAt) <= now

  // Already on active trial (e.g. from signup trigger) — treat as success
  if (isActiveTrial) {
    return NextResponse.json({
      success: true,
      trial_expires_at: trialEndsAt,
    })
  }

  // Trial was used and expired — cannot start another
  if (trialExpired) {
    return NextResponse.json(
      { error: 'Trial already used' },
      { status: 400 }
    )
  }

  const trialExpiresAt = new Date(now)
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 7)

  const planValue = planParam === 'agency' ? 'agency' : 'pro'

  const updatePayload: Record<string, unknown> = {
    is_trial: true,
    trial_started_at: now.toISOString(),
    trial_ends_at: trialExpiresAt.toISOString(),
    plan: planValue,
  }
  const { error } = await supabase
    .from('profiles')
    .update(updatePayload)
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'Failed to start trial' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    trial_ends_at: trialExpiresAt.toISOString(),
    trial_expires_at: trialExpiresAt.toISOString(),
  })
}
