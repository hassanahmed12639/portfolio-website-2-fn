import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

export const dynamic = 'force-dynamic'

function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const now = new Date().toISOString()

  const { data: profiles, error: fetchError } = await supabase
    .from('profiles')
    .select('id')

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const ids = (profiles ?? []).map((p) => p.id)
  const count = ids.length

  if (count === 0) {
    debugLog('[monthly-reset] No users to reset', now)
    return NextResponse.json({
      success: true,
      users_reset: 0,
      timestamp: now,
    })
  }

  const { error: updateError } = await supabase
    .from('profiles')
    .update({
      events_used: 0,
      monthly_scans: 0,
      monthly_ai_analyses: 0,
      scans_reset_at: now,
      ai_analyses_reset_at: now,
    })
    .in('id', ids)

  if (updateError) {
    console.error('[monthly-reset] Update failed', updateError)
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  debugLog('[monthly-reset] Reset complete', { users_reset: count, timestamp: now })

  return NextResponse.json({
    success: true,
    users_reset: count,
    timestamp: now,
  })
}
