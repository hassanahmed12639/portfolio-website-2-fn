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
      conversion_feedback: true,
      validator: false,
      deduplication: false,
      retry_queue: false,
      http_headers: false,
      cookie_extender: false,
      anomaly_detection: false,
      scanner: false,
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
      conversion_feedback: true,
      validator: false,
      deduplication: true,
      retry_queue: false,
      http_headers: true,
      cookie_extender: true,
      anomaly_detection: true,
      scanner: false,
      enrichment: false,
      integrations: true,
      reverse_proxy: true,
      attribution: false,
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
      conversion_feedback: true,
      validator: false,
      deduplication: true,
      retry_queue: false,
      http_headers: true,
      cookie_extender: true,
      anomaly_detection: true,
      scanner: false,
      enrichment: false,
      integrations: true,
      reverse_proxy: true,
      attribution: false,
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

// Trial plan names stored in DB: pro_trial, agency_trial (legacy: trial → pro)
export type PlanName = PlanType | 'trial' | 'pro_trial' | 'agency_trial'
export type ProfileForPlan = {
  plan?: string | null
  is_trial?: boolean | null
  trial_expires_at?: string | null
  trial_started_at?: string | null
  events_this_month?: number | null
  events_reset_at?: string | null
}

function trialToPlan(plan: PlanName): PlanType {
  if (plan === 'pro_trial' || plan === 'trial') return 'pro'
  if (plan === 'agency_trial') return 'agency'
  return plan as PlanType
}

export function canAccessFeature(plan: PlanName, feature: FeatureKey): boolean {
  const p = trialToPlan(plan)
  return canUseFeature(p, feature)
}

export function getEffectivePlan(profile: ProfileForPlan): PlanName {
  const plan = profile.plan as string | undefined
  const isTrialPlan = plan === 'pro_trial' || plan === 'agency_trial' || plan === 'trial' || profile.is_trial

  // Trial plans: grant Pro or Agency features until expiry
  if (isTrialPlan) {
    if (profile.trial_expires_at && new Date(profile.trial_expires_at) <= new Date()) {
      return 'free' // expired
    }
    if (plan === 'agency_trial') return 'agency_trial'
    if (plan === 'pro_trial' || plan === 'trial') return 'pro_trial'
    if (profile.is_trial) return 'pro_trial' // fallback when plan not set
  }

  if (plan && (plan in PLANS || plan === 'pro_trial' || plan === 'agency_trial' || plan === 'trial')) {
    return plan as PlanName
  }
  return 'free'
}

export function isPlanActive(profile: ProfileForPlan): boolean {
  if (profile.is_trial && profile.trial_expires_at) {
    return new Date(profile.trial_expires_at) > new Date()
  }
  return true
}
