export const dynamic = 'force-dynamic'

import { FeatureGate } from '@/components/FeatureGate'
import AttributionClient from './AttributionClient'

export default function AttributionPage() {
  return (
    <FeatureGate feature="attribution" requiredPlan="pro">
      <AttributionClient />
    </FeatureGate>
  )
}




