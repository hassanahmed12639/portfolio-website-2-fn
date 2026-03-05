'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, usePathname } from 'next/navigation'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current
  const refreshing = useRef(false)

  const refreshSession = useCallback(async () => {
    if (refreshing.current) return
    refreshing.current = true

    try {
      const { data: { session } } = await supabase.auth.getSession()

      if (!session) {
        console.log('[Session] No session found, redirecting to login')
        router.push('/dashboard/login')
        return
      }

      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      const timeLeft = expiresAt - now

      console.log('[Session] Time left:', timeLeft, 'seconds')

      if (timeLeft < 600) {
        const { error } = await supabase.auth.refreshSession()
        if (error) {
          console.error('[Session] Refresh failed:', error.message)
        } else {
          console.log('[Session] Refreshed successfully')
        }
      }
    } finally {
      refreshing.current = false
    }
  }, [supabase, router])

  // Refresh on every page navigation
  useEffect(() => {
    refreshSession()
  }, [pathname, refreshSession])

  // Refresh every 3 minutes
  useEffect(() => {
    const interval = setInterval(refreshSession, 3 * 60 * 1000)
    return () => clearInterval(interval)
  }, [refreshSession])

  // Refresh when tab becomes visible
  useEffect(() => {
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') refreshSession()
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshSession])

  // Listen for auth changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string, session: import('@supabase/supabase-js').Session | null) => {
      console.log('[Session] Auth event:', event)
      if (event === 'SIGNED_OUT') {
        router.push('/dashboard/login')
      }
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        router.refresh()
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return <>{children}</>
}
