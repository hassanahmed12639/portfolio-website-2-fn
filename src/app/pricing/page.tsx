import Link from "next/link"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

export const metadata: Metadata = {
  title: 'TrackHive Pricing — Server-Side Tracking Plans',
  description: 'Choose the right TrackHive plan for your business. Recover lost conversions with server-side tracking for Meta, TikTok, Snapchat, and Google.',
}

const FAQ_ITEMS = [
  {
    q: "Can I upgrade or downgrade anytime?",
    a: "Yes, plan changes take effect immediately.",
  },
  {
    q: "What happens when I hit my event limit?",
    a: "Events are queued and you'll get an email to upgrade.",
  },
  {
    q: "Do you offer refunds?",
    a: "Yes, 30-day money back guarantee.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Yes, 7-day free trial on Pro plan, no credit card needed.",
  },
  {
    q: "What platforms do you support?",
    a: "Meta CAPI, Google Enhanced Conversions, TikTok, Snapchat, GA4.",
  },
  {
    q: "Do I need a developer to set up TrackHive?",
    a: "No, setup takes 5 minutes with our guided wizard.",
  },
]

export default function PricingPage() {
  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      {/* Hero */}
      <section
        className="pt-32 pb-16"
        style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
            Simple pricing.
          </h1>
          <p className="text-xl" style={{ color: "#475569" }}>
            No hidden fees. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Pricing cards */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Free */}
            <div
              className="rounded-2xl border p-8 flex flex-col"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <p className="font-bold text-xl mb-1" style={{ color: "#0f172a" }}>
                Free
              </p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>
                $0<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span>
              </p>
              <p className="text-sm mb-8" style={{ color: "#475569" }}>
                Perfect to get started
              </p>
              <ul className="space-y-4 text-sm flex-1 mb-8" style={{ color: "#475569" }}>
                <li>✅ 1,000 events/month</li>
                <li>✅ Meta CAPI</li>
                <li>✅ 1 pixel</li>
                <li>✅ Basic analytics</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block text-center font-semibold py-3 rounded-xl transition-colors"
                style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
              >
                Start for free
              </Link>
            </div>

            {/* Pro — highlighted */}
            <div
              className="rounded-2xl p-8 flex flex-col relative shadow-xl"
              style={{
                backgroundColor: "#2563eb",
                boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)",
                border: "2px solid #2563eb",
              }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "#fbbf24", color: "#78350f" }}
              >
                MOST POPULAR
              </span>
              <p className="font-bold text-xl mb-1 text-white">Pro</p>
              <p className="text-4xl font-extrabold mb-1 text-white">
                $10<span className="text-base font-normal text-blue-200">/mo</span>
              </p>
              <p className="text-sm mb-8 text-blue-200">For growing businesses</p>
              <ul className="space-y-4 text-sm flex-1 mb-8 text-blue-100">
                <li>✅ 50,000 events/month</li>
                <li>✅ All platforms (Meta, Google, TikTok, Snapchat)</li>
                <li>✅ 3 pixels</li>
                <li>✅ AI Analysis</li>
                <li>✅ Email alerts</li>
                <li>✅ Anomaly detection</li>
                <li>✅ Priority support</li>
              </ul>
              <Link
                href="/billing"
                className="block text-center bg-white font-semibold py-3 rounded-xl transition-colors hover:bg-blue-50"
                style={{ color: "#2563eb" }}
              >
                Upgrade to Pro
              </Link>
            </div>

            {/* Agency */}
            <div
              className="rounded-2xl border p-8 flex flex-col"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e2e8f0",
                boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              }}
            >
              <p className="font-bold text-xl mb-1" style={{ color: "#0f172a" }}>
                Agency
              </p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>
                $25<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span>
              </p>
              <p className="text-sm mb-8" style={{ color: "#475569" }}>
                For agencies and teams
              </p>
              <ul className="space-y-4 text-sm flex-1 mb-8" style={{ color: "#475569" }}>
                <li>✅ Unlimited events</li>
                <li>✅ All platforms</li>
                <li>✅ 10 pixels</li>
                <li>✅ Everything in Pro</li>
                <li>✅ White label</li>
                <li>✅ 100+ GTM templates</li>
                <li>✅ Dedicated support</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block text-center font-semibold py-3 rounded-xl transition-colors"
                style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-12 text-center" style={{ color: "#0f172a" }}>
            Frequently asked questions
          </h2>
          <div className="space-y-6">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border p-6 bg-white"
                style={{
                  borderColor: "#e2e8f0",
                  boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                }}
              >
                <h3 className="font-semibold mb-2" style={{ color: "#0f172a" }}>
                  {faq.q}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                  {faq.a}
                </p>
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

      <TrackHiveFooter />
    </div>
  )
}
