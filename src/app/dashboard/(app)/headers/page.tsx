export const dynamic = 'force-dynamic'

import { FeatureGate } from '@/components/FeatureGate'
import HeadersClient from './HeadersClient'

export default function HeadersPage() {
  return (
    <FeatureGate feature="http_headers" requiredPlan="pro">
      <HeadersClient />
    </FeatureGate>
  )
}




