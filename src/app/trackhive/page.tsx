"use client"

import Link from "next/link"
import { useState } from "react"

const LIME = "#aaff00"
const TEXT_PRIMARY = "#0a0a0a"
const TEXT_SECONDARY = "#666666"
const TEXT_MUTED = "#999999"
const BORDER = "#e5e5e5"
const BG_SECONDARY = "#fafafa"

const FAQ_ITEMS = [
  { q: "Do I need a developer?", a: "No. Paste one snippet or use our GTM template. Done in 5 minutes." },
  { q: "How is this different from just the Meta Pixel?", a: "Browser pixels get blocked by 30-40% of users. Server-side CAPI cannot be blocked. You recover those lost conversions." },
  { q: "Does it work with Shopify?", a: "Yes. We have dedicated Shopify templates and step-by-step guides." },
  { q: "Is my customer data safe?", a: "All emails and phones are hashed with SHA-256 before storing. We never store raw PII." },
  { q: "Is there a free trial?", a: "Yes. Every account gets 7 days of full Pro access free. No credit card needed." },
  { q: "What platforms do you support?", a: "Meta CAPI, Google Enhanced Conversions, TikTok Events API, Snapchat Conversions API, and GA4 Measurement Protocol. More coming." },
]

const SNIPPET = `<script>window.TRACKHIVE_KEY = "your-key";</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`

const PLATFORMS = [
  { name: "Meta", desc: "Conversions API" },
  { name: "Google Ads", desc: "Enhanced Conversions" },
  { name: "TikTok", desc: "Events API" },
  { name: "Snapchat", desc: "Conversions API" },
  { name: "GA4", desc: "Measurement Protocol" },
  { name: "More coming", desc: "Pinterest, LinkedIn" },
]

