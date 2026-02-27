import Link from "next/link"

const BORDER = "#e5e5e5"
const TEXT_PRIMARY = "#0a0a0a"
const TEXT_SECONDARY = "#666666"
const TEXT_MUTED = "#999999"
const LIME = "#aaff00"

const SECTIONS = [
  {
    title: "Acceptance of Terms",
    content: "By signing up for or using TrackHive, you agree to these Terms of Service. If you do not agree, do not use the service.",
  },
  {
    title: "Description of Service",
    content: "TrackHive is a server-side tracking tool that sends your conversion and event data to ad platforms (Meta, Google, TikTok, Snapchat) and analytics (e.g. GA4) via their server-side APIs. We also provide AI analysis, cookie extension, reverse proxy, and related features.",
  },
  {
    title: "User Responsibilities",
    content: "You are responsible for obtaining any required consent from your website visitors (e.g. under GDPR, CCPA, or other laws) before collecting or sending their data through TrackHive. You must provide accurate account and integration information and keep your API keys and credentials secure.",
  },
  {
    title: "Acceptable Use",
    content: "You may not use TrackHive for spam, fraudulent or illegal tracking, or to resell or sublicense the service without permission. You may not attempt to circumvent usage limits, abuse our infrastructure, or use the service in a way that harms others or violates applicable law.",
  },
  {
    title: "Payment Terms",
    content: "Free tier is limited to 500 events per month and specified features. Pro is $10/month with higher limits and full platform access. Agency is $25/month with unlimited events and multi-workspace support. Fees are billed in advance. Refunds are at our discretion for the first billing period.",
  },
  {
    title: "Data Processing",
    content: "You control your data. We process it on your behalf to deliver the service (forwarding events, running AI analysis, etc.). By using TrackHive you instruct us to process data as described in our Privacy Policy and in your dashboard settings.",
  },
  {
    title: "Limitation of Liability",
    content: "We are not responsible for changes to ad platform APIs, policies, or match rates. Our liability is limited to the amount you paid us in the 12 months before the claim. We are not liable for indirect, incidental, or consequential damages.",
  },
  {
    title: "Termination",
    content: "We may suspend or terminate your account for abuse, non-payment, or violation of these terms. You may cancel at any time from the dashboard. On termination, your access ends and we may delete your data after a reasonable retention period.",
  },
  {
    title: "Changes to Terms",
    content: "We may update these terms from time to time. We will notify you of material changes by email or a notice in the product. Continued use after the effective date constitutes acceptance.",
  },
  {
    title: "Contact",
    content: "For questions about these terms, contact hassan@itshassanahmed.com.",
  },
]

export default function TermsOfServicePage() {
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
          Terms of Service
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
