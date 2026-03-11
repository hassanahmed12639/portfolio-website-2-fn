'use client'

import { useEffect, Suspense } from 'react'
import { useSearchParams, usePathname } from 'next/navigation'
import { generateEventId } from '@/lib/meta-pixel'

function PixelCaptureInner() {
  const searchParams = useSearchParams()
  const pathname = usePathname()

  useEffect(() => {
    // STEP 1 — Capture fbclid from URL immediately
    const fbclid = searchParams.get('fbclid')
    let fbcCaptured: string | null = null
    if (fbclid) {
      fbcCaptured = `fb.1.${Date.now()}.${fbclid}`
      document.cookie = `_fbc=${fbcCaptured}; max-age=7776000; path=/; SameSite=Lax`
      sessionStorage.setItem('_fbc', fbcCaptured)
    }

    // STEP 2 — Wait for pixel to set _fbp then store it
    setTimeout(() => {
      const fbpMatch = document.cookie.match(/_fbp=([^;]+)/)
      if (fbpMatch) sessionStorage.setItem('_fbp', fbpMatch[1])
    }, 1500)

    // STEP 3 — Generate eventId and set on window for pixel deduplication
    const eventId = generateEventId('PageView')
    if (typeof window !== 'undefined') {
      (window as unknown as { __metaPageViewId?: string }).__metaPageViewId = eventId
    }

    // STEP 4 — Send PageView to CAPI after short delay
    const timer = setTimeout(() => {
      const fbcMatch = document.cookie.match(/_fbc=([^;]+)/)
      const fbpMatch2 = document.cookie.match(/_fbp=([^;]+)/)

      // Use freshly captured fbc if fbclid was in URL
      const fbc = fbcCaptured ?? (fbcMatch ? fbcMatch[1] : sessionStorage.getItem('_fbc'))
      const fbp = fbpMatch2 ? fbpMatch2[1] : sessionStorage.getItem('_fbp')

      fetch('/api/track/meta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_name: 'PageView',
          event_source_url: window.location.href,
          event_id: eventId,
          user_data: {
            fbc: fbc || undefined,
            fbp: fbp || undefined,
          },
          custom_data: {},
        }),
      }).catch(() => {})
    }, 500)

    return () => clearTimeout(timer)
  }, [pathname, searchParams])

  return null
}

export default function MetaPixelCapture() {
  return (
    <Suspense fallback={null}>
      <PixelCaptureInner />
    </Suspense>
  )
}
