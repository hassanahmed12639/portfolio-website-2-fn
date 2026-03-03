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
        className="absolute inset-0 flex flex-col items-center justify-center bg-white/95 rounded-xl min-h-[200px] p-6 border border-slate-200"
        aria-hidden
      >
        <span className="text-4xl mb-3" aria-hidden>🔒</span>
        <p className="text-slate-900 font-medium mb-1">This feature is locked</p>
        <p className="text-slate-500 text-sm mb-4 text-center">
          Upgrade to Pro or start a free trial to unlock.
        </p>
        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => setShowModal(true)}
            className="px-4 py-2 rounded-lg font-medium bg-blue-600 hover:bg-blue-700 text-white transition-colors shadow-sm"
          >
            Start Free Trial
          </button>
          <a
            href="/dashboard/billing"
            className="px-4 py-2 rounded-lg font-medium text-center border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors"
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
