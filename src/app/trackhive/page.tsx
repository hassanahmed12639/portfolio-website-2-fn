import Link from "next/link"
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

const FEATURES = [
  { tag: "CORE FEATURE", title: "Meta CAPI Integration", desc: "Send purchase events server-side. Bypass every ad blocker. Achieve 85%+ match rates with advanced data hashing.", icon: "🌐" },
  { tag: "AI POWERED", title: "AI Analysis", desc: "Finds gaps in your tracking automatically and suggests optimizations for better attribution.", icon: "⚡" },
  { tag: "REAL-TIME", title: "Anomaly Detection", desc: "Alerts in 30 seconds when tracking breaks or conversion volume drops unexpectedly.", icon: "🛡️" },
  { tag: "PRIVACY FEATURES", title: "Cookie Extender & Reverse Proxy", desc: "Extend cookies from 7 days to 180 days. Serve tracking scripts from your own domain.", icon: "🔒" },
  { tag: "RELIABILITY", title: "Event Replay", desc: "Failed events retried automatically. Never lose a conversion due to server downtime.", icon: "🔄" },
  { tag: "DATA QUALITY", title: "Truth Score™", desc: "Know exactly how accurate your data is across all platforms with our proprietary scoring.", icon: "📊" },
  { tag: "TEMPLATES", title: "100+ Templates", desc: "Ready-made GTM and sGTM templates for every platform imaginable.", icon: "📋" },
  { tag: "MULTI-PIXEL", title: "Multi-Pixel Support", desc: "Send every event to multiple pixels simultaneously. Perfect for agencies managing multiple clients.", icon: "🎯" },
  { tag: "DEDUPLICATION", title: "Smart Deduplication", desc: "Automatically suppress duplicate events. Stop paying for the same conversion twice.", icon: "✅" },
]

const INTEGRATIONS = ["Meta", "Google", "TikTok", "Snapchat", "GTM", "Shopify", "WooCommerce"]

