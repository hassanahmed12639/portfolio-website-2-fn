'use client'

import { useState, useEffect } from 'react'
import PayPalSubscriptionButton from '@/components/PayPalSubscriptionButton'

const PLAN_FEATURES = {
  free: [
    { key: 'events', label: '500 events/month', included: true },
    { key: 'meta', label: 'Meta CAPI', included: true },
    { key: 'pixels_1', label: '1 pixel', included: true },
    { key: 'scanner', label: 'Scanner (3 scans/month)', included: true },
    { key: 'playground', label: 'Playground (5 tests/day)', included: true },
    { key: 'tiktok', label: 'TikTok Events API', included: false },
    { key: 'ga4', label: 'GA4 Integration', included: false },
    { key: 'google', label: 'Google Ads', included: false },
    { key: 'leads', label: 'Lead Manager', included: false },
    { key: 'live_stream', label: 'Live Stream', included: false },
    { key: 'alerts', label: 'Email Alerts', included: false },
    { key: 'tools', label: 'All Tools', included: false },
  ],
  pro: [
    { key: 'events', label: '25,000 events/month', included: true },
    { key: 'meta', label: 'Meta CAPI', included: true },
    { key: 'tiktok', label: 'TikTok Events API', included: true },
    { key: 'ga4', label: 'GA4 Integration', included: true },
    { key: 'google', label: 'Google Ads', included: true },
    { key: 'pixels_3', label: '3 pixels', included: true },
    { key: 'leads', label: 'Lead Manager + scoring', included: true },
    { key: 'live_stream', label: 'Live Stream & Event Replay', included: true },
    { key: 'raw_data', label: 'Raw Data access', included: true },
    { key: 'cookie', label: 'Cookie Lifetime Extender', included: true },
    { key: 'proxy', label: 'Reverse Proxy', included: true },
    { key: 'headers', label: 'HTTP Headers Management', included: true },
    { key: 'anomaly', label: 'Anomaly Detection', included: true },
    { key: 'alerts', label: 'Email Alerts', included: true },
    { key: 'tools', label: 'All Tools Unlocked', included: true },
    { key: 'support', label: 'Priority Support', included: true },
    { key: 'team', label: 'Team Members', included: false },
  ],
  agency: [
    { key: 'events', label: 'Unlimited events', included: true },
    { key: 'meta', label: 'Meta CAPI', included: true },
    { key: 'tiktok', label: 'TikTok Events API', included: true },
    { key: 'ga4', label: 'GA4 Integration', included: true },
    { key: 'google', label: 'Google Ads', included: true },
    { key: 'pixels_25', label: '25 pixels', included: true },
    { key: 'leads', label: 'Lead Manager + scoring', included: true },
    { key: 'live_stream', label: 'Live Stream & Event Replay', included: true },
    { key: 'raw_data', label: 'Raw Data access', included: true },
    { key: 'cookie', label: 'Cookie Lifetime Extender', included: true },
    { key: 'proxy', label: 'Reverse Proxy', included: true },
    { key: 'headers', label: 'HTTP Headers Management', included: true },
    { key: 'anomaly', label: 'Anomaly Detection', included: true },
    { key: 'alerts', label: 'Email Alerts', included: true },
    { key: 'tools', label: 'All Tools Unlocked', included: true },
    { key: 'team', label: '5 Team Members', included: true },
    { key: 'templates', label: 'All GTM Templates', included: true },
    { key: 'support', label: 'Dedicated Support', included: true },
    { key: 'early', label: 'Early Access to Features', included: true },
  ]
} as const

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

type PlanSlug = 'free' | 'trial' | 'pro' | 'agency'

