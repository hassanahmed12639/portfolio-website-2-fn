import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

const DAYS = 30

function formatDateKey(date: Date) {
  return date.toISOString().slice(0, 10)
}

function safePercent(value: number) {
  return Math.round(value * 100)
}

function getStatus(pixelCount: number, capiCount: number) {
  if (pixelCount === 0 && capiCount === 0) return 'No data'
  if (pixelCount === 0 && capiCount > 0) return 'Server only'
  if (pixelCount > 0 && capiCount === 0) return 'At risk'
  const ratio = capiCount / pixelCount
  if (ratio >= 0.95) return 'Healthy'
  if (ratio >= 0.75) return 'Warning'
  return 'At risk'
}

function getSuggestion(pixelCount: number, capiCount: number) {
  if (pixelCount === 0 && capiCount === 0) {
    return 'No browser pixel or CAPI events were detected. Verify your TrackHive script and browser pixel installation.'
  }
  if (pixelCount === 0) {
    return 'Browser-side pixel signals are missing. Confirm your pixel JS is installed and that event IDs are being generated.'
  }
  if (capiCount === 0) {
    return 'Server-side CAPI events are missing. Check your TrackHive endpoint, pixel integration, and server delivery status.'
  }
  const ratio = capiCount / pixelCount
  if (ratio >= 0.95) {
    return 'Signal coverage is healthy. Keep passing the same event_id and browser signals for consistent deduplication.'
  }
  if (ratio >= 0.75) {
    return 'CAPI coverage is slightly behind browser events. Inspect your server endpoint and integration settings.'
  }
  return 'Less than 75% of browser events are reaching CAPI. Investigate missing requests, network failures, or invalid API credentials.'
}

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const from = new Date(now)
    from.setDate(from.getDate() - (DAYS - 1))
    from.setHours(0, 0, 0, 0)
    const fromIso = from.toISOString()

    const [eventsResult, dedupResult] = await Promise.all([
      supabase
        .from('events')
        .select('event_id, created_at')
        .eq('user_id', user.id)
        .eq('platform', 'meta')
        .eq('meta_status', 'sent')
        .gte('created_at', fromIso),
      supabase
        .from('deduplication_log')
        .select('event_id, created_at')
        .eq('user_id', user.id)
        .gte('created_at', fromIso),
    ])

    const eventRows = eventsResult.data ?? []
    const dedupRows = dedupResult.error ? [] : dedupResult.data ?? []

    const metaByDay = new Map<string, Set<string>>()
    const pixelByDay = new Map<string, Set<string>>()

    for (const row of eventRows) {
      const eventId = String(row.event_id ?? '').trim()
      if (!eventId) continue
      const dateKey = formatDateKey(new Date(String(row.created_at)))
      if (!metaByDay.has(dateKey)) metaByDay.set(dateKey, new Set())
      metaByDay.get(dateKey)?.add(eventId)
    }

    for (const row of dedupRows) {
      const eventId = String(row.event_id ?? '').trim()
      if (!eventId) continue
      const dateKey = formatDateKey(new Date(String(row.created_at)))
      if (!pixelByDay.has(dateKey)) pixelByDay.set(dateKey, new Set())
      pixelByDay.get(dateKey)?.add(eventId)
    }

    const history: Array<{
      date: string
      pixel_events: number
      capi_events: number
      signal_loss_pct: number
      ratio: number
      status: string
      suggestion: string
    }> = []

    let totalPixel = 0
    let totalCapi = 0

    for (let i = 0; i < DAYS; i += 1) {
      const day = new Date(from)
      day.setDate(from.getDate() + i)
      const dateKey = formatDateKey(day)
      const pixelCount = pixelByDay.get(dateKey)?.size ?? 0
      const capiCount = metaByDay.get(dateKey)?.size ?? 0
      const ratio = pixelCount === 0 ? (capiCount > 0 ? 1 : 0) : capiCount / pixelCount
      const signalLossPct = pixelCount === 0 ? 0 : safePercent(Math.max(0, 1 - ratio))
      const status = getStatus(pixelCount, capiCount)
      const suggestion = getSuggestion(pixelCount, capiCount)

      history.push({
        date: dateKey,
        pixel_events: pixelCount,
        capi_events: capiCount,
        signal_loss_pct: signalLossPct,
        ratio,
        status,
        suggestion,
      })
      totalPixel += pixelCount
      totalCapi += capiCount
    }

    const latest = history[history.length - 1]
    const overallRatio = totalPixel === 0 ? (totalCapi > 0 ? 1 : 0) : totalCapi / totalPixel
    const overallLossPct = totalPixel === 0 ? 0 : safePercent(Math.max(0, 1 - overallRatio))
    const overallStatus = getStatus(totalPixel, totalCapi)
    const overallSuggestion = getSuggestion(totalPixel, totalCapi)

    try {
      await supabase.from('conversion_feedback_snapshots').upsert(
        {
          user_id: user.id,
          snapshot_date: formatDateKey(now),
          pixel_event_count: latest.pixel_events,
          capi_event_count: latest.capi_events,
          signal_loss_pct: latest.signal_loss_pct,
          status: latest.status,
          suggestion: latest.suggestion,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,snapshot_date' }
      )
    } catch {
      // ignore snapshot persistence failures
    }

    return NextResponse.json({
      current: latest,
      history,
      totals: {
        pixel_events: totalPixel,
        capi_events: totalCapi,
        signal_loss_pct: overallLossPct,
        ratio: overallRatio,
        status: overallStatus,
        suggestion: overallSuggestion,
      },
      last_updated: new Date().toISOString(),
    })
  } catch (error) {
    console.error('[dashboard/conversion-feedback] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
