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

    const expiresAt = session.expires_at ?? 0
    const timeUntilExpiry = expiresAt - Math.floor(Date.now() / 1000)
    if (timeUntilExpiry < 600) {
      await supabase.auth.refreshSession()
    }
  }, [supabase])

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') router.push('/dashboard/login')
    })

    // Defer session refresh to avoid blocking initial dashboard paint
    const t = setTimeout(refreshSession, 200)
    const interval = setInterval(refreshSession, 4 * 60 * 1000)

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') refreshSession()
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
      clearTimeout(t)
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
