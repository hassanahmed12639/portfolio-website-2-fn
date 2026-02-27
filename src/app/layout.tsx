import type { Metadata, Viewport } from 'next'
import './globals.css'
import ChatWidget from '@/components/ChatWidget'
import { ThemeProvider } from '@/components/ThemeProvider'
import ThemeToggle from '@/components/ThemeToggle'
import ScrollToTop from '@/components/ScrollToTop'
import GsapInit from '@/components/GsapInit'

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
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="m-0 p-0 bg-background text-foreground">
        <ThemeProvider>
          <GsapInit />
          {children}
          <ThemeToggle />
          <ScrollToTop />
          <ChatWidget />
        </ThemeProvider>
      </body>
    </html>
  )
}
