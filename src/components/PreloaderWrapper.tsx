'use client'

import { usePathname } from 'next/navigation'
import TrackHiveLoader from './TrackHiveLoader'

function shouldShowPreloader(pathname: string | null): boolean {
  if (!pathname) return false
  return (
    pathname === '/trackhive' ||
    pathname.startsWith('/trackhive/') ||
    pathname === '/dashboard' ||
    pathname.startsWith('/dashboard/')
  )
}

export default function PreloaderWrapper() {
  const pathname = usePathname()
  if (!shouldShowPreloader(pathname)) return null
  return <TrackHiveLoader />
}
