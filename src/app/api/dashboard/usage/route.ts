import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const supabaseAdmin = createAdminClient()

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('plan, events_this_month')
      .eq('id', user.id)
      .single()

    const { count: pixelCount } = await supabaseAdmin
      .from('pixels')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: leadCount } = await supabaseAdmin
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: alertCount } = await supabaseAdmin
      .from('alerts')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    const { count: teamCount } = await supabaseAdmin
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', user.id)

    const { data: integrationsList } = await supabaseAdmin
      .from('integrations')
      .select('platform, pixel_id, tag_id, ga4_measurement_id, conversion_id')
      .eq('user_id', user.id)

    const integrations = integrationsList ?? []
    const metaRow = integrations.find((i: { platform: string }) => i.platform === 'meta')
    const tiktokRow = integrations.find((i: { platform: string }) => i.platform === 'tiktok')
    const ga4Row = integrations.find((i: { platform: string }) => i.platform === 'ga4')
    const googleRow = integrations.find((i: { platform: string }) => i.platform === 'google')

    const plan = profile?.plan || 'free'
    const eventsThisMonth = profile?.events_this_month || 0
    const eventsLimit = plan === 'agency' ? -1 : plan === 'pro' ? 25000 : 500

    return NextResponse.json({
      plan,
      eventsThisMonth,
      eventsLimit,
      eventsPercent: eventsLimit === -1 ? 0 : Math.round((eventsThisMonth / eventsLimit) * 100),
      pixelCount: pixelCount || 0,
      leadCount: leadCount || 0,
      alertCount: alertCount || 0,
      teamCount: teamCount || 0,
      connectedPlatforms: {
        meta: !!(metaRow?.pixel_id || metaRow?.tag_id),
        tiktok: !!(tiktokRow?.pixel_id || tiktokRow?.tag_id),
        ga4: !!(ga4Row?.ga4_measurement_id || ga4Row?.tag_id),
        google: !!(googleRow?.tag_id || googleRow?.conversion_id),
      }
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
