'use client'

import { useState } from 'react'

export function StartTrialButton({
  className = '',
  children = 'Start Free Trial',
}: {
  className?: string
  children?: React.ReactNode
}) {
  const [loading, setLoading] = useState(false)

  async function handleClick() {
    setLoading(true)
    try {
      const res = await fetch('/api/trial/start', { method: 'POST' })
      const data = await res.json().catch(() => ({}))
      if (res.ok) {
        window.location.reload()
      } else {
        alert(data.error ?? 'Failed to start trial')
      }
    } catch {
      alert('Failed to start trial')
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={loading}
      className={className}
    >
      {loading ? 'Starting…' : children}
    </button>
  )
}




