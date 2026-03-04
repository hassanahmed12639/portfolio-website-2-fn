import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const openRouterKey = process.env.OPENROUTER_API_KEY

export const dynamic = 'force-dynamic'

type AnomalyType =
  | 'event_drop'
  | 'duplicate_events'
  | 'failed_api_calls'
  | 'value_anomaly'
  | 'spike'
  | 'platform_mismatch'

type Severity = 'high' | 'medium' | 'low'

type Anomaly = {
  id: string
  type: AnomalyType
  severity: Severity
  description: string
  timestamp: string
  fix_description?: string
  code_snippet?: string
}

async function getAiFix(anomaly: Anomaly): Promise<{ fix_description: string; code_snippet: string } | null> {
  if (!openRouterKey) return null
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${openRouterKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL || 'https://trackhive.app',
      },
      body: JSON.stringify({
        model: 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: `I have this tracking anomaly: ${anomaly.description} (Type: ${anomaly.type}). Give me a one paragraph fix in plain English and a short code snippet to fix it. Return ONLY valid JSON: { "fix_description": "string", "code_snippet": "string" }. No markdown, no backticks.`,
          },
        ],
        temperature: 0.3,
        max_tokens: 500,
      }),
    })
    if (!res.ok) return null
    const data = await res.json()
    const content = data.choices?.[0]?.message?.content
    if (typeof content !== 'string') return null
    const parsed = JSON.parse(content.replace(/^```\w*\n?|\n?```$/g, '').trim()) as {
      fix_description?: string
      code_snippet?: string
    }
    return {
      fix_description: parsed.fix_description ?? '',
      code_snippet: parsed.code_snippet ?? '',
    }
  } catch {
    return null
  }
}

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  if (!serviceRoleKey || !supabaseUrl) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const serviceSupabase = createServiceClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } })

  const now = new Date()
  const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())

  const { data: events, error } = await serviceSupabase
    .from('events')
    .select('id, event_name, platform, value, status, created_at')
    .eq('user_id', user.id)
    .gte('created_at', twentyFourHoursAgo.toISOString())
    .order('created_at', { ascending: true })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const list = events ?? []
  const anomalies: Anomaly[] = []
  let anomalyId = 0

  const eventsLastHour = list.filter((e) => new Date(e.created_at) >= oneHourAgo)
  const eventsToday = list.filter((e) => new Date(e.created_at) >= startOfToday)
  const hoursInDay = 24
  const avgHourly = list.length / hoursInDay
  const currentHourCount = eventsLastHour.length

  if (avgHourly > 0 && currentHourCount < avgHourly * 0.5) {
    anomalies.push({
      id: `ad-${++anomalyId}`,
      type: 'event_drop',
      severity: 'high',
      description: `Event drop: only ${currentHourCount} events in the last hour vs ${avgHourly.toFixed(0)} average. Events may be blocked or snippet removed.`,
      timestamp: now.toISOString(),
    })
  }

  const sixtySecondsAgo = new Date(now.getTime() - 60 * 1000)
  const recentForDup = list.filter((e) => new Date(e.created_at) >= sixtySecondsAgo)
  const byName: Record<string, number> = {}
  for (const e of recentForDup) {
    const n = e.event_name || 'unknown'
    byName[n] = (byName[n] || 0) + 1
  }
  for (const [name, count] of Object.entries(byName)) {
    if (count >= 3) {
      anomalies.push({
        id: `dup-${++anomalyId}`,
        type: 'duplicate_events',
        severity: 'high',
        description: `Duplicate events: "${name}" fired ${count} times in the last 60 seconds.`,
        timestamp: now.toISOString(),
      })
      break
    }
  }

  const failedLastHour = list.filter((e) => e.status === 'failed' && new Date(e.created_at) >= oneHourAgo)
  if (failedLastHour.length > 0) {
    anomalies.push({
      id: `fail-${++anomalyId}`,
      type: 'failed_api_calls',
      severity: 'high',
      description: `${failedLastHour.length} failed API call(s) in the last hour. Check integrations and tokens.`,
      timestamp: now.toISOString(),
    })
  }

  const purchaseNoValue = list.filter(
    (e) => (e.event_name === 'Purchase' || e.event_name === 'purchase') && (e.value == null || e.value === 0)
  )
  if (purchaseNoValue.length > 0) {
    anomalies.push({
      id: `val-${++anomalyId}`,
      type: 'value_anomaly',
      severity: 'high',
      description: `${purchaseNoValue.length} Purchase event(s) with value 0 or null. Revenue tracking may be wrong.`,
      timestamp: now.toISOString(),
    })
  }

  if (avgHourly > 0 && currentHourCount > avgHourly * 3) {
    anomalies.push({
      id: `spike-${++anomalyId}`,
      type: 'spike',
      severity: 'medium',
      description: `Traffic spike: ${currentHourCount} events in the last hour (${(currentHourCount / avgHourly).toFixed(1)}x average). Verify it is real traffic.`,
      timestamp: now.toISOString(),
    })
  }

  const { data: integrations } = await serviceSupabase
    .from('integrations')
    .select('platform')
    .eq('user_id', user.id)
    .eq('is_active', true)

  const hasMeta = integrations?.some((i) => i.platform === 'meta') ?? false
  if (hasMeta) {
    const metaEventsToday = eventsToday.filter((e) => e.platform === 'meta')
    if (metaEventsToday.length === 0 && eventsToday.length > 0) {
      anomalies.push({
        id: `plat-${++anomalyId}`,
        type: 'platform_mismatch',
        severity: 'medium',
        description: 'Meta integration is active but 0 Meta events today. CAPI or pixel may be misconfigured.',
        timestamp: now.toISOString(),
      })
    }
  }

  const hourlyBuckets: { hour: string; count: number }[] = []
  for (let i = 23; i >= 0; i--) {
    const hourStart = new Date(now)
    hourStart.setHours(hourStart.getHours() - i, 0, 0, 0)
    const hourEnd = new Date(hourStart)
    hourEnd.setHours(hourEnd.getHours() + 1, 0, 0, 0)
    const count = list.filter(
      (e) => new Date(e.created_at) >= hourStart && new Date(e.created_at) < hourEnd
    ).length
    hourlyBuckets.push({
      hour: hourStart.toISOString().slice(0, 13),
      count,
    })
  }
  const avgHourlyForChart = list.length / 24

  if (anomalies.length > 0 && openRouterKey) {
    const withFixes = await Promise.all(
      anomalies.map(async (a) => {
        const fix = await getAiFix(a)
        return { ...a, fix_description: fix?.fix_description, code_snippet: fix?.code_snippet }
      })
    )
    return NextResponse.json({
      anomalies: withFixes,
      hourly: hourlyBuckets,
      avgHourly: avgHourlyForChart,
    })
  }

  return NextResponse.json({
    anomalies,
    hourly: hourlyBuckets,
    avgHourly: avgHourlyForChart,
  })
}
