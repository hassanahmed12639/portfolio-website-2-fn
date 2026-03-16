import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeAttributionForUser, ensureConversionsFact, ensureTouchpointsFact } from '@/lib/attribution'

export const dynamic = 'force-dynamic'

function isAuthorized(request: NextRequest) {
  const expected = process.env.CRON_SECRET
  if (!expected) return true
  return request.headers.get('x-cron-secret') === expected
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const admin = createAdminClient()

  const { data: models, error: modelError } = await admin
    .from('attribution_models')
    .select('user_id, model_key, is_default')
    .eq('is_active', true)
  if (modelError) return NextResponse.json({ error: modelError.message }, { status: 500 })

  const users = new Set((models ?? []).map((m) => m.user_id))
  return NextResponse.json({
    success: true,
    users_with_models: users.size,
    model_rows: models?.length ?? 0,
    note: 'Call /api/attribution/compute for each user/model from your scheduler worker.',
  })
}
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: users, error } = await admin.from('profiles').select('id')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let processedUsers = 0
  let writtenRows = 0
  const failures: Array<{ user_id: string; reason: string }> = []
  for (const user of users ?? []) {
    try {
      await ensureConversionsFact(user.id, 120)
      await ensureTouchpointsFact(user.id, 120)
      for (const model of ['last_click', 'first_click', 'linear', 'position_based', 'time_decay'] as const) {
        const result = await computeAttributionForUser(user.id, model)
        writtenRows += result.touched
      }
      processedUsers += 1
    } catch (e) {
      failures.push({ user_id: user.id, reason: e instanceof Error ? e.message : 'refresh failed' })
    }
  }

  return NextResponse.json({
    success: true,
    processed_users: processedUsers,
    written_rows: writtenRows,
    failures,
  })
}
