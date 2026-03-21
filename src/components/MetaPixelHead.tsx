'use client'

import Script from 'next/script'
import { useState, useEffect } from 'react'

const META_PIXEL_ID = '1567554294333336'

export default function MetaPixelHead() {
  const [shouldRender, setShouldRender] = useState(false)

  useEffect(() => {
    const host = typeof window !== 'undefined' ? window.location.hostname : ''
    // Pixel is in layout head for track.itshassanahmed.com — only render for localhost
    if (host === 'localhost') {
      setShouldRender(true)
    }
  }, [])

  if (!shouldRender) return null

  // Noscript omitted - it causes React hydration/removeChild conflicts when in the tree
  return (
    <Script id="meta-pixel" strategy="lazyOnload">
      {`!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${META_PIXEL_ID}');
fbq('track', 'PageView');`}
    </Script>
  )
}