export default function TrackHivePage() {
  const [faqOpen, setFaqOpen] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  const copySnippet = () => {
    navigator.clipboard.writeText(SNIPPET)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans antialiased">
      {/* ——— Section 1: Navbar ——— */}
      <nav
        className="sticky top-0 left-0 right-0 z-50 h-[60px] flex items-center justify-between px-6 md:px-10 bg-white border-b"
        style={{ borderColor: BORDER }}
      >
        <Link href="/trackhive" className="flex items-center gap-1.5 font-bold text-lg">
          <span style={{ color: LIME }}>⚡</span>
          <span style={{ color: TEXT_PRIMARY }}>TrackHive</span>
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm" style={{ color: TEXT_SECONDARY }}>
          <Link href="/trackhive#features" className="hover:opacity-80 transition-opacity">Features</Link>
          <Link href="/trackhive#pricing" className="hover:opacity-80 transition-opacity">Pricing</Link>
          <Link href="/dashboard/templates" className="hover:opacity-80 transition-opacity">Templates</Link>
          <Link href="#" className="hover:opacity-80 transition-opacity">Docs</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/dashboard/login" className="text-sm hover:opacity-80 transition-opacity" style={{ color: TEXT_SECONDARY }}>
            Log in
          </Link>
          <Link
            href="/dashboard/signup"
            className="text-sm font-medium px-5 py-2 rounded-full bg-[#0a0a0a] text-white hover:opacity-90 transition-opacity"
          >
            Get started
          </Link>
        </div>
      </nav>

      {/* ——— Section 2: Hero ——— */}
      <section className="py-32 px-6 md:px-10">
        <div className="max-w-4xl mx-auto text-center">
          <span
            className="inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-8"
            style={{ background: LIME, color: TEXT_PRIMARY }}
          >
            AI-Powered Server-Side Tracking
          </span>
          <h1 className="text-6xl md:text-7xl font-bold tracking-tight leading-tight" style={{ color: TEXT_PRIMARY }}>
            Stop losing conversions
            <br />
            to ad blockers.
          </h1>
          <p className="text-lg max-w-xl mx-auto mt-6" style={{ color: TEXT_SECONDARY }}>
            TrackHive sends your events server-side to Meta CAPI, Google, TikTok and Snapchat. Recover 30-40% of conversions you&apos;re currently losing.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-10">
            <Link
              href="/dashboard/signup"
              className="w-full sm:w-auto px-8 py-3 rounded-full font-medium bg-[#0a0a0a] text-white hover:opacity-90 transition-opacity text-center"
            >
              Start for free
            </Link>
            <Link
              href="#how-it-works"
              className="w-full sm:w-auto px-8 py-3 rounded-full font-medium border bg-white hover:bg-[#fafafa] transition-colors text-center"
              style={{ borderColor: TEXT_PRIMARY, color: TEXT_PRIMARY }}
            >
              See a demo →
            </Link>
          </div>
          <p className="mt-6 text-sm" style={{ color: TEXT_MUTED }}>
            Free forever · No credit card · 7-day Pro trial
          </p>

          {/* Floating cards */}
          <div className="mt-20 relative flex justify-center items-start gap-4 md:gap-8 min-h-[320px]">
            {/* Left card */}
            <div
              className="hidden md:block absolute left-0 md:left-[5%] lg:left-[10%] top-8 w-48 rounded-2xl border p-4 shadow-md bg-white -rotate-3 transition-transform hover:rotate-0"
              style={{ borderColor: BORDER }}
            >
              <p className="text-sm font-semibold mb-1" style={{ color: TEXT_PRIMARY }}>⚡ Event fired</p>
              <p className="text-xs mb-2" style={{ color: TEXT_SECONDARY }}>Purchase · $149</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>
                Server-side
              </span>
            </div>

            {/* Center card - main dashboard */}
            <div
              className="relative z-10 w-full max-w-lg rounded-2xl border p-6 shadow-lg bg-white"
              style={{ borderColor: BORDER }}
            >
              <div className="flex items-center gap-2 mb-6">
                <span className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                  <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                  <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                </span>
                <span className="text-sm font-medium" style={{ color: TEXT_SECONDARY }}>TrackHive Dashboard</span>
              </div>
              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="rounded-xl border py-3 px-3" style={{ borderColor: BORDER }}>
                  <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>1,247</p>
                  <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Events</p>
                </div>
                <div className="rounded-xl border py-3 px-3" style={{ borderColor: BORDER }}>
                  <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>94%</p>
                  <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Match Rate</p>
                </div>
                <div className="rounded-xl border py-3 px-3" style={{ borderColor: BORDER }}>
                  <p className="text-2xl font-bold" style={{ color: TEXT_PRIMARY }}>5</p>
                  <p className="text-xs" style={{ color: TEXT_SECONDARY }}>Platforms</p>
                </div>
              </div>
              <div className="flex items-end gap-1 h-12 mb-4">
                {[35, 55, 45, 70, 65, 85, 60].map((h, i) => (
                  <div key={i} className="flex-1 rounded-t min-h-[4px]" style={{ height: `${h}%`, background: LIME }} />
                ))}
              </div>
              <div className="flex items-center gap-2 rounded-lg border py-2 px-3 text-sm" style={{ borderColor: BORDER }}>
                <span className="w-2 h-2 rounded-full" style={{ background: LIME }} />
                <span style={{ color: TEXT_PRIMARY }}>Purchase · $149 · Meta CAPI · ✓ Delivered</span>
              </div>
            </div>

            {/* Right card */}
            <div
              className="hidden md:block absolute right-0 md:right-[5%] lg:right-[10%] top-8 w-48 rounded-2xl border p-4 shadow-md bg-white rotate-3 transition-transform hover:rotate-0"
              style={{ borderColor: BORDER }}
            >
              <p className="text-sm font-semibold mb-2" style={{ color: TEXT_PRIMARY }}>🤖 AI Analysis</p>
              <p className="text-xs mb-1" style={{ color: TEXT_SECONDARY }}>Health Score</p>
              <div className="h-2 rounded-full overflow-hidden mb-2" style={{ background: BORDER }}>
                <div className="h-full rounded-full" style={{ width: "82%", background: LIME }} />
              </div>
              <p className="text-xs" style={{ color: TEXT_MUTED }}>82%</p>
              <p className="text-xs mt-1" style={{ color: TEXT_SECONDARY }}>2 issues found</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Section 3: Trust Bar ——— */}
      <section className="py-6 px-6 border-t border-b bg-[#fafafa]" style={{ borderColor: BORDER }}>
        <div className="max-w-4xl mx-auto text-center">
          <p className="text-sm" style={{ color: TEXT_MUTED }}>
            Trusted by performance marketers running ads on
          </p>
          <p className="text-sm mt-1" style={{ color: TEXT_MUTED }}>
            Meta Ads · Google Ads · TikTok Ads · Snapchat · GA4
          </p>
        </div>
      </section>

      {/* ——— Section 4: Stats ——— */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-5xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>30-40%</p>
              <p className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>of conversions lost to ad blockers without server-side tracking</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>Recoverable</span>
            </div>
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-5xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>85%+</p>
              <p className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>average match rate achieved with TrackHive CAPI</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>Industry-leading</span>
            </div>
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-5xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>5 min</p>
              <p className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>average setup time from signup to first server-side event</p>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>Quick setup</span>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Section 5: Features Bento Grid ——— */}
      <section id="features" className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>Everything you need.</h2>
          <p className="text-lg mb-16" style={{ color: TEXT_SECONDARY }}>Built by a performance marketer who was tired of broken tracking.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Row 1: Large Meta CAPI + Small AI */}
            <div className="lg:col-span-2 rounded-2xl border p-8 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-4" style={{ background: LIME, color: TEXT_PRIMARY }}>Core Feature</span>
              <h3 className="text-2xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>Meta CAPI</h3>
              <p className="mb-6" style={{ color: TEXT_SECONDARY }}>Send purchase events server-side. Bypass every ad blocker. Achieve 85%+ match rates.</p>
              <div className="flex items-center gap-2 text-sm font-mono py-3 px-4 rounded-xl" style={{ background: "#fafafa", borderColor: BORDER, borderWidth: 1 }}>
                <span style={{ color: TEXT_SECONDARY }}>[Your Server]</span>
                <span style={{ color: LIME }}> —→ </span>
                <span style={{ color: TEXT_PRIMARY }}>[Meta CAPI]</span>
              </div>
            </div>
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-4" style={{ background: LIME, color: TEXT_PRIMARY }}>AI Powered</span>
              <h3 className="text-xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>AI Analysis</h3>
              <p className="mb-4" style={{ color: TEXT_SECONDARY }}>Finds gaps in your tracking automatically</p>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                  <div className="h-full rounded-full" style={{ width: "82%", background: LIME }} />
                </div>
                <span className="text-sm font-medium" style={{ color: TEXT_PRIMARY }}>82/100</span>
              </div>
            </div>

            {/* Row 2: Small Anomaly + Large Cookie */}
            <div className="rounded-2xl border p-8 bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-4" style={{ background: LIME, color: TEXT_PRIMARY }}>Real-time</span>
              <h3 className="text-xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>Anomaly Detection</h3>
              <p className="mb-4" style={{ color: TEXT_SECONDARY }}>Alerts in 30 seconds when tracking breaks</p>
              <div className="rounded-lg border py-2 px-3 text-xs" style={{ borderColor: BORDER, color: TEXT_SECONDARY }}>
                ⚠️ Event drop detected · 2 min ago
              </div>
            </div>
            <div className="lg:col-span-2 rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-4" style={{ background: LIME, color: TEXT_PRIMARY }}>Privacy Features</span>
              <h3 className="text-2xl font-bold mb-2" style={{ color: TEXT_PRIMARY }}>Cookie Extender & Reverse Proxy</h3>
              <p className="mb-6" style={{ color: TEXT_SECONDARY }}>Extend cookies from 7 days to 180 days. Serve tracking scripts from your domain so ad blockers can&apos;t touch them.</p>
              <div className="space-y-3">
                <div>
                  <p className="text-xs mb-1" style={{ color: TEXT_SECONDARY }}>Browser Cookie: 7 days</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                    <div className="h-full rounded-full" style={{ width: "15%", background: BORDER }} />
                  </div>
                </div>
                <div>
                  <p className="text-xs mb-1" style={{ color: TEXT_SECONDARY }}>Server Cookie: 180 days</p>
                  <div className="h-2 rounded-full overflow-hidden" style={{ background: BORDER }}>
                    <div className="h-full rounded-full" style={{ width: "100%", background: LIME }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 3: Three equal */}
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-lg font-semibold mb-2" style={{ color: TEXT_PRIMARY }}>Event Replay</p>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Failed events retried automatically. Never lose a conversion.</p>
            </div>
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-lg font-semibold mb-2" style={{ color: TEXT_PRIMARY }}>Truth Score™</p>
              <p className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>Know exactly how accurate your data is.</p>
              <p className="text-sm font-medium">Score: 91/100 <span className="inline-block w-3 h-3 rounded-full ml-1 align-middle" style={{ background: LIME }} /></p>
            </div>
            <div className="rounded-2xl border p-8 bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <p className="text-lg font-semibold mb-2" style={{ color: TEXT_PRIMARY }}>80+ Templates</p>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Ready-made GTM and sGTM templates for every platform.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ——— Section 6: How It Works ——— */}
      <section id="how-it-works" className="py-24 px-6 md:px-10">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: TEXT_PRIMARY }}>Live in 5 minutes.</h2>
          <div className="flex flex-col md:flex-row md:items-start gap-8 md:gap-4 mb-12">
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Step 01</p>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>Connect</h3>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Enter your Pixel ID and access token</p>
            </div>
            <div className="hidden md:block flex-shrink-0 w-8 h-px self-center" style={{ background: BORDER }} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Step 02</p>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>Install</h3>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Paste one script tag on your site</p>
            </div>
            <div className="hidden md:block flex-shrink-0 w-8 h-px self-center" style={{ background: BORDER }} />
            <div className="flex-1 text-center md:text-left">
              <p className="text-sm font-semibold mb-1" style={{ color: TEXT_MUTED }}>Step 03</p>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>Track</h3>
              <p className="text-sm" style={{ color: TEXT_SECONDARY }}>Events flow server-side immediately</p>
            </div>
          </div>
          <div className="relative rounded-2xl p-6 bg-[#0a0a0a] font-mono text-sm text-white overflow-x-auto" style={{ borderLeft: `4px solid ${LIME}` }}>
            <button
              onClick={copySnippet}
              className="absolute top-4 right-4 text-xs font-medium px-3 py-1.5 rounded hover:opacity-90 transition-opacity"
              style={{ background: LIME, color: TEXT_PRIMARY }}
            >
              {copied ? "Copied" : "Copy"}
            </button>
            <pre className="pr-24">{SNIPPET}</pre>
          </div>
        </div>
      </section>

      {/* ——— Section 7: Platform Grid ——— */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-16 text-center" style={{ color: TEXT_PRIMARY }}>Works with every major platform.</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PLATFORMS.map((p, i) => (
              <div
                key={i}
                className="rounded-2xl border p-6 bg-white transition-colors hover:border-[#aaff00]"
                style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
              >
                <h3 className="font-bold text-lg mb-1" style={{ color: TEXT_PRIMARY }}>{p.name}</h3>
                <p className="text-sm mb-3" style={{ color: TEXT_SECONDARY }}>{p.desc}</p>
                <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>Connected</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Section 8: AI Section ——— */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium mb-4" style={{ background: LIME, color: TEXT_PRIMARY }}>AI Built In</span>
            <h2 className="text-4xl font-bold mb-4" style={{ color: TEXT_PRIMARY }}>Your tracking has gaps. AI finds them.</h2>
            <p className="text-lg mb-8" style={{ color: TEXT_SECONDARY }}>
              TrackHive analyzes every event, detects missing conversions, and writes the fix code for you.
            </p>
            <ul className="space-y-3 text-sm" style={{ color: TEXT_SECONDARY }}>
              {["Scans events and finds missing ones", "Detects anomalies in real-time", "Generates fix code automatically", "Cleans UTM parameters", "Attribution Truth Score™"].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: LIME }} />
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl border p-6 bg-white shadow-lg font-mono text-sm" style={{ borderColor: BORDER }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
                <span className="w-2 h-2 rounded-full bg-[#e5e5e5]" />
              </span>
              <span style={{ color: TEXT_SECONDARY }}>AI Analysis</span>
            </div>
            <p className="mb-4" style={{ color: TEXT_MUTED }}>Scanning 847 events...</p>
            <p className="mb-2" style={{ color: TEXT_PRIMARY }}>Health Score  82 / 100</p>
            <div className="h-2 rounded-full overflow-hidden mb-4" style={{ background: BORDER }}>
              <div className="h-full rounded-full" style={{ width: "82%", background: LIME }} />
            </div>
            <p className="mb-2" style={{ color: TEXT_PRIMARY }}>Issues found (2):</p>
            <p className="mb-1" style={{ color: TEXT_SECONDARY }}>→ InitiateCheckout missing</p>
            <p className="mb-4" style={{ color: TEXT_SECONDARY }}>→ event_id not set</p>
            <p className="mb-4" style={{ color: TEXT_PRIMARY }}>Fix ready to apply ↗</p>
            <button
              className="w-full py-3 rounded-xl font-bold text-sm transition-opacity hover:opacity-90"
              style={{ background: LIME, color: TEXT_PRIMARY }}
            >
              Apply Fix
            </button>
          </div>
        </div>
      </section>

      {/* ——— Section 9: Pricing ——— */}
      <section id="pricing" className="py-24 px-6 md:px-10">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-4xl font-bold mb-2 text-center" style={{ color: TEXT_PRIMARY }}>Simple pricing.</h2>
          <p className="text-center mb-16" style={{ color: TEXT_SECONDARY }}>Start free. Upgrade when ready.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* FREE */}
            <div className="rounded-2xl border p-8 flex flex-col bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5" style={{ borderColor: BORDER, boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>FREE</h3>
              <p className="text-4xl font-bold mb-6" style={{ color: TEXT_PRIMARY }}>$0</p>
              <ul className="space-y-3 text-sm flex-1 mb-8" style={{ color: TEXT_SECONDARY }}>
                <li>✓ 500 events/mo</li>
                <li>✓ Meta CAPI</li>
                <li>✓ Google Enhanced</li>
                <li>✓ 3 AI analyses/mo</li>
                <li style={{ color: TEXT_MUTED }}>✗ TikTok/Snapchat</li>
              </ul>
              <Link href="/dashboard/signup" className="block w-full py-3 rounded-full text-center font-medium bg-[#0a0a0a] text-white hover:opacity-90 transition-opacity">
                Get started
              </Link>
            </div>
            {/* PRO */}
            <div
              className="rounded-2xl border-2 p-8 flex flex-col bg-white relative"
              style={{ borderColor: LIME, boxShadow: "0 4px 12px rgba(0,0,0,0.06)" }}
            >
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium" style={{ background: LIME, color: TEXT_PRIMARY }}>
                Most popular
              </span>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>PRO</h3>
              <p className="text-4xl font-bold mb-6" style={{ color: TEXT_PRIMARY }}>$10<span className="text-lg font-normal" style={{ color: TEXT_SECONDARY }}>/mo</span></p>
              <ul className="space-y-3 text-sm flex-1 mb-8" style={{ color: TEXT_SECONDARY }}>
                <li>✓ 50,000 events/mo</li>
                <li>✓ All 5 platforms</li>
                <li>✓ Unlimited AI</li>
                <li>✓ Cookie Extender</li>
                <li>✓ Reverse Proxy</li>
                <li>✓ Anomaly Detection</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block w-full py-3 rounded-full text-center font-bold bg-[#aaff00] text-[#0a0a0a] hover:opacity-90 transition-opacity"
              >
                Start free trial
              </Link>
            </div>
            {/* AGENCY */}
            <div className="rounded-2xl border p-8 flex flex-col bg-white" style={{ borderColor: BORDER, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
              <h3 className="text-lg font-bold mb-1" style={{ color: TEXT_PRIMARY }}>AGENCY</h3>
              <p className="text-4xl font-bold mb-6" style={{ color: TEXT_PRIMARY }}>$25<span className="text-lg font-normal" style={{ color: TEXT_SECONDARY }}>/mo</span></p>
              <ul className="space-y-3 text-sm flex-1 mb-8" style={{ color: TEXT_SECONDARY }}>
                <li>✓ Unlimited events</li>
                <li>✓ Everything in Pro</li>
                <li>✓ 80+ GTM Templates</li>
                <li>✓ 10 workspaces</li>
              </ul>
              <a
                href="mailto:hassan@itshassanahmed.com"
                className="block w-full py-3 rounded-full text-center font-medium bg-[#0a0a0a] text-white hover:opacity-90 transition-opacity"
              >
                Contact us
              </a>
            </div>
          </div>
          <p className="text-center text-sm mt-8" style={{ color: TEXT_MUTED }}>
            All plans include 7-day free trial · No credit card required
          </p>
        </div>
      </section>

      {/* ——— Section 10: FAQ ——— */}
      <section className="py-24 px-6 md:px-10">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-4xl font-bold mb-12 text-center" style={{ color: TEXT_PRIMARY }}>Questions.</h2>
          <div className="bg-white">
            {FAQ_ITEMS.map((faq, i) => (
              <div
                key={i}
                className="border-b py-5 cursor-pointer"
                style={{ borderColor: BORDER }}
                onClick={() => setFaqOpen(faqOpen === i ? null : i)}
              >
                <div className="flex items-center justify-between gap-4">
                  <span className="font-semibold" style={{ color: TEXT_PRIMARY }}>{faq.q}</span>
                  <span className="text-lg font-bold shrink-0 transition-transform" style={{ color: faqOpen === i ? LIME : TEXT_MUTED }}>
                    {faqOpen === i ? "−" : "+"}
                  </span>
                </div>
                {faqOpen === i && <p className="mt-3 text-sm" style={{ color: TEXT_SECONDARY }}>{faq.a}</p>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ——— Section 11: Final CTA ——— */}
      <section className="py-32 px-6 text-center bg-[#fafafa]">
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ color: TEXT_PRIMARY }}>Start tracking smarter.</h2>
        <p className="text-lg mb-10" style={{ color: TEXT_SECONDARY }}>Free forever. 7-day Pro trial. Setup in 5 minutes.</p>
        <Link
          href="/dashboard/signup"
          className="inline-block px-10 py-4 rounded-full font-bold text-lg bg-[#0a0a0a] text-white hover:opacity-90 transition-opacity"
        >
          Get started for free
        </Link>
      </section>

      {/* ——— Section 12: Footer ——— */}
      <footer className="py-8 px-6 md:px-10 border-t bg-white" style={{ borderColor: BORDER }}>
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg">
                <span style={{ color: LIME }}>⚡</span>
                <span style={{ color: TEXT_PRIMARY }}> TrackHive</span>
              </span>
              <span className="text-sm" style={{ color: TEXT_MUTED }}>Built by Hassan Ahmed</span>
            </div>
            <div className="flex flex-wrap justify-center gap-4 text-sm" style={{ color: TEXT_MUTED }}>
              <Link href="/trackhive#features" className="hover:opacity-80 transition-opacity">Features</Link>
              <Link href="/trackhive#pricing" className="hover:opacity-80 transition-opacity">Pricing</Link>
              <Link href="/dashboard/templates" className="hover:opacity-80 transition-opacity">Templates</Link>
              <Link href="/privacy-policy" className="hover:opacity-80 transition-opacity">Privacy</Link>
              <Link href="/tos" className="hover:opacity-80 transition-opacity">Terms</Link>
            </div>
          </div>
          <p className="text-center text-sm" style={{ color: TEXT_MUTED }}>
            © 2025 TrackHive · itshassanahmed.com
          </p>
        </div>
      </footer>
    </div>
  )
}
