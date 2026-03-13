/**
 * Routes that require Pro plan (pro, pro_trial, agency, agency_trial)
 */
export const PRO_ROUTES = [
  '/dashboard/leads',
  '/dashboard/live',
  '/dashboard/event-replay',
  '/dashboard/raw-data',
  '/dashboard/templates',
  '/dashboard/data-quality',
  '/dashboard/validator',
  '/dashboard/deduplication',
  '/dashboard/retry-queue',
  '/dashboard/headers',
  '/dashboard/cookie-extender',
  '/dashboard/anomalies',
  '/dashboard/enrichment',
  '/dashboard/integrations',
  '/dashboard/reverse-proxy',
  '/dashboard/attribution',
  '/dashboard/connectors',
  '/dashboard/custom-dashboards',
] as const

/**
 * Routes that require Agency plan (agency, agency_trial only)
 */
export const AGENCY_ROUTES = ['/dashboard/team'] as const

export function getRequiredPlan(pathname: string): 'pro' | 'agency' | null {
  if (AGENCY_ROUTES.some((r) => pathname.startsWith(r))) return 'agency'
  if (PRO_ROUTES.some((r) => pathname.startsWith(r))) return 'pro'
  return null
}

export function hasPlanAccess(
  userPlan: string | null | undefined,
  isTrial: boolean | null | undefined,
  trialExpiresAt: string | null | undefined,
  required: 'pro' | 'agency'
): boolean {
  const effective =
    userPlan === 'pro' ||
    userPlan === 'agency' ||
    userPlan === 'pro_trial' ||
    userPlan === 'agency_trial' ||
    userPlan === 'trial'

  if (!effective) return false

  if (isTrial && trialExpiresAt && new Date(trialExpiresAt) <= new Date()) {
    return false // trial expired
  }

  if (required === 'agency') {
    return userPlan === 'agency' || userPlan === 'agency_trial'
  }

  return true // pro or agency
}
