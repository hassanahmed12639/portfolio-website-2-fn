export const PLANS = {
  free: {
    name: 'Free',
    price: 0,
    eventsPerMonth: 500,
    maxPixels: 1,
    maxTeamMembers: 0,
    platforms: ['meta'] as const,
    features: {
      overview: true,
      setup: true,
      lead_manager: false,
      event_logs: true, // 24hrs only
      live_stream: false,
      event_replay: false,
      raw_data: false,
      pixels: true, // 1 only
      playground: true, // 5/day limit
      templates: false,
      data_quality: false,
      validator: false,
      deduplication: false,
      retry_queue: false,
      http_headers: false,
      cookie_extender: false,
      anomaly_detection: false,
      scanner: true, // 3/month
      enrichment: false,
      integrations: false,
      reverse_proxy: false,
      attribution: false,
      privacy: true,
      email_alerts: false,
      team_members: false,
    },
  },
  pro: {
    name: 'Pro',
    price: 15,
    eventsPerMonth: 25000,
    maxPixels: 3,
    maxTeamMembers: 0,
    platforms: ['meta', 'tiktok', 'ga4', 'google'] as const,
    features: {
      overview: true,
      setup: true,
      lead_manager: true,
      event_logs: true,
      live_stream: true,
      event_replay: true,
      raw_data: true,
      pixels: true,
      playground: true,
      templates: true,
      data_quality: true,
      validator: true,
      deduplication: true,
      retry_queue: true,
      http_headers: true,
      cookie_extender: true,
      anomaly_detection: true,
      scanner: true,
      enrichment: true,
      integrations: true,
      reverse_proxy: true,
      attribution: true,
      privacy: true,
      email_alerts: true,
      team_members: false,
    },
  },
  agency: {
    name: 'Agency',
    price: 45,
    eventsPerMonth: -1, // unlimited
    maxPixels: 25,
    maxTeamMembers: 5,
    platforms: ['meta', 'tiktok', 'ga4', 'google'] as const,
    features: {
      overview: true,
      setup: true,
      lead_manager: true,
      event_logs: true,
      live_stream: true,
      event_replay: true,
      raw_data: true,
      pixels: true,
      playground: true,
      templates: true,
      data_quality: true,
      validator: true,
      deduplication: true,
      retry_queue: true,
      http_headers: true,
      cookie_extender: true,
      anomaly_detection: true,
      scanner: true,
      enrichment: true,
      integrations: true,
      reverse_proxy: true,
      attribution: true,
      privacy: true,
      email_alerts: true,
      team_members: true,
    },
  },
} as const

export type PlanType = keyof typeof PLANS
export type FeatureKey = keyof (typeof PLANS)['free']['features']

export function canUseFeature(plan: PlanType, feature: FeatureKey): boolean {
  return (PLANS[plan]?.features[feature] as boolean) ?? false
}

export function getEventsLimit(plan: PlanType): number {
  return PLANS[plan]?.eventsPerMonth ?? 500
}

export function getPixelsLimit(plan: PlanType): number {
  return PLANS[plan]?.maxPixels ?? 1
}

export function isUnlimited(plan: PlanType): boolean {
  return PLANS[plan]?.eventsPerMonth === -1
}

// Backward compatibility for existing code (trial maps to pro features)
export type PlanName = PlanType | 'trial'
export type ProfileForPlan = {
  plan?: string | null
  is_trial?: boolean | null
  trial_expires_at?: string | null
  trial_started_at?: string | null
  events_this_month?: number | null
  events_reset_at?: string | null
}

export function canAccessFeature(plan: PlanName, feature: FeatureKey): boolean {
  const p = (plan === 'trial' ? 'pro' : plan) as PlanType
  return canUseFeature(p, feature)
}

export function getEffectivePlan(profile: ProfileForPlan): PlanName {
  if (profile.is_trial && profile.trial_expires_at) {
    if (new Date(profile.trial_expires_at) > new Date()) {
      return 'pro' // trial maps to pro features
    }
    return 'free'
  }
  const p = profile.plan as PlanType | undefined
  return p && p in PLANS ? p : 'free'
}

export function isPlanActive(profile: ProfileForPlan): boolean {
  if (profile.is_trial && profile.trial_expires_at) {
    return new Date(profile.trial_expires_at) > new Date()
  }
  return true
}
