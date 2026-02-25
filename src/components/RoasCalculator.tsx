"use client"

import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

const GREEN = "#AAFF00"
const RED = "#ff4455"
const YELLOW = "#ffc400"

const LIGHT = {
  bg: "#ffffff",
  card: "#f5f5f5",
  card2: "#eeeeee",
  border: "#e5e5e5",
  border2: "#dddddd",
  text: "#0a0a0a",
  muted: "#666666",
  mutedLight: "#555555",
  glow: "transparent",
}
const DARK = {
  bg: "#080808",
  card: "#0f0f0f",
  card2: "#161616",
  border: "#1e1e1e",
  border2: "#2a2a2a",
  text: "#efefef",
  muted: "#555555",
  mutedLight: "#444444",
  glow: "rgba(170,255,0,0.04)",
}

export default function RoasCalculator() {
  const { isDarkMode } = useTheme()
  const T = isDarkMode ? DARK : LIGHT

  const [price, setPrice] = useState(97)
  const [cogs, setCogs] = useState(28)
  const [shipping, setShipping] = useState(6)
  const [feesPct, setFeesPct] = useState(3)
  const [other, setOther] = useState(3)
  const [budget, setBudget] = useState(5000)
  const [cvrPct, setCvrPct] = useState(2.5)
  const [cpc, setCpc] = useState(1.2)
  const [aov, setAov] = useState(97)
  const [yourRoas, setYourRoas] = useState<string>("")

  const fees = price * (feesPct / 100)
  const totalCosts = cogs + shipping + fees + other
  const contribution = price - totalCosts
  const margin = price > 0 ? (contribution / price) * 100 : 0
  const beRoas = price > 0 && contribution > 0 ? price / contribution : 0
  const maxCPA = contribution
  const clicks = budget / (cpc || 0.01)
  const orders = clicks * (cvrPct / 100)
  const revenue = orders * (aov || price)
  const cogsTotal = orders * totalCosts
  const adProfit = revenue - budget - cogsTotal

  const syncCVR = (val: number) => setCvrPct(val)

  const yourRoasNum = parseFloat(yourRoas)
  const hasYourRoas = !isNaN(yourRoasNum) && yourRoasNum > 0 && beRoas > 0
  const revAtYourRoas = budget * yourRoasNum
  const ordersAtYourRoas = revAtYourRoas / Math.max(aov || price, 1)
  const cogsCostAtYourRoas = ordersAtYourRoas * totalCosts
  const profitAtYourRoas = revAtYourRoas - budget - cogsCostAtYourRoas
  const verdict =
    hasYourRoas && yourRoasNum > beRoas * 1.05
      ? "profit"
      : hasYourRoas && yourRoasNum >= beRoas * 0.95
        ? "break"
        : hasYourRoas
          ? "loss"
          : null

  const scenarios = [
    { label: "1.5x ROAS", roas: 1.5 },
    { label: `${beRoas > 0 ? beRoas.toFixed(1) : "—"}x BE`, roas: beRoas, isBE: true },
    { label: "3x ROAS", roas: 3 },
    { label: "5x ROAS", roas: 5 },
    { label: "8x ROAS", roas: 8 },
  ].sort((a, b) => a.roas - b.roas)
  const maxRoas = 8

  return (
    <div
      className="min-h-screen font-sans transition-colors relative"
      style={{ background: T.bg, color: T.text }}
    >
      {isDarkMode && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 85% 15%, ${T.glow} 0%, transparent 50%)`,
          }}
        />
      )}
      <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10">
        <div className="text-center mb-10 sm:mb-12">
          <span
            className="inline-block text-[10px] uppercase tracking-wider px-3.5 py-1 rounded-full border mb-4"
            style={{
              fontFamily: "ui-monospace, monospace",
              color: GREEN,
              background: "rgba(170,255,0,0.08)",
              borderColor: "rgba(170,255,0,0.2)",
            }}
          >
            ⚡ Utility Tool — Daily Use
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-3"
            style={{ fontFamily: "Outfit, sans-serif" }}
          >
            BREAK-EVEN
            <br />
            <span style={{ color: GREEN, textShadow: isDarkMode ? "0 0 40px rgba(170,255,0,0.3)" : undefined }}>
              ROAS
            </span>{" "}
            CALCULATOR
          </h1>
          <p
            className="text-sm max-w-[460px] mx-auto leading-relaxed"
            style={{ color: T.muted }}
          >
            Know your numbers before you spend a dollar. Find the exact ROAS you need to break even, and whether your campaigns are actually profitable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div
            className="rounded-xl p-6 border"
            style={{ background: T.card, borderColor: T.border }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-5 pb-3 border-b flex items-center gap-2"
              style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}
            >
              <span className="w-4 h-px block" style={{ background: GREEN }} />
              Product & Cost Inputs
            </div>
            {[
              { label: "Selling Price", hint: "per unit / order", value: price, set: setPrice, prefix: "$" },
              { label: "Cost of Goods (COGS)", hint: "product cost per unit", value: cogs, set: setCogs, prefix: "$" },
              { label: "Shipping Cost", hint: "per order (if applicable)", value: shipping, set: setShipping, prefix: "$" },
              { label: "Platform Fees / Merchant", hint: "Shopify, Stripe, etc.", value: feesPct, set: setFeesPct, suffix: "%", max: 30, step: 0.1 },
              { label: "Other Variable Costs", hint: "fulfilment, packaging, etc.", value: other, set: setOther, prefix: "$" },
            ].map(({ label, hint, value, set, prefix, suffix, max, step }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>{label}</span>
                  <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>{hint}</span>
                </div>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>{prefix}</span>
                  )}
                  {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>{suffix}</span>
                  )}
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value) || 0)}
                    min={0}
                    max={max}
                    step={step ?? 1}
                    className="w-full rounded-lg border py-3 px-3 text-sm outline-none transition-[border-color] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{
                      background: T.card2,
                      borderColor: T.border2,
                      color: T.text,
                      fontFamily: "ui-monospace, monospace",
                      paddingLeft: prefix ? "28px" : undefined,
                      paddingRight: suffix ? "28px" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div
            className="rounded-xl p-6 border"
            style={{ background: T.card, borderColor: T.border }}
          >
            <div
              className="text-[10px] uppercase tracking-widest mb-5 pb-3 border-b flex items-center gap-2"
              style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}
            >
              <span className="w-4 h-px block" style={{ background: GREEN }} />
              Ad Spend Inputs
            </div>
            {[
              { label: "Monthly Ad Budget", hint: "total spend", value: budget, set: setBudget, prefix: "$", step: 100 },
              { label: "Average CPC", hint: "cost per click", value: cpc, set: setCpc, prefix: "$", step: 0.01 },
              { label: "Average Order Value (AOV)", hint: "if different from price", value: aov, set: setAov, prefix: "$" },
            ].map(({ label, hint, value, set, prefix, step }) => (
              <div key={label} className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>{label}</span>
                  <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>{hint}</span>
                </div>
                <div className="relative">
                  {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>{prefix}</span>
                  )}
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => set(parseFloat(e.target.value) || 0)}
                    min={0}
                    step={step ?? 1}
                    className="w-full rounded-lg border py-3 px-3 text-sm outline-none transition-[border-color] [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{
                      background: T.card2,
                      borderColor: T.border2,
                      color: T.text,
                      fontFamily: "ui-monospace, monospace",
                      paddingLeft: prefix ? "28px" : undefined,
                    }}
                  />
                </div>
              </div>
            ))}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Conversion Rate</span>
                <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>landing page CVR</span>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={0.1}
                  max={10}
                  step={0.1}
                  value={cvrPct}
                  onChange={(e) => syncCVR(parseFloat(e.target.value))}
                  className="flex-1 h-1 rounded-sm outline-none accent-[#AAFF00]"
                  style={{ background: T.border2 }}
                />
                <span
                  className="text-2xl font-bold tabular-nums min-w-[52px] text-right"
                  style={{ color: GREEN, fontFamily: "Outfit, sans-serif" }}
                >
                  {cvrPct.toFixed(1)}%
                </span>
              </div>
            </div>
            <div className="pt-5 mt-5 border-t" style={{ borderColor: T.border }}>
              <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Test Your Actual ROAS</div>
              <div className="flex gap-3 items-end">
                <div className="relative flex-1">
                  <input
                    type="number"
                    value={yourRoas}
                    onChange={(e) => setYourRoas(e.target.value)}
                    placeholder="e.g. 3.2"
                    min={0}
                    step={0.1}
                    className="w-full rounded-lg border py-3 px-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={{
                      background: T.card2,
                      borderColor: T.border2,
                      color: T.text,
                      fontFamily: "ui-monospace, monospace",
                      paddingRight: "28px",
                    }}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>x</span>
                </div>
                {verdict && (
                  <span
                    className="py-2.5 px-4 rounded-lg font-bold text-lg tracking-wider whitespace-nowrap shrink-0"
                    style={
                      verdict === "profit"
                        ? { background: "rgba(170,255,0,0.15)", color: GREEN, border: "1px solid rgba(170,255,0,0.3)" }
                        : verdict === "loss"
                          ? { background: "rgba(255,68,85,0.12)", color: RED, border: "1px solid rgba(255,68,85,0.2)" }
                          : { background: "rgba(255,196,0,0.1)", color: YELLOW, border: "1px solid rgba(255,196,0,0.2)" }
                    }
                  >
                    {verdict === "profit" ? "✓ PROFITABLE" : verdict === "break" ? "≈ BREAK EVEN" : "✗ LOSING MONEY"}
                  </span>
                )}
              </div>
              {hasYourRoas && (
                <p className="mt-2.5 text-xs leading-relaxed" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>
                  {verdict === "profit" && (
                    <>
                      At {yourRoasNum}x ROAS, you're making <span style={{ color: GREEN }}>+${Math.round(profitAtYourRoas).toLocaleString()}</span> profit on ${budget.toLocaleString()} spend. You're <strong style={{ color: T.text }}>{Math.round(((yourRoasNum - beRoas) / beRoas) * 100)}%</strong> above break-even. Consider scaling.
                    </>
                  )}
                  {verdict === "break" && (
                    <>
                      At {yourRoasNum}x ROAS, you're roughly breaking even — profit of ~${Math.round(profitAtYourRoas).toLocaleString()}. You need to either improve CVR, increase AOV, or cut COGS to become profitable.
                    </>
                  )}
                  {verdict === "loss" && (
                    <>
                      At {yourRoasNum}x ROAS, you're losing <span style={{ color: RED }}>${Math.abs(Math.round(profitAtYourRoas)).toLocaleString()}</span> per month. Break-even is <strong style={{ color: T.text }}>{beRoas.toFixed(2)}x</strong>. Fix creative, landing page CVR, or offer before scaling.
                    </>
                  )}
                </p>
              )}
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6 sm:p-7 border mb-5 relative overflow-hidden"
          style={{ background: T.card, borderColor: T.border }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: GREEN, boxShadow: isDarkMode ? "0 0 16px rgba(170,255,0,0.5)" : undefined }} />
          <div className="text-center mb-7">
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Your Break-Even ROAS</div>
            <div
              className="text-6xl sm:text-7xl lg:text-[100px] font-bold leading-none"
              style={{ color: GREEN, textShadow: isDarkMode ? "0 0 60px rgba(170,255,0,0.35)" : undefined, fontFamily: "Outfit, sans-serif" }}
            >
              {beRoas > 0 ? beRoas.toFixed(2) + "x" : "—"}
            </div>
            <div className="text-sm mt-1.5" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>
              {beRoas > 0
                ? `You need $${beRoas.toFixed(2)} in revenue for every $1 spent to break even`
                : "Enter valid numbers above"}
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {[
              { val: margin.toFixed(1) + "%", label: "Gross Margin %", color: margin >= 50 ? GREEN : margin >= 25 ? YELLOW : RED },
              { val: "$" + contribution.toFixed(2), label: "Contribution / Order", color: T.text },
              { val: "$" + maxCPA.toFixed(2), label: "Max Allowable CPA", color: YELLOW },
              { val: Math.round(orders).toLocaleString(), label: "Est. Monthly Orders", color: T.text },
            ].map(({ val, label, color }) => (
              <div
                key={label}
                className="rounded-lg p-3.5 border text-center"
                style={{ background: T.card2, borderColor: T.border }}
              >
                <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color }}>{val}</div>
                <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>{label}</div>
              </div>
            ))}
          </div>
          <div className="mb-6">
            <div className="text-[10px] uppercase tracking-widest mb-3.5" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Profitability Scenarios</div>
            <div className="space-y-2.5">
              {scenarios.map((s) => {
                const rev = budget * s.roas
                const cogsCost = (rev / (aov || price)) * totalCosts
                const profit = rev - budget - cogsCost
                const barW = Math.min(98, (s.roas / maxRoas) * 100)
                const barColor = s.isBE ? YELLOW : s.roas > beRoas ? GREEN : RED
                const profitStr = (profit >= 0 ? "+$" : "-$") + Math.abs(Math.round(profit)).toLocaleString()
                return (
                  <div key={s.label} className="flex items-center gap-3">
                    <div className="text-xs w-20 shrink-0" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>{s.label}</div>
                    <div className="flex-1 h-7 rounded-md overflow-hidden" style={{ background: T.border2 }}>
                      <div
                        className="h-full rounded-md flex items-center pl-2.5 font-bold text-sm transition-[width] duration-300"
                        style={{ width: barW + "%", background: barColor, color: T.bg, minWidth: 0 }}
                      >
                        {barW > 25 ? profitStr : ""}
                      </div>
                    </div>
                    <div className="text-[11px] w-10 text-right shrink-0" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>
                      {barW <= 25 ? profitStr : ""}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          <div className="text-[10px] uppercase tracking-widest mb-3" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>
            Monthly P&L Breakdown <span className="text-[9px] normal-case" style={{ color: T.mutedLight }}>(at your budget)</span>
          </div>
          <div className="rounded-lg overflow-hidden border" style={{ borderColor: T.border }}>
            {[
              { key: "Ad Spend", val: `-$${budget.toLocaleString()}`, neg: true },
              { key: "Est. Revenue (at current CVR)", val: `$${Math.round(revenue).toLocaleString()}`, neg: false },
              { key: "COGS + Shipping + Fees", val: `-$${Math.round(cogsTotal).toLocaleString()}`, neg: true },
              { key: "Est. Gross Profit", val: (adProfit >= 0 ? "+" : "") + `$${Math.round(adProfit).toLocaleString()}`, neg: adProfit < 0 },
            ].map(({ key, val, neg }) => (
              <div
                key={key}
                className="flex items-center justify-between py-2.5 px-3.5 text-sm border-b last:border-b-0"
                style={{ borderColor: T.border }}
              >
                <span style={{ color: T.muted }}>{key}</span>
                <span className="font-mono text-xs" style={{ color: neg ? RED : T.text }}>{val}</span>
              </div>
            ))}
            <div
              className="flex items-center justify-between py-2.5 px-3.5 font-semibold rounded-b-lg"
              style={{ background: "rgba(170,255,0,0.04)", borderTop: `1px solid rgba(170,255,0,0.1)` }}
            >
              <span style={{ color: T.text }}>Achieved ROAS</span>
              <span className="font-mono text-xs" style={{ color: budget > 0 && revenue / budget >= beRoas ? GREEN : RED }}>
                {budget > 0 ? (revenue / budget).toFixed(2) + "x" : "—"} {budget > 0 && (revenue / budget >= beRoas ? "✓ Profitable" : "✗ Below Break-Even")}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "📐", title: "What is Break-Even ROAS?", body: "Break-even ROAS = Revenue ÷ Ad Spend where Profit = $0. Calculated as: Price ÷ (Price − all variable costs). If your actual ROAS is above this number, you're profitable." },
            { icon: "💡", title: "MER vs Platform ROAS", body: "Platform ROAS is almost always inflated. Use MER (Total Revenue ÷ Total Ad Spend) across all channels as your true north. If MER > break-even ROAS, your business is healthy." },
            { icon: "🎯", title: "The ROAS Trap", body: "A 4x ROAS can still be unprofitable if COGS + fees eat margin. And a 2x ROAS can be highly profitable on low-cost digital products. Always anchor to margin, not just ROAS." },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl p-4 border"
              style={{ background: T.card, borderColor: T.border }}
            >
              <div className="text-xl mb-2">{icon}</div>
              <div className="text-sm font-semibold mb-1">{title}</div>
              <div className="text-xs leading-relaxed" style={{ color: T.muted }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
