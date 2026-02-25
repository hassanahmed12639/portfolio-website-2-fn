"use client"

import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"

const NEON = "#BFFF00"
const DARK = "#0a0a0a"
const CARD = "#111111"
const BORDER = "#1e1e1e"
const RED = "#FF4444"
const YELLOW = "#FFD700"

const LIGHT = {
  bg: "#ffffff",
  card: "#f5f5f5",
  border: "#e5e5e5",
  inputBg: "#ffffff",
  text: "#0a0a0a",
  muted: "#666666",
  mutedLight: "#555555",
}
const DARK_THEME = {
  bg: DARK,
  card: CARD,
  border: BORDER,
  inputBg: DARK,
  text: "#ffffff",
  muted: "#555555",
  mutedLight: "#444444",
}

function zScore(
  p1: number,
  n1: number,
  p2: number,
  n2: number
): number {
  const pooled = (p1 * n1 + p2 * n2) / (n1 + n2)
  const se = Math.sqrt(pooled * (1 - pooled) * (1 / n1 + 1 / n2))
  if (se === 0) return 0
  return Math.abs(p1 - p2) / se
}

function zToConfidence(z: number): number {
  if (z >= 2.576) return 99
  if (z >= 1.96) return 95
  if (z >= 1.645) return 90
  if (z >= 1.282) return 80
  return Math.min(Math.round(z * 30 + 50), 79)
}

function formatPct(val: number): string {
  return (val * 100).toFixed(2) + "%"
}

const EXAMPLES = [
  {
    label: "Winning test",
    a: { imp: 12400, clicks: 310, conv: 28 },
    b: { imp: 11800, clicks: 406, conv: 52 },
  },
  {
    label: "Inconclusive",
    a: { imp: 5000, clicks: 100, conv: 8 },
    b: { imp: 5200, clicks: 108, conv: 9 },
  },
  {
    label: "Loser variant",
    a: { imp: 8000, clicks: 320, conv: 40 },
    b: { imp: 7800, clicks: 198, conv: 18 },
  },
]

type VariantData = { imp: number; clicks: number; conv: number }

type ThemeColors = typeof LIGHT

function Variant({
  label,
  data,
  onChange,
  color,
  theme: themeColors,
}: {
  label: string
  data: VariantData
  onChange: (d: VariantData) => void
  color: string
  theme: ThemeColors
}) {
  const fields = [
    { key: "imp" as const, label: "Impressions" },
    { key: "clicks" as const, label: "Clicks" },
    { key: "conv" as const, label: "Conversions" },
  ]
  return (
    <div
      className="flex-1 min-w-0 rounded-2xl p-5 sm:p-6 lg:p-7 border"
      style={{
        background: themeColors.card,
        borderColor: `${color}30`,
      }}
    >
      <div className="flex items-center gap-2.5 mb-5 sm:mb-6">
        <div
          className="w-2.5 h-2.5 rounded-full shrink-0"
          style={{ background: color }}
        />
        <div className="font-extrabold text-base sm:text-lg" style={{ color }}>
          {label}
        </div>
      </div>
      {fields.map((f) => (
        <div key={f.key} className="mb-4">
          <label
            className="block mb-1.5 text-[11px] uppercase tracking-wider"
            style={{ color: themeColors.muted }}
          >
            {f.label}
          </label>
          <input
            type="number"
            value={data[f.key]}
            min={0}
            onChange={(e) =>
              onChange({ ...data, [f.key]: +e.target.value || 0 })
            }
            className="w-full rounded-xl px-4 py-3 text-base font-semibold outline-none box-border font-sans"
            style={{
              background: themeColors.inputBg,
              border: `1px solid ${themeColors.border}`,
              color: themeColors.text,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = color
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = themeColors.border
            }}
          />
        </div>
      ))}
      <div
        className="rounded-xl p-4 border"
        style={{
          background: themeColors.inputBg,
          borderColor: themeColors.border,
        }}
      >
        <div className="flex justify-between mb-2 text-xs">
          <span style={{ color: themeColors.mutedLight }}>CTR</span>
          <span className="font-bold" style={{ color }}>
            {data.imp > 0 ? formatPct(data.clicks / data.imp) : "—"}
          </span>
        </div>
        <div className="flex justify-between text-xs">
          <span style={{ color: themeColors.mutedLight }}>CVR</span>
          <span className="font-bold" style={{ color }}>
            {data.clicks > 0 ? formatPct(data.conv / data.clicks) : "—"}
          </span>
        </div>
      </div>
    </div>
  )
}