export default function BillingClient() {
  const [selectedPlan, setSelectedPlan] = useState<PlanSlug>('free')
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
        if (d.profile) {
          setProfile(d.profile)
          setSelectedPlan((d.profile.plan as PlanSlug) || 'free')
        }
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

  const activeFeatureKeys: Record<string, boolean> = {
    meta: !!usage?.connectedPlatforms?.meta,
    tiktok: !!usage?.connectedPlatforms?.tiktok,
    ga4: !!usage?.connectedPlatforms?.ga4,
    google: !!usage?.connectedPlatforms?.google,
    leads: (usage?.leadCount ?? 0) > 0,
    alerts: (usage?.alertCount ?? 0) > 0,
    pixels_1: (usage?.pixelCount ?? 0) >= 1,
    pixels_3: (usage?.pixelCount ?? 0) >= 1,
    pixels_25: (usage?.pixelCount ?? 0) >= 1,
    team: (usage?.teamCount ?? 0) > 0,
    events: (usage?.eventsThisMonth ?? 0) > 0,
  }
  const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Left — Checkout panel */}
          <div className="lg:col-span-2 order-2 lg:order-1">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm shadow-slate-200/50 p-8 sticky top-6">
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Billing</h2>
              <p className="text-slate-500 text-sm mb-6">Manage your TrackHive subscription</p>

              {/* Current Plan */}
              <div className="bg-slate-50 rounded-xl p-4 mb-6 border border-slate-100">
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

              {/* Selected plan summary */}
              {selectedPlan && selectedPlan !== 'free' && (
                <div className="border border-[var(--dash-border)] rounded-xl p-4 mb-6 bg-white shadow-[var(--dash-shadow)]">
                  <p className="text-xs text-blue-600 uppercase tracking-wider mb-2">You selected</p>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-900">
                      TrackHive {selectedPlan === 'pro' ? 'Pro' : 'Agency'}
                    </p>
                    <p className="font-bold text-slate-900">
                      {selectedPlan === 'pro' ? '$15' : '$45'}/mo
                    </p>
                  </div>
                  <div className="border-t border-[var(--dash-border)] mt-3 pt-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span>{selectedPlan === 'pro' ? '$15.00' : '$45.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>Billed</span>
                      <span>Monthly</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 mt-2 pt-2 border-t border-[var(--dash-border)]">
                      <span>Total</span>
                      <span>{selectedPlan === 'pro' ? '$15.00' : '$45.00'}/mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal subscription button (SDK) - shown when a paid plan is selected in left panel */}
              {selectedPlan &&
                selectedPlan !== 'free' &&
                currentPlan !== selectedPlan &&
                (selectedPlan === 'pro' ? proPlanId : agencyPlanId) && (
                  <PayPalSubscriptionButton
                    key={selectedPlan}
                    planId={selectedPlan === 'pro' ? proPlanId! : agencyPlanId!}
                    containerId={`paypal-button-container-${selectedPlan}`}
                  />
                )}

              {/* Missing plan IDs */}
              {selectedPlan &&
                selectedPlan !== 'free' &&
                currentPlan !== selectedPlan &&
                !(selectedPlan === 'pro' ? proPlanId : agencyPlanId) && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 text-center">
                    <p className="text-amber-800 text-sm">PayPal plan not configured. Add NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID / NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID to env.</p>
                  </div>
                )}

              {/* Already on this plan */}
              {selectedPlan === currentPlan && currentPlan !== 'free' && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-semibold">✅ You are on this plan</p>
                  <a
                    href="https://www.paypal.com/myaccount/autopay"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-slate-500 hover:text-slate-700 mt-2 block"
                  >
                    Manage on PayPal →
                  </a>
                </div>
              )}

              {/* Free plan selected */}
              {selectedPlan === 'free' && (
                <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
                  <p className="text-slate-600 font-medium">You are on the Free plan</p>
                  <p className="text-xs text-slate-400 mt-1">Select Pro or Agency to upgrade</p>
                </div>
              )}

              <SuccessBanner selectedPlan={selectedPlan} />

              {/* Guarantee */}
              <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                <span>🔒</span>
                <span>Secure payment via PayPal • Cancel anytime • 30-day money back</span>
              </div>
            </div>
          </div>

          {/* Right — Plan selection */}
          <div className="lg:col-span-3 order-1 lg:order-2">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Choose a plan
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(['free', 'pro', 'agency'] as const).map((planId) => {
                const features = PLAN_FEATURES[planId]
                const planInfo = {
                  free: { name: 'Free', price: '$0', period: 'forever', description: 'Perfect for getting started' },
                  pro: { name: 'Pro', price: '$15', period: '/month', description: 'For growing businesses' },
                  agency: { name: 'Agency', price: '$45', period: '/month', description: 'For agencies and teams' },
                }[planId]
                const isCurrentPlan = currentPlan === planId

                return (
                  <div
                    key={planId}
                    role="button"
                    tabIndex={0}
                    onClick={() => setSelectedPlan(planId)}
                    onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan(planId)}
                    className={`bg-white rounded-2xl border-2 p-6 flex flex-col cursor-pointer transition-all ${
                      isCurrentPlan
                        ? 'border-blue-500 shadow-lg shadow-blue-50'
                        : planId === 'pro'
                          ? 'border-slate-200'
                          : 'border-slate-100'
                    }`}
                  >
                    {/* Header */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-slate-900 text-lg">{planInfo.name}</h3>
                          {isCurrentPlan && (
                            <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Current
                            </span>
                          )}
                          {planId === 'pro' && !isCurrentPlan && (
                            <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="text-2xl font-black text-slate-900">{planInfo.price}</span>
                          <span className="text-slate-400 text-xs"> {planInfo.period}</span>
                        </div>
                      </div>
                      <p className="text-slate-500 text-sm">{planInfo.description}</p>
                    </div>

                    {/* Features */}
                    <ul className="space-y-2 mb-6 flex-1 min-h-0">
                      {features.map((feature) => {
                        const isActive = isCurrentPlan && activeFeatureKeys[feature.key]
                        return (
                          <li key={feature.key} className="flex items-center gap-2.5 text-sm">
                            <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                              !feature.included
                                ? 'bg-slate-100 text-slate-300'
                                : isActive
                                  ? 'bg-green-500 text-white'
                                  : 'bg-blue-100 text-blue-600'
                            }`}>
                              {!feature.included ? '×' : '✓'}
                            </div>
                            <span className={
                              !feature.included
                                ? 'text-slate-300 line-through'
                                : isActive
                                  ? 'text-slate-900 font-medium'
                                  : 'text-slate-600'
                            }>
                              {feature.label}
                            </span>
                            {isActive && (
                              <span className="ml-auto text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                                In use
                              </span>
                            )}
                          </li>
                        )
                      })}
                    </ul>

                    {/* Legend - only show on current plan */}
                    {isCurrentPlan && (
                      <div className="flex items-center gap-4 mb-4 text-xs text-slate-400 flex-wrap">
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span>Actively using</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-blue-100 border border-blue-300" />
                          <span>Available</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-3 h-3 rounded-full bg-slate-100" />
                          <span>Locked</span>
                        </div>
                      </div>
                    )}

                    {/* CTA */}
                    {isCurrentPlan ? (
                      <div className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-semibold border border-blue-200">
                        Your Current Plan
                      </div>
                    ) : planId === 'free' ? (
                      <div className="w-full text-center py-3 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
                        Downgrade
                      </div>
                    ) : (
                      <div>
                        <p className="text-xs text-slate-400 text-center mb-2">
                          Upgrade to {planInfo.name} for {planInfo.price}{planInfo.period}
                        </p>
                        {proPlanId && planId === 'pro' && (
                          <PayPalSubscriptionButton
                            key={planId}
                            planId={proPlanId}
                            containerId={`paypal-button-${planId}`}
                          />
                        )}
                        {agencyPlanId && planId === 'agency' && (
                          <PayPalSubscriptionButton
                            key={planId}
                            planId={agencyPlanId}
                            containerId={`paypal-button-${planId}`}
                          />
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
