import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('id, trial_started_at')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
  }

  if (profile.trial_started_at) {
    return NextResponse.json(
      { error: 'Trial already used' },
      { status: 400 }
    )
  }

  const now = new Date()
  const trialExpiresAt = new Date(now)
  trialExpiresAt.setDate(trialExpiresAt.getDate() + 7)

  const { error } = await supabase
    .from('profiles')
    .update({
      is_trial: true,
      trial_started_at: now.toISOString(),
      trial_expires_at: trialExpiresAt.toISOString(),
      plan: 'trial',
    })
    .eq('id', user.id)

  if (error) {
    return NextResponse.json(
      { error: error.message ?? 'Failed to start trial' },
      { status: 500 }
    )
  }

  return NextResponse.json({
    success: true,
    trial_expires_at: trialExpiresAt.toISOString(),
  })
}
