"use client"

import { useState } from "react"
import Link from "next/link"
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"

const SNIPPET = `<script>window.TRACKHIVE_KEY = "your-key";</script>
<script src="https://track.itshassanahmed.com/th.js" async></script>`

const SIDEBAR_SECTIONS = [
  {
    title: "Getting Started",
    items: [
      { id: "quick-start", label: "Quick Start" },
      { id: "installation", label: "Installation" },
      { id: "first-event", label: "First Event" },
    ],
  },
  {
    title: "Meta CAPI",
    items: [
      { id: "meta-setup", label: "Setup Guide" },
      { id: "meta-params", label: "Event Parameters" },
      { id: "match-rate", label: "Match Rate Guide" },
      { id: "test-events", label: "Test Events" },
    ],
  },
  {
    title: "Other Platforms",
    items: [
      { id: "google", label: "Google Enhanced" },
      { id: "tiktok", label: "TikTok Events API" },
      { id: "snapchat", label: "Snapchat CAPI" },
    ],
  },
  {
    title: "Advanced",
    items: [
      { id: "multi-pixel", label: "Multi-Pixel" },
      { id: "dedup", label: "Deduplication" },
      { id: "replay", label: "Event Replay" },
      { id: "validator", label: "Payload Validator" },
    ],
  },
  {
    title: "API Reference",
    items: [
      { id: "auth", label: "Authentication" },
      { id: "send-event", label: "Send Event" },
      { id: "schema", label: "Event Schema" },
    ],
  },
]

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("quick-start")

  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: "#0f172a" }}>
      <TrackHiveNavbar />

      <div className="pt-24 flex flex-col lg:flex-row min-h-[calc(100vh-4rem)]">
        {/* Mobile section selector */}
        <div className="lg:hidden px-6 py-4 border-b" style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}>
          <select
            value={activeSection}
            onChange={(e) => setActiveSection(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border text-sm font-medium"
            style={{ borderColor: "#e2e8f0", color: "#0f172a" }}
          >
            {SIDEBAR_SECTIONS.flatMap((s) =>
              s.items.map((item) => (
                <option key={item.id} value={item.id}>
                  {s.title} → {item.label}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Sidebar */}
        <aside
          className="hidden lg:block w-64 shrink-0 border-r overflow-y-auto py-8"
          style={{ borderColor: "#e2e8f0", backgroundColor: "#f8fafc" }}
        >
          <nav className="px-6 space-y-8">
            {SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title}>
                <p
                  className="text-xs font-bold uppercase tracking-widest mb-3"
                  style={{ color: "#94a3b8" }}
                >
                  {section.title}
                </p>
                <ul className="space-y-1">
                  {section.items.map((item) => (
                    <li key={item.id}>
                      <button
                        onClick={() => setActiveSection(item.id)}
                        className={`block w-full text-left text-sm py-2 px-3 rounded-lg transition-colors ${
                          activeSection === item.id
                            ? "font-medium"
                            : "hover:bg-white"
                        }`}
                        style={{
                          color: activeSection === item.id ? "#2563eb" : "#475569",
                          backgroundColor: activeSection === item.id ? "#eff6ff" : "transparent",
                        }}
                      >
                        {item.label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 overflow-y-auto py-12 px-6 md:px-12">
          <div className="max-w-3xl">
            {activeSection === "quick-start" && (
              <article>
                <h1 className="text-4xl font-extrabold mb-6" style={{ color: "#0f172a" }}>
                  Quick Start Guide
                </h1>
                <p className="text-lg mb-10" style={{ color: "#475569" }}>
                  Get TrackHive sending events in under 5 minutes.
                </p>

                <div className="space-y-10">
                  <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#0f172a" }}>
                      Step 1 — Create your account
                    </h2>
                    <p className="mb-4" style={{ color: "#475569" }}>
                      Sign up at trackhive.io and verify your email.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#0f172a" }}>
                      Step 2 — Add your Meta Pixel
                    </h2>
                    <p className="mb-4" style={{ color: "#475569" }}>
                      Go to Integrations → Meta CAPI → Add your Pixel ID and Access Token.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#0f172a" }}>
                      Step 3 — Install the tracking snippet
                    </h2>
                    <p className="mb-4" style={{ color: "#475569" }}>
                      Go to Setup & Snippet → copy your unique snippet → paste before{" "}
                      <code className="px-1.5 py-0.5 rounded text-sm bg-slate-100">&lt;/head&gt;</code>{" "}
                      on your website.
                    </p>
                    <pre
                      className="rounded-xl p-4 text-sm font-mono overflow-x-auto"
                      style={{
                        backgroundColor: "#0f172a",
                        color: "#4ade80",
                      }}
                    >
                      {SNIPPET}
                    </pre>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#0f172a" }}>
                      Step 4 — Fire your first event
                    </h2>
                    <p className="mb-4" style={{ color: "#475569" }}>
                      Use the Playground to test → go to Meta Events Manager → verify event received.
                    </p>
                  </section>

                  <section>
                    <h2 className="text-2xl font-bold mb-4" style={{ color: "#0f172a" }}>
                      Step 5 — You&apos;re live!
                    </h2>
                    <p style={{ color: "#475569" }}>
                      TrackHive is now sending all your events server-side.
                    </p>
                  </section>
                </div>
              </article>
            )}

            {activeSection === "installation" && (
              <article>
                <h1 className="text-4xl font-extrabold mb-6" style={{ color: "#0f172a" }}>
                  Installation
                </h1>
                <p className="text-lg mb-8" style={{ color: "#475569" }}>
                  Add the TrackHive snippet to your website.
                </p>
                <pre
                  className="rounded-xl p-4 text-sm font-mono overflow-x-auto"
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#4ade80",
                  }}
                >
                  {SNIPPET}
                </pre>
                <p className="mt-6" style={{ color: "#475569" }}>
                  Replace <code className="px-1.5 py-0.5 rounded bg-slate-100">your-key</code> with
                  your project key from the dashboard.
                </p>
              </article>
            )}

            {activeSection === "first-event" && (
              <article>
                <h1 className="text-4xl font-extrabold mb-6" style={{ color: "#0f172a" }}>
                  First Event
                </h1>
                <p className="text-lg mb-8" style={{ color: "#475569" }}>
                  Fire your first server-side event using the Playground or dataLayer.
                </p>
                <pre
                  className="rounded-xl p-4 text-sm font-mono overflow-x-auto"
                  style={{
                    backgroundColor: "#0f172a",
                    color: "#4ade80",
                  }}
                >
{`dataLayer.push({
  event: 'purchase',
  value: 99.99,
  currency: 'USD',
  transaction_id: 'T12345'
});`}
                </pre>
              </article>
            )}

            {activeSection !== "quick-start" &&
              activeSection !== "installation" &&
              activeSection !== "first-event" && (
                <article>
                  <h1 className="text-4xl font-extrabold mb-6" style={{ color: "#0f172a" }}>
                    {SIDEBAR_SECTIONS.flatMap((s) => s.items)
                      .find((i) => i.id === activeSection)
                      ?.label ?? "Documentation"}
                  </h1>
                  <p style={{ color: "#475569" }}>
                    This section is coming soon. Use the Quick Start guide to get started.
                  </p>
                  <Link
                    href="/docs#quick-start"
                    className="inline-block mt-6 font-semibold"
                    style={{ color: "#2563eb" }}
                    onClick={() => setActiveSection("quick-start")}
                  >
                    ← Back to Quick Start
                  </Link>
                </article>
              )}
          </div>
        </main>
      </div>

      <TrackHiveFooter />
    </div>
  )
}
