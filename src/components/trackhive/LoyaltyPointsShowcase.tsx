"use client"

import { useState } from "react"
import Link from "next/link"

type RewardTier = {
  id: string
  spend: string
  points: string
  reward: string
}

const rewardTiers: RewardTier[] = [
  { id: "tier-10", spend: "$10", points: "1,000 points", reward: "Starter tier" },
  { id: "tier-50", spend: "$50", points: "5,000 points", reward: "one domestic flight free" },
  { id: "tier-200", spend: "$200", points: "20,000 points", reward: "one domestic flight free" },
  { id: "tier-500", spend: "$500", points: "50,000 points", reward: "one expensive flight free" },
]

const monthlyPoints = [9, 12, 5, 11, 20, 39, 8, 6, 15, 16, 3, 1]
const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

export default function LoyaltyPointsShowcase() {
  const [activeTier, setActiveTier] = useState("tier-50")
  const [activeMonth, setActiveMonth] = useState(5)

  return (
    <section className="py-16 md:py-24 bg-slate-50/50">
      <div className="max-w-[940px] mx-auto px-5 md:px-6">
        <div className="text-center mb-8 md:mb-10">
          <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold px-4 py-1.5">
            Loyalty Points
          </span>
          <h2 className="mt-4 text-[42px] md:text-[56px] font-semibold leading-[0.98] tracking-[-0.03em] text-indigo-950">
            Earn Airlume Points
            <br />
            &amp; Fly For Free!
          </h2>
          <p className="mt-3 max-w-md mx-auto text-sm text-slate-500">
            book flights, earn points, and redeem them for discounts or even free trips.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-5">
          <article className="lg:col-span-4 h-[258px] rounded-3xl bg-white p-6 border border-slate-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 rounded-full bg-indigo-700 text-white flex items-center justify-center">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.539 1.118l-2.8-2.034a1 1 0 00-1.176 0l-2.8 2.034c-.783.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81H7.03a1 1 0 00.95-.69l1.07-3.292z" />
              </svg>
            </div>
            <div className="mt-auto">
              <p className="text-[14px] leading-tight font-semibold tracking-[-0.01em] text-indigo-950">Track Your Rewards</p>
              <p className="text-xs text-slate-500 mt-3 max-w-[200px] leading-[1.1]">
                easily check your airlume points balance anytime and see how close you are to your next free flight.
              </p>
            </div>
          </article>

          <article
            className="lg:col-span-4 h-[258px] rounded-3xl relative overflow-hidden border border-indigo-300/40 shadow-sm"
            style={{
              backgroundImage:
                "radial-gradient(circle at 30% 16%, rgba(255,255,255,0.7), transparent 40%), linear-gradient(160deg, #dbeafe 0%, #818cf8 55%, #4338ca 100%)",
              backgroundPosition: "center",
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/65 via-indigo-700/35 to-transparent" />
            <div className="absolute left-5 right-5 bottom-5 text-white">
              <h3 className="text-[15px] leading-tight tracking-[-0.01em] font-semibold">Exclusive Perks for You</h3>
              <p className="text-xs text-indigo-100 mt-2 max-w-[300px]">
                unlock vip upgrades, priority boarding, and lounge access with airlume&apos;s exclusive loyalty rewards.
              </p>
            </div>
          </article>

          <article className="lg:col-span-4 h-[258px] rounded-3xl bg-white border border-slate-100 shadow-sm overflow-hidden flex">
            <div className="flex-1 p-6">
              <p className="text-[46px] leading-none font-semibold tracking-[-0.03em] text-indigo-950">70%</p>
              <h3 className="text-[15px] leading-tight tracking-[-0.01em] font-semibold text-indigo-950 mt-3">Save More Always</h3>
              <p className="text-xs text-slate-500 mt-3 max-w-[240px]">
                redeem points for flight discounts, save up to 70% on selected trips.
              </p>
            </div>
            <div className="w-14 bg-indigo-700 relative">
              <div className="absolute inset-y-0 left-0 w-1/2 bg-indigo-500/80" />
            </div>
          </article>

          <article className="lg:col-span-7 h-[275px] rounded-3xl bg-white p-6 border border-slate-100 shadow-sm">
            <div className="grid grid-cols-[1fr_255px] gap-4 items-start h-full">
              <div className="pt-1">
                <span className="inline-flex items-center rounded-full bg-indigo-100 text-indigo-700 text-[12px] font-semibold px-5 py-1.5">
                  Earn As You Fly
                </span>
                <h3 className="mt-3 text-[44px] md:text-[26px] leading-[0.94] tracking-[-0.02em] font-semibold text-indigo-950 max-w-[300px]">
                  Earn 1 Point Per
                  <br />
                  $1 Spent. Book
                  <br />
                  Smarter, Collect
                  <br />
                  Faster.
                </h3>
                <Link
                  href="/features"
                  className="mt-3 inline-flex items-center gap-2 rounded-full bg-indigo-700 text-white pl-5 pr-1 py-1.5 text-[14px] font-semibold hover:bg-indigo-800 transition-colors shadow-[0_3px_10px_rgba(67,56,202,0.25)]"
                >
                  Start Now
                  <span className="w-7 h-7 rounded-full bg-white text-indigo-700 inline-flex items-center justify-center text-sm">→</span>
                </Link>
              </div>
              <div className="w-full max-w-[255px] space-y-1.5">
                {rewardTiers.map((tier) => {
                  const isActive = tier.id === activeTier
                  const isProgressTier = tier.id === "tier-200" || tier.id === "tier-500"
                  const isPinnedTier = tier.id === "tier-50" || tier.id === "tier-10"

                  const rowClassName = `w-full text-left rounded-xl border px-3 py-1.5 transition-colors ${
                    isProgressTier
                      ? "bg-slate-100/90 border-slate-200 hover:border-indigo-200"
                      : isActive
                        ? "bg-indigo-50 border-indigo-300"
                        : "bg-transparent border-transparent hover:border-indigo-200"
                  }`

                  const rowContent = (
                    <>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`rounded-full flex items-center justify-center text-sm font-semibold ${
                            isActive
                              ? "w-9 h-9 bg-indigo-700 text-white"
                              : "w-8 h-8 bg-indigo-100 text-indigo-700"
                          }`}
                        >
                          {tier.spend}
                        </span>
                        <p className="text-[14px] leading-none tracking-[-0.01em] font-semibold text-indigo-950">{tier.points}</p>
                      </div>
                      <p className="text-[9px] leading-none text-slate-500 mt-0 pl-[42px]">{tier.reward}</p>
                    </>
                  )

                  if (isPinnedTier) {
                    return (
                      <div key={tier.id} className="w-full text-left px-0 py-0">
                        {rowContent}
                      </div>
                    )
                  }

                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setActiveTier(tier.id)}
                      className={rowClassName}
                    >
                      {rowContent}
                    </button>
                  )
                })}
              </div>
            </div>
          </article>

          <article
            className="lg:col-span-5 h-[275px] rounded-3xl bg-white p-6 border border-slate-100 shadow-sm transition-all duration-200 hover:border-indigo-200 hover:shadow-[0_10px_24px_rgba(67,56,202,0.14)] cursor-pointer"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-indigo-700">Available Points</p>
                <p className="text-[46px] leading-none font-semibold tracking-[-0.03em] text-indigo-950 mt-1">13,200</p>
                <p className="text-xs text-slate-500 mt-1">
                  month over month growth: <span className="text-emerald-600 font-semibold">+9%</span>
                </p>
              </div>
              <span className="inline-flex items-center rounded-full bg-indigo-700 text-white px-3 py-1 text-[11px] font-semibold mt-2">
                Hamida Jannat
              </span>
            </div>

            <div className="mt-4 h-[140px] border-t border-slate-100 pt-3">
              <div className="grid grid-cols-12 items-end gap-2 h-[98px]">
                {monthlyPoints.map((value, idx) => {
                  const isActive = idx === activeMonth
                  return (
                    <button
                      key={monthLabels[idx]}
                      type="button"
                      onClick={() => setActiveMonth(idx)}
                      className={`rounded-full transition-all ${
                        isActive ? "bg-indigo-600" : "bg-indigo-200/70 hover:bg-indigo-300"
                      }`}
                      style={{ height: `${Math.max(10, value * 2.6)}px` }}
                      aria-label={`Set active month ${monthLabels[idx]}`}
                    />
                  )
                })}
              </div>
              <div className="mt-2 grid grid-cols-12 text-[10px] text-slate-400">
                {monthLabels.map((label, idx) => (
                  <span key={label} className={idx === activeMonth ? "text-indigo-700 font-semibold" : ""}>
                    {label}
                  </span>
                ))}
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  )
}
