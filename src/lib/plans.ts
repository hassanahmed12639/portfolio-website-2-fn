export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    events_limit: 500,
    domains_limit: 1,
    scans_limit: 3,
    ai_analyses_limit: 3,
    features: {
      meta_capi: true,
      google_enhanced: true,
      tiktok: false,
      snapchat: false,
      ga4: false,
      cookie_extender: false,
      reverse_proxy: false,
      enrichment: false,
      anomaly_detection: false,
      event_replay: false,
      raw_data_export: false,
      attribution: false,
      ai_analysis: true,
      website_scanner: true,
      http_headers: false,
      privacy_config: true,
      playground: true,
      gtm_templates: false,
    },
  },
  trial: {
    name: '7-Day Free Trial',
    price: 0,
    events_limit: 50000,
    domains_limit: 3,
    scans_limit: -1,
    ai_analyses_limit: -1,
    features: {
      meta_capi: true,
      google_enhanced: true,
      tiktok: true,
      snapchat: true,
      ga4: true,
      cookie_extender: true,
      reverse_proxy: true,
      enrichment: true,
      anomaly_detection: true,
      event_replay: true,
      raw_data_export: true,
      attribution: true,
      ai_analysis: true,
      website_scanner: true,
      http_headers: true,
      privacy_config: true,
      playground: true,
      gtm_templates: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 10,
    events_limit: 50000,
    domains_limit: 3,
    scans_limit: -1,
    ai_analyses_limit: -1,
    features: {
      meta_capi: true,
      google_enhanced: true,
      tiktok: true,
      snapchat: true,
      ga4: true,
      cookie_extender: true,
      reverse_proxy: true,
      enrichment: true,
      anomaly_detection: true,
      event_replay: true,
      raw_data_export: true,
      attribution: true,
      ai_analysis: true,
      website_scanner: true,
      http_headers: true,
      privacy_config: true,
      playground: true,
      gtm_templates: false,
    },
  },
  agency: {
    name: 'Agency',
    price: 25,
    events_limit: -1,
    domains_limit: 10,
    scans_limit: -1,
    ai_analyses_limit: -1,
    features: {
      meta_capi: true,
      google_enhanced: true,
      tiktok: true,
      snapchat: true,
      ga4: true,
      cookie_extender: true,
      reverse_proxy: true,
      enrichment: true,
      anomaly_detection: true,
      event_replay: true,
      raw_data_export: true,
      attribution: true,
      ai_analysis: true,
      website_scanner: true,
      http_headers: true,
      privacy_config: true,
      playground: true,
      gtm_templates: true,
    },
  },
} as const

export type PlanName = keyof typeof PLANS

export type FeatureKey = keyof (typeof PLANS)['free']['features']

export function canAccessFeature(
  plan: PlanName,
  feature: FeatureKey
): boolean {
  return (PLANS[plan]?.features[feature] as boolean) ?? false
}

export function getEventsLimit(plan: PlanName): number {
  return PLANS[plan]?.events_limit ?? 500
}

export function isUnlimited(limit: number): boolean {
  return limit === -1
}

export type ProfileForPlan = {
  plan?: string | null
  is_trial?: boolean | null
  trial_expires_at?: string | null
  trial_started_at?: string | null
}

export function isPlanActive(profile: ProfileForPlan): boolean {
  if (profile.is_trial && profile.trial_expires_at) {
    return new Date(profile.trial_expires_at) > new Date()
  }
  return true
}

export function getEffectivePlan(profile: ProfileForPlan): PlanName {
  if (profile.is_trial && profile.trial_expires_at) {
    if (new Date(profile.trial_expires_at) > new Date()) {
      return 'trial'
    }
    return 'free'
  }
  const p = profile.plan as PlanName | undefined
  return p && (p in PLANS) ? p : 'free'
}
