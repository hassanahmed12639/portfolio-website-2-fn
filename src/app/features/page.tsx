export const dynamic = 'force-dynamic'

import { TrackHiveCTASection } from "@/components/trackhive/TrackHiveCTASection"
import type { Metadata } from 'next'
import TrackHiveNavbar from "@/components/trackhive/Navbar"
import TrackHiveFooter from "@/components/trackhive/Footer"
import { FEATURE_SECTIONS } from "@/data/feature-sections"

export const metadata: Metadata = {
  title: 'TrackHive Features — CAPI, Retry Queue, Data Quality',
  description: 'Explore TrackHive features including Meta CAPI, deduplication, event replay, anomaly alerts, and privacy-safe server-side tracking.',
}

export default function FeaturesPage() {
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
                className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: "#eff6ff" }}
              >
                {section.id === "server-side" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                )}
                {section.id === "data-quality" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {section.id === "reliability" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                )}
                {section.id === "intelligence" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )}
                {section.id === "privacy" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )}
                {section.id === "agency" && (
                  <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
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

      <TrackHiveCTASection
        title="Ready to connect your stack?"
        description="Get started in 5 minutes. No credit card required."
        buttonText="Start for free →"
      />

      <TrackHiveFooter />
    </div>
  )
}
