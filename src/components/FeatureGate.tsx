'use client'

import { useState } from 'react'
import { usePlan } from '@/hooks/usePlan'
import { FeatureKey } from '@/lib/plans'
import { UpgradeModal } from './UpgradeModal'

interface FeatureGateProps {
  feature: FeatureKey
  children: React.ReactNode
  fallback?: React.ReactNode
  requiredPlan?: 'pro' | 'agency'
}

export function FeatureGate({
  feature,
  children,
  fallback,
  requiredPlan = 'pro',
}: FeatureGateProps) {
  const { can, loading } = usePlan()
  const [showModal, setShowModal] = useState(false)

  if (loading) return null
  if (can(feature)) return <>{children}</>

  if (fallback) return <>{fallback}</>

  const featureLabel = feature.replace(/_/g, ' ')

  return (
    <>
      <div
        className="relative cursor-pointer group"
        onClick={() => setShowModal(true)}
      >
        <div className="opacity-40 pointer-events-none select-none">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 dark:bg-zinc-900/60 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-lg">
            🔒 Upgrade to unlock
          </div>
        </div>
      </div>
      <UpgradeModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        feature={featureLabel}
        requiredPlan={requiredPlan}
      />
    </>
  )
}
