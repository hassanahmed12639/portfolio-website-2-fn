import Link from "next/link"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

export const metadata: Metadata = {
  title: 'TrackHive — Server-Side Tracking for Meta, TikTok & Google',
  description: 'Stop losing conversions to ad blockers. TrackHive sends events server-side via Meta CAPI, TikTok Events API and Google Enhanced Conversions. 85%+ match rate guaranteed.',
  keywords: 'Meta CAPI, server-side tracking, TikTok Events API, Google Enhanced Conversions, ad blocker bypass',
  openGraph: {
    title: 'TrackHive — Server-Side Tracking',
    description: 'Stop losing 30-40% of your conversions to ad blockers.',
    url: 'https://track.itshassanahmed.com',
    siteName: 'TrackHive',
    type: 'website'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TrackHive — Server-Side Tracking',
    description: 'Stop losing 30-40% of your conversions to ad blockers.'
  }
}

const PARTNERS = ["Meta", "Google Ads", "TikTok", "Shopify", "Snapchat"]

const INTEGRATIONS: { name: string; src: string }[] = [
  { name: "Meta", src: "/meta-icon.png" },
  { name: "Google", src: "/google-ads-icon.png" },
  { name: "TikTok", src: "/tiktok-icon.png" },
  { name: "Snapchat", src: "/snapchat-icon.png" },
  { name: "GTM", src: "https://cdn.simpleicons.org/googletagmanager/4285F4" },
  { name: "Shopify", src: "/shopify-icon.png" },
  { name: "WooCommerce", src: "https://cdn.simpleicons.org/woocommerce/96588A" },
  { name: "GA4", src: "https://cdn.simpleicons.org/googleanalytics/E37400" },
  { name: "Zapier", src: "https://cdn.simpleicons.org/zapier/FF4A00" },
]

