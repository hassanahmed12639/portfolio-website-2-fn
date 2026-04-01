import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

function debugLog(...args: unknown[]) {
  if (process.env.NODE_ENV === 'development') {
    console.log(...args)
  }
}

export async function GET(req: NextRequest) {
  try {
    debugLog('[MatchRate] GET started')
    const supabase = await await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    debugLog('[MatchRate] Auth check:', user?.id ?? 'no user', authError?.message ?? 'ok')

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    debugLog('[MatchRate] Fetching events since:', thirtyDaysAgo.toISOString())

    const { data: events, error: eventsError } = await supabase
      .from('events')
      .select('data_quality_score, data_quality_breakdown, fbc, fbp, fbclid, created_at')
      .eq('user_id', user.id)
      .eq('platform', 'meta')
      .gte('created_at', thirtyDaysAgo.toISOString())

    debugLog('[MatchRate] Events:', events?.length ?? 0, eventsError ? `error: ${eventsError.message}` : 'ok')

    const total = events?.length || 0

    if (total === 0) {
      debugLog('[MatchRate] No events, returning empty payload')
      return NextResponse.json({
        estimated_match_rate: 0,
        label: 'No Data',
        recommendation: 'Fire some events to see your match rate',
        trend: 0,
        trend_direction: 'stable',
        total_events: 0,
        avg_quality: 0,
        message: 'No events yet',
        coverage: {
          email: 0,
          phone: 0,
          fbp: 0,
          fbc: 0,
          name: 0,
          location: 0,
          fbclid: 0,
        },
        last_updated: new Date().toISOString(),
      })
    }

    debugLog('[MatchRate] Computing coverage')
    const withEmail = events?.filter((e) => (e.data_quality_breakdown as Record<string, boolean>)?.email).length || 0
    const withPhone = events?.filter((e) => (e.data_quality_breakdown as Record<string, boolean>)?.phone).length || 0
    const withFbp = events?.filter((e) => e.fbp || (e.data_quality_breakdown as Record<string, boolean>)?.fbp).length || 0
    const withFbc = events?.filter((e) => e.fbc || (e.data_quality_breakdown as Record<string, boolean>)?.fbc).length || 0
    const withName = events?.filter((e) => (e.data_quality_breakdown as Record<string, boolean>)?.name).length || 0
    const withLocation = events?.filter((e) => (e.data_quality_breakdown as Record<string, boolean>)?.location).length || 0
    const withFbclid = events?.filter((e) => e.fbclid || (e.data_quality_breakdown as Record<string, boolean>)?.fbclid).length || 0

    const emailRate = withEmail / total
    const phoneRate = withPhone / total
    const fbpRate = withFbp / total
    const fbcRate = withFbc / total
    const nameRate = withName / total
    const locationRate = withLocation / total
    const fbclidRate = withFbclid / total

    debugLog('[MatchRate] Computing estimated match rate')
    const estimatedMatchRate = Math.round(
      (emailRate * 35 +
        phoneRate * 25 +
        fbpRate * 20 +
        fbcRate * 10 +
        nameRate * 5 +
        locationRate * 3 +
        fbclidRate * 2)
    )

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)

    const recentEvents = events?.filter((e) => new Date(e.created_at!) >= sevenDaysAgo) || []
    const previousEvents =
      events?.filter(
        (e) =>
          new Date(e.created_at!) >= fourteenDaysAgo && new Date(e.created_at!) < sevenDaysAgo
      ) || []

    const recentAvgScore =
      recentEvents.length > 0
        ? recentEvents.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / recentEvents.length
        : 0
    const previousAvgScore =
      previousEvents.length > 0
        ? previousEvents.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / previousEvents.length
        : 0

    const trend = recentAvgScore - previousAvgScore
    const avgQuality =
      events && events.length > 0
        ? Math.round(
            events.reduce((sum, e) => sum + (e.data_quality_score || 0), 0) / events.length
          )
        : 0

    let label = 'Poor'
    let recommendation = ''
    if (estimatedMatchRate >= 80) {
      label = 'Excellent'
      recommendation = 'Your match rate is excellent! Keep passing rich customer data.'
    } else if (estimatedMatchRate >= 60) {
      label = 'Good'
      recommendation = 'Good match rate. Adding phone numbers could push you to Excellent.'
    } else if (estimatedMatchRate >= 40) {
      label = 'Fair'
      recommendation = 'Pass email and phone with every event to improve match rate significantly.'
    } else {
      label = 'Poor'
      recommendation = 'Start passing email with every Purchase event to immediately improve match rate.'
    }

    const payload = {
      estimated_match_rate: Math.min(estimatedMatchRate, 98),
      label,
      recommendation,
      trend: Math.round(trend),
      trend_direction: trend > 0 ? 'up' : trend < 0 ? 'down' : 'stable',
      total_events: total,
      avg_quality: avgQuality,
      coverage: {
        email: Math.round(emailRate * 100),
        phone: Math.round(phoneRate * 100),
        fbp: Math.round(fbpRate * 100),
        fbc: Math.round(fbcRate * 100),
        name: Math.round(nameRate * 100),
        location: Math.round(locationRate * 100),
        fbclid: Math.round(fbclidRate * 100),
      },
      last_updated: new Date().toISOString(),
    }

    debugLog('[MatchRate] Success:', payload.estimated_match_rate, payload.label)
    return NextResponse.json(payload)
  } catch (error) {
    console.error('[MatchRate] Error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

