'use client'
import { useState } from 'react'

export default function PayPalButton({ planId, planName, price, className, returnUrl, cancelUrl }: {
  planId: string
  planName: string
  price: string
  className?: string
  returnUrl?: string
  cancelUrl?: string
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubscribe = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/paypal/create-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId, return_url: returnUrl, cancel_url: cancelUrl }),
      })
      const { approvalUrl, error: apiError } = await res.json()
      if (apiError) {
        setError(apiError)
        return
      }
      if (approvalUrl) window.location.href = approvalUrl
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleSubscribe}
        disabled={loading}
        className={className || 'w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-colors disabled:opacity-50'}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Redirecting to PayPal...
          </span>
        ) : (
          `Subscribe to ${planName} — ${price}/mo`
        )}
      </button>
      {error && <p className="text-red-500 text-xs mt-2 text-center">{error}</p>}
    </div>
  )
}
