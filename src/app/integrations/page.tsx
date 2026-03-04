import Link from "next/link"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

export const metadata: Metadata = {
  title: 'TrackHive Integrations — Meta, Google, TikTok, Snapchat',
  description: 'Connect TrackHive with ad platforms, GTM, and e-commerce stacks to send reliable server-side conversion events.',
}

const INTEGRATION_GROUPS = [
  {
    title: "Ad Platforms",
    items: [
      { name: "Meta CAPI", description: "Conversions API for Facebook & Instagram ads", icon: "📘", status: "Live" },
      { name: "Google Enhanced Conversions", description: "Server-side conversion tracking for Google Ads", icon: "🔍", status: "Live" },
      { name: "TikTok Events API", description: "Server-side events for TikTok Ads", icon: "🎵", status: "Live" },
      { name: "Snapchat CAPI", description: "Conversions API for Snapchat Ads", icon: "👻", status: "Live" },
      { name: "Pinterest", description: "Conversions API for Pinterest Ads", icon: "📌", status: "Coming Soon" },
    ],
  },
  {
    title: "Tag Managers",
    items: [
      { name: "Google Tag Manager", description: "Client-side GTM integration", icon: "📦", status: "Live" },
      { name: "Server-side GTM", description: "Server-side tag manager support", icon: "🖥️", status: "Live" },
    ],
  },
  {
    title: "E-commerce",
    items: [
      { name: "Shopify", description: "Native Shopify integration", icon: "🛒", status: "Live" },
      { name: "WooCommerce", description: "WordPress / WooCommerce plugin", icon: "🛍️", status: "Live" },
      { name: "Custom (API)", description: "REST API for any platform", icon: "⚙️", status: "Live" },
    ],
  },
]

export default function IntegrationsPage() {
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
            Connect everything.
          </h1>
          <p className="text-xl" style={{ color: "#475569" }}>
            TrackHive works with every major ad platform and e-commerce stack.
          </p>
        </div>
      </section>

      {/* Integration cards */}
      <section className="py-16 md:py-24">
        <div className="max-w-5xl mx-auto px-6 space-y-16">
          {INTEGRATION_GROUPS.map((group) => (
            <div key={group.title}>
              <h2
                className="text-xl font-bold mb-8"
                style={{ color: "#0f172a" }}
              >
                {group.title}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {group.items.map((item) => (
                  <div
                    key={item.name}
                    className="rounded-xl border p-6 flex items-center gap-4 bg-white"
                    style={{
                      borderColor: "#e2e8f0",
                      boxShadow: "0 1px 3px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.04)",
                    }}
                  >
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                      style={{ backgroundColor: "#eff6ff" }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold" style={{ color: "#0f172a" }}>
                        {item.name}
                      </p>
                      <p className="text-sm truncate" style={{ color: "#475569" }}>
                        {item.description}
                      </p>
                    </div>
                    <span
                      className="ml-auto shrink-0 text-xs font-semibold px-2 py-1 rounded-full"
                      style={{
                        color: item.status === "Live" ? "#16a34a" : "#d97706",
                        backgroundColor: item.status === "Live" ? "#dcfce7" : "#fef3c7",
                      }}
                    >
                      {item.status === "Live" ? "Live ✅" : "Coming Soon"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-24" style={{ backgroundColor: "#2563eb" }}>
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4">
            Ready to connect your stack?
          </h2>
          <p className="text-lg text-blue-200 mb-8">
            Get started in 5 minutes. No credit card required.
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
