export const dynamic = 'force-dynamic'

import { FeatureGate } from '@/components/FeatureGate'
import EnrichmentClient from './EnrichmentClient'

export default function EnrichmentPage() {
  return (
    <div className="p-6 md:p-8">
      <FeatureGate feature="enrichment" requiredPlan="pro">
        <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Real-time Data Enrichment</h1>
        <p className="text-[var(--dash-muted)] text-sm mb-8">
          Automatically enrich every event with geolocation, device type, customer type, LTV, and hashed PII for better attribution.
        </p>
        <EnrichmentClient />
      </FeatureGate>
    </div>
  )
}




