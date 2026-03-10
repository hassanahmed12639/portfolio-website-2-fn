export const dynamic = 'force-dynamic'

import Link from "next/link"

const BORDER = "#e5e5e5"
const TEXT_PRIMARY = "#0a0a0a"
const TEXT_SECONDARY = "#666666"
const TEXT_MUTED = "#999999"
const LIME = "#aaff00"

const SECTIONS = [
  {
    title: "What We Collect",
    content: "We collect your API keys and access tokens (for Meta, Google, TikTok, Snapchat), your account email, event data (event name, value, parameters) that you send through TrackHive, and IP addresses for request logging and security.",
  },
  {
    title: "How We Use It",
    content: "We use your data to forward events server-side to Meta CAPI, Google Enhanced Conversions, TikTok Events API, and Snapchat Conversions API. We also use it to improve our service, debug issues, and provide AI analysis of your tracking.",
  },
  {
    title: "Data Storage",
    content: "Data is stored in Supabase. Sensitive fields are encrypted at rest. Our database and application run on US-based servers (Vercel and Supabase).",
  },
  {
    title: "Data Retention",
    content: "Event and log data are retained for 90 days by default. Retention is user-configurable in dashboard settings. You can request shorter or longer retention within plan limits.",
  },
  {
    title: "PII Handling",
    content: "Email addresses and phone numbers sent for matching (e.g. to ad platforms) are hashed with SHA-256 before storage or forwarding. We do not store raw PII. We only pass hashed or tokenized data to third-party ad platforms as required for conversion matching.",
  },
  {
    title: "Your Rights",
    content: "You can request deletion of your account and associated data, export of your data in a portable format, and update your account and integration settings at any time from the dashboard or by contacting us.",
  },
  {
    title: "Cookies",
    content: "We use server-side cookies to support our cookie extender feature and to maintain session state for the tracking script. These are first-party cookies set by our infrastructure when serving requests on your behalf.",
  },
  {
    title: "Third Parties",
    content: "We share data only as necessary with: Meta (Conversions API), Google (Enhanced Conversions), TikTok (Events API), Snapchat (Conversions API), Supabase (database and auth), and Vercel (hosting). Each has their own privacy policy governing their use of data.",
  },
  {
    title: "Contact",
    content: "For privacy-related requests or questions, contact hassan@itshassanahmed.com.",
  },
]

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-white text-[#0a0a0a] font-sans antialiased">
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

      <main className="max-w-2xl mx-auto px-6 md:px-10 py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-2" style={{ color: TEXT_PRIMARY }}>
          Privacy Policy
        </h1>
        <p className="text-sm mb-12" style={{ color: TEXT_MUTED }}>
          Last updated: February 2025
        </p>

        <div className="space-y-10">
          {SECTIONS.map((section, i) => (
            <section key={i}>
              <h2 className="text-lg font-bold mb-3" style={{ color: TEXT_PRIMARY }}>
                {section.title}
              </h2>
              <p className="text-sm leading-relaxed" style={{ color: TEXT_SECONDARY }}>
                {section.content}
              </p>
            </section>
          ))}
        </div>
      </main>

      <footer className="py-8 px-6 md:px-10 border-t bg-white mt-20" style={{ borderColor: BORDER }}>
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
