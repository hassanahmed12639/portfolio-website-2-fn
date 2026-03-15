'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PLANS, PlanType, FeatureKey, canUseFeature } from '@/lib/plans'

export type Plan = 'free' | 'pro' | 'agency'

interface PlanState {
  plan: Plan
  isTrial: boolean
  trialDaysLeft: number
  trialEndsAt: Date | null
  isTrialExpired: boolean
  isLoading: boolean
  // Backward compatibility for DashboardNav, EcommerceDashboard, etc.
  can: (feature: FeatureKey) => boolean
  limits: (typeof PLANS)[PlanType]
  eventsThisMonth: number
  eventsLimit: number
  eventsPercent: number
  isNearLimit: boolean
  isAtLimit: boolean
  isUnlimited: boolean
  isPro: boolean
  isAgency: boolean
  isFree: boolean
  loading: boolean
}

function computePlanState(profile: {
  plan?: string | null
  is_trial?: boolean | null
  trial_ends_at?: string | null
  trial_expires_at?: string | null
  events_this_month?: number | null
}): Pick<PlanState, 'plan' | 'isTrial' | 'trialDaysLeft' | 'trialEndsAt' | 'isTrialExpired'> {
  const now = new Date()
  const trialEndRaw = profile.trial_ends_at ?? profile.trial_expires_at ?? null
  const trialEndsAt = trialEndRaw ? new Date(trialEndRaw) : null
  const isTrialExpired = !!profile.is_trial && !!trialEndsAt && now > trialEndsAt
  const trialDaysLeft = (() => {
    if (!trialEndsAt || isTrialExpired) return 0
    const dayMs = 1000 * 60 * 60 * 24
    // Calendar-day countdown:
    // 13th -> 19th shows 6, then 14th -> 19th shows 5.
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
    const startOfTrialEnd = new Date(
      trialEndsAt.getFullYear(),
      trialEndsAt.getMonth(),
      trialEndsAt.getDate()
    ).getTime()
    return Math.max(0, Math.floor((startOfTrialEnd - startOfToday) / dayMs))
  })()
  const rawPlan = (profile.plan && typeof profile.plan === 'string' ? profile.plan.toLowerCase() : '') || 'free'
  const effectivePlan: Plan = isTrialExpired
    ? 'free'
    : rawPlan === 'agency' || rawPlan === 'agency_trial'
      ? 'agency'
      : rawPlan === 'pro' || rawPlan === 'pro_trial' || rawPlan === 'trial'
        ? 'pro'
        : rawPlan === 'free'
          ? 'free'
          : 'free'

  return {
    plan: effectivePlan,
    isTrial: !!profile.is_trial && !isTrialExpired,
    trialDaysLeft,
    trialEndsAt,
    isTrialExpired,
  }
}

const defaultLimits = PLANS.free

export function usePlan(): PlanState {
  const supabase = createClient()
  const [state, setState] = useState<PlanState>({
    plan: 'free',
    isTrial: false,
    trialDaysLeft: 0,
    trialEndsAt: null,
    isTrialExpired: false,
    isLoading: true,
    can: () => false,
    limits: defaultLimits,
    eventsThisMonth: 0,
    eventsLimit: 500,
    eventsPercent: 0,
    isNearLimit: false,
    isAtLimit: false,
    isUnlimited: false,
    isPro: false,
    isAgency: false,
    isFree: true,
    loading: true,
  })

  useEffect(() => {
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function fetchPlan() {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('plan, is_trial, trial_ends_at, trial_expires_at, events_this_month')
        .eq('id', user.id)
        .single()

      if (!profile) {
        setState((prev) => ({ ...prev, isLoading: false }))
        return
      }

      const computed = computePlanState(profile)
      const plan = computed.plan as PlanType
      const limits = PLANS[plan] ?? defaultLimits
      const eventsThisMonth = profile.events_this_month ?? 0
      const eventsLimit = limits.eventsPerMonth
      const isUnlimited = eventsLimit === -1
      const eventsPercent = isUnlimited ? 0 : Math.min((eventsThisMonth / eventsLimit) * 100, 100)
      const isNearLimit = eventsPercent >= 80
      const isAtLimit = eventsPercent >= 100

      setState({
        ...computed,
        isLoading: false,
        can: (feature: FeatureKey) => canUseFeature(plan, feature),
        limits,
        eventsThisMonth,
        eventsLimit,
        eventsPercent,
        isNearLimit,
        isAtLimit,
        isUnlimited,
        isPro: plan === 'pro' || plan === 'agency',
        isAgency: plan === 'agency',
        isFree: plan === 'free',
        loading: false,
      })

      // If trial expired, update Supabase
      if (computed.isTrialExpired) {
        await supabase
          .from('profiles')
          .update({ plan: 'free', is_trial: false })
          .eq('id', user.id)
      }

      channel = supabase
        .channel('profile_plan')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: `id=eq.${user.id}`,
          },
          (payload: { new: Record<string, unknown> }) => {
            const computed = computePlanState(payload.new as Parameters<typeof computePlanState>[0])
            const plan = computed.plan as PlanType
            const limits = PLANS[plan] ?? defaultLimits
            const eventsThisMonth = (payload.new.events_this_month as number) ?? 0
            const eventsLimit = limits.eventsPerMonth
            const isUnlimited = eventsLimit === -1
            const eventsPercent = isUnlimited ? 0 : Math.min((eventsThisMonth / eventsLimit) * 100, 100)
            setState({
              ...computed,
              isLoading: false,
              can: (feature: FeatureKey) => canUseFeature(plan, feature),
              limits,
              eventsThisMonth,
              eventsLimit,
              eventsPercent,
              isNearLimit: eventsPercent >= 80,
              isAtLimit: eventsPercent >= 100,
              isUnlimited,
              isPro: plan === 'pro' || plan === 'agency',
              isAgency: plan === 'agency',
              isFree: plan === 'free',
              loading: false,
            })
          }
        )
        .subscribe()
    }

    fetchPlan()
    return () => {
      if (channel) supabase.removeChannel(channel)
    }
  }, [])

  return state
}
