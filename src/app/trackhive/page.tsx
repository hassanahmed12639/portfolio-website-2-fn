import Link from "next/link"
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

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
    <div className="min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      {/* Hero - Clause style: grid bg, tagline, headline with underlines, CTAs, floating avatars, partners */}
      <section
        className="pt-28 pb-20 relative overflow-hidden"
        style={{
          background: "#fafafa",
          backgroundImage: "linear-gradient(rgba(226,232,240,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(226,232,240,0.15) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      >
        <div className="max-w-5xl mx-auto px-6 text-center relative">
          {/* Tagline with lightning */}
          <div className="inline-flex items-center gap-2 text-sm font-semibold mb-6" style={{ color: "#475569" }}>
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" /></svg>
            TRACK FOR FAST
          </div>
          {/* Headline with underlined words */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 max-w-4xl mx-auto" style={{ color: "#0f172a" }}>
            One tool to{" "}
            <span className="relative inline-block">
              track
              <span className="absolute bottom-1 left-0 w-full h-2 -z-10" style={{ backgroundColor: "#93c5fd" }} />
            </span>{" "}
            conversions and your{" "}
            <span className="relative inline-block">
              ads.
              <span className="absolute bottom-1 left-0 w-full h-2 -z-10" style={{ backgroundColor: "#93c5fd" }} />
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: "#475569" }}>
            TrackHive helps marketing teams work faster and smarter, delivering server-side events to Meta, Google, TikTok and Snapchat—so you get the visibility and match rates you need.
          </p>
          <div className="flex items-center justify-center gap-4 mb-16 flex-wrap">
            <Link
              href="/dashboard/signup"
              className="font-semibold px-8 py-3.5 rounded-xl text-base transition-all text-white"
              style={{ backgroundColor: "#1d4ed8" }}
            >
              Start for Free
            </Link>
            <Link
              href="/features"
              className="font-semibold px-8 py-3.5 rounded-xl text-base border transition-colors bg-white hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
            >
              Get a Demo
            </Link>
          </div>

          {/* Floating profile circles - decorative */}
          <div className="absolute top-20 left-4 md:left-12 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow">
            <span className="text-xs font-bold" style={{ color: "#475569" }}>A</span>
          </div>
          <div className="absolute top-24 right-4 md:right-16 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow">
            <span className="text-xs font-bold" style={{ color: "#475569" }}>B</span>
          </div>
          <div className="absolute bottom-32 left-8 md:left-24 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow">
            <span className="text-xs font-bold" style={{ color: "#475569" }}>C</span>
          </div>
          <div className="absolute bottom-28 right-8 md:right-24 w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow">
            <span className="text-xs font-bold" style={{ color: "#475569" }}>D</span>
          </div>
        </div>

        {/* Partner logos */}
        <div className="max-w-4xl mx-auto px-6 pt-12 border-t" style={{ borderColor: "#e2e8f0" }}>
          <p className="text-sm mb-6" style={{ color: "#64748b" }}>
            Trusted by performance marketers worldwide.
          </p>
          <div className="flex items-center justify-center gap-8 md:gap-12 flex-wrap">
            {PARTNERS.map((name) => (
              <span key={name} className="font-semibold text-base" style={{ color: "#94a3b8" }}>
                {name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features - Clause style: FEATURES tag, title, 4-block grid */}
      <section id="features" className="py-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <div
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold mb-6"
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
              style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
              style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
              style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
              style={{ borderColor: "#e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
      <section id="integrations" className="py-24 relative">
        <div
          className="max-w-6xl mx-auto px-6 rounded-3xl p-12 md:p-16"
          style={{
            backgroundColor: "#0f172a",
            backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        >
          <div className="text-center mb-12">
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
                className="w-24 h-24 rounded-2xl bg-white flex items-center justify-center p-4 shadow-sm overflow-hidden"
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
      <section className="py-24 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center mb-20">
          <p className="text-6xl md:text-7xl font-serif leading-none mb-6" style={{ color: "#1d4ed8" }}>&ldquo;</p>
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
          className="max-w-4xl mx-auto px-6 rounded-2xl p-8 md:p-12"
          style={{ backgroundColor: "#f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}
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
      <section className="py-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
            Simple pricing.
          </h2>
          <p className="text-lg mb-16" style={{ color: "#475569" }}>
            No hidden fees. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="rounded-2xl border p-8 text-left bg-white" style={{ borderColor: "#e2e8f0" }}>
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>Free</p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>$0<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span></p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>Perfect to get started</p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}><li>✅ 1,000 events/month</li><li>✅ Meta CAPI</li><li>✅ 1 pixel</li><li>✅ Basic analytics</li></ul>
              <Link href="/dashboard/signup" className="block text-center font-semibold py-2.5 rounded-lg transition-colors bg-slate-100" style={{ color: "#1e293b" }}>Start for free</Link>
            </div>
            <div className="rounded-2xl p-8 text-left shadow-xl relative" style={{ backgroundColor: "#1d4ed8", boxShadow: "0 25px 50px -12px rgba(29,78,216,0.25)" }}>
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full bg-amber-400" style={{ color: "#78350f" }}>MOST POPULAR</span>
              <p className="font-bold text-lg mb-1 text-white">Pro</p>
              <p className="text-4xl font-extrabold mb-1 text-white">$10<span className="text-base font-normal text-blue-200">/mo</span></p>
              <p className="text-sm mb-6 text-blue-200">For growing businesses</p>
              <ul className="space-y-3 text-sm mb-8 text-blue-100"><li>✅ 50,000 events/month</li><li>✅ All platforms</li><li>✅ 3 pixels</li><li>✅ AI Analysis</li><li>✅ Email alerts</li><li>✅ Priority support</li></ul>
              <Link href="/billing" className="block text-center bg-white font-semibold py-2.5 rounded-lg transition-colors hover:bg-blue-50 text-blue-600">Upgrade to Pro</Link>
            </div>
            <div className="rounded-2xl border p-8 text-left bg-white" style={{ borderColor: "#e2e8f0" }}>
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>Agency</p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>$25<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span></p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>For agencies and teams</p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}><li>✅ Unlimited events</li><li>✅ All platforms</li><li>✅ 10 pixels</li><li>✅ Everything in Pro</li><li>✅ White label</li><li>✅ Dedicated support</li></ul>
              <Link href="/dashboard/signup" className="block text-center font-semibold py-2.5 rounded-lg bg-slate-100 transition-colors" style={{ color: "#1e293b" }}>Start for free</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA - dark strip: Discover full scale... + Get a Demo / Start for Free */}
      <section className="py-20" style={{ backgroundColor: "#1e3a5f" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
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
