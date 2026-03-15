import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

type Rule = {
  id: string
  user_id: string
  name: string
  condition: string
  threshold: number | null
  enabled: boolean
  cooldown_minutes: number
  last_triggered_at: string | null
  notify_email: string
}

export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  const headerSecret = request.headers.get('x-cron-secret')
  const authHeader = request.headers.get('authorization')
  const bearerSecret = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  const valid = cronSecret && (headerSecret === cronSecret || bearerSecret === cronSecret)
  if (!valid) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdminClient()
  const { data: rules, error } = await admin.from('alert_rules').select('*').eq('enabled', true)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  let triggered = 0
  const now = new Date()
  for (const rule of (rules ?? []) as Rule[]) {
    const threshold = Number(rule.threshold ?? 0)
    if (rule.last_triggered_at) {
      const elapsedMinutes = (now.getTime() - new Date(rule.last_triggered_at).getTime()) / 60000
      if (elapsedMinutes < Number(rule.cooldown_minutes ?? 60)) continue
    }

    // Evaluate rule conditions using current aggregates.
    let value = 0
    let shouldTrigger = false
    if (rule.condition === 'data_quality_below' || rule.condition === 'score_below') {
      const { data: rows } = await admin
        .from('events')
        .select('data_quality_score')
        .eq('user_id', rule.user_id)
        .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      const scores = (rows ?? []).map((r) => Number(r.data_quality_score ?? 0))
      value = scores.length > 0 ? scores.reduce((a, b) => a + b, 0) / scores.length : 0
      shouldTrigger = value < threshold
    } else if (rule.condition === 'event_volume_drops' || rule.condition === 'event_volume_drop') {
      const { count } = await admin
        .from('events')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', rule.user_id)
        .gte('created_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      value = Number(count ?? 0)
      shouldTrigger = value < threshold
    } else if (rule.condition === 'revenue_drops') {
      const { data: rows } = await admin
        .from('conversions_fact')
        .select('value')
        .eq('user_id', rule.user_id)
        .gte('conversion_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      value = (rows ?? []).reduce((sum, r) => sum + Number(r.value ?? 0), 0)
      shouldTrigger = value < threshold
    } else if (rule.condition === 'keyword_drop' || rule.condition === 'ctr_drop') {
      const { data: rows } = await admin
        .from('seo_opportunities')
        .select('id')
        .eq('user_id', rule.user_id)
        .in('opportunity_type', ['pos_5_20', 'low_ctr_high_impr'])
        .gte('detected_at', new Date(Date.now() - 24 * 3600 * 1000).toISOString())
      value = Number((rows ?? []).length)
      shouldTrigger = value > threshold
    }

    if (shouldTrigger) {
      await admin.from('alert_logs').insert({
        user_id: rule.user_id,
        rule_id: rule.id,
        rule_name: rule.name,
        triggered_at: new Date().toISOString(),
        condition: rule.condition,
        value,
        threshold,
        email_sent_to: rule.notify_email,
        status: 'sent',
      })
      await admin
        .from('alert_rules')
        .update({ last_triggered_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', rule.id)
      triggered += 1
    }
  }

  return NextResponse.json({ success: true, triggered })
}
