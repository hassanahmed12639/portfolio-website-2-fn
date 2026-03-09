import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'
import ChatbotWrapper from '@/components/ChatbotWrapper'
import TrackHivePixel from '@/components/TrackHivePixel'
import MetaDomainVerification from '@/components/MetaDomainVerification'
import { ThemeProvider } from '@/components/ThemeProvider'
import GsapInit from '@/components/GsapInit'
import PreloaderWrapper from '@/components/PreloaderWrapper'

export const metadata: Metadata = {
  title: 'Next.js GSAP Portfolio',
  description: 'A production-ready Next.js portfolio starter with GSAP animations',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

const themeScript = `
(function() {
  try {
    var stored = localStorage.getItem('theme');
    var theme = (stored === 'light' || stored === 'dark') ? stored : 'dark';
    document.documentElement.classList.toggle('dark', theme === 'dark');
  } catch (e) {}
})();
`

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Geist:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
        <meta
          name="google-site-verification"
          content="EWMl3iYHe0Ccf67EQ-MwhClivAY1DUTy8HM5ijTPU5Q"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="m-0 p-0 bg-background text-foreground">
        <ThemeProvider>
          <PreloaderWrapper />
          <GsapInit />
          {children}
          <ChatWidget />
          <ChatbotWrapper />
          <TrackHivePixel />
          <MetaDomainVerification />
        </ThemeProvider>
      </body>
    </html>
  )
}
