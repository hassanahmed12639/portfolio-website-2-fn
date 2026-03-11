export const dynamic = 'force-dynamic'

import { TrackHiveCTASection } from "@/components/trackhive/TrackHiveCTASection"
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
      { name: "Meta CAPI", description: "Conversions API for Facebook & Instagram ads", badge: { letter: "M", bg: "bg-white", icon: "/landing-meta.png" }, status: "Live" },
      { name: "Google Enhanced Conversions", description: "Server-side conversion tracking for Google Ads", badge: { letter: "G", bg: "bg-white", icon: "/landing-google-ads.png" }, status: "Live" },
      { name: "TikTok Events API", description: "Server-side events for TikTok Ads", badge: { letter: "TT", bg: "bg-white", icon: "/landing-tiktok-ads.png" }, status: "Live" },
    ],
  },
  {
    title: "Tag Managers",
    items: [
      { name: "Google Tag Manager", description: "Client-side GTM integration", badge: { letter: "GTM", bg: "bg-white", icon: "/landing-gtm.png" }, status: "Live" },
      { name: "Server-side GTM", description: "Server-side tag manager support", badge: { letter: "sGTM", bg: "bg-white", icon: "/landing-gtm.png" }, status: "Live" },
    ],
  },
  {
    title: "E-commerce",
    items: [
      { name: "Shopify", description: "Native Shopify integration", badge: { letter: "S", bg: "bg-white", icon: "/landing-shopify-ads.png" }, status: "Live" },
      { name: "WooCommerce", description: "WordPress / WooCommerce plugin", badge: { letter: "W", bg: "bg-white", icon: "/woo-com.png" }, status: "Live" },
      { name: "Custom (API)", description: "REST API for any platform", badge: { letter: "API", bg: "bg-white", icon: "/rest.png" }, status: "Live" },
    ],
  },
]

export default function IntegrationsPage() {
  return (
    <div className="trackhive-flow font-sans min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
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
                      className={`w-16 h-16 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${item.badge.bg}`}
                    >
                      {"icon" in item.badge && item.badge.icon ? (
                        <img src={item.badge.icon} alt="" className="w-full h-full max-w-full max-h-full object-contain" />
                      ) : (
                        <span className="text-white text-xs font-bold">{item.badge.letter}</span>
                      )}
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
                      {item.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <TrackHiveCTASection
        title="Ready to connect your stack?"
        description="Get started in 5 minutes. No credit card required."
        buttonText="Start for free →"
      />

      <TrackHiveFooter />
    </div>
  )
}
