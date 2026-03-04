'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current

  const refreshSession = useCallback(async () => {
    const { data: { session }, error } = await supabase.auth.getSession()
    if (error || !session) return

    // If token expires in less than 10 minutes, refresh it
    const expiresAt = session.expires_at ?? 0
    const now = Math.floor(Date.now() / 1000)
    const timeUntilExpiry = expiresAt - now

    if (timeUntilExpiry < 600) {
      console.log('[Session] Refreshing token, expires in:', timeUntilExpiry, 'seconds')
      const { error: refreshError } = await supabase.auth.refreshSession()
      if (refreshError) {
        console.error('[Session] Refresh failed:', refreshError.message)
      } else {
        console.log('[Session] Token refreshed successfully')
      }
    }
  }, [supabase])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[Session] Auth event:', event)
      if (event === 'SIGNED_OUT') {
        router.push('/dashboard/login')
      }
      if (event === 'TOKEN_REFRESHED') {
        console.log('[Session] Token refreshed')
      }
    })

    refreshSession()
    const interval = setInterval(refreshSession, 4 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        console.log('[Session] Tab visible, checking session')
        refreshSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    let idleTimer: ReturnType<typeof setTimeout>
    const handleActivity = () => {
      clearTimeout(idleTimer)
      idleTimer = setTimeout(refreshSession, 1000)
    }
    window.addEventListener('mousemove', handleActivity)
    window.addEventListener('keypress', handleActivity)
    window.addEventListener('click', handleActivity)

    return () => {
      subscription.unsubscribe()
      clearInterval(interval)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('mousemove', handleActivity)
      window.removeEventListener('keypress', handleActivity)
      window.removeEventListener('click', handleActivity)
      clearTimeout(idleTimer)
    }
  }, [supabase, router, refreshSession])

  return <>{children}</>
}
