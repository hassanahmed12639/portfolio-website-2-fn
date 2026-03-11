import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

const supabaseAdmin = createAdminClient()

function getActionValue(actions: { action_type: string; value: string }[] | undefined, type: string | ((t: string) => boolean)): number {
  if (!actions?.length) return 0
  const match = typeof type === 'string'
    ? actions.find((a) => a.action_type === type)
    : actions.find((a) => type(a.action_type))
  return parseFloat(match?.value || '0')
}

async function syncMeta(connection: any, userId: string) {
  const params = new URLSearchParams({
    fields: [
      'campaign_name',
      'spend',
      'impressions',
      'clicks',
      'actions',
      'action_values',
      'cost_per_action_type',
      'ctr',
      'cpc',
      'cpm',
      'reach',
      'frequency',
      'inline_link_clicks',
    ].join(','),
    level: 'campaign',
    date_preset: 'maximum',
    access_token: connection.access_token,
    limit: '500',
  })

  const url = `https://graph.facebook.com/v18.0/act_${connection.account_id}/insights?${params}`
  console.log('Meta sync URL:', url.replace(connection.access_token, 'TOKEN_HIDDEN'))

  const res = await fetch(url)
  const data = await res.json()
  console.log('Meta sync full response:', JSON.stringify(data, null, 2))
  console.log('Meta campaigns count:', data.data?.length ?? 0)

  if (data.error) throw new Error(data.error.message)

  // Also try fetching campaigns directly to verify account access
  const campaignsRes = await fetch(
    `https://graph.facebook.com/v18.0/act_${connection.account_id}/campaigns?fields=name,status,objective&access_token=${connection.access_token}`
  )
  const campaignsData = await campaignsRes.json()
  console.log('Meta campaigns direct:', JSON.stringify(campaignsData, null, 2))

  const campaigns = (data.data || []).map((c: any) => {
    const actions = c.actions || []
    const costPerAction = c.cost_per_action_type || []

    const conversions = getActionValue(actions, 'purchase') || getActionValue(actions, 'omni_purchase')
    const leads = getActionValue(actions, 'lead') || getActionValue(actions, (t) => t?.includes('lead'))
    const messages =
      getActionValue(actions, (t) => t?.includes('messaging_conversation')) ||
      getActionValue(actions, (t) => t?.includes('messaging_first_reply'))
    const addToCart = getActionValue(actions, 'add_to_cart') || getActionValue(actions, (t) => t?.includes('add_to_cart'))
    const initiateCheckout =
      getActionValue(actions, 'initiate_checkout') || getActionValue(actions, (t) => t?.includes('initiate_checkout'))

    const costPerLead =
      parseFloat(costPerAction.find((a: any) => a.action_type === 'lead')?.value || '0') ||
      parseFloat(costPerAction.find((a: any) => a.action_type?.includes('lead'))?.value || '0')
    const costPerMessage =
      parseFloat(costPerAction.find((a: any) => a.action_type?.includes('messaging'))?.value || '0')
    const costPerPurchase =
      parseFloat(costPerAction.find((a: any) => a.action_type === 'purchase')?.value || '0') ||
      parseFloat(costPerAction.find((a: any) => a.action_type === 'omni_purchase')?.value || '0')

    const spend = parseFloat(c.spend || 0)
    const revenue = parseFloat(String(conversions)) * 50

    return {
      user_id: userId,
      connection_id: connection.id,
      platform: 'meta',
      campaign_name: c.campaign_name,
      spend,
      impressions: parseInt(c.impressions || 0),
      clicks: parseInt(c.clicks || 0),
      conversions: parseFloat(String(conversions)),
      roas: spend > 0 ? revenue / spend : 0,
      ctr: parseFloat(c.ctr || 0),
      cpc: parseFloat(c.cpc || 0),
      cpm: parseFloat(c.cpm || 0),
      leads: parseFloat(String(leads)),
      cost_per_lead: costPerLead,
      messages: parseFloat(String(messages)),
      cost_per_message: costPerMessage,
      reach: parseInt(c.reach || 0),
      frequency: parseFloat(c.frequency || 0),
      link_clicks: parseInt(c.inline_link_clicks || c.clicks || 0),
      add_to_cart: parseFloat(String(addToCart)),
      initiate_checkout: parseFloat(String(initiateCheckout)),
      cost_per_purchase: costPerPurchase,
      date_start: null,
      date_end: null,
      synced_at: new Date().toISOString(),
    }
  })

  console.log('Campaigns to insert:', campaigns.length)

  if (campaigns.length > 0) {
    await supabaseAdmin.from('ad_campaigns').delete().eq('connection_id', connection.id)
    const { error } = await supabaseAdmin.from('ad_campaigns').insert(campaigns)
    if (error) console.log('Supabase insert error:', error)
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
