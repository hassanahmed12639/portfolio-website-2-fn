'use client'

import Link from 'next/link'
import { Sparkles, Check } from 'lucide-react'

type UpgradeModalProps = {
  isOpen: boolean
  onClose: () => void
  feature: string
  requiredPlan: 'pro' | 'agency'
}

const FEATURE_LISTS: Record<string, string[]> = {
  'Lead Manager': ['Lead scoring & pipeline', 'Meta feedback signals', 'Lead enrichment', 'Conversion tracking', 'Smart deduplication'],
  default: ['Full event tracking', 'Server-side CAPI', 'Advanced analytics', 'Data quality tools', 'Priority support'],
}

export function UpgradeModal({
  isOpen,
  onClose,
  feature,
  requiredPlan,
}: UpgradeModalProps) {
  if (!isOpen) return null

  const featureItems = FEATURE_LISTS[feature] ?? FEATURE_LISTS.default

  async function handleStartTrial() {
    try {
      const res = await fetch('/api/trial/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: requiredPlan }),
      })
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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="rounded-2xl bg-[var(--dash-card)] border border-[var(--dash-border)] shadow-[var(--dash-shadow)] max-w-md w-full overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[var(--dash-primary-soft)] text-[var(--dash-primary)]">
                <Sparkles className="h-4 w-4" strokeWidth={2} />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-[var(--dash-text)]">
                  Unlock the <span className="text-[var(--dash-primary)]">full power</span> of {feature}
                </h2>
                <p className="text-sm text-[var(--dash-muted)] mt-0.5">
                  This feature is available on {requiredPlan}. Start a free trial or upgrade to get access.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="ml-2 rounded-lg p-1.5 text-[var(--dash-muted)] hover:bg-[var(--dash-surface-hover)] hover:text-[var(--dash-text)] transition-colors shrink-0"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <ul className="space-y-2.5 mb-6">
            {featureItems.map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-[var(--dash-text)]">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--dash-success-soft)] text-[var(--dash-success)]">
                  <Check className="h-3 w-3" strokeWidth={3} />
                </span>
                {item}
              </li>
            ))}
          </ul>

          <div className="flex flex-col sm:flex-row gap-3 mb-3">
            <button
              type="button"
              onClick={handleStartTrial}
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl font-semibold text-white bg-[var(--dash-primary)] hover:bg-[var(--dash-accent-hover)] transition-colors"
            >
              Start 7-Day Free Trial
            </button>
            <Link
              href="/dashboard/billing"
              className="flex-1 min-w-0 px-4 py-2.5 rounded-xl font-medium text-center border border-[var(--dash-border-strong)] text-[var(--dash-text)] hover:bg-[var(--dash-surface-hover)] transition-colors whitespace-nowrap"
            >
              Upgrade plan
            </Link>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-sm text-[var(--dash-muted)] hover:text-[var(--dash-text)]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  )
}
