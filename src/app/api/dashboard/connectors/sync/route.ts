import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabaseAdmin = createAdminClient()

async function syncMeta(connection: { id: string; account_id: string; access_token: string }, userId: string) {
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const dateStr = since.toISOString().split('T')[0]
  const untilStr = new Date().toISOString().split('T')[0]
  const accountId = connection.account_id.startsWith('act_') ? connection.account_id : `act_${connection.account_id}`

  const res = await fetch(
    `https://graph.facebook.com/v18.0/${accountId}/insights` +
    `?fields=campaign_name,spend,impressions,clicks,actions,ctr,cpc,cpm` +
    `&level=campaign&time_range={"since":"${dateStr}","until":"${untilStr}"}` +
    `&access_token=${connection.access_token}`
  )
  const data = await res.json()
  if (data.error) throw new Error(data.error.message)

  const campaigns = (data.data || []).map((c: { campaign_name?: string; spend?: string; impressions?: string; clicks?: string; actions?: { action_type: string; value: string }[]; ctr?: string; cpc?: string; cpm?: string }) => {
    const conversions = (c.actions || []).find((a: { action_type: string }) => a.action_type === 'purchase')?.value || 0
    const spend = parseFloat(c.spend || '0')
    const revenue = Number(conversions) * 50
    return {
      user_id: userId,
      connection_id: connection.id,
      platform: 'meta',
      campaign_name: c.campaign_name || 'Unknown',
      spend,
      impressions: parseInt(c.impressions || '0', 10),
      clicks: parseInt(c.clicks || '0', 10),
      conversions: parseFloat(String(conversions)),
      roas: spend > 0 ? revenue / spend : 0,
      ctr: parseFloat(c.ctr || '0'),
      cpc: parseFloat(c.cpc || '0'),
      cpm: parseFloat(c.cpm || '0'),
      date_start: dateStr,
      date_end: untilStr,
      synced_at: new Date().toISOString(),
    }
  })

  if (campaigns.length > 0) {
    await supabaseAdmin.from('ad_campaigns').delete().eq('connection_id', connection.id)
    await supabaseAdmin.from('ad_campaigns').insert(campaigns)
  }

  return campaigns.length
}

async function syncTikTok(connection: { id: string; account_id: string; access_token: string }, userId: string) {
  const since = new Date()
  since.setDate(since.getDate() - 30)
  const startDate = since.toISOString().split('T')[0]
  const endDate = new Date().toISOString().split('T')[0]

  const res = await fetch(
    `https://business-api.tiktok.com/open_api/v1.3/report/integrated/get/` +
    `?advertiser_id=${connection.account_id}` +
    `&report_type=BASIC&dimensions=["campaign_id","stat_time_day"]` +
    `&metrics=["campaign_name","spend","impressions","clicks","conversion","ctr","cpc","cpm"]` +
    `&start_date=${startDate}` +
    `&end_date=${endDate}`,
    { headers: { 'Access-Token': connection.access_token } }
  )
  const data = await res.json()
  if (data.code !== 0) throw new Error(data.message || 'TikTok API error')

  const list = data.data?.list || []
  const campaigns = list.map((c: { metrics?: { campaign_name?: string; spend?: string; impressions?: string; clicks?: string; conversion?: string; ctr?: string; cpc?: string; cpm?: string } }) => ({
    user_id: userId,
    connection_id: connection.id,
    platform: 'tiktok',
    campaign_name: c.metrics?.campaign_name || 'Unknown',
    spend: parseFloat(c.metrics?.spend || '0'),
    impressions: parseInt(c.metrics?.impressions || '0', 10),
    clicks: parseInt(c.metrics?.clicks || '0', 10),
    conversions: parseFloat(c.metrics?.conversion || '0'),
    roas: 0,
    ctr: parseFloat(c.metrics?.ctr || '0'),
    cpc: parseFloat(c.metrics?.cpc || '0'),
    cpm: parseFloat(c.metrics?.cpm || '0'),
    date_start: startDate,
    date_end: endDate,
    synced_at: new Date().toISOString(),
  }))

  if (campaigns.length > 0) {
    await supabaseAdmin.from('ad_campaigns').delete().eq('connection_id', connection.id)
    await supabaseAdmin.from('ad_campaigns').insert(campaigns)
  }

  return campaigns.length
}

export async function POST(request: Request) {
  try {
    const { connectionId } = await request.json()
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { data: connection } = await supabaseAdmin
      .from('ad_connections')
      .select('*')
      .eq('id', connectionId)
      .eq('user_id', user.id)
      .single()

    if (!connection) return NextResponse.json({ error: 'Connection not found' }, { status: 404 })

    let count = 0
    if (connection.platform === 'meta') count = await syncMeta(connection, user.id)
    if (connection.platform === 'tiktok') count = await syncTikTok(connection, user.id)

    await supabaseAdmin
      .from('ad_connections')
      .update({ last_synced_at: new Date().toISOString() })
      .eq('id', connectionId)

    return NextResponse.json({ success: true, count })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
