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
      hostname.includes('itshassanahmed.com') ||
      hostname.includes('localhost')
    ) {
      setIsTrackDomain(true)
    }
  }, [])

  // PageView tracking on route changes (browser pixels + TrackHive server-side)
  useEffect(() => {
    if (!isTrackDomain) return
    if (typeof window === 'undefined') return

    // Meta PageView with eventID for deduplication with CAPI
    const pageViewId = (window as unknown as { __metaPageViewId?: string }).__metaPageViewId || `pv_${Date.now()}`
    if ((window as unknown as { fbq?: (a: string, b: string, c?: unknown, d?: { eventID?: string }) => void }).fbq) {
      (window as unknown as { fbq: (a: string, b: string, c?: unknown, d?: { eventID?: string }) => void }).fbq('track', 'PageView', {}, { eventID: pageViewId })
    }

    // TikTok PageView
    if ((window as unknown as { ttq?: { page: () => void } }).ttq) {
      (window as unknown as { ttq: { page: () => void } }).ttq.page()
    }

    // TrackHive server-side PageView
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
          fbq('track', 'PageView', {}, { eventID: (typeof window !== 'undefined' && window.__metaPageViewId) ? window.__metaPageViewId : ('pv_' + Date.now()) });
        `}
      </Script>

      {/* TikTok Pixel Base Code */}
      <Script id="tiktok-pixel" strategy="afterInteractive">
        {`
    !function (w, d, t) {
      w.TiktokAnalyticsObject=t;
      var ttq=w[t]=w[t]||[];
      ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie","holdConsent","revokeConsent","grantConsent"];
      ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
      for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
      ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
      ttq.load=function(e,n){
        var r="https://analytics.tiktok.com/i18n/pixel/events.js",o=n&&n.partner;
        ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=r,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};
        n=document.createElement("script");n.type="text/javascript",n.async=!0,n.src=r+"?sdkid="+e+"&lib="+t;
        e=document.getElementsByTagName("script")[0];e.parentNode.insertBefore(n,e)
      };
      ttq.load('${process.env.NEXT_PUBLIC_TIKTOK_PIXEL_ID || 'D6K5RJBC77U9T6VFJPK0'}');
      ttq.page();
    }(window, document, 'ttq');
  `}
      </Script>

      {/* TrackHive Server-Side Script */}
      <Script
        src={`https://track.itshassanahmed.com/th.js?id=${pixelId}`}
        strategy="afterInteractive"
      />

      {/* Cookie Lifetime Extender */}
      {isTrackDomain && (
        <img
          src="https://track.itshassanahmed.com/api/cookie/set?api_key=0efb5a00-a57e-4fa6-852f-0f144001b08d"
          width={1}
          height={1}
          alt=""
          style={{
            position: 'absolute',
            width: '1px',
            height: '1px',
            opacity: 0
          }}
        />
      )}
    </>
  )
}
