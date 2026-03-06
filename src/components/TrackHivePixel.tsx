'use client'

import Script from 'next/script'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function TrackHivePixel() {
  const [isTrackDomain, setIsTrackDomain] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    const hostname = window.location.hostname
    if (
      hostname.includes('track.itshassanahmed.com') ||
      hostname.includes('localhost')
    ) {
      setIsTrackDomain(true)
    }
  }, [])

  // PageView tracking on route changes
  useEffect(() => {
    if (!isTrackDomain) return
    if (typeof window === 'undefined') return

    if ((window as unknown as { fbq?: (a: string, b: string) => void }).fbq) {
      (window as unknown as { fbq: (a: string, b: string) => void }).fbq('track', 'PageView')
    }
    if ((window as unknown as { trackhive?: (a: string, b: string, c?: { event_source_url: string }) => void }).trackhive) {
      (window as unknown as { trackhive: (a: string, b: string, c?: { event_source_url: string }) => void }).trackhive('track', 'PageView', {
        event_source_url: window.location.href,
      })
    }
  }, [pathname, isTrackDomain])

  if (!isTrackDomain) return null

  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID
  if (!pixelId) return null

  return (
    <>
      {/* Meta Pixel Base Code */}
      <Script id="meta-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}');
          fbq('track', 'PageView');
        `}
      </Script>

      {/* TrackHive Server-Side Script */}
      <Script
        src={`https://track.itshassanahmed.com/th.js?id=${pixelId}`}
        strategy="afterInteractive"
      />
    </>
  )
}
