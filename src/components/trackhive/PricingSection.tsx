"use client"

import PricingTable from "./PricingTable"
import { PRICING_PLANS } from "@/lib/pricing"

interface PricingSectionProps {
  /** When false, hides the header (useful when page already has hero copy) */
  showHeader?: boolean
}

export default function PricingSection({ showHeader = true }: PricingSectionProps) {
  return (
    <section
      id="pricing"
      className="py-12 md:py-16"
      style={{ backgroundColor: "#f8fafc" }}
    >
      <PricingTable plans={PRICING_PLANS} showHeader={showHeader} />
    </section>
  )
}
