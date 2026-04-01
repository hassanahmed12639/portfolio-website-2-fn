import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AlertLog } from '@/lib/email-alerts'
import { getAlertEmailHtml } from '@/lib/alert-email'
import { Resend } from 'resend'
const FROM_EMAIL = 'TrackHive <noreply@itshassanahmed.com>'
export const dynamic = 'force-dynamic'

const CONDITION_LABELS: Record<string, string> = {
  score_below: 'Data Quality Score Alert',
  data_quality_below: 'Data Quality Score Alert',
  match_rate_below: 'Match Rate Alert',
  error_spike: 'Error Count Alert',
  error_count_exceeds: 'Error Count Alert',
  event_volume_drop: 'Event Volume Alert',
  event_volume_drops: 'Event Volume Alert',
  event_volume_spikes: 'Event Volume Spike Alert',
  retry_queue_exceeds: 'Retry Queue Alert',
  platform_down: 'Platform Down Alert',
  dedup_rate_high: 'Duplicate Rate Alert',
  new_lead: 'New Lead Alert',
  lead_score_changed: 'Lead Status Alert',
  no_leads_for: 'No Leads Alert',
  revenue_drops: 'Revenue Alert',
  high_value_purchase: 'High Value Purchase Alert',
  events_limit_warning: 'Events Limit Alert',
  custom: 'Custom Alert',
}

function conditionLabel(condition: string): string {
  return CONDITION_LABELS[condition] ?? condition.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function conditionText(condition: string, value: number, threshold: number): string {
  if (condition === 'score_below' || condition === 'data_quality_below') return `Data Quality Score dropped to ${value}%`
  if (condition === 'match_rate_below') return `Match rate dropped to ${value}%`
  if (condition === 'error_spike' || condition === 'error_count_exceeds') return `Error count (${value}) exceeded threshold`
  if (condition === 'event_volume_drop' || condition === 'event_volume_drops') return `Event volume (${value}) dropped below threshold`
  if (condition === 'event_volume_spikes') return `Event volume (${value}) spiked above threshold`
  return `Condition triggered: value ${value}, threshold ${threshold}`
}

function conditionDetails(condition: string, value: number, threshold: number, ruleName: string): string {
  const parts: string[] = [`Threshold was set to ${threshold}.`]
  if (ruleName && ruleName !== 'Test Alert') parts.push(`Rule: ${ruleName}.`)
  return parts.join(' ')
}

async function appendLog(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, log: AlertLog) {
  await supabase.from('alert_logs').insert({
    id: log.id,
    user_id: userId,
    rule_id: log.ruleId === 'test' ? null : log.ruleId,
    rule_name: log.ruleName,
    triggered_at: log.triggeredAt,
    condition: log.condition,
    value: log.value,
    threshold: log.threshold,
    email_sent_to: log.emailSentTo,
    status: log.status,
  })
}

export async function POST(request: NextRequest) {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()
  const { ruleId, ruleName, condition, value, threshold, email } = body as {
    ruleId: string
    ruleName: string
    condition: string
    value: number
    threshold: number
    email: string
  }
  if (!email) return NextResponse.json({ error: 'email required' }, { status: 400 })

  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }
  const resend = new Resend(resendApiKey)

  const alertType = conditionLabel(condition)
  const message = conditionText(condition, value, threshold)
  const details = conditionDetails(condition, value, threshold, ruleName ?? '')
  const html = getAlertEmailHtml(alertType, message, details)

  const logEntry: AlertLog = {
    id: crypto.randomUUID(),
    ruleId: ruleId ?? 'test',
    ruleName: ruleName ?? 'Test Alert',
    triggeredAt: new Date().toISOString(),
    condition,
    value,
    threshold,
    emailSentTo: email,
    status: 'sent',
  }

  try {
    const { error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: `⚠️ TrackHive Alert: ${ruleName ?? 'Alert'}`,
      html,
    })
    if (error) {
      logEntry.status = 'failed'
      await appendLog(supabase, user.id, logEntry)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await appendLog(supabase, user.id, logEntry)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logEntry.status = 'failed'
    await appendLog(supabase, user.id, logEntry)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}

