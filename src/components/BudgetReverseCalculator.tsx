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

function fmt(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M"
  if (n >= 1000) return Math.round(n / 1000) + "K"
  return Math.round(n).toLocaleString()
}

type Mode = "sales" | "leads" | "revenue"

export default function BudgetReverseCalculator() {
  const { isDarkMode } = useTheme()
  const T = isDarkMode ? DARK : LIGHT

  const [mode, setMode] = useState<Mode>("sales")
  const [goalVal, setGoalVal] = useState(100)
  const [goalRevenue, setGoalRevenue] = useState(50000)
  const [aov, setAov] = useState(97)
  const [cvrPct, setCvrPct] = useState(2.5)
  const [leadCvrPct, setLeadCvrPct] = useState(20)
  const [cpc, setCpc] = useState(1.2)
  const [ctrPct, setCtrPct] = useState(1.8)

  const cvr = cvrPct / 100
  const ctr = ctrPct / 100
  const leadCvr = leadCvrPct / 100

  let targetConvs: number
  let targetRevenue: number
  if (mode === "revenue") {
    targetRevenue = goalRevenue
    targetConvs = targetRevenue / (aov || 1)
  } else {
    targetConvs = goalVal
    targetRevenue = targetConvs * aov
  }

  let clicksNeeded: number
  let budget: number
  let formula: string
  let leadsNeeded: number | null = null

  if (mode === "leads") {
    leadsNeeded = targetConvs
    const salesFromLeads = leadsNeeded * leadCvr
    clicksNeeded = leadsNeeded / cvr
    budget = clicksNeeded * cpc
    formula = `${Math.round(leadsNeeded).toLocaleString()} leads ÷ ${cvrPct}% CVR = ${fmt(clicksNeeded)} clicks × $${cpc} CPC = $${Math.round(budget).toLocaleString()} budget`
  } else {
    clicksNeeded = targetConvs / cvr
    budget = clicksNeeded * cpc
    formula = `${Math.round(targetConvs).toLocaleString()} sales ÷ ${cvrPct}% CVR = ${fmt(clicksNeeded)} clicks × $${cpc} CPC = $${Math.round(budget).toLocaleString()} budget`
  }

  const impressionsNeeded = clicksNeeded / ctr
  const cpa = budget / Math.max(targetConvs, 1)
  const roas = targetRevenue / Math.max(budget, 1)
  const dailyBudget = budget / 30

  const cvrVariants = [0.5, 1.0, 1.5, cvrPct, 3.0, 4.0, 6.0].sort((a, b) => a - b)
  const sensRows = cvrVariants.map((v) => {
    const clicks = targetConvs / (v / 100)
    const bud = clicks * cpc
    const cp = bud / targetConvs
    const isCurrentRow = Math.abs(v - cvrPct) < 0.05
    let tag: "good" | "bad" | "be" = "be"
    if (bud < budget * 0.8) tag = "good"
    else if (bud > budget * 1.3) tag = "bad"
    return { v, clicks, bud, cp, isCurrentRow, tag }
  })

  const inputStyle = {
    background: T.card2,
    borderColor: T.border2,
    color: T.text,
    fontFamily: "ui-monospace, monospace",
  }

  return (
    <div
      className="min-h-screen font-sans transition-colors relative"
      style={{ background: T.bg, color: T.text }}
    >
      {isDarkMode && (
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            background: `radial-gradient(ellipse at 15% 85%, ${T.glow} 0%, transparent 55%)`,
          }}
        />
      )}
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 py-8 sm:py-12 lg:py-16 relative z-10">
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
            🎯 Utility Tool — Goal-First Planning
          </span>
          <h1
            className="text-4xl sm:text-5xl lg:text-7xl font-bold tracking-tight leading-tight mb-3"
            style={{ fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}
          >
            AD BUDGET
            <br />
            <span style={{ color: GREEN, textShadow: isDarkMode ? "0 0 40px rgba(170,255,0,0.3)" : undefined }}>
              REVERSE
            </span>{" "}
            CALCULATOR
          </h1>
          <p className="text-sm max-w-[500px] mx-auto leading-relaxed" style={{ color: T.muted }}>
            Start with your goal. Work backwards to find exactly how much you need to spend. No guessing. No over-budgeting.
          </p>
        </div>

        <div
          className="flex flex-wrap gap-1 p-1 rounded-xl border max-w-[480px] mx-auto mb-8"
          style={{ background: T.card, borderColor: T.border }}
        >
          {[
            { id: "sales" as Mode, label: "💰 I want X sales" },
            { id: "leads" as Mode, label: "📋 I want X leads" },
            { id: "revenue" as Mode, label: "📈 I want $X revenue" },
          ].map(({ id, label }) => (
            <button
              key={id}
              type="button"
              onClick={() => setMode(id)}
              className="flex-1 min-w-[120px] py-2.5 px-3 rounded-lg border-none text-[11px] uppercase tracking-wider cursor-pointer transition-all font-medium"
              style={{
                background: mode === id ? GREEN : "transparent",
                color: mode === id ? T.bg : T.muted,
                fontFamily: "ui-monospace, monospace",
              }}
            >
              {label}
            </button>
          ))}
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
              Your Goal
            </div>
            {mode !== "revenue" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>
                    {mode === "sales" ? "Target Sales / Month" : "Target Leads / Month"}
                  </span>
                </div>
                <input
                  type="number"
                  value={goalVal}
                  onChange={(e) => setGoalVal(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={1}
                  className="w-full rounded-lg border py-3 px-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={inputStyle}
                />
              </div>
            )}
            {mode === "revenue" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Target Revenue ($)</span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>$</span>
                  <input
                    type="number"
                    value={goalRevenue}
                    onChange={(e) => setGoalRevenue(parseFloat(e.target.value) || 0)}
                    min={1}
                    step={100}
                    className="w-full rounded-lg border py-3 pl-8 pr-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={inputStyle}
                  />
                </div>
              </div>
            )}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Average Order / Deal Value</span>
                <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>per conversion</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>$</span>
                <input
                  type="number"
                  value={aov}
                  onChange={(e) => setAov(parseFloat(e.target.value) || 0)}
                  min={1}
                  step={1}
                  className="w-full rounded-lg border py-3 pl-8 pr-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={inputStyle}
                />
              </div>
            </div>
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
              Your Funnel Metrics
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Landing Page CVR</span>
                <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>% of clicks that convert</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={cvrPct}
                  onChange={(e) => setCvrPct(parseFloat(e.target.value) || 0)}
                  min={0.1}
                  max={100}
                  step={0.1}
                  className="w-full rounded-lg border py-3 pl-3 pr-8 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={inputStyle}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>%</span>
              </div>
            </div>
            {mode === "leads" && (
              <div className="mb-4">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Lead → Sale CVR</span>
                  <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>% of leads that close</span>
                </div>
                <div className="relative">
                  <input
                    type="number"
                    value={leadCvrPct}
                    onChange={(e) => setLeadCvrPct(parseFloat(e.target.value) || 0)}
                    min={0.1}
                    max={100}
                    step={0.1}
                    className="w-full rounded-lg border py-3 pl-3 pr-8 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    style={inputStyle}
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>%</span>
                </div>
              </div>
            )}
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Average CPC</span>
                <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>cost per click</span>
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>$</span>
                <input
                  type="number"
                  value={cpc}
                  onChange={(e) => setCpc(parseFloat(e.target.value) || 0)}
                  min={0.01}
                  step={0.01}
                  className="w-full rounded-lg border py-3 pl-8 pr-3 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={inputStyle}
                />
              </div>
            </div>
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>CTR</span>
                <span className="text-[10px]" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>click-through rate</span>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={ctrPct}
                  onChange={(e) => setCtrPct(parseFloat(e.target.value) || 0)}
                  min={0.01}
                  max={100}
                  step={0.1}
                  className="w-full rounded-lg border py-3 pl-3 pr-8 text-sm outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  style={inputStyle}
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm" style={{ color: T.mutedLight, fontFamily: "ui-monospace, monospace" }}>%</span>
              </div>
            </div>
          </div>
        </div>

        <div
          className="rounded-xl p-6 sm:p-7 border mb-5 relative overflow-hidden"
          style={{ background: T.card, borderColor: T.border }}
        >
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: GREEN, boxShadow: isDarkMode ? "0 0 16px rgba(170,255,0,0.5)" : undefined }} />
          <div className="text-center mb-7">
            <div className="text-2xl font-bold tracking-tight" style={{ fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>
              YOUR <span style={{ color: GREEN }}>FUNNEL MATH</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-0 mb-8">
            <div className="text-center py-4 px-3 min-w-[80px] sm:min-w-[110px]">
              <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color: GREEN, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>{fmt(impressionsNeeded)}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Impressions</div>
            </div>
            <div className="text-xl font-bold px-1 -mt-2" style={{ color: T.mutedLight }}>→</div>
            <div className="text-center py-4 px-3 min-w-[80px] sm:min-w-[110px]">
              <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color: GREEN, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>{fmt(clicksNeeded)}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Clicks</div>
            </div>
            {mode === "leads" && leadsNeeded != null && (
              <>
                <div className="text-xl font-bold px-1 -mt-2" style={{ color: T.mutedLight }}>→</div>
                <div className="text-center py-4 px-3 min-w-[80px] sm:min-w-[110px]">
                  <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color: GREEN, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>{fmt(leadsNeeded)}</div>
                  <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Leads</div>
                </div>
              </>
            )}
            <div className="text-xl font-bold px-1 -mt-2" style={{ color: T.mutedLight }}>→</div>
            <div className="text-center py-4 px-3 min-w-[80px] sm:min-w-[110px]">
              <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color: GREEN, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>{fmt(targetConvs)}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Sales</div>
            </div>
            <div className="text-xl font-bold px-1 -mt-2" style={{ color: T.mutedLight }}>=</div>
            <div className="text-center py-4 px-3 min-w-[80px] sm:min-w-[110px]">
              <div className="text-2xl sm:text-3xl font-bold leading-none mb-1" style={{ color: GREEN, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}>${fmt(targetRevenue)}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Revenue</div>
            </div>
          </div>

          <div
            className="rounded-lg py-3.5 px-4 text-center text-xs leading-relaxed mb-6"
            style={{ background: "rgba(170,255,0,0.04)", border: "1px solid rgba(170,255,0,0.1)", color: T.muted, fontFamily: "ui-monospace, monospace" }}
          >
            {formula}
          </div>

          <div
            className="text-center py-7 rounded-xl mb-6"
            style={{ background: "rgba(170,255,0,0.04)", border: "1px solid rgba(170,255,0,0.15)" }}
          >
            <div className="text-[11px] uppercase tracking-widest mb-2" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Required Monthly Ad Budget</div>
            <div
              className="text-5xl sm:text-6xl lg:text-[88px] font-bold leading-none"
              style={{ color: GREEN, textShadow: isDarkMode ? "0 0 50px rgba(170,255,0,0.3)" : undefined, fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}
            >
              ${Math.round(budget).toLocaleString()}
            </div>
            <div className="text-sm mt-1.5" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>
              to achieve {Math.round(targetConvs).toLocaleString()} {mode === "leads" ? "leads" : "sales"} at ${aov} AOV
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
            <div className="rounded-lg p-3.5 border text-center" style={{ background: T.card2, borderColor: T.border }}>
              <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: GREEN }}>${Math.round(dailyBudget).toLocaleString()}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Daily Budget</div>
            </div>
            <div className="rounded-lg p-3.5 border text-center" style={{ background: T.card2, borderColor: T.border }}>
              <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: YELLOW }}>${Math.round(cpa).toLocaleString()}</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Cost Per {mode === "leads" ? "Lead" : "Sale"}</div>
            </div>
            <div className="rounded-lg p-3.5 border text-center col-span-2 sm:col-span-1" style={{ background: T.card2, borderColor: T.border }}>
              <div className="text-xl sm:text-2xl font-bold mb-0.5" style={{ color: T.text }}>{roas.toFixed(2)}x</div>
              <div className="text-[9px] uppercase tracking-wider" style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}>Required ROAS</div>
            </div>
          </div>

          <div
            className="text-[10px] uppercase tracking-widest mb-3.5 flex items-center gap-2"
            style={{ color: T.muted, fontFamily: "ui-monospace, monospace" }}
          >
            <span className="w-4 h-px block" style={{ background: GREEN }} />
            What if your CVR changes?
          </div>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-[9px] uppercase tracking-wider border-b" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>CVR</th>
                  <th className="py-2 px-3 text-[9px] uppercase tracking-wider border-b" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>Clicks Needed</th>
                  <th className="py-2 px-3 text-[9px] uppercase tracking-wider border-b" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>Budget Required</th>
                  <th className="py-2 px-3 text-[9px] uppercase tracking-wider border-b" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>CPA</th>
                  <th className="py-2 px-3 text-[9px] uppercase tracking-wider border-b" style={{ color: T.muted, borderColor: T.border, fontFamily: "ui-monospace, monospace" }}>Status</th>
                </tr>
              </thead>
              <tbody className="text-xs font-mono">
                {sensRows.map(({ v, clicks, bud, cp, isCurrentRow, tag }) => (
                  <tr
                    key={v}
                    className={isCurrentRow ? "" : ""}
                    style={{
                      background: isCurrentRow ? "rgba(170,255,0,0.05)" : undefined,
                      borderBottom: `1px solid ${T.border}`,
                    }}
                  >
                    <td className="py-2.5 px-3" style={{ color: isCurrentRow ? GREEN : T.text }}>{v}%{isCurrentRow ? " ← you" : ""}</td>
                    <td className="py-2.5 px-3" style={{ color: T.text }}>{fmt(clicks)}</td>
                    <td className="py-2.5 px-3" style={{ color: T.text }}>${Math.round(bud).toLocaleString()}</td>
                    <td className="py-2.5 px-3" style={{ color: T.text }}>${Math.round(cp)}</td>
                    <td className="py-2.5 px-3">
                      <span
                        className="inline-block py-0.5 px-2 rounded-full text-[9px] ml-1.5"
                        style={
                          tag === "good"
                            ? { background: "rgba(170,255,0,0.1)", color: GREEN }
                            : tag === "bad"
                              ? { background: "rgba(255,68,85,0.1)", color: RED }
                              : { background: "rgba(255,196,0,0.1)", color: YELLOW }
                        }
                      >
                        {tag === "good" ? "Saves Budget" : tag === "bad" ? "Costly" : "Similar"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { icon: "🔄", title: "Why Reverse Calculate?", body: "Most marketers set a budget first, then hope for results. Reverse planning forces you to define success before spending a dollar — and reveals whether your goals are realistic." },
            { icon: "📊", title: "The CVR Lever", body: "A 1% improvement in CVR can cut your required budget by 30-40%. Before increasing spend, always ask: \"Can I improve conversion rate first?\" It's the highest-ROI move." },
            { icon: "⚡", title: "Add a 20% Buffer", body: "Always plan 15-20% above the calculated minimum. Algorithms need learning budget, creative tests cost money, and CPCs fluctuate. Never run campaigns at the exact break-even number." },
          ].map(({ icon, title, body }) => (
            <div
              key={title}
              className="rounded-xl p-4 border"
              style={{ background: T.card, borderColor: T.border }}
            >
              <div className="text-lg mb-2">{icon}</div>
              <div className="text-sm font-semibold mb-1">{title}</div>
              <div className="text-xs leading-relaxed" style={{ color: T.muted }}>{body}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
