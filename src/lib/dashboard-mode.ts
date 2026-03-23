/**
 * Single source of truth for which dashboard experience to show.
 * Handles whitespace/casing, and falls back to business_type when dashboard_type is unset.
 */
export type DashboardMode = 'ecommerce' | 'leadgen'

export function normalizeDashboardTypeRaw(
  raw: string | null | undefined
): DashboardMode | null {
  if (raw == null) return null
  const v = String(raw).trim().toLowerCase()
  if (v === 'leadgen') return 'leadgen'
  if (v === 'ecommerce') return 'ecommerce'
  return null
}

export function resolveDashboardMode(
  profile:
    | { dashboard_type?: string | null; business_type?: string | null }
    | null
    | undefined
): DashboardMode {
  const dt = normalizeDashboardTypeRaw(profile?.dashboard_type ?? null)
  if (dt) return dt
  const bt = normalizeDashboardTypeRaw(profile?.business_type ?? null)
  if (bt) return bt
  return 'ecommerce'
}
