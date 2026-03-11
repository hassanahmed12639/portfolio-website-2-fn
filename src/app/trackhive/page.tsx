export const dynamic = 'force-dynamic'

import Link from "next/link"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"
import TrackHiveHeroDashboard from "@/components/trackhive/HeroDashboard"
import WireFlowIcons from "@/components/trackhive/WireFlowIcons"
import TestimonialSection from "@/components/trackhive/TestimonialSection"
import PricingSection from "@/components/trackhive/PricingSection"
import { TrackHiveCTASection } from "@/components/trackhive/TrackHiveCTASection"

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
  { name: "Meta", src: "/landing-meta.png" },
  { name: "Google", src: "/landing-google-ads.png" },
  { name: "TikTok", src: "/landing-tiktok-ads.png" },
  { name: "Snapchat", src: "/landing-snapchat-ads (1).png" },
  { name: "GTM", src: "https://cdn.simpleicons.org/googletagmanager/4285F4" },
  { name: "Shopify", src: "/landing-shopify-ads.png" },
  { name: "WooCommerce", src: "https://cdn.simpleicons.org/woocommerce/96588A" },
  { name: "GA4", src: "https://cdn.simpleicons.org/googleanalytics/E37400" },
  { name: "Zapier", src: "https://cdn.simpleicons.org/zapier/FF4A00" },
]

