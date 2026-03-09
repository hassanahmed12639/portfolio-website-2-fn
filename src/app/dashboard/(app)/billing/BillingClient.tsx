'use client'

import { useState, useEffect } from 'react'
import PayPalSubscriptionButton from '@/components/PayPalSubscriptionButton'
import { PRICING_PLANS } from '@/lib/pricing'

type PlanSlug = 'free' | 'trial' | 'pro' | 'agency'

function SuccessBanner({ selectedPlan }: { selectedPlan: string }) {
  const [show, setShow] = useState(false)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('success=true')) setShow(true)
  }, [])
  if (!show) return null
  return (
    <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
      <p className="text-green-800 font-semibold">🎉 Subscription activated!</p>
      <p className="text-green-600 text-sm mt-1">
        Welcome to TrackHive {selectedPlan === 'pro' ? 'Pro' : selectedPlan === 'agency' ? 'Agency' : selectedPlan}!
      </p>
    </div>
  )
}

export default function BillingClient() {
  const [profile, setProfile] = useState<{
    plan?: string
    plan_activated_at?: string
    email?: string
  } | null>(null)
  const [usage, setUsage] = useState<{
    plan?: string
    eventsThisMonth?: number
    pixelCount?: number
    leadCount?: number
    alertCount?: number
    teamCount?: number
    connectedPlatforms?: { meta?: boolean; tiktok?: boolean; ga4?: boolean; google?: boolean }
  } | null>(null)

  useEffect(() => {
    fetch('/api/dashboard/profile')
      .then((r) => r.json())
      .then((d) => {
        if (d.profile) setProfile(d.profile)
      })
      .catch(() => {})
  }, [])

  useEffect(() => {
    fetch('/api/dashboard/usage')
      .then((r) => r.json())
      .then((d) => setUsage(d))
      .catch(() => {})
  }, [])

  const currentPlan = (profile?.plan as PlanSlug) || (usage?.plan as PlanSlug) || 'free'
  const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Usage / Current plan section */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Billing</h2>
          <p className="text-slate-500 text-sm mb-4">Manage your TrackHive subscription</p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-w-md">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-slate-900 capitalize">{currentPlan}</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  currentPlan === 'pro'
                    ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]'
                    : currentPlan === 'agency'
                      ? 'bg-purple-50 text-purple-700'
                      : currentPlan === 'trial'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                }`}
              >
                {currentPlan === 'free'
                  ? 'Free Forever'
                  : currentPlan === 'trial'
                    ? '7-day Trial'
                    : 'Active'}
              </span>
            </div>
            {profile?.plan_activated_at && (
              <p className="text-xs text-slate-400 mt-1">
                Active since {new Date(profile.plan_activated_at).toLocaleDateString()}
              </p>
            )}
          </div>
        </div>

        <SuccessBanner selectedPlan={currentPlan} />

        {/* Plan cards — using PRICING_PLANS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PRICING_PLANS.map((plan) => {
            const planSlug = plan.id as PlanSlug
            const isCurrentPlan = currentPlan === planSlug

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative ${
                  isCurrentPlan
                    ? 'border-blue-500 shadow-lg shadow-blue-50'
                    : plan.highlighted
                      ? 'border-slate-200'
                      : 'border-slate-100'
                }`}
              >
                {/* Current plan badge top right */}
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mb-1">
                  <span className="text-4xl font-black text-slate-900">{plan.priceDisplay}</span>
                  {plan.price > 0 && (
                    <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
                  )}
                </div>

                {/* Name and tagline */}
                <p className="font-bold text-slate-900 text-lg mb-1">{plan.name}</p>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{plan.tagline}</p>

                {/* Features list */}
                <ul className="space-y-2.5 mb-6 flex-1">
                  {plan.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                        feature.included
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-slate-100 text-slate-300'
                      }`}>
                        {feature.included ? '✓' : '×'}
                      </div>
                      <span className={feature.included ? 'text-slate-700' : 'text-slate-300 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                {isCurrentPlan ? (
                  <div className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-200">
                    Your Current Plan
                  </div>
                ) : plan.id === 'free' ? (
                  <div className="w-full text-center py-3 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
                    Downgrade
                  </div>
                ) : (
                  <div>
                    <p className="text-xs text-slate-400 text-center mb-2">{plan.ctaNote}</p>
                    {plan.id === 'pro' && proPlanId && (
                      <PayPalSubscriptionButton
                        planId={proPlanId}
                        containerId={`paypal-button-${plan.id}`}
                      />
                    )}
                    {plan.id === 'agency' && agencyPlanId && (
                      <PayPalSubscriptionButton
                        planId={agencyPlanId}
                        containerId={`paypal-button-${plan.id}`}
                      />
                    )}
                    {((plan.id === 'pro' && !proPlanId) || (plan.id === 'agency' && !agencyPlanId)) && (
                      <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                        <p className="text-amber-800 text-sm">PayPal plan not configured.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Guarantee */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <span>🔒</span>
          <span>Secure payment via PayPal • Cancel anytime • 30-day money back</span>
        </div>
      </div>
    </div>
  )
}
