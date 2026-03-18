'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PRICING_PLANS } from '@/lib/pricing'
import PayPalButton from '@/components/PayPalButton'

type PlanSlug = 'free' | 'pro' | 'agency'
type PlanName = 'pro' | 'agency'

declare global {
  interface Window {
    paypal?: {
      Buttons: (config: {
        style?: Record<string, unknown>
        createSubscription: (
          data: unknown,
          actions: { subscription: { create: (opts: { plan_id: string }) => Promise<unknown> } }
        ) => Promise<unknown>
        onApprove: (data: { subscriptionID: string }) => void | Promise<void>
        onError?: (err: unknown) => void
      }) => { render: (selector: string) => void }
    }
  }
}

export default function BillingClientSubscriptions({
  userId,
  currentPlan,
  activeSubscriptionId,
}: {
  userId: string
  currentPlan: PlanSlug
  activeSubscriptionId: string | null
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const success = searchParams?.get('success') === 'true'
  const cancelled = searchParams?.get('cancelled') === 'true'

  const [sdkReady, setSdkReady] = useState(false)
  const [activatingPlan, setActivatingPlan] = useState<PlanName | null>(null)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [useFallbackButtons, setUseFallbackButtons] = useState(false)

  const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID as string | undefined
  const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID as string | undefined
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID as string | undefined
  const paypalScriptSrc =
    paypalClientId
      ? `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription&components=buttons&currency=USD`
      : null

  const renderedButtonsRef = useRef<Record<PlanName, boolean>>({ pro: false, agency: false })
  const renderAttemptedRef = useRef<Record<PlanName, boolean>>({ pro: false, agency: false })
  const paypalPollStartedRef = useRef(false)

  const activePlanLabel = currentPlan === 'free' ? 'Free Forever' : currentPlan === 'pro' ? 'Pro' : 'Agency'

  const plans = useMemo(() => {
    return PRICING_PLANS.filter((p) => p.id === 'pro' || p.id === 'agency')
  }, [])

  async function handleCancel() {
    setError(null)
    setCancelling(true)
    try {
      const res = await fetch('/api/paypal/cancel-subscription', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Failed to cancel subscription.')
        return
      }

      router.push('/dashboard/billing?cancelled=true')
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setCancelling(false)
    }
  }

  useEffect(() => {
    if (!sdkReady) return

    async function activate(subscriptionID: string) {
      setError(null)
      const res = await fetch('/api/paypal/activate-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionID, user_id: userId }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(data?.error ?? 'Failed to activate subscription')
      return data
    }

    const renderButtons = () => {
      if (!window.paypal) return

      if (currentPlan !== 'pro' && proPlanId && !renderedButtonsRef.current.pro) {
        if (renderAttemptedRef.current.pro) return
        renderAttemptedRef.current.pro = true
        window.paypal.Buttons({
          style: { shape: 'pill', layout: 'vertical', label: 'pay' },
          createSubscription: function (_data, actions) {
            return actions.subscription.create({ plan_id: proPlanId })
          },
          onApprove: async function (data) {
            const subscriptionID = data?.subscriptionID
            if (!subscriptionID) {
              setError('PayPal did not return a subscription ID.')
              return
            }
            try {
              setActivatingPlan('pro')
              await activate(subscriptionID)
              router.push('/dashboard/billing?success=true')
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed to activate subscription.')
              setActivatingPlan(null)
            }
          },
          onError: function (err) {
            setError(err instanceof Error ? err.message : 'PayPal checkout failed.')
            setActivatingPlan(null)
          },
        }).render('#paypal-button-pro')

        // Mark as rendered only when PayPal actually injects content.
        const mark = () => {
          const el = document.getElementById('paypal-button-pro')
          if (el && el.childElementCount > 0) {
            renderedButtonsRef.current.pro = true
            setUseFallbackButtons(false)
          }
        }
        setTimeout(mark, 500)
        setTimeout(mark, 1500)
      }

      if (currentPlan !== 'agency' && agencyPlanId && !renderedButtonsRef.current.agency) {
        if (renderAttemptedRef.current.agency) return
        renderAttemptedRef.current.agency = true
        window.paypal.Buttons({
          style: { shape: 'pill', layout: 'vertical', label: 'pay' },
          createSubscription: function (_data, actions) {
            return actions.subscription.create({ plan_id: agencyPlanId })
          },
          onApprove: async function (data) {
            const subscriptionID = data?.subscriptionID
            if (!subscriptionID) {
              setError('PayPal did not return a subscription ID.')
              return
            }
            try {
              setActivatingPlan('agency')
              await activate(subscriptionID)
              router.push('/dashboard/billing?success=true')
            } catch (e) {
              setError(e instanceof Error ? e.message : 'Failed to activate subscription.')
              setActivatingPlan(null)
            }
          },
          onError: function (err) {
            setError(err instanceof Error ? err.message : 'PayPal checkout failed.')
            setActivatingPlan(null)
          },
        }).render('#paypal-button-agency')

        const mark = () => {
          const el = document.getElementById('paypal-button-agency')
          if (el && el.childElementCount > 0) {
            renderedButtonsRef.current.agency = true
            setUseFallbackButtons(false)
          }
        }
        setTimeout(mark, 500)
        setTimeout(mark, 1500)
      }
    }

    // The script `onLoad` can fire before `window.paypal` is fully initialized.
    if (window.paypal) {
      renderButtons()
      return
    }

    if (paypalPollStartedRef.current) return
    paypalPollStartedRef.current = true

    const startedAt = Date.now()
    const tick = () => {
      if (Date.now() - startedAt > 10_000) {
        paypalPollStartedRef.current = false
        setError('PayPal failed to initialize. Please refresh the page.')
        return
      }

      if (window.paypal) {
        paypalPollStartedRef.current = false
        renderButtons()
        return
      }

      setTimeout(tick, 250)
    }

    tick()
  }, [agencyPlanId, currentPlan, proPlanId, sdkReady, router, userId])

  // If the PayPal SDK doesn't initialize, show fallback buttons so users can still pay.
  useEffect(() => {
    if (!paypalScriptSrc) return
    if (sdkReady) {
      setUseFallbackButtons(false)
      return
    }

    setUseFallbackButtons(false)
    const t = window.setTimeout(() => {
      // Only show fallback if SDK isn't ready yet.
      if (!sdkReady) setUseFallbackButtons(true)
    }, 10_000)

    return () => window.clearTimeout(t)
  }, [paypalScriptSrc, sdkReady])

  // If the SDK loads but never renders into the target containers, also show fallback.
  useEffect(() => {
    if (!sdkReady) return
    if (!paypalScriptSrc) return

    const t = window.setTimeout(() => {
      if (!renderedButtonsRef.current.pro && !renderedButtonsRef.current.agency) {
        setUseFallbackButtons(true)
      }
    }, 8000)

    return () => window.clearTimeout(t)
  }, [sdkReady, paypalScriptSrc])

  return (
    <div className="min-h-[calc(100vh-8rem)] bg-gradient-to-b from-slate-50 to-white">
      {paypalScriptSrc && (
        // next/script can race with SDK global initialization; we rely on the `onLoad`
        // to flip `sdkReady` and then poll inside the main effect.
        // If this still doesn't work, fallback buttons will appear.
        <script
          id="trackhive-paypal-sdk"
          src={paypalScriptSrc}
          async
          defer
          onLoad={() => {
            setSdkReady(true)
          }}
          onError={() => {
            setError('PayPal SDK script failed to load. Disable adblock/privacy blocking and refresh.')
            setUseFallbackButtons(true)
          }}
          data-trackhive-paypal-sdk="true"
        />
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-1">Billing</h2>
          <p className="text-slate-500 text-sm mb-4">Manage your TrackHive subscription</p>
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 max-w-md">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Plan</p>
            <div className="flex items-center justify-between">
              <p className="text-xl font-bold text-slate-900">{activePlanLabel}</p>
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  currentPlan === 'pro'
                    ? 'bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]'
                    : currentPlan === 'agency'
                      ? 'bg-purple-50 text-purple-700'
                      : 'bg-slate-100 text-slate-600'
                }`}
              >
                {currentPlan === 'free' ? 'Free' : currentPlan === 'pro' ? 'Active' : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {success && (
          <div className="mt-4 bg-green-50 border border-green-200 rounded-xl p-4">
            <p className="text-green-800 font-semibold">🎉 Subscription activated!</p>
            <p className="text-green-600 text-sm mt-1">You can now use TrackHive.</p>
          </div>
        )}

        {cancelled && (
          <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-4">
            <p className="text-amber-800 font-semibold">Subscription cancelled.</p>
            <p className="text-amber-700 text-sm mt-1">Your access will be updated shortly.</p>
          </div>
        )}

        {error && (
          <div className="mt-4 bg-red-50 border border-red-200 text-red-700 text-sm font-bold px-4 py-3 rounded-xl text-center">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {plans.map((p) => {
            const plan = p.id as PlanName
            const isCurrent = currentPlan === plan

            return (
              <div
                key={p.id}
                className={`bg-white rounded-2xl border-2 p-6 flex flex-col ${
                  isCurrent ? 'border-blue-500 shadow-lg shadow-blue-50' : p.highlighted ? 'border-slate-200' : 'border-slate-100'
                }`}
              >
                <div className="mb-1">
                  <span className="text-4xl font-black text-slate-900">{p.priceDisplay}</span>
                  <span className="text-slate-400 text-sm ml-1">{p.period}</span>
                </div>
                <p className="font-bold text-slate-900 text-lg mb-1">{p.name}</p>
                <p className="text-slate-500 text-sm mb-4 leading-relaxed">{p.tagline}</p>

                {isCurrent && (
                  <div className="w-full text-center py-3 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-200 mb-4">
                    Your Current Plan
                  </div>
                )}

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
                      <span className={feature.included ? 'text-slate-700' : 'text-slate-300 line-through'}>
                        {feature.text}
                      </span>
                    </li>
                  ))}
                </ul>

                {isCurrent ? (
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelling || !activeSubscriptionId}
                    className="w-full bg-slate-900 text-white font-black py-3 rounded-xl hover:bg-slate-800 transition-colors disabled:opacity-50 text-sm"
                  >
                    {cancelling ? 'Cancelling...' : 'Cancel Subscription'}
                  </button>
                ) : (
                  <div className="w-full">
                    <div className="mb-2 text-xs text-slate-500 text-center">
                      {activatingPlan === plan ? 'Processing PayPal...' : 'Subscribe with PayPal'}
                    </div>
                    {useFallbackButtons ? (
                      plan === 'pro' ? (
                        proPlanId ? (
                          <PayPalButton
                            planId={proPlanId}
                            planName="TrackHive Pro"
                            price="$15"
                            returnUrl="/dashboard/billing?success=true"
                            cancelUrl="/dashboard/billing?cancelled=true"
                            className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                          />
                        ) : (
                          <p className="text-red-500 text-xs mt-2 text-center">Missing `NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID` env var.</p>
                        )
                      ) : agencyPlanId ? (
                        <PayPalButton
                          planId={agencyPlanId}
                          planName="TrackHive Agency"
                          price="$45"
                          returnUrl="/dashboard/billing?success=true"
                          cancelUrl="/dashboard/billing?cancelled=true"
                          className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                        />
                      ) : (
                        <p className="text-red-500 text-xs mt-2 text-center">Missing `NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID` env var.</p>
                      )
                    ) : (
                      <div
                        id={plan === 'pro' ? 'paypal-button-pro' : 'paypal-button-agency'}
                        aria-label={`PayPal subscribe button for ${plan}`}
                        className="min-h-[48px] flex items-center justify-center"
                      />
                    )}

                    {!paypalClientId && (
                      <p className="text-red-500 text-xs mt-2 text-center">
                        Missing `NEXT_PUBLIC_PAYPAL_CLIENT_ID` env var.
                      </p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>

        <div className="mt-8 flex items-center gap-2 text-xs text-slate-400">
          <span>🔒</span>
          <span>Secure payment via PayPal • Cancel anytime • 30-day money back</span>
        </div>
      </div>
    </div>
  )
}

