import { FeatureGate } from '@/components/FeatureGate'
import AnomaliesClient from './AnomaliesClient'

export default function AnomaliesPage() {
  return (
    <FeatureGate feature="anomaly_detection" requiredPlan="pro">
      <AnomaliesClient />
    </FeatureGate>
  )
}




