import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'TrackHive Docs — Setup and API Reference',
  description: 'TrackHive documentation for installation, event tracking setup, Meta CAPI, and API usage.'
}

export default function DocsLayout({ children }: { children: ReactNode }) {
  return children
}
