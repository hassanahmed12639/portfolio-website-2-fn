import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computeSeoIntelligence } from '@/lib/seo-intelligence'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: properties, error } = await admin
    .from('gsc_properties')
    .select('id, user_id')
    .eq('is_active', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let processed = 0
  const failures: Array<{ property_id: string; user_id: string; reason: string }> = []
  for (const p of properties ?? []) {
    try {
      await computeSeoIntelligence(p.user_id, p.id, 90)
      processed += 1
    } catch (e) {
      failures.push({
        property_id: p.id,
        user_id: p.user_id,
        reason: e instanceof Error ? e.message : 'failed',
      })
    }
  }

  return NextResponse.json({
    success: true,
    processed_properties: processed,
    failures,
  })
}
