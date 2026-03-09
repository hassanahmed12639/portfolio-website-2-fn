"use client"

import React from "react"
import Link from "next/link"

export type PricingPlan = {
  id: string
  name: string
  badge: string
  price: number
  priceDisplay: string
  period: string
  tagline: string
  highlighted: boolean
  cta: string
  ctaNote: string
  ctaHref?: string
  features: { text: string; included: boolean }[]
}

interface PricingTableProps {
  plans: PricingPlan[]
  /** When false, hides the header (useful when page already has hero copy) */
  showHeader?: boolean
}

const PricingTable: React.FC<PricingTableProps> = ({ plans, showHeader = true }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
      {showHeader && (
        <div className="text-center space-y-4 mb-12">
          <h1 className="text-4xl md:text-5xl font-bold" style={{ color: "#0f172a" }}>
            Simple pricing.
          </h1>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: "#475569" }}>
            No hidden fees. Cancel anytime.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl border-2 p-6 sm:p-8 flex flex-col ${
              plan.highlighted
                ? "border-blue-600 shadow-xl shadow-blue-100"
                : "border-slate-100 shadow-sm"
            }`}
          >
            {/* Badge */}
            <div className="mb-4">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  plan.highlighted
                    ? "bg-blue-600 text-white"
                    : plan.id === "agency"
                    ? "bg-purple-100 text-purple-700"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {plan.badge}
              </span>
            </div>

            {/* Price */}
            <div className="mb-2">
              <span className="text-4xl sm:text-5xl font-black text-slate-900">
                {plan.priceDisplay}
              </span>
              {plan.price > 0 && (
                <span className="text-slate-400 text-sm ml-1">{plan.period}</span>
              )}
            </div>

            {/* Plan name and tagline */}
            <p className="text-lg font-bold text-slate-900 mb-1">{plan.name}</p>
            <p className="text-sm text-slate-500 mb-6 leading-relaxed">{plan.tagline}</p>

            {/* Features */}
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 text-xs font-bold ${
                      feature.included
                        ? "bg-blue-100 text-blue-600"
                        : "bg-slate-100 text-slate-300"
                    }`}
                  >
                    {feature.included ? "✓" : "×"}
                  </div>
                  <span
                    className={`text-sm leading-snug ${
                      feature.included ? "text-slate-700" : "text-slate-300 line-through"
                    }`}
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            {/* CTA */}
            <div>
              <Link
                href={plan.ctaHref ?? "/dashboard/signup"}
                className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all ${
                  plan.highlighted
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
              </Link>
              <p className="text-xs text-slate-400 text-center mt-2">{plan.ctaNote}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default PricingTable
