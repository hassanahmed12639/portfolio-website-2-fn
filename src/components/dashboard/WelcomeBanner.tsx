'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function WelcomeBannerInner() {
  const searchParams = useSearchParams()
  const [show, setShow] = useState(false)
  const welcomePlan = searchParams?.get('plan') ?? null

  useEffect(() => {
    if (searchParams?.get('welcome') === 'true' && (welcomePlan === 'pro' || welcomePlan === 'agency')) {
      setShow(true)
      const t = setTimeout(() => setShow(false), 8000)
      return () => clearTimeout(t)
    }
  }, [searchParams, welcomePlan])

  if (!show) return null

  return (
    <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl p-5 mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="font-black text-lg">
          🎉 {welcomePlan === 'agency' ? 'Agency' : 'Pro'} Trial Activated!
        </p>
        <p className="text-blue-100 text-sm mt-1">
          All features unlocked for 7 days. No credit card needed. Enjoy!
        </p>
      </div>
      <button
        type="button"
        onClick={() => setShow(false)}
        aria-label="Dismiss"
        className="text-white/70 hover:text-white text-xl font-bold flex-shrink-0"
      >
        ✕
      </button>
    </div>
  )
}

export default function WelcomeBanner() {
  return (
    <Suspense fallback={null}>
      <WelcomeBannerInner />
    </Suspense>
  )
}
