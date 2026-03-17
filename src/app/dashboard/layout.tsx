export const dynamic = 'force-dynamic'

import type { Metadata } from 'next'
import './dashboard-theme.css'

export const metadata: Metadata = {
  title: {
    default: 'TrackHive',
    template: '%s | TrackHive',
  },
  icons: {
    icon: [{ url: '/logo-new-1.png', type: 'image/png' }],
    shortcut: ['/logo-new-1.png'],
    apple: ['/logo-new-1.png'],
  },
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}