export default function TrackHivePage() {
  return (
    <div className="trackhive-flow font-sans min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
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
            <div className="text-center lg:text-left flex flex-col items-center lg:items-start order-1">
              <h1 className="text-3xl md:text-4xl lg:text-5xl xl:text-[3.25rem] font-bold leading-tight mb-4 md:mb-6 bg-gradient-to-r from-[#0f172a] via-[#2563eb] to-[#93c5fd] bg-clip-text text-transparent w-full">
                One tool to track conversions and your ads.
              </h1>
              <p className="text-base md:text-lg lg:text-xl text-slate-600 max-w-xl mb-8 md:mb-10 mx-auto lg:mx-0">
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

            {/* Right: interactive dashboard */}
            <div className="order-2 flex justify-center lg:justify-end">
              <TrackHiveHeroDashboard />
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

      {/* About/Brand statement section recreated from provided reference */}
      <section className="relative overflow-hidden bg-white py-10 md:py-14 lg:py-16">
        <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-5xl text-center">
            <h2 className="text-3xl font-bold leading-[1.1] tracking-tight text-[#0f172a] sm:text-4xl md:text-5xl lg:text-6xl">
              <span className="bg-gradient-to-r from-[#0f172a] via-[#2563eb] to-[#93c5fd] bg-clip-text text-transparent">
                Track events
              </span>
              <br />
              <span className="text-[#0f172a]">server-side with</span>{" "}
              <span className="text-[#93c5fd]">full data control.</span>
            </h2>
          </div>
        </div>

        {/* Connected wire motif + centered CTA */}
        <div className="relative mt-8 h-[220px] overflow-hidden sm:h-[260px] md:h-[300px]">
          <div className="pointer-events-none absolute inset-0">
            <svg
              className="h-full w-full"
              viewBox="0 0 1200 320"
              preserveAspectRatio="none"
              aria-hidden="true"
            >
              {/* Center axis */}
              <path d="M0 160 L1200 160" stroke="#e2e8f0" strokeWidth="1" />

              {/* Primary outer wires */}
              <path d="M0 16 C180 16, 300 158, 600 160" fill="none" stroke="#334155" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d="M1200 16 C1020 16, 900 158, 600 160" fill="none" stroke="#334155" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d="M0 304 C180 304, 300 162, 600 160" fill="none" stroke="#334155" strokeOpacity="0.45" strokeWidth="1.2" />
              <path d="M1200 304 C1020 304, 900 162, 600 160" fill="none" stroke="#334155" strokeOpacity="0.45" strokeWidth="1.2" />

              {/* Secondary inner wires */}
              <path d="M0 74 C220 74, 350 157, 600 160" fill="none" stroke="#64748b" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2.5 4.5" />
              <path d="M1200 74 C980 74, 850 157, 600 160" fill="none" stroke="#64748b" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2.5 4.5" />
              <path d="M0 246 C220 246, 350 163, 600 160" fill="none" stroke="#64748b" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2.5 4.5" />
              <path d="M1200 246 C980 246, 850 163, 600 160" fill="none" stroke="#64748b" strokeOpacity="0.28" strokeWidth="1" strokeDasharray="2.5 4.5" />

            </svg>
          </div>

          <WireFlowIcons />

          <div className="absolute left-1/2 top-1/2 z-10 w-full -translate-x-1/2 -translate-y-1/2 px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <Link
                href="/dashboard/signup"
                className="inline-flex w-auto shrink-0 items-center justify-center rounded-md bg-[#0f172a] px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition-colors hover:bg-[#1e293b]"
              >
                TrackHive
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Section - updated card count/content and responsive grid */}
      <section id="features" className="py-24 bg-white font-sans">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <span className="inline-flex items-center rounded-full bg-blue-50 px-4 py-1.5 text-xs font-semibold text-blue-700">
              Everything You Need
            </span>
            <h2 className="mt-5 text-3xl font-bold leading-tight text-slate-900 sm:text-4xl md:text-5xl">
              Built for serious advertisers
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-500 sm:text-base">
              Stop losing conversions to ad blockers and browser restrictions. TrackHive sends your data server-side, every time.
            </p>
          </div>

          <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:snap-none sm:pb-0 lg:grid-cols-4">
            <article className="min-w-full snap-start rounded-3xl bg-blue-700 p-5 text-white shadow-sm shadow-blue-200/60 sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8L10 18l-4-4-3 3" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight sm:text-2xl">Beat Ad Blockers Forever</h3>
              <p className="mt-2.5 text-sm leading-6 text-blue-100">
                Browser pixels lose 40% of conversions to ad blockers and iOS. TrackHive fires from your server - invisible to every blocker, every time.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V7.618a1 1 0 01.553-.894L9 4m0 16l6-3m-6 3V4m6 13l6 3m-6-3V4m6 16V4" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">90%+ Meta Match Rate</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Most pixels match at 50-60%. TrackHive captures fbp, fbc, email and phone automatically to hit 90%+ - so Meta finds buyers, not browsers.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a2 2 0 01-2.827 0l-4.243-4.243a8 8 0 1111.313 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">One Event. Four Platforms.</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Meta CAPI, TikTok, Google Ads and GA4 all fire from a single event. No duplicate code. No missed conversions.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">Tell Meta Who Actually Buys</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Score leads as Hot, Good or Bad and send the signal back to Meta. Lower CPL, higher ROAS - automatically.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">Know Before Your ROAS Drops</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Live event stream and anomaly detection catch tracking failures instantly - not three days later when your CPA has already doubled.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">Live in Under 5 Minutes</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Paste one script tag and you are tracking server-side across every platform. No developers, no infrastructure, no complicated setup.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 11c0 1.105-.672 2-1.5 2S9 12.105 9 11s.672-2 1.5-2 1.5.895 1.5 2zm9 0c0 4.418-4.03 8-9 8a10.943 10.943 0 01-4-.75L3 20l1.25-3.75A7.59 7.59 0 013 11c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">Cookies That Last 180 Days</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Safari and Firefox kill cookies in 1-7 days. TrackHive sets server-side cookies that survive ITP, ETP and every browser restriction.
              </p>
            </article>

            <article className="min-w-full snap-start rounded-3xl border border-slate-200 bg-white p-5 shadow-[0_1px_4px_rgba(15,23,42,0.06)] sm:min-w-0">
              <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-blue-700">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5V9H2v11h5m10 0v-6a3 3 0 00-3-3H10a3 3 0 00-3 3v6m10 0H7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold leading-tight text-slate-900 sm:text-2xl">Built for Agencies</h3>
              <p className="mt-2.5 text-sm leading-6 text-slate-500">
                Manage 25 pixels across multiple clients from one dashboard. Invite your team and keep every client's data completely isolated.
              </p>
            </article>
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

      {/* Two-column: dashboard visual + headline, description, CTA, stat cards */}
      <section className="py-16 md:py-24 bg-slate-50/50">
        <div className="max-w-6xl mx-auto px-5 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            {/* Left: dashboard-style card */}
            <div className="order-2 lg:order-1">
              <div
                className="rounded-2xl bg-white p-6 shadow-lg border border-slate-100 overflow-hidden transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_8px_30px_rgba(30,58,138,0.12)] cursor-pointer"
                style={{
                  boxShadow: "0 4px 24px -4px rgba(15,23,42,0.08), 0 0 0 1px rgba(15,23,42,0.04)",
                }}
                role="region"
                aria-label="Ecommerce conversion tracking dashboard"
              >
                <h3 className="text-lg font-bold text-slate-900 mb-4">Ecommerce conversion tracking</h3>
                <p className="text-2xl font-bold text-slate-900 mb-1">85.2<span className="text-sm font-normal text-slate-500 ml-1">% match rate</span></p>
                <div className="flex gap-1 h-3 rounded-full overflow-hidden bg-slate-100 mb-6">
                  <div className="flex-1 rounded-full bg-blue-500" style={{ minWidth: "18%" }} />
                  <div className="flex-1 rounded-full bg-blue-400" style={{ minWidth: "22%" }} />
                  <div className="flex-1 rounded-full bg-blue-600" style={{ minWidth: "25%" }} />
                  <div className="flex-1 rounded-full bg-slate-300" style={{ minWidth: "20%" }} />
                  <div className="flex-1 rounded-full bg-slate-200" style={{ minWidth: "15%" }} />
                </div>
                <ul className="space-y-2 text-sm text-slate-600 mb-4">
                  {[
                    { label: "Purchase", value: "14,250" },
                    { label: "Add to cart", value: "4,250" },
                    { label: "View content", value: "3,250" },
                    { label: "Initiate checkout", value: "12,250" },
                  ].map(({ label, value }) => (
                    <li key={label} className="flex justify-between items-center">
                      <span>{label}</span>
                      <span className="font-semibold text-slate-900">{value}</span>
                    </li>
                  ))}
                </ul>
                <div className="rounded-xl border border-slate-200 bg-slate-50/80 px-4 py-3 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Conversions sent</p>
                    <p className="text-xl font-bold text-slate-900">24,360</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
                      +15%
                    </span>
                    <p className="text-xs text-slate-500">124 orders today</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: headline, description, CTA, stat cards */}
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 leading-tight mb-4">
                Recover lost sales and improve ROAS with server-side ecommerce tracking
              </h2>
              <p className="text-slate-600 text-base md:text-lg mb-6 max-w-lg">
                Stop losing purchase and add-to-cart events to ad blockers and iOS. TrackHive sends every conversion from your store to Meta, TikTok and Google—so your ads optimize on real sales.
              </p>
              <Link
                href="/features"
                className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors mb-8"
              >
                Read more about it
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
              </Link>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { value: "85%+", label: "Match rate" },
                  { value: "5 min", label: "Setup time" },
                  { value: "50K+", label: "Ecommerce events" },
                ].map(({ value, label }) => (
                  <div
                    key={label}
                    className="rounded-2xl bg-white border border-slate-100 px-5 py-4 text-center"
                    style={{ boxShadow: "0 1px 3px rgba(15,23,42,0.06)" }}
                  >
                    <p className="text-2xl font-bold text-slate-900">{value}</p>
                    <p className="text-sm font-medium text-slate-500 mt-0.5">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonial + Stats */}
      <TestimonialSection />

      {/* Pricing Section */}
      <PricingSection />

      <TrackHiveCTASection
        title="Ready to connect your stack?"
        description="Get started in 5 minutes. No credit card required."
        buttonText="Start for free →"
      />

      <TrackHiveFooter />
    </div>
  )
}
