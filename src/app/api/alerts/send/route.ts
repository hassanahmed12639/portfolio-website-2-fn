import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import type { AlertLog } from '@/lib/email-alerts'
import { Resend } from 'resend'
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

const LOGS_PATH = path.join(process.cwd(), 'src', 'data', 'alert-logs.json')
export const dynamic = 'force-dynamic'

function conditionText(condition: string, value: number, threshold: number): string {
  if (condition === 'score_below') return `Your Data Quality Score dropped to ${value} — below your threshold of ${threshold}`
  if (condition === 'match_rate_below') return `Your Match Rate dropped to ${value}% — below your threshold of ${threshold}%`
  if (condition === 'error_spike') return `Error count (${value}) exceeded your threshold of ${threshold}`
  if (condition === 'event_volume_drop') return `Event volume (${value}) dropped below your threshold of ${threshold}`
  return `Condition "${condition}" triggered: value ${value}, threshold ${threshold}`
}

async function appendLog(log: AlertLog) {
  const raw = await readFile(LOGS_PATH, 'utf-8').catch(() => '[]')
  const logs: AlertLog[] = JSON.parse(raw)
  logs.push(log)
  await writeFile(LOGS_PATH, JSON.stringify(logs, null, 2))
}

export async function POST(request: NextRequest) {
  const supabase = await createClient()
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

  const fromEmail = process.env.ALERT_FROM_EMAIL ?? 'onboarding@resend.dev'
  const resendApiKey = process.env.RESEND_API_KEY
  if (!resendApiKey) {
    return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
  }
  const resend = new Resend(resendApiKey)
  const message = conditionText(condition, value, threshold)

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

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#0f0f0f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#0f0f0f;padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#1a1a2e 0%,#16213e 100%);border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;border-bottom:2px solid #22c55e;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#22c55e;letter-spacing:2px;text-transform:uppercase;font-weight:600;">TrackHive</p>
              <h1 style="margin:0;font-size:24px;color:#ffffff;font-weight:700;">⚠️ Alert Triggered</h1>
            </td>
          </tr>

          <!-- Alert Name Banner -->
          <tr>
            <td style="background:#1a1a2e;padding:0 40px;">
              <div style="background:#ff4444;border-radius:8px;padding:16px 20px;margin:24px 0 0 0;text-align:center;">
                <p style="margin:0;font-size:18px;font-weight:700;color:#ffffff;">🔔 ${ruleName ?? 'Alert'}</p>
              </div>
            </td>
          </tr>

          <!-- Main Content -->
          <tr>
            <td style="background:#1a1a2e;padding:24px 40px;">
              <p style="margin:0 0 24px 0;font-size:16px;color:#a0a0a0;line-height:1.6;">
                One of your TrackHive alert rules was triggered. Here are the details:
              </p>

              <!-- Metric Cards -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
                <tr>
                  <td width="48%" style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:8px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Current Value</p>
                    <p style="margin:0;font-size:36px;font-weight:700;color:#ff4444;">${value}</p>
                  </td>
                  <td width="4%"></td>
                  <td width="48%" style="background:#0f0f0f;border:1px solid #2a2a2a;border-radius:8px;padding:20px;text-align:center;">
                    <p style="margin:0 0 4px 0;font-size:12px;color:#666;text-transform:uppercase;letter-spacing:1px;">Your Threshold</p>
                    <p style="margin:0;font-size:36px;font-weight:700;color:#22c55e;">${threshold}</p>
                  </td>
                </tr>
              </table>

              <!-- Condition Description -->
              <div style="background:#0f0f0f;border:1px solid #2a2a2a;border-left:4px solid #f59e0b;border-radius:8px;padding:16px 20px;margin-bottom:24px;">
                <p style="margin:0;font-size:15px;color:#f59e0b;font-weight:600;">What happened:</p>
                <p style="margin:8px 0 0 0;font-size:15px;color:#ffffff;">
                  Your <strong>${(condition ?? '').replace(/_/g, ' ')}</strong> dropped to <strong style="color:#ff4444;">${value}</strong>, which is below your alert threshold of <strong style="color:#22c55e;">${threshold}</strong>.
                </p>
              </div>

              <!-- Timestamp -->
              <p style="margin:0 0 24px 0;font-size:13px;color:#555;">
                🕐 Triggered at: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}
              </p>

              <!-- CTA Button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard/data-quality"
                       style="display:inline-block;background:#22c55e;color:#000000;font-size:16px;font-weight:700;text-decoration:none;padding:14px 40px;border-radius:8px;letter-spacing:0.5px;">
                      View Dashboard →
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#111111;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border-top:1px solid #1f1f1f;">
              <p style="margin:0 0 8px 0;font-size:13px;color:#444;">You're receiving this because you set up an alert in TrackHive.</p>
              <p style="margin:0;font-size:12px;color:#333;">TrackHive — Server-Side Tracking Platform</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
  try {
    const { error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `⚠️ TrackHive Alert: ${ruleName ?? 'Alert'}`,
      html,
    })
    if (error) {
      logEntry.status = 'failed'
      await appendLog(logEntry)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }
    await appendLog(logEntry)
    return NextResponse.json({ ok: true })
  } catch (err) {
    logEntry.status = 'failed'
    await appendLog(logEntry)
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
