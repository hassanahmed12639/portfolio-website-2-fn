import Link from "next/link"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"
import { PRICING_PLANS } from "@/lib/pricing"

export const metadata: Metadata = {
  title: 'TrackHive Pricing — Server-Side Tracking Plans',
  description: 'Choose the right TrackHive plan for your business. Recover lost conversions with server-side tracking for Meta, TikTok, Snapchat, and Google.',
}

const COMPARISON_ROWS = [
  { feature: 'Events per month', free: '500', pro: '25,000', agency: 'Unlimited' },
  { feature: 'Pixels', free: '1', pro: '3', agency: '25' },
  { feature: 'Platforms', free: 'Meta', pro: 'All 4', agency: 'All 4' },
  { feature: 'Lead Manager', free: false, pro: true, agency: true },
  { feature: 'Live Stream & Replay', free: false, pro: true, agency: true },
  { feature: 'Cookie Extender', free: false, pro: true, agency: true },
  { feature: 'Reverse Proxy', free: false, pro: true, agency: true },
  { feature: 'Anomaly Detection', free: false, pro: true, agency: true },
  { feature: 'Email Alerts', free: false, pro: true, agency: true },
  { feature: 'Team Members', free: false, pro: false, agency: '5' },
  { feature: 'GTM Templates', free: 'Basic', pro: 'All', agency: 'All + Premium' },
  { feature: 'Support', free: 'Community', pro: 'Priority', agency: 'Dedicated' },
] as const

function isBool(val: string | boolean): val is boolean {
  return typeof val === 'boolean'
}

const FAQ_ITEMS = [
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes. You can upgrade or downgrade your plan at any time from your billing page. Changes take effect immediately.",
  },
  {
    q: "What happens when I hit my event limit?",
    a: "We will send you an email alert when you reach 80% of your limit. Events above the limit are queued and processed when your limit resets on the 1st of each month.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes. If you are not satisfied within the first 7 days of a paid plan we will issue a full refund, no questions asked.",
  },
  {
    q: "Is there a free trial for Pro or Agency?",
    a: "The Free plan lets you test TrackHive with real data before upgrading. No time limit on the free plan.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards and PayPal through our secure payment processor.",
  },
]

export default function PricingPage() {
  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      <main>
        {/* Hero */}
        <section className="text-center py-20 px-4">
          <span className="text-xs font-bold bg-blue-100 text-blue-600 px-3 py-1 rounded-full">
            Simple Pricing
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4">
            Start Free. Scale When Ready.
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            No hidden fees. No long-term contracts. Cancel anytime.
          </p>
        </section>

        {/* Plan cards — identical to landing page */}
        <section id="pricing" className="py-12 md:py-16" style={{ backgroundColor: "#f8fafc" }}>
          <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
              {PRICING_PLANS.map((plan) => (
                <div
                  key={plan.id}
                  className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 flex flex-col ${
                    plan.highlighted
                      ? "border-blue-600 shadow-xl shadow-blue-100"
                      : "border-slate-100 shadow-sm"
                  }`}
                >
                  {/* Badge */}
                  <div className="mb-4">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-full ${
                        plan.highlighted
                          ? "bg-blue-600 text-white"
                          : plan.id === "agency"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {plan.badge}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="mb-2">
                    <span className="text-4xl sm:text-5xl font-black text-slate-900">
                      {plan.priceDisplay}
                    </span>
                    {plan.price > 0 && (
                      <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
                    )}
                  </div>

                  {/* Plan name and tagline */}
                  <p className="text-lg font-bold text-slate-900 mb-1">{plan.name}</p>
                  <p className="text-sm text-slate-500 mb-6 leading-relaxed">{plan.tagline}</p>

                  {/* Features */}
                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <div
                          className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                            feature.included
                              ? "bg-blue-100 text-blue-600"
                              : "bg-slate-100 text-slate-300"
                          }`}
                        >
                          {feature.included ? "✓" : "×"}
                        </div>
                        <span
                          className={`text-sm leading-snug ${
                            feature.included ? "text-slate-700" : "text-slate-300 line-through"
                          }`}
                        >
                          {feature.text}
                        </span>
                      </li>
                    ))}
                  </ul>

                  {/* CTA */}
                  <div>
                    <Link
                      href={plan.ctaHref ?? "/dashboard/signup"}
                      className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                        plan.highlighted
                          ? "bg-blue-600 text-white hover:bg-blue-700"
                          : "bg-slate-900 text-white hover:bg-slate-800"
                      }`}
                    >
                      {plan.cta}
                    </Link>
                    <p className="text-xs text-slate-400 text-center mt-2">{plan.ctaNote}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison table */}
        <section className="py-16 px-4">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold text-slate-900 text-center mb-10">
              Compare plans
            </h2>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="text-left py-3 px-4 text-slate-500 font-medium">Feature</th>
                    <th className="text-center py-3 px-4 text-slate-700 font-bold">Free</th>
                    <th className="text-center py-3 px-4 text-blue-600 font-bold">Pro</th>
                    <th className="text-center py-3 px-4 text-purple-600 font-bold">Agency</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON_ROWS.map((row, i) => (
                    <tr
                      key={row.feature}
                      className={i % 2 === 0 ? "bg-white" : "bg-slate-50"}
                    >
                      <td className="py-3 px-4 text-slate-700 font-medium">{row.feature}</td>
                      <td className="text-center py-3 px-4">
                        {isBool(row.free) ? (
                          row.free ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="text-slate-600">{row.free}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {isBool(row.pro) ? (
                          row.pro ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="text-slate-600">{row.pro}</span>
                        )}
                      </td>
                      <td className="text-center py-3 px-4">
                        {isBool(row.agency) ? (
                          row.agency ? (
                            <span className="text-green-500">✓</span>
                          ) : (
                            <span className="text-slate-300">—</span>
                          )
                        ) : (
                          <span className="text-slate-600">{row.agency}</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ section */}
        <section className="py-20 px-4" style={{ backgroundColor: "#f8fafc" }}>
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">
              Frequently asked questions
            </h2>
            <div className="space-y-6">
              {FAQ_ITEMS.map((faq, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-slate-200 p-6 bg-white shadow-sm"
                >
                  <h3 className="font-semibold text-slate-900 mb-2">{faq.q}</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-24" style={{ backgroundColor: "#2563eb" }}>
          <div className="max-w-3xl mx-auto px-6 text-center">
            <h2 className="text-4xl font-extrabold text-white mb-4">
              Start tracking smarter today.
            </h2>
            <p className="text-lg text-blue-200 mb-8">
              Join hundreds of marketers recovering lost conversions with TrackHive.
            </p>
            <Link
              href="/dashboard/signup"
              className="inline-block bg-white font-bold px-10 py-4 rounded-xl text-lg transition-colors hover:bg-blue-50"
              style={{ color: "#2563eb" }}
            >
              Start for free →
            </Link>
          </div>
        </section>
      </main>

      <TrackHiveFooter />
    </div>
  )
}
