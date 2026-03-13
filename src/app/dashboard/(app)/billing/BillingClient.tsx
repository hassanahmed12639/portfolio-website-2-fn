'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import PayPalSubscriptionButton from '@/components/PayPalSubscriptionButton'
import { PRICING_PLANS } from '@/lib/pricing'
import { usePlan } from '@/hooks/usePlan'

type PlanSlug = 'free' | 'pro' | 'agency'

function UpgradeRequiredBanner({ required }: { required: 'pro' | 'agency' }) {
  const msg =
    required === 'agency'
      ? 'Upgrade to Agency to access Team Members and agency features.'
      : 'Upgrade to Pro or Agency to access this feature.'
  return (
    <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-amber-800">
      <p className="font-semibold">Upgrade required</p>
      <p className="text-sm mt-1">{msg}</p>
    </div>
  )
}

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
  const router = useRouter()
  const searchParams = useSearchParams()
  const upgradeRequired = searchParams?.get('upgrade') as 'pro' | 'agency' | null
  const { plan, isTrial, isTrialExpired, trialDaysLeft } = usePlan()
  const [activating, setActivating] = useState<string | null>(null)
  const [error, setError] = useState('')

  const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID

  async function startTrial(selectedPlan: 'pro' | 'agency') {
    setActivating(selectedPlan)
    setError('')
    try {
      const res = await fetch('/api/dashboard/activate-trial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: selectedPlan }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong')
        return
      }
      router.push(`/dashboard?plan=${selectedPlan}&welcome=true&trial=true`)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setActivating(null)
    }
  }

  function getProButton() {
    if (plan === 'pro' && isTrial) {
      return (
        <div className="w-full bg-blue-50 border border-blue-200 text-blue-700 font-black py-3 rounded-xl text-center text-sm">
          ⏳ Trial Active — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left
        </div>
      )
    }
    if (plan === 'pro' && !isTrial) {
      return (
        <div className="w-full bg-slate-100 text-slate-600 font-black py-3 rounded-xl text-center text-sm">
          ✅ Your Current Plan
        </div>
      )
    }
    if (plan === 'agency') {
      return null
    }
    if (isTrialExpired) {
      return (
        <div>
          <p className="text-xs text-red-500 font-bold text-center mb-2">
            Trial expired — payment required to continue
          </p>
          {proPlanId && (
            <PayPalSubscriptionButton planId={proPlanId} containerId="paypal-button-pro" plan="pro" />
          )}
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={() => startTrial('pro')}
        disabled={activating === 'pro'}
        className="w-full bg-blue-600 text-white font-black py-3 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 text-sm"
      >
        {activating === 'pro' ? 'Activating...' : '🚀 Start 7-Day Free Trial'}
      </button>
    )
  }

  function getAgencyButton() {
    if (plan === 'agency' && isTrial) {
      return (
        <div className="w-full bg-slate-100 border border-slate-200 text-slate-700 font-black py-3 rounded-xl text-center text-sm">
          ⏳ Trial Active — {trialDaysLeft} day{trialDaysLeft !== 1 ? 's' : ''} left
        </div>
      )
    }
    if (plan === 'agency' && !isTrial) {
      return (
        <div className="w-full bg-slate-100 text-slate-600 font-black py-3 rounded-xl text-center text-sm">
          ✅ Your Current Plan
        </div>
      )
    }
    if (isTrialExpired) {
      return (
        <div>
          <p className="text-xs text-red-500 font-bold text-center mb-2">Trial expired — payment required</p>
          {agencyPlanId && (
            <PayPalSubscriptionButton planId={agencyPlanId} containerId="paypal-button-agency" plan="agency" />
          )}
        </div>
      )
    }
    return (
      <button
        type="button"
        onClick={() => startTrial('agency')}
        disabled={activating === 'agency'}
        className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-slate-700 transition-colors disabled:opacity-50 text-sm"
      >
        {activating === 'agency' ? 'Activating...' : '🚀 Start 7-Day Free Trial'}
      </button>
    )
  }

  const currentPlanLabel =
    plan === 'free'
      ? 'Free'
      : plan === 'pro'
        ? isTrial
          ? 'Pro Trial'
          : 'Pro'
        : isTrial
          ? 'Agency Trial'
          : 'Agency'

  const isCurrentPlanTrial = (plan === 'pro' || plan === 'agency') && isTrial

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Billing</h2>
          <p className="text-slate-500 text-sm mb-4">Manage your TrackHive subscription</p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-w-md">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-slate-900">{currentPlanLabel}</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  plan === 'pro'
                    ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]'
                    : plan === 'agency'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {plan === 'free' ? 'Free Forever' : isCurrentPlanTrial ? '7-day Trial' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {upgradeRequired && (upgradeRequired === 'pro' || upgradeRequired === 'agency') && (
          <UpgradeRequiredBanner required={upgradeRequired} />
        )}
        <SuccessBanner selectedPlan={plan} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {PRICING_PLANS.map((p) => {
            const planSlug = p.id as PlanSlug
            const isCurrentPlan =
              (plan === 'pro' && planSlug === 'pro') ||
              (plan === 'agency' && planSlug === 'agency') ||
              (plan === 'free' && planSlug === 'free')

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col relative ${
                  isCurrentPlan
                    ? 'border-blue-500 shadow-lg shadow-blue-50'
                    : p.highlighted
                      ? 'border-slate-200'
                      : 'border-slate-100'
                }`}
              >
                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-1">
                  <span className="text-4xl font-black text-slate-900">{p.priceDisplay}</span>
                  {p.price > 0 && <span className="text-slate-400 text-sm ml-1">{p.period}</span>}
                </div>
                <p className="font-bold text-slate-900 text-lg mb-1">{p.name}</p>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">{p.tagline}</p>

                <ul className="space-y-2.5 mb-6 flex-1">
                  {p.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm">
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                          feature.included ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-300'
                        }`}
                      >
                        {feature.included ? '✓' : '×'}
                      </div>
                      <span
                        className={
                          feature.included ? 'text-slate-700' : 'text-slate-300 line-through'
                        }
                      >
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrentPlan ? (
                  <div className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-200">
                    Your Current Plan
                  </div>
                ) : p.id === 'free' ? (
                  <div className="w-full text-center py-3 bg-slate-50 text-slate-400 rounded-xl text-sm font-medium cursor-not-allowed">
                    Downgrade
                  </div>
                ) : p.id === 'pro' ? (
                  <div>
                    {getProButton()}
                    {getProButton() === null && plan === 'agency' && (
                      <p className="text-xs text-slate-400 text-center">{p.ctaNote}</p>
                    )}
                    {getProButton() && (plan === 'free' || (plan === 'pro' && isTrial)) && (
                      <p className="text-xs text-slate-500 text-center mt-2">7-day free trial. No credit card required.</p>
                    )}
                    {plan === 'free' && !isTrialExpired && proPlanId && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-400 text-center mb-2">{p.ctaNote}</p>
                        <PayPalSubscriptionButton planId={proPlanId} containerId="paypal-button-pro" plan="pro" />
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {getAgencyButton()}
                    {plan !== 'agency' && agencyPlanId && (
                      <div className="mt-2">
                        <p className="text-xs text-slate-400 text-center mb-2">{p.ctaNote}</p>
                        <PayPalSubscriptionButton
                          planId={agencyPlanId}
                          containerId="paypal-button-agency"
                          plan="agency"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <span>🔒</span>
          <span>Secure payment via PayPal • Cancel anytime • 30-day money back</span>
        </div>
      </div>
    </div>
  )
}