export default function TrackHivePage() {
  return (
    <div className="min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      {/* Section 1: Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
            style={{ backgroundColor: "#eff6ff", border: "1px solid #bfdbfe", color: "#1d4ed8" }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full animate-pulse"
              style={{ backgroundColor: "#3b82f6" }}
            />
            AI-POWERED SERVER-SIDE TRACKING
          </div>
          {/* Headline */}
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6" style={{ color: "#0f172a" }}>
            Stop losing conversions
            <br />
            <span style={{ color: "#2563eb" }}>to ad blockers.</span>
          </h1>
          {/* Subheadline */}
          <p className="text-xl max-w-2xl mx-auto mb-10" style={{ color: "#475569" }}>
            TrackHive sends your events server-side to Meta CAPI, Google, TikTok and Snapchat.
            Recover 30-40% of conversions you&apos;re currently losing.
          </p>
          {/* CTA buttons */}
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <Link
              href="/dashboard/signup"
              className="font-semibold px-8 py-3.5 rounded-xl text-base transition-all shadow-lg"
              style={{
                backgroundColor: "#2563eb",
                color: "#ffffff",
                boxShadow: "0 10px 40px -10px rgba(37, 99, 235, 0.4)",
              }}
            >
              Start for free →
            </Link>
            <Link
              href="/features"
              className="font-semibold px-8 py-3.5 rounded-xl text-base border transition-colors bg-white hover:bg-slate-50"
              style={{ borderColor: "#e2e8f0", color: "#334155" }}
            >
              See a demo
            </Link>
          </div>
          {/* Trust line */}
          <p className="text-sm" style={{ color: "#94a3b8" }}>
            Free forever • No credit card • 5 min setup
          </p>
        </div>

        {/* Dashboard preview card */}
        <div className="max-w-4xl mx-auto px-6 mt-16">
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: "#ffffff",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
              border: "1px solid #f1f5f9",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="text-xs ml-2" style={{ color: "#94a3b8" }}>
                trackhive.io/dashboard
              </span>
            </div>
            {/* Mini dashboard preview */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>
                  Total Events
                </p>
                <p className="text-2xl font-bold" style={{ color: "#2563eb" }}>1,247</p>
                <p className="text-xs mt-1" style={{ color: "#16a34a" }}>+12% this week</p>
              </div>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>
                  Match Rate
                </p>
                <p className="text-2xl font-bold" style={{ color: "#16a34a" }}>94%</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Optimal</p>
              </div>
              <div className="rounded-xl p-4 border" style={{ backgroundColor: "#f8fafc", borderColor: "#f1f5f9" }}>
                <p className="text-xs uppercase tracking-wide mb-1" style={{ color: "#94a3b8" }}>
                  Platforms
                </p>
                <p className="text-2xl font-bold" style={{ color: "#0f172a" }}>5</p>
                <p className="text-xs mt-1" style={{ color: "#94a3b8" }}>Active</p>
              </div>
            </div>
            {/* Mini bar chart */}
            <div className="flex items-end gap-1.5 h-16 mb-4">
              {[40, 55, 45, 65, 58, 72, 68, 80, 75, 90, 85, 95].map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-sm"
                  style={{
                    height: `${h}%`,
                    backgroundColor: i === 9 ? "#2563eb" : "#dbeafe",
                  }}
                />
              ))}
            </div>
            {/* Live event row */}
            <div
              className="flex items-center gap-3 rounded-lg px-4 py-2.5"
              style={{ backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}
            >
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm" style={{ color: "#334155" }}>
                Purchase — $99.99 — Meta CAPI —
              </span>
              <span className="text-sm font-medium" style={{ color: "#16a34a" }}>
                Delivered
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 2: Stats bar */}
      <section className="py-16 bg-white border-y" style={{ borderColor: "#f1f5f9" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
            <div>
              <p className="text-4xl font-extrabold mb-2" style={{ color: "#0f172a" }}>
                30-40%
              </p>
              <p className="text-sm mb-2" style={{ color: "#475569" }}>
                of conversions lost to ad blockers without server-side tracking
              </p>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#2563eb" }}>
                RECOVERABLE
              </span>
            </div>
            <div>
              <p className="text-4xl font-extrabold mb-2" style={{ color: "#0f172a" }}>
                85%+
              </p>
              <p className="text-sm mb-2" style={{ color: "#475569" }}>
                average match rate achieved with TrackHive CAPI
              </p>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#2563eb" }}>
                INDUSTRY LEADING
              </span>
            </div>
            <div>
              <p className="text-4xl font-extrabold mb-2" style={{ color: "#0f172a" }}>
                5 min
              </p>
              <p className="text-sm mb-2" style={{ color: "#475569" }}>
                average setup time from signup to first server-side event
              </p>
              <span className="text-xs font-semibold tracking-widest" style={{ color: "#2563eb" }}>
                QUICK SETUP
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Section 3: Features grid */}
      <section className="py-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
              Everything you need.
            </h2>
            <p className="text-lg" style={{ color: "#475569" }}>
              Built by performance marketers who were tired of broken tracking.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border p-6 hover:shadow-md transition-shadow bg-white"
                style={{ borderColor: "#f1f5f9", boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)" }}
              >
                <span className="text-xs font-bold tracking-widest" style={{ color: "#2563eb" }}>
                  {f.tag}
                </span>
                <h3 className="text-lg font-bold mt-2 mb-2" style={{ color: "#0f172a" }}>
                  {f.title}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                  {f.desc}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xl">{f.icon}</span>
                  <span className="text-xs font-semibold" style={{ color: "#16a34a" }}>
                    ACTIVE
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 4: Integrations logos */}
      <section className="py-20 bg-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-widest mb-8" style={{ color: "#94a3b8" }}>
            Works with every major platform
          </p>
          <div className="flex items-center justify-center gap-10 flex-wrap">
            {INTEGRATIONS.map((p) => (
              <span
                key={p}
                className="font-semibold text-lg transition-colors"
                style={{ color: "#94a3b8" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Section 5: Pricing preview */}
      <section className="py-24" style={{ backgroundColor: "#f8fafc" }}>
        <div className="max-w-5xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
            Simple pricing.
          </h2>
          <p className="text-lg mb-16" style={{ color: "#475569" }}>
            No hidden fees. Cancel anytime.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free */}
            <div
              className="rounded-2xl border p-8 text-left bg-white"
              style={{ borderColor: "#e2e8f0" }}
            >
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>
                Free
              </p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>
                $0<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span>
              </p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>
                Perfect to get started
              </p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}>
                <li>✅ 1,000 events/month</li>
                <li>✅ Meta CAPI</li>
                <li>✅ 1 pixel</li>
                <li>✅ Basic analytics</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block text-center font-semibold py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
              >
                Start for free
              </Link>
            </div>
            {/* Pro — highlighted */}
            <div
              className="rounded-2xl p-8 text-left shadow-xl relative"
              style={{ backgroundColor: "#2563eb", boxShadow: "0 25px 50px -12px rgba(37, 99, 235, 0.25)" }}
            >
              <span
                className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-bold px-3 py-1 rounded-full"
                style={{ backgroundColor: "#fbbf24", color: "#78350f" }}
              >
                MOST POPULAR
              </span>
              <p className="font-bold text-lg mb-1 text-white">Pro</p>
              <p className="text-4xl font-extrabold mb-1 text-white">
                $10<span className="text-base font-normal text-blue-200">/mo</span>
              </p>
              <p className="text-sm mb-6 text-blue-200">For growing businesses</p>
              <ul className="space-y-3 text-sm mb-8 text-blue-100">
                <li>✅ 50,000 events/month</li>
                <li>✅ All platforms</li>
                <li>✅ 3 pixels</li>
                <li>✅ AI Analysis</li>
                <li>✅ Email alerts</li>
                <li>✅ Priority support</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block text-center bg-white font-semibold py-2.5 rounded-lg transition-colors hover:bg-blue-50 text-blue-600"
              >
                Start for free
              </Link>
            </div>
            {/* Agency */}
            <div
              className="rounded-2xl border p-8 text-left bg-white"
              style={{ borderColor: "#e2e8f0" }}
            >
              <p className="font-bold text-lg mb-1" style={{ color: "#0f172a" }}>
                Agency
              </p>
              <p className="text-4xl font-extrabold mb-1" style={{ color: "#0f172a" }}>
                $25<span className="text-base font-normal" style={{ color: "#94a3b8" }}>/mo</span>
              </p>
              <p className="text-sm mb-6" style={{ color: "#475569" }}>
                For agencies and teams
              </p>
              <ul className="space-y-3 text-sm mb-8" style={{ color: "#475569" }}>
                <li>✅ Unlimited events</li>
                <li>✅ All platforms</li>
                <li>✅ 10 pixels</li>
                <li>✅ Everything in Pro</li>
                <li>✅ White label</li>
                <li>✅ Dedicated support</li>
              </ul>
              <Link
                href="/dashboard/signup"
                className="block text-center font-semibold py-2.5 rounded-lg transition-colors"
                style={{ backgroundColor: "#f1f5f9", color: "#1e293b" }}
              >
                Start for free
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Section 6: Final CTA */}
      <section className="py-24" style={{ backgroundColor: "#2563eb" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Start tracking smarter today.
          </h2>
          <p className="text-lg mb-10 text-blue-200">
            Join hundreds of marketers recovering lost conversions with TrackHive.
          </p>
          <Link
            href="/dashboard/signup"
            className="inline-block bg-white hover:bg-blue-50 font-bold px-10 py-4 rounded-xl text-lg transition-colors shadow-lg"
            style={{ color: "#2563eb" }}
          >
            Start for free →
          </Link>
          <p className="text-blue-300 text-sm mt-4">
            No credit card required • Free forever plan
          </p>
        </div>
      </section>

      <TrackHiveFooter />
    </div>
  )
}
