'use client'

import { useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { usePathname } from 'next/navigation'

export default function SessionProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const supabaseRef = useRef<ReturnType<typeof createClient> | null>(null)
  if (!supabaseRef.current) supabaseRef.current = createClient()
  const supabase = supabaseRef.current
  const refreshing = useRef(false)
  const initialized = useRef(false)

  const refreshSession = useCallback(async () => {
    if (refreshing.current) return
    refreshing.current = true

    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) {
        console.error('[Session] Error:', error.message)
        refreshing.current = false
        return
      }

      if (!session) {
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/dashboard/login'
        }
        return
      }

      const now = Math.floor(Date.now() / 1000)
      const expiresAt = session.expires_at || 0
      const timeLeft = expiresAt - now

      if (timeLeft < 600) {
        const { error: refreshError } = await supabase.auth.refreshSession()
        if (refreshError) {
          console.error('[Session] Refresh failed:', refreshError.message)
        }
      }
    } finally {
      refreshing.current = false
    }
  }, [supabase])

  // Initialize once on mount
  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true
      refreshSession()
    }
  }, [refreshSession])

  // Refresh on every route change
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
      if (document.visibilityState === 'visible') {
        refreshSession()
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [refreshSession])

  // Listen for auth state changes
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: string) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/dashboard/login'
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase])

  return <>{children}</>
}
