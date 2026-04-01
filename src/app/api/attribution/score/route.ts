import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

type EventRow = {
  id: string
  user_id: string
  event_name: string
  platform: string | null
  value: number | null
  status: string | null
  event_id: string | null
  payload: { email?: string; phone?: string; event_source_url?: string } | null
  created_at: string
}

function calculateTruthScore(event: EventRow): { score: number; breakdown: Record<string, number> } {
  let score = 0
  const breakdown: Record<string, number> = {}

  if (event.status === 'success') {
    score += 25
    breakdown.server_confirmed = 25
  }

  const payload = event.payload ?? {}
  if (payload.email || payload.phone) {
    score += 20
    breakdown.user_data = 20
  }

  if (event.event_id) {
    score += 15
    breakdown.deduplication = 15
  }

  if (event.event_name === 'Purchase' && (event.value ?? 0) > 0) {
    score += 15
    breakdown.conversion_value = 15
  } else if (event.event_name !== 'Purchase') {
    score += 15
    breakdown.conversion_value = 15
  }

  if (payload.event_source_url) {
    score += 10
    breakdown.source_url = 10
  }

  if (event.platform) {
    score += 10
    breakdown.platform_fired = 10
  }

  if (event.status !== 'failed') {
    score += 5
    breakdown.no_errors = 5
  }

  return { score: Math.min(score, 100), breakdown }
}

export async function GET() {
  const supabase = await await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data: events, error: eventsError } = await supabase
    .from('events')
    .select('id, user_id, event_name, platform, value, status, event_id, payload, created_at')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(100)

  if (eventsError) {
    return NextResponse.json({ error: eventsError.message }, { status: 500 })
  }

  const rows = (events ?? []) as EventRow[]
  const scored: Array<{
    conversion_id: string
    event_name: string
    created_at: string
    value: number | null
    truth_score: number
    meta_score: number
    google_score: number
    platform: string | null
    status: string | null
    breakdown: Record<string, number>
    confidence: 'High' | 'Medium' | 'Low'
  }> = []

  for (const event of rows) {
    const { score, breakdown } = calculateTruthScore(event)
    const metaScore = event.platform === 'meta' ? score : 0
    const googleScore = event.platform === 'google' ? score : 0
    const confidence = score >= 80 ? 'High' : score >= 50 ? 'Medium' : 'Low'

    await supabase.from('attribution_scores').upsert(
      {
        user_id: user.id,
        conversion_id: event.id,
        event_name: event.event_name,
        truth_score: score,
        meta_score: metaScore,
        google_score: googleScore,
        ga4_score: 0,
        utm_score: breakdown.source_url ? 10 : 0,
        server_score: event.status === 'success' ? 25 : 0,
        breakdown,
        recommendation: confidence === 'Low' ? 'Improve server-side firing and deduplication' : null,
      },
      { onConflict: 'user_id,conversion_id' }
    )

    scored.push({
      conversion_id: event.id,
      event_name: event.event_name,
      created_at: event.created_at,
      value: event.value,
      truth_score: score,
      meta_score: metaScore,
      google_score: googleScore,
      platform: event.platform,
      status: event.status,
      breakdown,
      confidence,
    })
  }

  return NextResponse.json({ conversions: scored })
}

