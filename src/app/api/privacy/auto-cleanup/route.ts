import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

export async function GET() {
  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  })

  const { data: usersWithCleanup, error: fetchError } = await supabase
    .from('privacy_settings')
    .select('user_id, data_retention_days')
    .eq('auto_delete_enabled', true)

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  const summary: { user_id: string; deleted: number }[] = []
  let totalDeleted = 0

  for (const row of usersWithCleanup ?? []) {
    const days = Math.max(1, Number(row.data_retention_days) || 90)
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    const cutoffIso = cutoff.toISOString()

    const { data: deleted, error } = await supabase
      .from('events')
      .delete()
      .eq('user_id', row.user_id)
      .lt('created_at', cutoffIso)
      .select('id')

    const count = Array.isArray(deleted) ? deleted.length : 0
    totalDeleted += count
    summary.push({ user_id: row.user_id, deleted: count })
  }

  return NextResponse.json({
    users_processed: summary.length,
    total_deleted: totalDeleted,
    summary,
  })
}
