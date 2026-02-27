import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "TrackHive — AI-Powered Server-Side Tracking",
  description:
    "Stop losing 30-40% of conversions to ad blockers and iOS. Server-side events to Meta CAPI, Google, TikTok, Snapchat. AI analysis that tells you what's broken.",
}

export default function TrackHiveLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
