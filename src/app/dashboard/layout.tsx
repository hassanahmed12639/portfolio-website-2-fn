export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './dashboard-theme.css'

export const metadata: Metadata = {
  title: {
    default: 'TrackHive',
    template: '%s | TrackHive',
  },
  icons: {
    icon: [{ url: '/favicon-new.png', type: 'image/png' }],
    shortcut: ['/favicon-new.png'],
    apple: ['/favicon-new.png'],
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}




