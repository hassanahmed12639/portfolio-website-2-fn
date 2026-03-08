import { FeatureGate } from '@/components/FeatureGate'
import RawDataClient from './RawDataClient'

export default function RawDataPage() {
  return (
    <FeatureGate feature="raw_data" requiredPlan="pro">
      <RawDataClient />
    </FeatureGate>
  )
}




