import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'

export const metadata: Metadata = {
  title: 'Next.js GSAP Portfolio',
  description: 'A production-ready Next.js portfolio starter with GSAP animations',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="m-0 p-0">
        {children}
        <ChatWidget />
      </body>
    </html>
  )
}
