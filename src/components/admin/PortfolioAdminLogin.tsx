'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function PortfolioAdminLogin() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    setError('')

    const res = await fetch('/api/admin/portfolio-auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password }),
    })

    if (res.ok) {
      router.push('/admin')
    } else {
      setError('Incorrect password')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-black font-black text-lg">H</span>
          </div>
          <h1 className="text-white font-black text-2xl">Portfolio Admin</h1>
          <p className="text-slate-500 text-sm mt-1">itshassanahmed.com</p>
        </div>

        <div className="bg-slate-900 rounded-2xl p-6 border border-slate-800">
          <div className="mb-4">
            <label className="text-slate-400 text-xs font-bold uppercase tracking-wide block mb-2">
              Admin Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
              placeholder="Enter password"
              className="w-full bg-slate-800 border border-slate-700 text-white px-4 py-3 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-white/20"
            />
          </div>

          {error && <p className="text-red-400 text-xs mb-4">{error}</p>}

          <button
            onClick={handleLogin}
            disabled={loading || !password}
            className="w-full bg-white text-black font-bold py-3 rounded-xl text-sm hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
      </div>
    </div>
  )
}
