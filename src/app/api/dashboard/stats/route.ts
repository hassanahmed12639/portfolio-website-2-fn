import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfMonthIso = startOfMonth.toISOString()

    // Events: count this month, revenue (Purchase value sum), purchases count, by platform, delivery status
    const [
      eventsResult,
      purchaseEventsResult,
      metaMatchResult
    ] = await Promise.all([
      supabase
        .from('events')
        .select('id, platform, value, event_name, data_quality_score')
        .eq('user_id', user.id)
        .gte('created_at', startOfMonthIso),
      supabase
        .from('events')
        .select('id, value')
        .eq('user_id', user.id)
        .or('event_name.eq.Purchase,event_name.eq.TEST_Purchase')
        .gte('created_at', startOfMonthIso),
      supabase
        .from('events')
        .select('data_quality_score')
        .eq('user_id', user.id)
        .eq('platform', 'meta')
        .gte('created_at', startOfMonthIso)
    ])

    const events = eventsResult.data ?? []
    const purchaseEvents = purchaseEventsResult.data ?? []
    const totalEvents = events.length
    const totalRevenue = purchaseEvents.reduce((sum, e) => sum + (Number(e.value) || 0), 0)
    const purchases = purchaseEvents.length

    const metaEvents = events.filter(e => e.platform === 'meta').length
    const tiktokEvents = events.filter(e => e.platform === 'tiktok').length
    const googleEvents = events.filter(e => e.platform === 'google' || e.platform === 'ga4').length

    // Average data_quality_score across ALL Meta events this month (include 0 so it reflects actual user data)
    const metaEventsForScore = metaMatchResult.data ?? []
    const matchRate =
      metaEventsForScore.length > 0
        ? Math.round(
            metaEventsForScore.reduce((sum, e) => sum + (Number(e.data_quality_score) ?? 0), 0) /
              metaEventsForScore.length
          )
        : 0

    // Lead stats (leads table may not exist yet)
    let totalLeads = 0
    let hotLeads = 0
    let goodLeads = 0
    let convertedLeads = 0
    let metaFeedbackSent = 0
    let stageNew = 0
    let stageContacted = 0
    let stageQualified = 0
    let stageProposal = 0
    let stageConverted = 0

    const [
      leadsResult,
      hotLeadsResult,
      goodLeadsResult,
      convertedLeadsResult,
      metaFeedbackResult,
      stagesResult
    ] = await Promise.all([
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('score', 'hot'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('score', 'good'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('score', 'converted'),
      supabase.from('leads').select('*', { count: 'exact', head: true }).eq('user_id', user.id).eq('meta_feedback_sent', true),
      supabase.from('leads').select('stage').eq('user_id', user.id)
    ])

    if (!leadsResult.error) {
      totalLeads = leadsResult.count ?? 0
      hotLeads = hotLeadsResult.count ?? 0
      goodLeads = goodLeadsResult.count ?? 0
      convertedLeads = convertedLeadsResult.count ?? 0
      metaFeedbackSent = metaFeedbackResult.count ?? 0
      const stages = stagesResult.data ?? []
      stageNew = stages.filter((l: { stage?: string }) => l.stage === 'new').length
      stageContacted = stages.filter((l: { stage?: string }) => l.stage === 'contacted').length
      stageQualified = stages.filter((l: { stage?: string }) => l.stage === 'qualified').length
      stageProposal = stages.filter((l: { stage?: string }) => l.stage === 'proposal').length
      stageConverted = stages.filter((l: { stage?: string }) => l.stage === 'converted').length
    }

    const conversionRate = totalLeads > 0 ? Math.round((convertedLeads / totalLeads) * 100) : 0

    return NextResponse.json({
      totalRevenue,
      purchases,
      totalEvents,
      matchRate,
      metaEvents,
      tiktokEvents,
      googleEvents,
      totalLeads,
      hotLeads,
      goodLeads,
      convertedLeads,
      metaFeedbackSent,
      conversionRate,
      stageNew,
      stageContacted,
      stageQualified,
      stageProposal,
      stageConverted,
    })
  } catch (error) {
    console.error('[dashboard/stats] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
