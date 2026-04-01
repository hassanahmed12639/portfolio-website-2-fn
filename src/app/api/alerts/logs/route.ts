import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { data, error } = await supabase
    .from('alert_logs')
    .select('id, rule_id, rule_name, triggered_at, condition, value, threshold, email_sent_to, status')
    .eq('user_id', user.id)
    .order('triggered_at', { ascending: false })
    .limit(1000)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const logs = (data ?? []).map((row) => ({
    id: row.id,
    ruleId: row.rule_id,
    ruleName: row.rule_name,
    triggeredAt: row.triggered_at,
    condition: row.condition,
    value: Number(row.value ?? 0),
    threshold: Number(row.threshold ?? 0),
    emailSentTo: row.email_sent_to,
    status: row.status,
  }))
  return NextResponse.json(logs)
}

