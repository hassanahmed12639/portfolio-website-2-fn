import UnifiedRevenueClient from './UnifiedRevenueClient'

export const dynamic = 'force-dynamic'

export default function UnifiedRevenuePage() {
  return (
    <div className="p-6 md:p-8 overflow-auto">
      <h1 className="text-xl font-semibold text-[var(--dash-text)] mb-2">Unified Revenue</h1>
      <p className="text-[var(--dash-muted)] text-sm mb-8">
        Compare exact tracked revenue with modeled attribution across Meta, TikTok, Google Ads, and Organic.
      </p>
      <UnifiedRevenueClient />
    </div>
  )
}
