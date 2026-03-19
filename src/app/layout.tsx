import type { Metadata, Viewport } from 'next'
import { headers } from 'next/headers'
import './globals.css'
import '@/lib/mouseStore'
import TrackHivePixel from '@/components/TrackHivePixel'
import MetaPixelCapture from '@/components/MetaPixelCapture'
import MetaDomainVerification from '@/components/MetaDomainVerification'
import { ThemeProvider } from '@/components/ThemeProvider'
import GsapInit from '@/components/GsapInit'
import PreloaderWrapper from '@/components/PreloaderWrapper'
import { getBrandNameForHost, isTrackHiveHost } from '@/lib/domain-brand'

export async function generateMetadata(): Promise<Metadata> {
  const headersList = await headers()
  const host = headersList.get('host') ?? headersList.get('x-forwarded-host') ?? ''
  const isTrackDomain = isTrackHiveHost(host)
  const brandName = getBrandNameForHost(host)

  return {
    metadataBase: new URL(isTrackDomain ? 'https://track.itshassanahmed.com' : 'https://itshassanahmed.com'),
    alternates: {
      canonical: '/',
    },
    title: brandName,
    description: 'A production-ready Next.js portfolio starter with GSAP animations',
    ...(isTrackDomain && {
      icons: {
        icon: [{ url: '/logo-new-1.png', type: 'image/png' }],
      },
    }),
  }
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

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const headersList = await headers()
  const host = headersList.get('host') ?? headersList.get('x-forwarded-host') ?? ''
  const isTrackDomain = isTrackHiveHost(host)

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {isTrackDomain && (
          <link rel="icon" href="/logo-new-1.png" type="image/png" />
        )}
        <meta
          name="google-site-verification"
          content="EWMl3iYHe0Ccf67EQ-MwhClivAY1DUTy8HM5ijTPU5Q"
        />
        {isTrackDomain && (
          <meta name="facebook-domain-verification" content="y9y0m56tti3g4oz18qf8ko1sio2wvk" />
        )}
        {isTrackDomain && (
          <script
            dangerouslySetInnerHTML={{
              __html: `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '1567554294333336');
fbq('track', 'PageView');`,
            }}
          />
        )}
        {isTrackDomain && (
          <noscript>
            <img
              height="1"
              width="1"
              style={{ display: 'none' }}
              src="https://www.facebook.com/tr?id=1567554294333336&ev=PageView&noscript=1"
              alt=""
            />
          </noscript>
        )}
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="m-0 p-0 bg-background text-foreground" style={{ fontFamily: "'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, 'Helvetica Neue', Arial, sans-serif" }}>
        <ThemeProvider>
          <div className="relative z-[1]">
            <PreloaderWrapper />
            <GsapInit />
            {children}
          </div>
          <TrackHivePixel />
          <MetaPixelCapture />
          <MetaDomainVerification />
        </ThemeProvider>
      </body>
    </html>
  )
}
