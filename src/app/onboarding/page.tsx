'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const steps = [
  { id: 1, title: 'Welcome to TrackHive', subtitle: "Let's set up your account in 2 minutes" },
  { id: 2, title: 'Tell us about your business', subtitle: "We'll customize your experience" },
  { id: 3, title: 'What are you tracking?', subtitle: 'Choose your primary use case' },
  { id: 4, title: 'Which ad platforms do you use?', subtitle: "We'll set these up for you" },
]

export default function OnboardingPage() {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    business_name: '',
    website_url: '',
    business_type: '',
    monthly_events: '',
    ad_platforms: [] as string[],
  })

  const handlePlatformToggle = (platform: string) => {
    setForm((f) => ({
      ...f,
      ad_platforms: f.ad_platforms.includes(platform)
        ? f.ad_platforms.filter((p) => p !== platform)
        : [...f.ad_platforms, platform],
    }))
  }

  const handleComplete = async () => {
    setLoading(true)
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) return

    const dashboardType = form.business_type === 'leadgen' ? 'leadgen' : 'ecommerce'

    await supabase
      .from('profiles')
      .update({
        business_name: form.business_name,
        website_url: form.website_url,
        business_type: form.business_type,
        monthly_events: parseInt(form.monthly_events) || 0,
        ad_platforms: form.ad_platforms,
        dashboard_type: dashboardType,
        onboarding_completed: true,
      })
      .eq('id', user.id)

    router.push('/dashboard')
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
        <img src="/logo-icon.png" alt="TrackHive" className="w-7 h-7 rounded-lg object-contain" />
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
              <span className="text-4xl">🚀</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mb-3">Welcome to TrackHive!</h1>
            <p className="text-slate-500 mb-8 text-lg">
              Let&apos;s get your server-side tracking set up. It only takes 2 minutes.
            </p>
            <div className="grid grid-cols-3 gap-4 mb-8">
              {[
                { icon: '📊', label: 'Stop losing conversions to ad blockers' },
                { icon: '⚡', label: 'Fire events to Meta, TikTok & Google' },
                { icon: '🎯', label: 'Get 85%+ match rates on Meta CAPI' },
              ].map((item) => (
                <div
                  key={item.label}
                  className="bg-white rounded-xl border border-slate-100 p-4 text-center shadow-sm"
                >
                  <p className="text-2xl mb-2">{item.icon}</p>
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
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  className="w-full mt-1.5 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  emoji: '🛍️',
                  title: 'E-Commerce Store',
                  desc: 'Track purchases, add to carts, checkouts. Optimize Meta and TikTok ads for buyers.',
                  features: ['Purchase tracking', 'Cart abandonment', 'Revenue analytics', 'ROAS optimization'],
                },
                {
                  type: 'leadgen',
                  emoji: '🎯',
                  title: 'Lead Generation',
                  desc: 'Track leads, score them as good or bad, and send quality signals back to Meta.',
                  features: ['Lead scoring', 'Funnel stages', 'Meta feedback loop', 'Lead export'],
                },
                {
                  type: 'agency',
                  emoji: '🏢',
                  title: 'Agency / Freelancer',
                  desc: 'Manage tracking for multiple clients with multi-pixel support.',
                  features: ['Multi-pixel', 'Client management', 'All platforms', 'White label'],
                },
                {
                  type: 'saas',
                  emoji: '💻',
                  title: 'SaaS / App',
                  desc: 'Track signups, trials, upgrades and send conversion data to ad platforms.',
                  features: ['Signup tracking', 'Trial conversions', 'Upgrade events', 'Retention data'],
                },
                {
                  type: 'other',
                  emoji: '📌',
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
                    <span className="text-3xl">{option.emoji}</span>
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
                { id: 'meta', emoji: '📘', label: 'Meta / Facebook', desc: 'Facebook & Instagram Ads' },
                { id: 'tiktok', emoji: '🎵', label: 'TikTok Ads', desc: 'TikTok advertising' },
                { id: 'google', emoji: '🔍', label: 'Google Ads', desc: 'Search & Display' },
                { id: 'snapchat', emoji: '👻', label: 'Snapchat Ads', desc: 'Coming soon' },
              ].map((platform) => (
                <div
                  key={platform.id}
                  onClick={() => platform.id !== 'snapchat' && handlePlatformToggle(platform.id)}
                  className={`bg-white rounded-2xl border-2 p-4 cursor-pointer transition-all ${
                    form.ad_platforms.includes(platform.id)
                      ? 'border-blue-500 shadow-md shadow-blue-50'
                      : platform.id === 'snapchat'
                        ? 'border-slate-100 opacity-50 cursor-not-allowed'
                        : 'border-slate-100 hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl">{platform.emoji}</span>
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
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4 text-sm text-blue-700">
              <p className="font-semibold mb-1">🎉 Almost done!</p>
              <p className="text-blue-600 text-xs">
                After setup you can add your API keys in the Integrations page and start tracking in minutes.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setStep(3)}
                className="flex-1 bg-white border border-slate-200 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-50"
              >
                ← Back
              </button>
              <button
                onClick={handleComplete}
                disabled={loading || form.ad_platforms.length === 0}
                className="flex-1 bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Go to Dashboard 🚀'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