export default function ABTestCalculator() {
  const { isDarkMode } = useTheme()
  const theme = isDarkMode ? DARK_THEME : LIGHT

  const [a, setA] = useState<VariantData>({
    imp: 10000,
    clicks: 250,
    conv: 20,
  })
  const [b, setB] = useState<VariantData>({
    imp: 10200,
    clicks: 338,
    conv: 38,
  })

  const cvrA = a.clicks > 0 ? a.conv / a.clicks : 0
  const cvrB = b.clicks > 0 ? b.conv / b.clicks : 0
  const z = zScore(cvrA, a.clicks, cvrB, b.clicks)
  const confidence = zToConfidence(z)
  const significant = confidence >= 95
  const lift = cvrA > 0 ? ((cvrB - cvrA) / cvrA) * 100 : 0
  const winner = cvrB > cvrA ? "B" : "A"
  const confColor = confidence >= 95 ? NEON : confidence >= 80 ? YELLOW : RED

  const loadExample = (ex: (typeof EXAMPLES)[0]) => {
    setA(ex.a)
    setB(ex.b)
  }

  return (
    <div
      className="min-h-screen font-sans py-8 px-4 sm:py-10 sm:px-6 lg:py-12 lg:px-8 transition-colors"
      style={{ background: theme.bg, color: theme.text }}
    >
      <div className="max-w-[900px] mx-auto">
        <div className="mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5 mb-2">
            <div
              className="w-2 h-2 rounded-full shrink-0"
              style={{ background: NEON, boxShadow: `0 0 8px ${NEON}` }}
            />
            <span
              className="text-xs uppercase tracking-widest font-semibold"
              style={{ color: NEON }}
            >
              Statistical Tool
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight m-0">
            A/B Test Significance Calculator
          </h1>
          <p
            className="mt-2 text-sm sm:text-base"
            style={{ color: theme.muted }}
          >
            Know when a result is real — not just random variation. Stop making
            calls on gut feel.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 sm:gap-3 mb-5 sm:mb-6">
          {EXAMPLES.map((ex, i) => (
            <button
              key={i}
              type="button"
              onClick={() => loadExample(ex)}
              className="rounded-lg px-3 py-2 sm:px-4 sm:py-2.5 cursor-pointer text-xs sm:text-sm font-semibold border transition-colors hover:border-[#BFFF00] hover:text-[#BFFF00]"
              style={{
                background: theme.card,
                borderColor: theme.border,
                color: theme.muted,
              }}
            >
              Load: {ex.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 sm:gap-5 lg:gap-6 mb-5 sm:mb-6">
          <Variant
            label="Variant A (Control)"
            data={a}
            onChange={setA}
            color="#888"
            theme={theme}
          />
          <Variant
            label="Variant B (Challenger)"
            data={b}
            onChange={setB}
            color={NEON}
            theme={theme}
          />
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6 lg:p-8 text-center mb-5 sm:mb-6 border"
          style={{
            background: theme.card,
            borderColor: `${confColor}40`,
          }}
        >
          <div
            className="text-[11px] uppercase tracking-wider mb-4"
            style={{ color: theme.muted }}
          >
            Statistical Result
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-center sm:items-center gap-6 sm:gap-8 lg:gap-10 mb-5 sm:mb-6">
            <div>
              <div
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none"
                style={{ color: confColor }}
              >
                {confidence}%
              </div>
              <div className="text-sm mt-1" style={{ color: theme.muted }}>
                Confidence Level
              </div>
            </div>
            <div
              className="hidden sm:block w-px shrink-0 self-stretch"
              style={{ background: theme.border, minHeight: 60 }}
            />
            <div>
              <div
                className="text-4xl sm:text-5xl lg:text-6xl font-black leading-none"
                style={{ color: lift > 0 ? NEON : RED }}
              >
                {lift > 0 ? "+" : ""}
                {lift.toFixed(1)}%
              </div>
              <div className="text-sm mt-1" style={{ color: theme.muted }}>
                CVR Lift (B vs A)
              </div>
            </div>
          </div>

          <div
            className="rounded-xl p-4 sm:p-5 border text-left"
            style={{
              background: significant ? `${NEON}10` : `${RED}10`,
              borderColor: `${significant ? NEON : RED}30`,
            }}
          >
            <div
              className="font-extrabold text-base sm:text-lg mb-2"
              style={{ color: confColor }}
            >
              {significant
                ? `✅ Statistically Significant — Variant ${winner} Wins`
                : confidence >= 80
                  ? "⚠️ Approaching Significance — Need More Data"
                  : "❌ Not Significant — Don't Call This Test Yet"}
            </div>
            <div
              className="text-sm leading-relaxed"
              style={{ color: theme.muted }}
            >
              {significant
                ? `You have ${confidence}% confidence this result is real, not random. There's only a ${100 - confidence}% chance this is due to chance. Safe to scale Variant ${winner}.`
                : confidence >= 80
                  ? `You're at ${confidence}% confidence — below the 95% threshold. Run the test longer or increase traffic. Calling it now risks a false positive.`
                  : `At ${confidence}% confidence, this result is likely random noise. You need more data before making any decisions. Don't stop the test early.`}
            </div>
          </div>
        </div>

        <div
          className="rounded-2xl p-5 sm:p-6 lg:p-7 border"
          style={{ background: theme.card, borderColor: theme.border }}
        >
          <div
            className="text-[11px] uppercase tracking-wider mb-4"
            style={{ color: theme.muted }}
          >
            Why Statistical Significance Matters
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
            {[
              {
                icon: "📉",
                title: "Early Stopping",
                desc: "Most brands end tests too early. A test that 'looks like it's winning' at 70% confidence will flip 30% of the time. That's expensive guessing.",
              },
              {
                icon: "📊",
                title: "Sample Size",
                desc: "Significance requires enough data. 50 conversions per variant is minimum. Less than that and your margins of error are massive.",
              },
              {
                icon: "🔄",
                title: "One Test At A Time",
                desc: "Testing two things simultaneously (ad creative + landing page) makes it impossible to know what caused the result. Isolate variables.",
              },
              {
                icon: "⚖️",
                title: "95% Is The Bar",
                desc: "Industry standard is 95% confidence. Anything less means you're making budget decisions on a coin flip. Patience in testing compounds.",
              },
            ].map((item, i) => (
              <div key={i} className="flex gap-3">
                <span className="text-xl sm:text-2xl shrink-0">{item.icon}</span>
                <div className="min-w-0">
                  <div className="font-bold text-sm mb-1">{item.title}</div>
                  <div
                    className="text-xs sm:text-sm leading-snug"
                    style={{ color: theme.muted }}
                  >
                    {item.desc}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
