'use client'

import { useState, useEffect } from 'react'
import PayPalSubscriptionButton from '@/components/PayPalSubscriptionButton'

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

  const currentPlan = (profile?.plan as PlanSlug) || 'free'
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
                        ? 'bg-blue-50 text-blue-700'
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
                <div className="border border-blue-100 rounded-xl p-4 mb-6 bg-blue-50/80">
                  <p className="text-xs text-blue-600 uppercase tracking-wider mb-2">You selected</p>
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-bold text-slate-900">
                      TrackHive {selectedPlan === 'pro' ? 'Pro' : 'Agency'}
                    </p>
                    <p className="font-bold text-slate-900">
                      {selectedPlan === 'pro' ? '$10' : '$25'}/mo
                    </p>
                  </div>
                  <div className="border-t border-blue-100 mt-3 pt-3">
                    <div className="flex justify-between text-sm text-slate-600">
                      <span>Subtotal</span>
                      <span>{selectedPlan === 'pro' ? '$10.00' : '$25.00'}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-600 mt-1">
                      <span>Billed</span>
                      <span>Monthly</span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-900 mt-2 pt-2 border-t border-blue-100">
                      <span>Total</span>
                      <span>{selectedPlan === 'pro' ? '$10.00' : '$25.00'}/mo</span>
                    </div>
                  </div>
                </div>
              )}

              {/* PayPal subscription button (SDK) */}
              {selectedPlan &&
                selectedPlan !== 'free' &&
                currentPlan !== selectedPlan &&
                (selectedPlan === 'pro' ? proPlanId : agencyPlanId) && (
                  <PayPalSubscriptionButton
                    key={selectedPlan}
                    planId={selectedPlan === 'pro' ? proPlanId! : agencyPlanId!}
                    containerId={`paypal-button-container-${selectedPlan === 'pro' ? proPlanId! : agencyPlanId!}`}
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
          <div className="lg:col-span-3 order-1 lg:order-2 space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Choose a plan
            </h3>

            {/* Free Plan Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('free')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('free')}
              className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                selectedPlan === 'free'
                  ? 'border-blue-500 shadow-md shadow-blue-50'
                  : 'border-slate-100 hover:border-slate-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🆓</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Free</p>
                    <p className="text-xs text-slate-400">Forever free</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">
                    $0<span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'free' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}
                  >
                    {selectedPlan === 'free' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="text-green-500">✓</span> 1,000 events/month
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Meta CAPI
                </p>
                <p className="text-xs text-slate-500 flex items-center gap-2">
                  <span className="text-green-500">✓</span> 1 pixel
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-red-400">✗</span> AI Analysis
                </p>
                <p className="text-xs text-slate-400 flex items-center gap-2">
                  <span className="text-red-400">✗</span> Email alerts
                </p>
              </div>
            </div>

            {/* Pro Plan Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('pro')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('pro')}
              className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all relative ${
                selectedPlan === 'pro'
                  ? 'border-blue-500 shadow-md shadow-blue-50'
                  : 'border-slate-100 hover:border-blue-200'
              }`}
            >
              <span className="absolute -top-3 left-4 bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                MOST POPULAR
              </span>
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">⚡</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Pro</p>
                    <p className="text-xs text-slate-400">For growing businesses</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">
                    $10<span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'pro' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}
                  >
                    {selectedPlan === 'pro' && <div className="w-2 h-2 rounded-full bg-white" />}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> 50,000 events/month
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> All platforms
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> 3 pixels
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> AI Analysis
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Email alerts
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Priority support
                </p>
              </div>
            </div>

            {/* Agency Plan Card */}
            <div
              role="button"
              tabIndex={0}
              onClick={() => setSelectedPlan('agency')}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedPlan('agency')}
              className={`bg-white rounded-2xl border-2 p-6 cursor-pointer transition-all ${
                selectedPlan === 'agency'
                  ? 'border-purple-500 shadow-md shadow-purple-50'
                  : 'border-slate-100 hover:border-purple-200'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                    <span className="text-lg">🏢</span>
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">Agency</p>
                    <p className="text-xs text-slate-400">For agencies & teams</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <p className="font-bold text-slate-900">
                    $25<span className="text-xs font-normal text-slate-400">/mo</span>
                  </p>
                  <div
                    className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                      selectedPlan === 'agency'
                        ? 'border-purple-500 bg-purple-500'
                        : 'border-slate-300'
                    }`}
                  >
                    {selectedPlan === 'agency' && (
                      <div className="w-2 h-2 rounded-full bg-white" />
                    )}
                  </div>
                </div>
              </div>
              <div className="space-y-1.5">
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Unlimited events
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> All platforms
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> 10 pixels
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Everything in Pro
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> White label
                </p>
                <p className="text-xs text-slate-600 flex items-center gap-2">
                  <span className="text-green-500">✓</span> Dedicated support
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
