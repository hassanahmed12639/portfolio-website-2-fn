'use client'

import { usePathname } from 'next/navigation'
import TrackHivePixel from '@/components/TrackHivePixel'
import MetaPixelHead from '@/components/MetaPixelHead'
import MetaDomainVerification from '@/components/MetaDomainVerification'

/** Paths where third-party scripts (pixels, PayPal) cause React removeChild conflicts - skip tracking */
const SKIP_TRACKING_PATHS = ['/billing']

export default function TrackingWrapper() {
  const pathname = usePathname()
  const skipTracking = pathname && SKIP_TRACKING_PATHS.some((p) => pathname === p || pathname.startsWith(p + '/'))

  if (skipTracking) return null

  return (
    <>
      <TrackHivePixel />
      <MetaPixelHead />
      <MetaDomainVerification />
    </>
  )
}
