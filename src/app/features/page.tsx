import Link from "next/link"
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

const FEATURE_SECTIONS = [
  {
    id: "server-side",
    tag: "CORE",
    title: "Server-Side Tracking",
    subtitle: "Meta CAPI, Google, TikTok, Snapchat",
    icon: "🌐",
    desc: "Send your conversion events directly from your server to ad platforms. Bypass ad blockers, browser restrictions, and iOS privacy limits.",
    bullets: [
      "Meta Conversions API with 85%+ match rates",
      "Google Enhanced Conversions",
      "TikTok Events API",
      "Snapchat Conversions API",
      "Advanced SHA-256 data hashing",
      "Automatic event deduplication",
    ],
  },
  {
    id: "data-quality",
    tag: "ACCURACY",
    title: "Data Quality",
    subtitle: "Truth Score™, Match Rate, Payload Validator",
    icon: "📊",
    desc: "Know exactly how accurate your tracking data is. Our proprietary Truth Score™ gives you a single metric for data quality across all platforms.",
    bullets: [
      "Truth Score™ — 0-100 accuracy metric",
      "Real-time match rate monitoring",
      "Payload validator catches errors before send",
      "Data quality dashboard with recommendations",
      "UTM parameter cleaning",
      "Attribution analysis",
    ],
  },
  {
    id: "reliability",
    tag: "RELIABILITY",
    title: "Reliability",
    subtitle: "Event Replay, Auto Retry, Deduplication",
    icon: "🔄",
    desc: "Never lose a conversion. Failed events are automatically retried. Duplicates are suppressed. Your data flows reliably, 24/7.",
    bullets: [
      "Automatic event retry on failure",
      "Retry queue with manual requeue",
      "Smart deduplication (event_id)",
      "Failed event replay from logs",
      "99.9% delivery guarantee",
      "Real-time delivery status",
    ],
  },
  {
    id: "intelligence",
    tag: "AI POWERED",
    title: "Intelligence",
    subtitle: "AI Analysis, Anomaly Detection, Alerts",
    icon: "⚡",
    desc: "AI finds gaps in your tracking automatically. Get alerts in 30 seconds when something breaks. Fix issues before they cost you conversions.",
    bullets: [
      "AI Analysis — finds missing events & suggests fixes",
      "Anomaly detection — volume drops, tracking breaks",
      "Email & webhook alerts",
      "Automated UTM cleaner",
      "Attribution scoring",
      "Health score dashboard",
    ],
  },
  {
    id: "privacy",
    tag: "PRIVACY",
    title: "Privacy & Compliance",
    subtitle: "Cookie Extender, Reverse Proxy, GDPR",
    icon: "🔒",
    desc: "Extend cookie windows from 7 days to 180 days. Serve tracking scripts from your own domain. Built-in GDPR tools and consent management.",
    bullets: [
      "Cookie Extender — 7 days → 180 days",
      "Reverse proxy — first-party domain serving",
      "GDPR auto-cleanup",
      "PII hashing (SHA-256)",
      "Data deletion requests",
      "Consent mode support",
    ],
  },
  {
    id: "agency",
    tag: "AGENCY TOOLS",
    title: "Agency Tools",
    subtitle: "Multi-Pixel, Templates, Raw Data",
    icon: "🎯",
    desc: "Manage multiple clients and pixels from one dashboard. 100+ ready-made GTM and sGTM templates. Export raw event data for custom analysis.",
    bullets: [
      "Multi-pixel support (up to 10 on Agency)",
      "100+ GTM and sGTM templates",
      "Raw data export",
      "White-label options (Agency plan)",
      "Workspace separation",
      "Bulk configuration",
    ],
  },
]

export default function FeaturesPage() {
  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      {/* Hero */}
      <section
        className="pt-32 pb-20"
        style={{ background: "linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 50%, #f8fafc 100%)" }}
      >
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4" style={{ color: "#0f172a" }}>
            Everything you need to track smarter.
          </h1>
          <p className="text-xl" style={{ color: "#475569" }}>
            Built by performance marketers for performance marketers.
          </p>
        </div>
      </section>

      {/* Feature sections */}
      <section className="py-16 md:py-24">
        <div className="max-w-4xl mx-auto px-6 space-y-24">
          {FEATURE_SECTIONS.map((section) => (
            <div
              key={section.id}
              className="flex flex-col md:flex-row gap-8 items-start"
            >
              <div
                className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style={{ backgroundColor: "#eff6ff" }}
              >
                {section.icon}
              </div>
              <div className="flex-1">
                <span
                  className="text-xs font-bold tracking-widest"
                  style={{ color: "#2563eb" }}
                >
                  {section.tag}
                </span>
                <h2 className="text-2xl md:text-3xl font-bold mt-2 mb-2" style={{ color: "#0f172a" }}>
                  {section.title}
                </h2>
                <p className="text-sm mb-4" style={{ color: "#2563eb" }}>
                  {section.subtitle}
                </p>
                <p className="text-base mb-6 leading-relaxed" style={{ color: "#475569" }}>
                  {section.desc}
                </p>
                <ul className="space-y-2">
                  {section.bullets.map((bullet, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-2 text-sm"
                      style={{ color: "#475569" }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{ backgroundColor: "#2563eb" }}
                      />
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-white border-t" style={{ borderColor: "#e2e8f0" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <p className="text-lg mb-6" style={{ color: "#475569" }}>
            Ready to recover your lost conversions?
          </p>
          <Link
            href="/dashboard/signup"
            className="inline-block font-semibold px-8 py-3 rounded-xl transition-colors text-white hover:opacity-90"
            style={{ backgroundColor: "#2563eb" }}
          >
            Start for free →
          </Link>
        </div>
      </section>

      <TrackHiveFooter />
    </div>
  )
}
