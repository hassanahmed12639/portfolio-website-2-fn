'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PayPalButton from '@/components/PayPalButton'

const proPlanId = process.env.NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID

export default function BillingForm() {
  const [success, setSuccess] = useState(false)
  const [billingEmail, setBillingEmail] = useState('')
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('monthly')

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('success=true')) {
      setSuccess(true)
    }
  }, [])

  if (success) {
    return (
      <div className="max-w-lg mx-auto px-6 py-16 text-center">
        <div className="rounded-2xl border border-green-200 bg-green-50 p-8">
          <p className="text-4xl mb-4">✅</p>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Subscription activated!</h1>
          <p className="text-slate-600 mb-6">
            Thank you for upgrading to TrackHive Pro. Sign in or create an account to access your dashboard.
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 overflow-visible">
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-10">
        {/* Left: Billing details - order first on mobile */}
        <div className="lg:col-span-3 space-y-6 order-1">
          {/* Billing details header - extra top padding so it's never clipped below fixed nav */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 scroll-mt-28" id="billing-details">
              Billing details
            </h2>
            <Link href="/pricing" className="text-sm text-slate-500 hover:text-slate-700 whitespace-nowrap">
              ← back to pricing
            </Link>
          </div>

          {/* Plan selection */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-slate-700">Subscription</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPlan('monthly')}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  plan === 'monthly'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 ${plan === 'monthly' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                  <span className="font-semibold text-slate-900">Monthly</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">$10 per month</p>
                <p className="text-lg font-bold text-slate-900 mt-1">10 USD</p>
              </button>
              <button
                type="button"
                onClick={() => setPlan('yearly')}
                className={`rounded-xl border-2 p-4 text-left transition-colors ${
                  plan === 'yearly'
                    ? 'border-blue-500 bg-blue-50/50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className={`w-4 h-4 rounded-full border-2 ${plan === 'yearly' ? 'border-blue-500 bg-blue-500' : 'border-slate-300'}`} />
                  <span className="font-semibold text-slate-900">Yearly</span>
                </div>
                <p className="text-sm text-slate-600 mt-1">$7 per month</p>
                <p className="text-lg font-bold text-slate-900 mt-1">84 USD</p>
                <span className="inline-block mt-2 text-xs font-semibold text-green-600 bg-green-100 px-2 py-0.5 rounded">SAVE 30%</span>
              </button>
            </div>
            {/* For now we only have monthly plan ID; yearly would need NEXT_PUBLIC_PAYPAL_PRO_YEARLY_PLAN_ID */}
            {plan === 'yearly' && (
              <p className="text-amber-700 text-sm">Yearly billing coming soon. Please select Monthly.</p>
            )}
          </div>

          {/* Billing email */}
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

          {/* Optional fields */}
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

          {/* Payment details + PayPal */}
          <div className="pt-4 border-t border-slate-200">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Payment details</h3>
            {proPlanId && plan === 'monthly' ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6">
                <p className="text-sm text-slate-600 mb-4">Pay securely with PayPal. You can cancel anytime.</p>
                <PayPalButton
                  planId={proPlanId}
                  planName="TrackHive Pro"
                  price="$10"
                  returnUrl="/billing?success=true"
                  cancelUrl="/pricing?cancelled=true"
                  className="w-full flex items-center justify-center gap-2 bg-[#0070ba] hover:bg-[#005ea6] text-white font-semibold py-3.5 rounded-xl transition-colors disabled:opacity-50"
                />
              </div>
            ) : !proPlanId ? (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-center">
                <p className="text-amber-800 text-sm">PayPal is not configured. Add NEXT_PUBLIC_PAYPAL_PRO_PLAN_ID to enable checkout.</p>
                <Link href="/dashboard/signup" className="inline-block mt-3 text-sm font-medium text-blue-600 hover:underline">
                  Sign up for free →
                </Link>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-6 text-center">
                <p className="text-slate-600 text-sm">Select Monthly above to pay with PayPal. Yearly billing coming soon.</p>
              </div>
            )}
            <p className="text-xs text-slate-500 mt-3">Secure payment via PayPal • Cancel anytime • 30-day money back</p>
          </div>
        </div>

        {/* Right: Order summary - sticky only on lg so mobile layout isn't affected */}
        <div className="lg:col-span-2 order-2">
          <div
            className="rounded-2xl p-6 lg:p-8 text-white lg:sticky lg:top-28"
            style={{ background: 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #3b82f6 100%)' }}
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl font-bold">TrackHive Pro</span>
              <span className="text-sm font-medium px-2 py-0.5 rounded-full bg-white/20">+ 14 days free trial</span>
            </div>
            <p className="text-blue-100 text-sm mb-6">All platforms • AI Analysis • Priority support</p>

            {/* Timeline */}
            <div className="space-y-4 border-l-2 border-white/30 pl-4 ml-1">
              <div className="flex gap-3">
                <span className="text-white">🚀</span>
                <div>
                  <p className="font-medium text-white text-sm">Today — start free trial</p>
                  <p className="text-blue-200 text-xs">14 days full access, no charge</p>
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
                  <p className="font-medium text-white text-sm">Day 14 — Pro account starts</p>
                  <p className="text-blue-200 text-xs">$10/mo billed monthly</p>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-white/20">
              <p className="text-sm text-blue-100 mb-1">Have questions about your plan?</p>
              <a href="mailto:support@trackhive.io" className="text-sm font-medium text-white hover:underline">
                support@trackhive.io
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
