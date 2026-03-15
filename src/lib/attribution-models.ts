export type AttributionModelKey =
  | 'last_click'
  | 'first_click'
  | 'linear'
  | 'position_based'
  | 'time_decay'
  | 'data_driven'

export type Touchpoint = {
  channel: string
  source: string | null
  medium: string | null
  touchpoint_at: string
}

export function supportedAttributionModels() {
  return [
    { key: 'last_click', name: 'Last Click', window_days: 30 },
    { key: 'first_click', name: 'First Click', window_days: 30 },
    { key: 'linear', name: 'Linear', window_days: 30 },
    { key: 'position_based', name: 'Position Based (40/20/40)', window_days: 30 },
    { key: 'time_decay', name: 'Time Decay', window_days: 14 },
    { key: 'data_driven', name: 'Data Driven (heuristic)', window_days: 30 },
  ] as const
}

export function normalizeChannel(value: string | null | undefined): string {
  const v = (value ?? '').trim().toLowerCase()
  if (!v) return 'direct'
  if (v.includes('facebook') || v.includes('instagram') || v === 'meta') return 'meta'
  if (v.includes('tiktok') || v === 'tt') return 'tiktok'
  if (v.includes('google') || v === 'gads' || v === 'google_ads') return 'google_ads'
  if (v.includes('organic') || v === 'seo' || v === 'gsc') return 'organic'
  if (v.includes('email')) return 'email'
  return v
}

function equalSplit(items: Touchpoint[]) {
  if (items.length === 0) return [] as Array<{ touchpoint: Touchpoint; credit_pct: number }>
  const pct = 1 / items.length
  return items.map((touchpoint) => ({ touchpoint, credit_pct: pct }))
}

export function computeAttributionCredits(modelKey: AttributionModelKey, touchpoints: Touchpoint[]) {
  if (touchpoints.length === 0) return [] as Array<{ touchpoint: Touchpoint; credit_pct: number }>
  const ordered = [...touchpoints].sort(
    (a, b) => new Date(a.touchpoint_at).getTime() - new Date(b.touchpoint_at).getTime()
  )

  if (modelKey === 'first_click') {
    return ordered.map((touchpoint, idx) => ({ touchpoint, credit_pct: idx === 0 ? 1 : 0 }))
  }

  if (modelKey === 'last_click') {
    return ordered.map((touchpoint, idx) => ({ touchpoint, credit_pct: idx === ordered.length - 1 ? 1 : 0 }))
  }

  if (modelKey === 'linear') {
    return equalSplit(ordered)
  }

  if (modelKey === 'position_based') {
    if (ordered.length === 1) return [{ touchpoint: ordered[0], credit_pct: 1 }]
    if (ordered.length === 2) {
      return ordered.map((touchpoint) => ({ touchpoint, credit_pct: 0.5 }))
    }
    const middleCount = ordered.length - 2
    const middleCredit = middleCount > 0 ? 0.2 / middleCount : 0
    return ordered.map((touchpoint, idx) => {
      if (idx === 0) return { touchpoint, credit_pct: 0.4 }
      if (idx === ordered.length - 1) return { touchpoint, credit_pct: 0.4 }
      return { touchpoint, credit_pct: middleCredit }
    })
  }

  if (modelKey === 'time_decay') {
    const lastTs = new Date(ordered[ordered.length - 1].touchpoint_at).getTime()
    const weighted = ordered.map((touchpoint) => {
      const ageHours = Math.max(
        0,
        (lastTs - new Date(touchpoint.touchpoint_at).getTime()) / (1000 * 60 * 60)
      )
      // Half-life around 7 days.
      const weight = Math.pow(0.5, ageHours / (24 * 7))
      return { touchpoint, weight }
    })
    const total = weighted.reduce((acc, row) => acc + row.weight, 0) || 1
    return weighted.map((row) => ({ touchpoint: row.touchpoint, credit_pct: row.weight / total }))
  }

  // data_driven fallback heuristic:
  // recent paid channels get slightly more weight, then normalize.
  const weighted = ordered.map((touchpoint, idx) => {
    const channel = normalizeChannel(touchpoint.channel)
    const recencyBoost = 1 + idx / Math.max(1, ordered.length - 1)
    const paidBoost = channel === 'meta' || channel === 'tiktok' || channel === 'google_ads' ? 1.15 : 1
    return { touchpoint, weight: recencyBoost * paidBoost }
  })
  const total = weighted.reduce((acc, row) => acc + row.weight, 0) || 1
  return weighted.map((row) => ({ touchpoint: row.touchpoint, credit_pct: row.weight / total }))
}