export default function TrackHivePage() {
  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      {/* Hero - Aigen style: light blue gradient, two-column, headline + card + social proof */}
      <section
        className="pt-20 md:pt-24 pb-10 md:pb-14 relative overflow-hidden min-h-[600px] md:min-h-[680px]"
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 35%, #f8fafc 70%, #ffffff 100%)",
          backgroundImage: `
            linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 35%, #f8fafc 70%, #ffffff 100%),
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(147, 197, 253, 0.12) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(191, 219, 254, 0.08) 0%, transparent 50%)
          `,
        }}
      >
        <div className="max-w-6xl mx-auto px-5 md:px-6 relative">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-12 items-center">
            {/* Left: headline, description, CTA */}
            <div className="text-center lg:text-left order-1">
              <div className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 mb-4 md:mb-6">
                <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
                TRACK FOR FAST
              </div>
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold leading-tight mb-4 md:mb-6 text-slate-900">
                One tool to{" "}
                <span className="text-[#3B82F6]">track</span>
                {" "}conversions and your{" "}
                <span className="text-[#3B82F6]">ads.</span>
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-xl mb-8 md:mb-10">
                TrackHive helps marketing teams work faster and smarter, delivering server-side events to Meta, Google, TikTok and Snapchat—so you get the visibility and match rates you need.
              </p>
              <Link
                href="/dashboard/signup"
                className="inline-flex font-semibold px-8 py-3.5 rounded-xl text-base text-white transition-all shadow-lg hover:shadow-xl hover:opacity-95"
                style={{ background: "linear-gradient(180deg, #3B82F6 0%, #2563eb 100%)" }}
              >
                Start for Free
              </Link>
            </div>

            {/* Right: white card + input + social proof */}
            <div className="order-2 flex justify-center lg:justify-end">
              <div className="w-full max-w-md">
                <div
                  className="rounded-2xl bg-white p-5 shadow-xl border border-slate-100/80"
                  style={{ boxShadow: "0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)" }}
                >
                  <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-3">
                    <span className="text-slate-400 text-sm flex-1 truncate">
                      Send events to Meta, Google, TikTok every morning
                    </span>
                    <button type="button" className="p-1.5 text-slate-400 hover:text-slate-600" aria-label="Voice">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v0m0 0v7m0-7h7" /></svg>
                    </button>
                    <button
                      type="button"
                      className="p-2 rounded-full bg-[#3B82F6] text-white hover:bg-[#2563eb] transition-colors"
                      aria-label="Send"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center gap-3 mt-6 pl-1">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div
                        key={i}
                        className="w-9 h-9 rounded-full border-2 border-white bg-slate-300 flex items-center justify-center text-xs font-medium text-slate-600"
                        style={{ zIndex: 5 - i }}
                      >
                        {i}
                      </div>
                    ))}
                  </div>
                  <p className="text-sm font-medium text-slate-600">
                    Trusted by performance marketers worldwide
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner logos - below hero */}
        <div className="max-w-4xl mx-auto px-5 md:px-6 pt-10 md:pt-14 border-t border-slate-200/60">
          <p className="text-sm text-slate-500 mb-4 md:mb-6 text-center">
            Integrations with leading platforms
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {PARTNERS.map((name) => (
              <span key={name} className="font-semibold text-base text-slate-400">
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* About - Ibnésia-style: pill header, highlighted text block, short viewport */}
      <section
        className="py-12 md:py-16 relative overflow-hidden min-h-[320px] md:min-h-[360px] flex flex-col justify-center"
        style={{
          background: "linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 35%, #f8fafc 70%, #ffffff 100%)",
          backgroundImage: `
            linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 35%, #f8fafc 70%, #ffffff 100%),
            radial-gradient(ellipse 80% 50% at 20% 40%, rgba(147, 197, 253, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse 60% 40% at 80% 60%, rgba(191, 219, 254, 0.06) 0%, transparent 50%)
          `,
        }}
      >
        {/* Subtle background shapes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -left-20 -top-20 w-80 h-64 rounded-[3rem] border border-slate-200/40" />
          <div className="absolute right-10 top-1/4 w-72 h-56 rounded-[2.5rem] border border-slate-200/30" />
          <div className="absolute left-1/3 -bottom-10 w-64 h-48 rounded-[2rem] border border-slate-200/25" />
        </div>

        <div className="max-w-4xl mx-auto px-5 md:px-6 relative">
          {/* Pill header */}
          <div className="flex justify-center mb-8 md:mb-10">
            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white border"
              style={{ backgroundColor: "#3B82F6", borderColor: "#2563eb" }}
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              ABOUT TRACKHIVE
            </div>
          </div>

          {/* Main content with highlighted words */}
          <div className="text-center mb-8">
            <p className="text-2xl md:text-3xl lg:text-4xl font-bold leading-snug text-slate-900 max-w-3xl mx-auto">
              Our team of highly{" "}
              <span style={{ color: "#0ea5e9" }}>experienced engineers</span>
              {" "}and{" "}
              <span style={{ color: "#64748b" }}>specialists</span>
              {" "}are dedicated to offering the best{" "}
              <span style={{ color: "#3B82F6" }}>tracking solutions tailored</span>
              {" "}to your unique marketing{" "}
              <span style={{ color: "#ec4899" }}>needs.</span>
            </p>
          </div>

          {/* Bottom tagline */}
          <div className="flex justify-end">
            <p className="text-xs font-medium text-slate-500 tracking-wide flex items-center gap-2">
              <span className="w-8 h-px bg-slate-400" />
              ENJOY THE EASE EXPERIENCE WITH TRACKHIVE
            </p>
          </div>
        </div>
      </section>

      {/* Features - Clause style: FEATURES tag, title, 4-block grid */}
      <section id="features" className="py-12 md:py-16" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="text-center mb-10 md:mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mb-4 md:mb-6"
              style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" }}
            >
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
              FEATURES
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "#0f172a" }}>
              Latest advanced tech to capture every conversion
            </h2>
            <p className="text-lg max-w-2xl mx-auto" style={{ color: "#475569" }}>
              Maximize match rates and attribution with server-side tracking, AI analysis, and alerts—without replacing your existing tools.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Block 1: Dynamic dashboard */}
            <div
              className="rounded-2xl p-6 lg:p-8 border bg-white"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0f172a" }}>
                Dynamic dashboard
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#475569" }}>
                TrackHive gives you live events, match rates, and data quality in one place—so you see exactly what’s working across Meta, Google, TikTok and more.
              </p>
              <Link
                href="/dashboard/signup"
                className="inline-block font-semibold text-sm px-4 py-2 rounded-lg text-white"
                style={{ backgroundColor: "#1d4ed8" }}
              >
                Explore all
              </Link>
            </div>

            {/* Block 2: Chart / stats */}
            <div
              className="rounded-2xl p-6 lg:p-8 border bg-white"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium" style={{ color: "#475569" }}>Match rate</span>
                <div className="flex -space-x-2">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="w-8 h-8 rounded-full bg-slate-300 border-2 border-white" />
                  ))}
                </div>
              </div>
              <div className="flex items-end gap-1.5 h-32">
                {[40, 55, 45, 65, 58, 72, 68, 80, 75, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i === 7 ? "#1d4ed8" : "#e2e8f0",
                    }}
                  />
                ))}
              </div>
              <p className="text-xs mt-2" style={{ color: "#94a3b8" }}>0 · 2K · 6K · 10K</p>
            </div>

            {/* Block 3: Smart notifications */}
            <div
              className="rounded-2xl p-6 lg:p-8 border bg-white"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0f172a" }}>
                Smart notifications
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#475569" }}>
                Get alerts when tracking breaks, match rate drops, or anomalies appear—via email or in-dashboard so you can fix issues fast.
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: "#94a3b8" }}>
                <span>Email notification</span>
                <span>Save</span>
              </div>
            </div>

            {/* Block 4: Task / event management */}
            <div
              className="rounded-2xl p-6 lg:p-8 border bg-white"
              style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.06)" }}
            >
              <h3 className="text-xl font-bold mb-3" style={{ color: "#0f172a" }}>
                Event replay & retry
              </h3>
              <p className="text-sm mb-6 leading-relaxed" style={{ color: "#475569" }}>
                Failed events are retried automatically. Replay from logs, manage deduplication, and keep every conversion in sync across platforms.
              </p>
              <div className="flex items-center justify-between text-xs" style={{ color: "#94a3b8" }}>
                <span>Activity</span>
                <span>+ Message</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integrations - dark section: Don't replace. Integrate. + logo grid */}
      <section id="integrations" className="py-12 md:py-16 relative">
        <div
          className="max-w-6xl mx-auto px-5 md:px-6 rounded-3xl p-8 md:p-16"
          style={{
            backgroundColor: "#0f172a",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="text-center mb-10 md:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mb-6" style={{ color: "#93c5fd", border: "1px solid rgba(147,197,253,0.4)" }}>
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a1 1 0 110-2h2a1 1 0 110 2h-2zM11 9a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1V9zM4 7a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1H5a1 1 0 01-1-1V7zM18 7a1 1 0 011-1h2a1 1 0 011 1v8a1 1 0 01-1 1h-2a1 1 0 01-1-1V7z" /></svg>
              INTEGRATIONS
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Don&apos;t replace. Integrate.
            </h2>
            <p className="text-base md:text-lg max-w-xl mx-auto mb-6" style={{ color: "#94a3b8" }}>
              We know how hard it is to rip out tools you already use. TrackHive works with your existing pixels, GTM, and platforms—so you add server-side tracking without starting over.
            </p>
            <Link href="/integrations" className="text-sm font-semibold underline hover:no-underline" style={{ color: "#93c5fd" }}>
              All Integrations →
            </Link>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {INTEGRATIONS.map((item) => (
              <div
                key={item.name}
                className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-4 border overflow-hidden"
                style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.05)" }}
              >
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial + Stats */}
      <section className="py-12 md:py-16 bg-white">
        <div className="max-w-4xl mx-auto px-5 md:px-6 text-center mb-8 md:mb-12">
          <p className="text-5xl md:text-7xl font-serif leading-none mb-4 md:mb-6" style={{ color: "#1d4ed8" }}>&ldquo;</p>
          <blockquote className="text-2xl md:text-3xl font-bold leading-snug mb-8" style={{ color: "#0f172a" }}>
            TrackHive is helping us recover conversions we were losing to ad blockers and iOS, while improving Meta match rates and attribution across our whole funnel.
          </blockquote>
          <div className="flex flex-col items-center gap-2">
            <div className="w-14 h-14 rounded-full bg-slate-200 flex items-center justify-center text-lg font-bold" style={{ color: "#475569" }}>
              DR
            </div>
            <p className="font-semibold" style={{ color: "#0f172a" }}>Darlene Robertson</p>
            <p className="text-sm" style={{ color: "#64748b" }}>Head of Performance at E‑commerce Co.</p>
          </div>
        </div>

        {/* Stats box */}
        <div
          className="max-w-4xl mx-auto px-5 md:px-6 rounded-2xl p-7 md:p-12 border"
          style={{ backgroundColor: "#f8fafc", borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.05)" }}
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: "#1d4ed8" }}>2024</p>
              <p className="text-sm" style={{ color: "#475569" }}>TrackHive Launched</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: "#1d4ed8" }}>50K+</p>
              <p className="text-sm" style={{ color: "#475569" }}>Events Processed</p>
            </div>
            <div>
              <p className="text-4xl font-bold mb-1" style={{ color: "#1d4ed8" }}>1K+</p>
              <p className="text-sm" style={{ color: "#475569" }}>Marketers Trust Us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing preview - keep existing pricing cards */}
      <section className="py-12 md:py-16" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto px-5 md:px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
            Simple pricing.
          </h2>
          <p className="text-lg mb-10 md:mb-16" style={{ color: "#475569" }}>
            No hidden fees. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-8 text-left bg-white" style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.05)" }}>
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>Free</p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>$0<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span></p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>Perfect to get started</p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}>
                {['1,000 events/month', 'Meta CAPI', '1 pixel', 'Basic analytics'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/signup" className="block text-center font-semibold py-2.5 rounded-lg transition-colors bg-slate-100" style={{ color: "#1e293b" }}>Start for free</Link>
            </div>
            <div className="rounded-2xl p-8 text-left relative border" style={{ backgroundColor: "#1d4ed8", borderColor: "rgba(147,197,253,0.35)", boxShadow: "0 8px 20px rgba(29,78,216,0.2)" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-amber-400" style={{ color: "#78350f" }}>MOST POPULAR</span>
              <p className="font-bold text-lg mb-1 text-white">Pro</p>
              <p className="text-4xl font-extrabold mb-1 text-white">$10<span className="text-base font-normal text-blue-200">/mo</span></p>
              <p className="text-sm mb-6 text-blue-200">For growing businesses</p>
              <ul className="space-y-3 text-sm mb-8 text-blue-100">
                {['50,000 events/month', 'All platforms', '3 pixels', 'AI Analysis', 'Email alerts', 'Priority support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-200 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/billing" className="block text-center bg-white font-semibold py-2.5 rounded-lg transition-colors hover:bg-blue-50 text-blue-600">Upgrade to Pro</Link>
            </div>
            <div className="rounded-2xl border p-8 text-left bg-white" style={{ borderColor: "#e5e7eb", boxShadow: "0 1px 2px rgba(15,23,42,0.05)" }}>
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>Agency</p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>$25<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span></p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>For agencies and teams</p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}>
                {['Unlimited events', 'All platforms', '10 pixels', 'Everything in Pro', 'White label', 'Dedicated support'].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
              <Link href="/dashboard/signup" className="block text-center font-semibold py-2.5 rounded-lg bg-slate-100 transition-colors" style={{ color: "#1e293b" }}>Start for free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - dark strip: Discover full scale... + Get a Demo / Start for Free */}
      <section className="py-10 md:py-14" style={{ backgroundColor: "#1e3a5f" }}>
        <div className="max-w-6xl mx-auto px-5 md:px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-6 md:gap-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white max-w-xl">
            Discover the full scale of{" "}
            <span className="relative inline-block">
              TrackHive capabilities
              <span className="absolute bottom-1 left-0 w-full h-1 rounded" style={{ backgroundColor: "#93c5fd" }} />
            </span>
          </h2>
          <div className="flex flex-wrap gap-4 shrink-0">
            <Link href="/features" className="font-semibold px-6 py-3 rounded-xl border border-white text-white hover:bg-white/10 transition-colors">
              Get a Demo
            </Link>
            <Link href="/dashboard/signup" className="font-semibold px-6 py-3 rounded-xl bg-white hover:bg-slate-100 transition-colors" style={{ color: "#1d4ed8" }}>
              Start for Free
            </Link>
          </div>
        </div>
      </section>

      <TrackHiveFooter />
    </div>
  )
}
