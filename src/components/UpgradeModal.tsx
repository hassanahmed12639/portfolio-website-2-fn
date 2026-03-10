'use client'

import Link from 'next/link'

type UpgradeModalProps = {
  isOpen: boolean
  onClose: () => void
  feature: string
  requiredPlan: 'pro' | 'agency'
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
}: UpgradeModalProps) {
  if (!isOpen) return null

  async function handleStartTrial() {
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
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-xl bg-zinc-900 border border-zinc-700 shadow-xl max-w-md w-full p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-2xl" aria-hidden>🔒</span>
          <h2 className="text-lg font-semibold text-white">
            Unlock {feature}
          </h2>
        </div>
        <p className="text-sm text-zinc-400 mb-6">
          This feature is available on {requiredPlan}. Start a free trial or upgrade to get access.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          <button
            type="button"
            onClick={handleStartTrial}
            className="flex-1 min-w-0 px-4 py-2.5 rounded-lg font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
          >
            Start 7-Day Free Trial
          </button>
          <Link
            href="/dashboard/billing"
            className="flex-1 min-w-0 px-4 py-2.5 rounded-lg font-medium text-center border border-zinc-500 text-zinc-200 hover:bg-zinc-800 transition-colors whitespace-nowrap"
          >
            Upgrade to Pro — $10/mo
          </Link>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-zinc-500 hover:text-zinc-400"
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}
