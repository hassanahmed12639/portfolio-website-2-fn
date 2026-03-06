'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function AdminLoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setLoading(true)
    setError('')

    const attempts = parseInt(typeof localStorage !== 'undefined' ? localStorage.getItem('admin_attempts') || '0' : '0', 10)
    const lockoutTime = parseInt(typeof localStorage !== 'undefined' ? localStorage.getItem('admin_lockout') || '0' : '0', 10)

    if (Date.now() < lockoutTime) {
      const minutesLeft = Math.ceil((lockoutTime - Date.now()) / 60000)
      setError(`Too many attempts. Try again in ${minutesLeft} minutes.`)
      setLoading(false)
      return
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      const newAttempts = attempts + 1
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('admin_attempts', String(newAttempts))
        if (newAttempts >= 5) {
          localStorage.setItem('admin_lockout', String(Date.now() + 30 * 60000))
          setError('Too many failed attempts. Locked for 30 minutes.')
          setLoading(false)
          return
        }
      }
      setError(`Invalid credentials. ${5 - newAttempts} attempts remaining.`)
      setLoading(false)
      return
    }

    // Check if admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', data.user.id)
      .single()

    if (!profile?.is_admin) {
      setError('Access denied. Admin only.')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem('admin_attempts')
      localStorage.removeItem('admin_lockout')
    }

    router.push('/admin/overview')
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-8 w-full max-w-sm">
        <div className="flex items-center gap-2 mb-6">
          <img src="/logo-icon.png" alt="TrackHive" className="w-14 h-14 rounded-lg object-contain" />
          <div>
            <p className="font-bold text-slate-900 text-sm">TrackHive</p>
            <p className="text-xs text-red-500 font-semibold">Admin Panel</p>
          </div>
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-1">Admin Login</h1>
        <p className="text-sm text-slate-500 mb-6">Restricted access only</p>
        {error && (
          <div className="bg-red-50 border border-red-100 text-red-600 text-sm px-4 py-3 rounded-xl mb-4">
            {error}
          </div>
        )}
        <div className="space-y-3">
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Admin email"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
          />
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
