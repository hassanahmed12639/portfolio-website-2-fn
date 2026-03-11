import type { Metadata } from "next"

export const metadata: Metadata = {
  metadataBase: new URL('https://track.itshassanahmed.com'),
  alternates: {
    canonical: '/',
  },
  title: "TrackHive — AI-Powered Server-Side Tracking",
  description:
    "Stop losing 30-40% of conversions to ad blockers and iOS. Server-side events to Meta CAPI, Google, TikTok, Snapchat. AI analysis that tells you what's broken.",
}

export default function TrackHiveLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>
      {children}
    </div>
  )
}
