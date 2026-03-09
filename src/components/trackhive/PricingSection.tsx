"use client"

import PricingTable, { type Plan } from "./PricingTable"

const PLANS: Plan[] = [
  {
    title: "Free",
    price: { monthly: 0, yearly: 0 },
    description: "Perfect to get started",
    features: [
      "1,000 events/month",
      "Meta CAPI",
      "1 pixel",
      "Basic analytics"
    ],
    ctaText: "Start for free",
    ctaHref: "/dashboard/signup",
    isFeatured: false
  },
  {
    title: "Pro",
    price: { monthly: 10, yearly: 96 },
    description: "For growing businesses",
    features: [
      "50,000 events/month",
      "All platforms",
      "3 pixels",
      "AI Analysis",
      "Email alerts",
      "Priority support"
    ],
    ctaText: "Upgrade to Pro",
    ctaHref: "/billing",
    isFeatured: true
  },
  {
    title: "Agency",
    price: { monthly: 25, yearly: 240 },
    description: "For agencies and teams",
    features: [
      "Unlimited events",
      "All platforms",
      "10 pixels",
      "Everything in Pro",
      "White label",
      "Dedicated support"
    ],
    ctaText: "Start for free",
    ctaHref: "/dashboard/signup",
    isFeatured: false
  }
]

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
      <PricingTable plans={PLANS} showHeader={showHeader} />
    </section>
  )
}
