'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import PayPalButton from '@/components/PayPalButton'

type Plan = 'pro' | 'agency'

declare global {
  interface Window {
    // PayPal SDK attaches `window.paypal`. Different files in this repo declare it for different button
    // variants; to avoid TS "subsequent property declarations must have same type" we keep this broad.
    paypal?: any
  }
}

export default function BillingFormV2({ userId }: { userId: string }) {
  const [sdkReady, setSdkReady] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [paypalReady, setPaypalReady] = useState(false)
  const [billingEmail, setBillingEmail] = useState('')
  const [selectedPlan, setSelectedPlan] = useState<Plan>('pro')

  const [successPlan, setSuccessPlan] = useState<Plan | null>(null)

  const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID
  const agencyPlanId = process.env.NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID
  const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID

  const latestUserIdRef = useRef(userId)
  useEffect(() => {
    latestUserIdRef.current = userId
  }, [userId])

  // React Strict Mode can run effects twice in dev; PayPal rendering is not always safe
  // when the container is cleared/re-rendered concurrently. Track render lifecycle to avoid races.
  const renderNonceRef = useRef(0)
  const renderInProgressRef = useRef(false)
  const lastRenderedPlanIdRef = useRef<string | null>(null)
  const paypalButtonsInstanceRef = useRef<any>(null)

  const paypalScriptSrc = useMemo(() => {
    if (!paypalClientId) return null
    return `https://www.paypal.com/sdk/js?client-id=${paypalClientId}&vault=true&intent=subscription&components=buttons&currency=USD`
  }, [paypalClientId])

  const paypalScriptStatusRef = useRef<'idle' | 'loading' | 'loaded' | 'error'>('idle')

  const selectedPlanId = selectedPlan === 'pro' ? proPlanId : agencyPlanId

  const showSdkFallbackButton =
    !sdkReady && (error?.toLowerCase().includes('failed to load') ?? false)

  useEffect(() => {
    if (!paypalScriptSrc) return

    // If SDK is already available, mark ready immediately.
    if (typeof window !== 'undefined' && (window as any).paypal?.Buttons) {
      setSdkReady(true)
      paypalScriptStatusRef.current = 'loaded'
      return
    }

    // Avoid injecting multiple scripts (Billing can be visited/re-rendered).
    const existing = document.querySelector<HTMLScriptElement>('script[data-trackhive-paypal-sdk="true"]')
    if (existing) {
      paypalScriptStatusRef.current = existing.dataset.status === 'loaded' ? 'loaded' : 'loading'
      if (paypalScriptStatusRef.current === 'loaded') setSdkReady(true)
      existing.addEventListener('load', () => {
        paypalScriptStatusRef.current = 'loaded'
        setSdkReady(true)
      })
      existing.addEventListener('error', () => {
        paypalScriptStatusRef.current = 'error'
        setError('PayPal SDK script failed to load. Disable adblock/privacy blocking and try again.')
      })
      return
    }

    setError(null)
    setSdkReady(false)
    paypalScriptStatusRef.current = 'loading'

    const script = document.createElement('script')
    script.src = paypalScriptSrc
    script.async = true
    script.defer = true
    script.setAttribute('data-trackhive-paypal-sdk', 'true')
    script.dataset.status = 'loading'

    script.onload = () => {
      paypalScriptStatusRef.current = 'loaded'
      script.dataset.status = 'loaded'
      setSdkReady(true)
    }
    script.onerror = () => {
      paypalScriptStatusRef.current = 'error'
      script.dataset.status = 'error'
      setError('PayPal SDK script failed to load. Disable adblock/privacy blocking and try again.')
    }

    document.head.appendChild(script)
  }, [paypalScriptSrc])

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('success') === 'true') {
      const planParam = params.get('plan')
      const plan: Plan = planParam === 'agency' ? 'agency' : 'pro'
      setSuccessPlan(plan)
      setSelectedPlan(plan)
    }
  }, [])

  useEffect(() => {
    if (!paypalScriptSrc) return
    if (sdkReady) return
    if (paypalScriptStatusRef.current === 'error') return

    const t = window.setTimeout(() => {
      setError(
        'PayPal checkout failed to load in your browser. If you use adblock/privacy tools, allow `https://www.paypal.com/sdk/js` and refresh.'
      )
    }, 15_000)

    return () => window.clearTimeout(t)
  }, [paypalScriptSrc, sdkReady])

  useEffect(() => {
    if (!sdkReady) return
    if (!selectedPlanId) return

    // If a render for the same plan is already running (Strict Mode double-effect),
    // don't clear the container / start another render.
    if (renderInProgressRef.current && lastRenderedPlanIdRef.current === selectedPlanId) return

    setError(null)
    setPaypalReady(false)

    const mount = document.getElementById('paypal-subscribe-button')
    if (!mount) return

    // Always tear down any previous PayPal button before rendering a new one.
    if (paypalButtonsInstanceRef.current?.close) {
      try {
        paypalButtonsInstanceRef.current.close()
      } catch {
        // Ignore close errors and continue with a fresh render.
      }
    }
    paypalButtonsInstanceRef.current = null
    mount.innerHTML = ''

    renderInProgressRef.current = true
    lastRenderedPlanIdRef.current = selectedPlanId
    const nonce = ++renderNonceRef.current

    // Render can race with SDK global initialization; poll briefly for `window.paypal`.
    // Without this, the container stays empty and the user can't proceed.
    const startedAt = Date.now()
    const poll = async (): Promise<void> => {
      if (Date.now() - startedAt > 10_000) {
        if (nonce === renderNonceRef.current) {
          setError('PayPal failed to initialize. Please refresh and try again.')
          renderInProgressRef.current = false
        }
        return
      }

      if (!window.paypal) {
        setTimeout(() => {
          void poll()
        }, 250)
        return
      }

      try {
        const buttons = window.paypal.Buttons({
          style: { shape: 'pill', layout: 'horizontal', label: 'subscribe' },
          createSubscription: function (_data: unknown, actions: any) {
            return actions.subscription.create({ plan_id: selectedPlanId })
          },
          onApprove: async function (data: any) {
            try {
              const subscriptionID = data?.subscriptionID ?? data?.subscriptionId
              if (!subscriptionID) throw new Error('PayPal did not return a subscription ID.')

              const res = await fetch('/api/paypal/activate-subscription', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ subscriptionID, user_id: latestUserIdRef.current }),
              })
              const payload = await res.json().catch(() => ({}))
              if (!res.ok) {
                throw new Error(payload?.error ?? 'Failed to activate subscription.')
              }

              window.location.href = `/billing?success=true&plan=${selectedPlan}`
            } catch (e) {
              if (nonce === renderNonceRef.current) {
                setError(e instanceof Error ? e.message : 'Failed to activate subscription.')
              }
            }
          },
          onError: function (err: any) {
            if (nonce === renderNonceRef.current) {
              setError(err instanceof Error ? err.message : 'PayPal checkout failed.')
              renderInProgressRef.current = false
            }
          },
        })
        paypalButtonsInstanceRef.current = buttons
        buttons.render('#paypal-subscribe-button')

        if (nonce === renderNonceRef.current) {
          setPaypalReady(true)
          renderInProgressRef.current = false
        }
      } catch (e) {
        if (nonce === renderNonceRef.current) {
          setError(e instanceof Error ? e.message : 'PayPal checkout failed.')
          renderInProgressRef.current = false
        }
      }
    }

    void poll()
    return () => {
      // Prevent any in-flight poll from updating state after a new effect run.
      renderNonceRef.current = nonce + 1
      // If this effect is being replaced, mark as no longer in-progress so a new render can start.
      renderInProgressRef.current = false
      if (paypalButtonsInstanceRef.current?.close) {
        try {
          paypalButtonsInstanceRef.current.close()
        } catch {
          // Ignore close errors during cleanup.
        }
      }
      paypalButtonsInstanceRef.current = null
    }
  }, [sdkReady, selectedPlan, selectedPlanId])

  if (successPlan) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Subscription activated!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for upgrading to TrackHive {successPlan === 'agency' ? 'Agency' : 'Pro'}. Sign in or create an account
            to access your dashboard.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/dashboard/login"
              className="inline-flex justify-center font-semibold py-3 px-6 rounded-xl border border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
            >
              Sign in
            </Link>
            <Link
              href="/dashboard/signup"
              className="inline-flex justify-center font-semibold py-3 px-6 rounded-xl text-white bg-blue-600 hover:bg-blue-700"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const summaryTitle = selectedPlan === 'agency' ? 'TrackHive Agency' : 'TrackHive Pro'
  const summaryPrice = selectedPlan === 'agency' ? '$45/mo' : '$15/mo'

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        <div className="lg:col-span-3 space-y-6 order-1">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 scroll-mt-28" id="billing-details">
              Billing details
            </h2>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-700 whitespace-nowrap">
              ← back to pricing
            </Link>
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Subscription</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setSelectedPlan('pro')}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  selectedPlan === 'pro'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan === 'pro' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                    }`}
                  />
                  <span className="font-semibold text-slate-900">Pro</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">$15 per month</p>
                <p className="text-lg font-bold text-slate-900 mt-1">15 USD</p>
                <p className="text-xs mt-2 text-blue-700 font-semibold">7-day free trial</p>
              </button>

              <button
                type="button"
                onClick={() => setSelectedPlan('agency')}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  selectedPlan === 'agency'
                    ? 'border-purple-500 bg-purple-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`w-4 h-4 rounded-full border-2 ${
                      selectedPlan === 'agency' ? 'border-purple-500 bg-purple-500' : 'border-slate-300'
                    }`}
                  />
                  <span className="font-semibold text-slate-900">Agency</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">$45 per month</p>
                <p className="text-lg font-bold text-slate-900 mt-1">45 USD</p>
                <p className="text-xs mt-2 text-purple-700 font-semibold">7-day free trial</p>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Billing email</label>
            <input
              type="email"
              value={billingEmail}
              onChange={(e) => setBillingEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Cardholder&apos;s name (optional)</label>
              <input
                type="text"
                placeholder="Name"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country (optional)</label>
              <input
                type="text"
                placeholder="Country"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Payment details</h3>

            {selectedPlanId ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                <p className="text-sm text-slate-600 mb-4">Pay securely with PayPal. You can cancel anytime.</p>
                {!paypalReady && <p className="text-xs text-slate-500 text-center mb-2">Loading PayPal…</p>}
                {/* Container must have NO React children - PayPal injects here; mixing causes removeChild errors */}
                <div id="paypal-subscribe-button" aria-label="PayPal subscribe button" suppressHydrationWarning />
                {error && <p className="text-red-500 text-xs mt-3 text-center">{error}</p>}
                {showSdkFallbackButton && (
                  <div className="mt-4">
                    <PayPalButton
                      planId={selectedPlanId}
                      planName={selectedPlan === 'pro' ? 'TrackHive Pro' : 'TrackHive Agency'}
                      price={selectedPlan === 'pro' ? '$15' : '$45'}
                      returnUrl={`/billing?success=true&plan=${selectedPlan}`}
                      cancelUrl="/pricing?cancelled=true"
                      className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-amber-800 text-sm">
                  PayPal is not configured. Add `NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID` and `NEXT_PUBLIC_PAYPAL_AGENCY_PLAN_ID` to
                  enable checkout.
                </p>
                <Link href="/dashboard/signup" className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
                  Sign up for free →
                </Link>
              </div>
            )}

            <p className="text-xs text-slate-500 mt-3">Secure payment via PayPal • Cancel anytime • 30-day money back</p>
          </div>
        </div>

        <div className="lg:col-span-2 order-2">
          <div
            className="rounded-2xl p-6 lg:p-8 text-white lg:sticky lg:top-28"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">{summaryTitle}</span>
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-white/20">+ 7 days free trial</span>
            </div>
            <p className="text-blue-100 text-sm mb-6">All platforms • AI Analysis • Priority support</p>

            <div className="space-y-4 border-l-2 border-white/30 pl-4 ml-1">
              <div className="flex gap-3">
                <span className="text-white">🚀</span>
                <div>
                  <p className="font-medium text-white text-sm">Today — start free trial</p>
                  <p className="text-blue-200 text-xs">7 days full access, no charge</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-white/60">☆</span>
                <div>
                  <p className="font-medium text-white/80 text-sm">Day 7 — reminder</p>
                  <p className="text-blue-200/80 text-xs">7 days left in trial</p>
                </div>
              </div>
              <div className="flex gap-3">
                <span className="text-white">★</span>
                <div>
                  <p className="font-medium text-white text-sm">
                    Day 7 — {selectedPlan === 'agency' ? 'Agency' : 'Pro'} account starts
                  </p>
                  <p className="text-blue-200 text-xs">{summaryPrice} billed monthly</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-blue-100 mb-1">Have questions about your plan?</p>
              <a href="mailto:support@track.itshassanahmed.com" className="text-sm font-medium text-white hover:underline">
                support@track.itshassanahmed.com
              </a>
              <span className="text-blue-200"> · </span>
              <Link href="/pricing" className="text-sm font-medium text-white hover:underline">
                Contact →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

