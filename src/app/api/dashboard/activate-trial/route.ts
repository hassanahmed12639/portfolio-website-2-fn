import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const supabase = await await createClient()
    const supabaseAdmin = createAdminClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const plan = body?.plan as string | undefined
    if (!plan || !['pro', 'agency'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan' }, { status: 400 })
    }

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, is_trial, trial_ends_at, trial_started_at')
      .eq('id', user.id)
      .single()

    const now = new Date()

    // Block if already on paid plan (not trial)
    if (profile?.plan && profile.plan !== 'free' && !profile?.is_trial) {
      return NextResponse.json(
        { error: 'You are already on a paid plan' },
        { status: 400 }
      )
    }

    // Block if trial already used (trial_ends_at set but not currently on trial)
    if (profile?.trial_ends_at && !profile?.is_trial) {
      return NextResponse.json(
        {
          error: 'Your free trial has been used. Please upgrade to a paid plan.',
          trialUsed: true,
        },
        { status: 400 }
      )
    }

    // Block if currently on trial but expired
    if (profile?.is_trial && profile?.trial_ends_at && new Date(profile.trial_ends_at) < now) {
      return NextResponse.json(
        {
          error: 'Your free trial has expired. Please upgrade to a paid plan.',
          trialUsed: true,
        },
        { status: 400 }
      )
    }

    const trialEnds = new Date()
    trialEnds.setDate(trialEnds.getDate() + 7)

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        plan,
        is_trial: true,
        trial_started_at: now.toISOString(),
        trial_ends_at: trialEnds.toISOString(),
      })
      .eq('id', user.id)

    if (error) throw error

    return NextResponse.json({
      success: true,
      plan,
      trial_ends_at: trialEnds.toISOString(),
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Activate trial failed'
    console.error('Activate trial error:', message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

