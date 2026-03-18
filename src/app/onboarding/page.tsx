'use client'

export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { BarChart2, Zap, Target, Rocket } from 'lucide-react'
import { completeOnboarding } from '@/app/dashboard/actions'
import { createClient as createBrowserSupabaseClient } from '@/lib/supabase/client'

const steps = [
  { id: 1, title: 'Welcome to TrackHive', subtitle: "Let's set up your account in 2 minutes" },
  { id: 2, title: 'Tell us about your business', subtitle: "We'll customize your experience" },
  { id: 3, title: 'What are you tracking?', subtitle: 'Choose your primary use case' },
  { id: 4, title: 'Which ad platforms do you use?', subtitle: "We'll set these up for you" },
  { id: 5, title: 'Choose your plan', subtitle: 'Select the plan that fits your needs' },
]

const PLAN_OPTIONS = [
  { id: 'free', name: 'Free', price: '$0', period: 'forever', tagline: '500 events/month, Meta CAPI' },
  { id: 'pro', name: 'Pro', price: '$15', period: '/mo', tagline: '25K events, all platforms' },
  { id: 'agency', name: 'Agency', price: '$45', period: '/mo', tagline: 'Unlimited, multi-client' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState({
    business_name: '',
    website_url: '',
    business_type: '',
    monthly_events: '',
    ad_platforms: [] as string[],
    selected_plan: '' as 'free' | 'pro' | 'agency' | '',
  })
  const [trialLoading, setTrialLoading] = useState(false)

  const handlePlatformToggle = (platform: string) => {
    setForm((f) => ({
      ...f,
      ad_platforms: f.ad_platforms.includes(platform)
        ? f.ad_platforms.filter((p) => p !== platform)
        : [...f.ad_platforms, platform],
    }))
  }

  const completeAndRedirect = async (redirectTo: string) => {
    setLoading(true)
    setError(null)
    try {
      const supabase = createBrowserSupabaseClient()
      const { data: { session } } = await supabase.auth.getSession()
      const accessToken = session?.access_token

      if (!accessToken) {
        router.push('/dashboard/login')
        return
      }

      const result = await completeOnboarding(form, accessToken)
      if (!result.ok) {
        setError(result.error)
        return
      }
      router.push(redirectTo)
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = async () => {
    setTrialLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: form.selected_plan }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Failed to start trial')
        return
      }
      await completeAndRedirect('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start trial')
    } finally {
      setTrialLoading(false)
    }
  }

  const handleMakePayment = () => {
    completeAndRedirect('/dashboard/billing')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center p-4">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-slate-100">
        <div
          className="h-full bg-blue-600 transition-all duration-500"
          style={{ width: `${(step / steps.length) * 100}%` }}
        />
      </div>

      {/* Logo */}
      <div className="fixed top-4 left-6 flex items-center gap-2">
        <img src="/logo-new-1.png" alt="TrackHive" className="w-14 h-14 rounded-lg object-contain" />
        <span className="font-bold text-slate-900">TrackHive</span>
      </div>

      {/* Step counter */}
      <div className="fixed top-4 right-6 text-xs text-slate-400 font-medium">
        Step {step} of {steps.length}
      </div>

      <div className="w-full max-w-lg">
        {/* Step 1 — Welcome */}
        {step === 1 && (
          <div className="text-center">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
              <Rocket className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to TrackHive!</h1>
            <p className="text-slate-500 mb-8 text-lg">
              Let&apos;s get your server-side tracking set up. It only takes 2 minutes.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { Icon: BarChart2, label: 'Stop losing conversions to ad blockers' },
                { Icon: Zap, label: 'Fire events to Meta, TikTok & Google' },
                { Icon: Target, label: 'Get 85%+ match rates on Meta CAPI' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm"
                >
                  <item.Icon className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                  <p className="text-xs text-slate-600">{item.label}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => setStep(2)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-md shadow-blue-100"
            >
              Let&apos;s Get Started →
            </button>
          </div>
        )}

        {/* Step 2 — Business Info */}
        {step === 2 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Tell us about your business</h1>
              <p className="text-slate-500">This helps us customize your TrackHive experience</p>
            </div>
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Business Name
                </label>
                <input
                  value={form.business_name}
                  onChange={(e) => setForm((f) => ({ ...f, business_name: e.target.value }))}
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. My Store, Agency XYZ"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Website URL
                </label>
                <input
                  value={form.website_url}
                  onChange={(e) => setForm((f) => ({ ...f, website_url: e.target.value }))}
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="https://yourwebsite.com"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Monthly Events (approx)
                </label>
                <select
                  value={form.monthly_events}
                  onChange={(e) => setForm((f) => ({ ...f, monthly_events: e.target.value }))}
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 [&>option]:text-slate-900 [&>option]:bg-white"
                >
                  <option value="">Select range</option>
                  <option value="1000">Less than 1,000</option>
                  <option value="10000">1,000 - 10,000</option>
                  <option value="50000">10,000 - 50,000</option>
                  <option value="100000">50,000 - 100,000</option>
                  <option value="500000">100,000+</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(1)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!form.business_name || !form.website_url}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — Business Type */}
        {step === 3 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">What are you tracking?</h1>
              <p className="text-slate-500">We&apos;ll show you the most relevant features</p>
            </div>
            <div className="space-y-3">
              {[
                {
                  type: 'ecommerce',
                  title: 'E-Commerce Store',
                  desc: 'Track purchases, add to carts, checkouts. Optimize Meta and TikTok ads for buyers.',
                  features: ['Purchase tracking', 'Cart abandonment', 'Revenue analytics', 'ROAS optimization'],
                },
                {
                  type: 'leadgen',
                  title: 'Lead Generation',
                  desc: 'Track leads, score them as good or bad, and send quality signals back to Meta.',
                  features: ['Lead scoring', 'Funnel stages', 'Meta feedback loop', 'Lead export'],
                },
                {
                  type: 'agency',
                  title: 'Agency / Freelancer',
                  desc: 'Manage tracking for multiple clients with multi-pixel support.',
                  features: ['Multi-pixel', 'Client management', 'All platforms', 'White label'],
                },
                {
                  type: 'saas',
                  title: 'SaaS / App',
                  desc: 'Track signups, trials, upgrades and send conversion data to ad platforms.',
                  features: ['Signup tracking', 'Trial conversions', 'Upgrade events', 'Retention data'],
                },
                {
                  type: 'other',
                  title: 'Other',
                  desc: 'General conversion tracking and server-side events.',
                  features: ['Custom events', 'All platforms', 'Flexible setup'],
                },
              ].map((option) => (
                <div
                  key={option.type}
                  onClick={() => setForm((f) => ({ ...f, business_type: option.type }))}
                  className={`bg-white rounded-2xl border-2 p-5 cursor-pointer transition-all ${
                    form.business_type === option.type
                      ? 'border-blue-500 shadow-md shadow-blue-50'
                      : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-bold text-slate-900">{option.title}</p>
                        <div
                          className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                            form.business_type === option.type ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                          }`}
                        >
                          {form.business_type === option.type && (
                            <div className="w-2 h-2 rounded-full bg-white" />
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-slate-500 mt-1">{option.desc}</p>
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {option.features.map((f) => (
                          <span
                            key={f}
                            className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full"
                          >
                            {f}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(2)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!form.business_type}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Ad Platforms */}
        {step === 4 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Which ad platforms do you use?</h1>
              <p className="text-slate-500">Select all that apply — we&apos;ll set these up for you</p>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-6">
              {[
                { id: 'meta', label: 'Meta / Facebook', desc: 'Facebook & Instagram Ads' },
                { id: 'tiktok', label: 'TikTok Ads', desc: 'TikTok advertising' },
                { id: 'google', label: 'Google Ads', desc: 'Search & Display' },
              ].map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => handlePlatformToggle(platform.id)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                    form.ad_platforms.includes(platform.id)
                      ? 'border-blue-500 shadow-md shadow-blue-50'
                      : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex justify-end mb-2">
                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                        form.ad_platforms.includes(platform.id) ? 'border-blue-500 bg-blue-500' : 'border-slate-300'
                      }`}
                    >
                      {form.ad_platforms.includes(platform.id) && (
                        <div className="w-2 h-2 rounded-full bg-white" />
                      )}
                    </div>
                  </div>
                  <p className="font-semibold text-slate-900 text-sm">{platform.label}</p>
                  <p className="text-xs text-slate-400">{platform.desc}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(5)}
                disabled={form.ad_platforms.length === 0}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50"
              >
                Continue →
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Choose Plan */}
        {step === 5 && (
          <div>
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-slate-900 mb-2">Choose your plan</h1>
              <p className="text-slate-500">Select the plan that fits your needs</p>
            </div>
            <div className="space-y-3 mb-6">
              {PLAN_OPTIONS.map((plan) => (
                <button
                  key={plan.id}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, selected_plan: plan.id as 'free' | 'pro' | 'agency' }))}
                  className={`w-full text-left rounded-2xl border-2 p-4 transition-all ${
                    form.selected_plan === plan.id
                      ? 'border-blue-500 shadow-md shadow-blue-50 bg-blue-50/50'
                      : 'border-slate-100 hover:border-blue-200 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-900">{plan.name}</p>
                      <p className="text-sm text-slate-500">{plan.tagline}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-slate-400 text-sm">{plan.period}</span>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {form.selected_plan && (
              <div className="space-y-3 mb-6">
                {form.selected_plan === 'free' && (
                  <button
                    type="button"
                    onClick={() => completeAndRedirect('/dashboard')}
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Setting up...
                      </>
                    ) : (
                      'Continue with Free'
                    )}
                  </button>
                )}
                {(form.selected_plan === 'pro' || form.selected_plan === 'agency') && (
                  <>
                    <div className="flex gap-3 mb-3">
                      <button
                        type="button"
                        onClick={handleStartTrial}
                        disabled={trialLoading}
                        className="flex-1 py-3 rounded-xl font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-60"
                      >
                        {trialLoading ? 'Starting...' : 'I will start with 7 day free trial'}
                      </button>
                      <button
                        type="button"
                        onClick={handleMakePayment}
                        disabled={loading}
                        className="flex-1 py-3 rounded-xl font-semibold border-2 border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                      >
                        Make Payment
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 text-center">No credit card required. Trial expires after 7 days.</p>
                  </>
                )}
              </div>
            )}

            {error && (
              <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {error}
              </p>
            )}
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setStep(4)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
              >
                ← Back
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
