'use client'

import { useState, useEffect } from 'react'
import { PLANS, PlanType, FeatureKey, canUseFeature, getEffectivePlan } from '@/lib/plans'

function toValidPlan(plan: string | null | undefined): PlanType {
  const p = String(plan || 'free')
  if (p in PLANS) return p as PlanType
  if (p === 'trial') return 'pro' // trial maps to pro features
  return 'free'
}

export function usePlan() {
  const [plan, setPlan] = useState<PlanType>('free')
  const [eventsThisMonth, setEventsThisMonth] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then((r) => r.json())
      .then((data) => {
        const profile = data.profile ?? data
        const effective = getEffectivePlan(profile)
        setPlan(toValidPlan(effective))
        setEventsThisMonth(profile.events_this_month ?? profile.events_used ?? 0)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const can = (feature: FeatureKey) => canUseFeature(plan, feature)
  const limits = PLANS[plan] ?? PLANS.free
  const eventsLimit = limits.eventsPerMonth
  const isUnlimited = eventsLimit === -1
  const eventsPercent = isUnlimited ? 0 : Math.min((eventsThisMonth / eventsLimit) * 100, 100)
  const isNearLimit = eventsPercent >= 80
  const isAtLimit = eventsPercent >= 100

  return {
    plan,
    limits,
    eventsThisMonth,
    eventsLimit,
    isUnlimited,
    eventsPercent,
    isNearLimit,
    isAtLimit,
    loading,
    can,
    isPro: plan === 'pro' || plan === 'agency',
    isAgency: plan === 'agency',
    isFree: plan === 'free',
  }
}
