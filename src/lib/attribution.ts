import { createAdminClient } from '@/lib/supabase/admin'

export type AttributionModelKey =
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'position_based'
  | 'time_decay'

type Touchpoint = {
  id: string
  occurred_at: string
  platform: string | null
  source: string | null
  medium: string | null
}

function normalizeChannel(tp: Touchpoint): string {
  const platform = (tp.platform ?? '').toLowerCase()
  const source = (tp.source ?? '').toLowerCase()
  const medium = (tp.medium ?? '').toLowerCase()
  if (platform.includes('meta') || source.includes('facebook') || source.includes('instagram')) return 'meta'
  if (platform.includes('tiktok') || source.includes('tiktok')) return 'tiktok'
  if (platform.includes('google') || medium.includes('cpc') || source.includes('google')) return 'google_ads'
  if (medium.includes('organic')) return 'organic'
  if (!source && !medium) return 'direct'
  return source || platform || 'referral'
}

function toWeights(model: AttributionModelKey, touchpoints: Touchpoint[]): number[] {
  const n = touchpoints.length
  if (n === 0) return []
  if (model === 'last_click') return Array.from({ length: n }, (_, i) => (i === n - 1 ? 1 : 0))
  if (model === 'first_click') return Array.from({ length: n }, (_, i) => (i === 0 ? 1 : 0))
  if (model === 'linear') return Array.from({ length: n }, () => 1 / n)
  if (model === 'position_based') {
    if (n === 1) return [1]
    if (n === 2) return [0.5, 0.5]
    const first = 0.4
    const last = 0.4
    const middle = (1 - first - last) / (n - 2)
    return touchpoints.map((_, i) => (i === 0 ? first : i === n - 1 ? last : middle))
  }
  // time decay
  const now = new Date(touchpoints[n - 1].occurred_at).getTime()
  const halfLifeDays = 7
  const halfLifeMs = halfLifeDays * 24 * 60 * 60 * 1000
  const raw = touchpoints.map((tp) => {
    const dt = Math.max(0, now - new Date(tp.occurred_at).getTime())
    return Math.pow(0.5, dt / halfLifeMs)
  })
  const sum = raw.reduce((a, b) => a + b, 0) || 1
  return raw.map((v) => v / sum)
}

export async function ensureConversionsFact(userId: string, days = 90) {
  const admin = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)

  const { data: events } = await admin
    .from('events')
    .select('event_id, event_name, value, currency, payload, created_at')
    .eq('user_id', userId)
    .or('event_name.eq.Purchase,event_name.eq.TEST_Purchase')
    .gte('created_at', since.toISOString())

  const rows = (events ?? []).map((e) => {
    const payload = (e.payload as Record<string, unknown> | null) ?? null
    const orderId = typeof payload?.order_id === 'string' ? payload.order_id : null
    const sourceUrl = typeof payload?.event_source_url === 'string' ? payload.event_source_url : null
    return {
      user_id: userId,
      event_id: e.event_id ?? null,
      order_id: orderId,
      conversion_name: e.event_name ?? 'Purchase',
      conversion_at: e.created_at,
      value: Number(e.value ?? 0),
      currency: typeof e.currency === 'string' ? e.currency : 'USD',
      source_url: sourceUrl,
    }
  })

  if (rows.length > 0) {
    await admin.from('conversions_fact').upsert(rows, { onConflict: 'user_id,event_id' })
  }
  return rows.length
}

