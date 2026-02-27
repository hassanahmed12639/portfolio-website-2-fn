'use client'

import { useState } from 'react'
import { canAccessFeature, type PlanName, type FeatureKey } from '@/lib/plans'
import { UpgradeModal } from './UpgradeModal'

type FeatureGateProps = {
  feature: FeatureKey
  userPlan: PlanName
  trialExpired: boolean
  children: React.ReactNode
}

const REQUIRED_PLAN = 'Pro'

export function FeatureGate({
  feature,
  userPlan,
  trialExpired,
  children,
}: FeatureGateProps) {
  const [showModal, setShowModal] = useState(false)
  const effectivePlan = trialExpired ? 'free' : userPlan
  const hasAccess = canAccessFeature(effectivePlan, feature)

  if (hasAccess) {
    return <>{children}</>
  }

  return (
    <div className="relative">
      <div className="pointer-events-none select-none blur-sm opacity-60">
        {children}
      </div>
      <div
        className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/70 rounded-xl min-h-[200px] p-6"
        aria-hidden
      >
        <span className="text-4xl mb-3" aria-hidden>🔒</span>
        <p className="text-white font-medium mb-1">This feature is locked</p>
        <p className="text-zinc-400 text-sm mb-4 text-center">
          Upgrade to Pro or start a free trial to unlock.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-medium bg-emerald-500 text-emerald-950 hover:bg-emerald-400 transition-colors"
          >
            Start Free Trial
          </button>
          <a
            href="/dashboard/billing"
            className="px-4 py-2 rounded-lg font-medium text-center border border-zinc-500 text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            Upgrade
          </a>
        </div>
      </div>
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        featureName={feature.replace(/_/g, ' ')}
        requiredPlan={REQUIRED_PLAN}
      />
    </div>
  )
}