export async function ensureTouchpointsFact(userId: string, days = 90) {
  const admin = createAdminClient()
  const since = new Date()
  since.setDate(since.getDate() - days)
  const { data: events } = await admin
    .from('events')
    .select('event_id, visitor_id, platform, fbclid, payload, created_at')
    .eq('user_id', userId)
    .gte('created_at', since.toISOString())

  const rows = (events ?? []).map((e) => {
    const payload = (e.payload as Record<string, unknown> | null) ?? null
    const sourceUrl = typeof payload?.event_source_url === 'string' ? payload.event_source_url : null
    let source: string | null = null
    let medium: string | null = null
    if (sourceUrl) {
      try {
        const u = new URL(sourceUrl)
        source = u.searchParams.get('utm_source')
        medium = u.searchParams.get('utm_medium')
      } catch {
        // no-op
      }
    }
    return {
      user_id: userId,
      event_id: e.event_id ?? null,
      session_id: null,
      visitor_id: e.visitor_id ?? null,
      occurred_at: e.created_at,
      source,
      medium,
      campaign: null,
      term: null,
      content: null,
      landing_page: sourceUrl,
      referrer: null,
      gclid: null,
      fbclid: e.fbclid ?? null,
      ttclid: null,
      platform: e.platform ?? null,
      raw_payload: payload ?? {},
    }
  })
  if (rows.length > 0) {
    await admin.from('channel_touchpoints').upsert(rows, { onConflict: 'user_id,event_id,platform,occurred_at' })
  }
  return rows.length
}

export async function computeAttributionForUser(userId: string, modelKey: AttributionModelKey) {
  const admin = createAdminClient()

  const { data: model } = await admin
    .from('attribution_models')
    .select('id, lookback_days')
    .eq('model_key', modelKey)
    .eq('is_active', true)
    .single()
  if (!model) throw new Error(`Attribution model not found: ${modelKey}`)

  const { data: conversions } = await admin
    .from('conversions_fact')
    .select('id, conversion_at, value')
    .eq('user_id', userId)
    .order('conversion_at', { ascending: false })
    .limit(500)

  if (!conversions || conversions.length === 0) {
    return { computed: 0, touched: 0 }
  }

  const lookbackMs = Number(model.lookback_days ?? 30) * 24 * 60 * 60 * 1000
  let written = 0
  for (const c of conversions) {
    const endTs = new Date(c.conversion_at).getTime()
    const startTs = new Date(endTs - lookbackMs).toISOString()
    const endIso = new Date(endTs).toISOString()

    const { data: touchpoints } = await admin
      .from('channel_touchpoints')
      .select('id, occurred_at, platform, source, medium')
      .eq('user_id', userId)
      .gte('occurred_at', startTs)
      .lte('occurred_at', endIso)
      .order('occurred_at', { ascending: true })

    const list = (touchpoints ?? []) as Touchpoint[]
    if (list.length === 0) {
      // assign direct channel if no touchpoints
      await admin
        .from('attribution_results')
        .upsert({
          user_id: userId,
          conversion_id: c.id,
          model_id: model.id,
          touchpoint_id: null,
          channel: 'direct',
          credit_pct: 1,
          revenue_allocated: Number(c.value ?? 0),
          computed_at: new Date().toISOString(),
        })
      written += 1
      continue
    }

    const weights = toWeights(modelKey, list)
    const byChannel = new Map<string, { pct: number; revenue: number; touchpointId: string | null }>()
    for (let i = 0; i < list.length; i += 1) {
      const channel = normalizeChannel(list[i])
      const w = weights[i] ?? 0
      const rev = Number(c.value ?? 0) * w
      const prev = byChannel.get(channel) ?? { pct: 0, revenue: 0, touchpointId: list[i].id }
      prev.pct += w
      prev.revenue += rev
      byChannel.set(channel, prev)
    }

    const rows = Array.from(byChannel.entries()).map(([channel, v]) => ({
      user_id: userId,
      conversion_id: c.id,
      model_id: model.id,
      touchpoint_id: v.touchpointId,
      channel,
      credit_pct: v.pct,
      revenue_allocated: v.revenue,
      computed_at: new Date().toISOString(),
    }))

    if (rows.length > 0) {
      await admin.from('attribution_results').delete().eq('conversion_id', c.id).eq('model_id', model.id)
      await admin.from('attribution_results').insert(rows)
      written += rows.length
    }
  }

  return { computed: conversions.length, touched: written }
}
