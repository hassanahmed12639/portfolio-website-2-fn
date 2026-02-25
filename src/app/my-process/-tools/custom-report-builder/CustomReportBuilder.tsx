"use client";

import { useState, useMemo } from "react";
import { useTheme } from "@/components/ThemeProvider";

const GREEN = "#aaff00";

const DARK_T = {
  bg: "#0d0d0d",
  card: "#141414",
  card2: "#161616",
  border: "#252525",
  border2: "#2a2a2a",
  green: GREEN,
  white: "#ffffff",
  grey: "#555555",
  muted: "#333",
  red: "#ff4455",
  yellow: "#ffc400",
};

const LIGHT_T = {
  bg: "#ffffff",
  card: "#f5f5f5",
  card2: "#ebebeb",
  border: "#e0e0e0",
  border2: "#d0d0d0",
  green: GREEN,
  white: "#0f0f0f",
  grey: "#555555",
  muted: "#666666",
  red: "#e53935",
  yellow: "#f9a825",
};

const BENCHMARKS: Record<string, Record<string, number>> = {
  ecomm: { roas: 3.5, mer: 2.8, cpa: 45, cpl: 18, cpm: 12, cpc: 1.2, ctr: 1.8, freq: 2.5, thumbstop: 30, cvr: 2.5, aov: 85, ltv: 180, ncac: 55, ltvac: 3.3 },
  saas: { roas: 2.8, mer: 2.2, cpa: 120, cpl: 45, cpm: 18, cpc: 2.8, ctr: 2.1, freq: 2.0, thumbstop: 28, cvr: 3.5, aov: 149, ltv: 800, ncac: 180, ltvac: 4.4 },
  agency: { roas: 4.0, mer: 3.0, cpa: 200, cpl: 60, cpm: 15, cpc: 2.1, ctr: 1.5, freq: 3.0, thumbstop: 25, cvr: 1.8, aov: 2500, ltv: 8000, ncac: 300, ltvac: 26 },
  leadgen: { roas: 5.0, mer: 3.5, cpa: 35, cpl: 12, cpm: 10, cpc: 0.9, ctr: 2.4, freq: 2.2, thumbstop: 32, cvr: 4.0, aov: 350, ltv: 500, ncac: 45, ltvac: 11 },
  info: { roas: 4.5, mer: 3.2, cpa: 80, cpl: 22, cpm: 8, cpc: 0.7, ctr: 3.0, freq: 2.8, thumbstop: 35, cvr: 3.0, aov: 197, ltv: 350, ncac: 100, ltvac: 3.5 },
};

const KPI_DEFS: Record<
  string,
  {
    name: string;
    abbr: string;
    fmt: (v: number) => string;
    desc: string;
    goodAbove: boolean;
    inputLabel: string;
    inputStep: string;
  }
> = {
  roas: { name: "Return on Ad Spend", abbr: "ROAS", fmt: (v) => `${v.toFixed(1)}x`, desc: "Revenue ÷ Ad Spend", goodAbove: true, inputLabel: "Your ROAS", inputStep: "0.1" },
  mer: { name: "Marketing Efficiency Ratio", abbr: "MER", fmt: (v) => `${v.toFixed(1)}x`, desc: "Total Revenue ÷ Total Marketing Spend", goodAbove: true, inputLabel: "Your MER", inputStep: "0.1" },
  cpa: { name: "Cost Per Acquisition", abbr: "CPA", fmt: (v) => `$${v.toFixed(0)}`, desc: "Total Spend ÷ Conversions", goodAbove: false, inputLabel: "Your CPA", inputStep: "1" },
  cpl: { name: "Cost Per Lead", abbr: "CPL", fmt: (v) => `$${v.toFixed(0)}`, desc: "Total Spend ÷ Leads Generated", goodAbove: false, inputLabel: "Your CPL", inputStep: "1" },
  cpm: { name: "Cost Per 1K Impressions", abbr: "CPM", fmt: (v) => `$${v.toFixed(2)}`, desc: "Cost to reach 1,000 people", goodAbove: false, inputLabel: "Your CPM", inputStep: "0.1" },
  cpc: { name: "Cost Per Click", abbr: "CPC", fmt: (v) => `$${v.toFixed(2)}`, desc: "Total Spend ÷ Clicks", goodAbove: false, inputLabel: "Your CPC", inputStep: "0.01" },
  ctr: { name: "Click-Through Rate", abbr: "CTR", fmt: (v) => `${v.toFixed(2)}%`, desc: "Clicks ÷ Impressions × 100", goodAbove: true, inputLabel: "Your CTR %", inputStep: "0.01" },
  freq: { name: "Frequency", abbr: "FREQ", fmt: (v) => `${v.toFixed(1)}x`, desc: "Avg. times one person sees your ad", goodAbove: false, inputLabel: "Your Freq", inputStep: "0.1" },
  thumbstop: { name: "Thumb Stop Ratio", abbr: "TSR", fmt: (v) => `${v.toFixed(0)}%`, desc: "3-sec views ÷ Impressions × 100", goodAbove: true, inputLabel: "Your TSR %", inputStep: "1" },
  cvr: { name: "Conversion Rate", abbr: "CVR", fmt: (v) => `${v.toFixed(2)}%`, desc: "Conversions ÷ Clicks × 100", goodAbove: true, inputLabel: "Your CVR %", inputStep: "0.01" },
  aov: { name: "Average Order Value", abbr: "AOV", fmt: (v) => `$${v.toFixed(0)}`, desc: "Revenue ÷ Number of Orders", goodAbove: true, inputLabel: "Your AOV", inputStep: "1" },
  ltv: { name: "Lifetime Value", abbr: "LTV", fmt: (v) => `$${Math.round(v).toLocaleString()}`, desc: "Avg. revenue per customer over lifetime", goodAbove: true, inputLabel: "Your LTV", inputStep: "1" },
  ncac: { name: "New Customer CAC", abbr: "nCAC", fmt: (v) => `$${v.toFixed(0)}`, desc: "Spend ÷ New Customers (not retargeted)", goodAbove: false, inputLabel: "Your nCAC", inputStep: "1" },
  ltvac: { name: "LTV : CAC Ratio", abbr: "LTV:CAC", fmt: (v) => `${v.toFixed(1)}x`, desc: "LTV ÷ CAC — profitability indicator", goodAbove: true, inputLabel: "LTV:CAC", inputStep: "0.1" },
};

const RELATIONSHIPS: Record<string, { title: string; a: string; b: string; desc: string }> = {
  "ctr-cpm": { title: "CTR affects effective CPM", a: "CTR", b: "CPM", desc: 'Higher CTR signals relevance to the algorithm, which <strong>lowers your CPM</strong> over time. A 1% CTR improvement can reduce CPM by 15-30%.' },
  "ctr-cpc": { title: "CTR drives CPC down", a: "CTR", b: "CPC", desc: "CTR and CPC move inversely. <strong>Double your CTR → roughly halve your CPC.</strong> Better creative = cheaper clicks." },
  "cpc-cvr": { title: "CPC + CVR determine CPA", a: "CPC", b: "CVR", desc: "CPA = CPC ÷ CVR. If your <strong>CVR doubles</strong>, your CPA halves without changing a single bid. Fix landing pages before scaling." },
  "roas-mer": { title: "ROAS vs MER gap reveals attribution error", a: "ROAS", b: "MER", desc: "If ROAS >> MER, your platform is taking credit for organic sales. The gap = <strong>attribution inflation</strong>. Trust MER." },
  "freq-ctr": { title: "Frequency kills CTR", a: "FREQ", b: "CTR", desc: "Above frequency 3–4, CTR drops exponentially. <strong>Refresh creative</strong> before frequency exceeds 3.5 to prevent performance decay." },
  "ltv-ncac": { title: "LTV justifies CAC", a: "LTV", b: "nCAC", desc: "If LTV:CAC > 3x, scale aggressively. Below 1.5x, the business model is <strong>unprofitable at scale</strong>. Fix retention first." },
  "aov-roas": { title: "AOV is your ROAS lever", a: "AOV", b: "ROAS", desc: "A <strong>$20 AOV increase</strong> on a $50 product improves ROAS by 40% with zero change to ad spend. Bundles, upsells, and order bumps." },
  "thumbstop-ctr": { title: "Thumb Stop → CTR pipeline", a: "TSR", b: "CTR", desc: "TSR measures if the hook stops the scroll. <strong>TSR above 30%</strong> typically produces CTR above 2%. Fix the first 3 seconds first." },
};

const RECS: Record<
  string,
  { good?: { t: string; d: string; p: string }; warn?: { t: string; d: string; p: string }; bad?: { t: string; d: string; p: string } }
> = {
  roas: { good: { t: "Scale Winning Campaigns", d: "ROAS is above benchmark. Increase budgets 20% every 72hrs while ROAS stays strong.", p: "low" }, warn: { t: "Diagnose CPA Drivers", d: "ROAS near benchmark. Audit your best/worst ad sets. Pause bottom 20% by ROAS.", p: "med" }, bad: { t: "Stop & Fix Before Scaling", d: "ROAS below breakeven. Diagnose creative, audience, offer, and landing page before adding budget.", p: "high" } },
  mer: { good: { t: "Trust the Model", d: "MER is healthy. Use this as your true north when platform ROAS looks inflated.", p: "low" }, bad: { t: "Reduce Non-Tracked Spend", d: "MER below target. Audit all marketing spend — dark social, influencer, and brand may be underperforming.", p: "high" } },
  cpa: { good: { t: "Maintain & Scale", d: "CPA is below benchmark. Test higher budgets in top-performing campaigns.", p: "low" }, bad: { t: "CPA Reduction Sprint", d: "Run a 2-week CPA audit: check landing page CVR, audience quality, bidding strategy, and creative angles.", p: "high" } },
  ctr: { good: { t: "Document the Hook", d: "CTR is strong. Record exactly what angle, format, and audience is producing this — replicate it.", p: "low" }, bad: { t: "Creative Overhaul Needed", d: "CTR below 1% signals poor creative-audience fit. Test 5 new hooks before scaling.", p: "high" } },
  freq: { bad: { t: "Creative Refresh Urgent", d: "Frequency above 3.5 causes creative fatigue. Launch new variations immediately to prevent CTR collapse.", p: "high" }, warn: { t: "Watch Frequency Closely", d: "Approaching fatigue territory. Prepare 3 new creative variants to deploy before frequency hits 4.", p: "med" } },
  cvr: { bad: { t: "Landing Page Audit", d: "Low CVR suggests offer-page disconnect. Run an A/B test on headline, CTA, and social proof before pushing more traffic.", p: "high" } },
  ltvac: { bad: { t: "Fix Unit Economics First", d: "LTV:CAC below 3x means you're not profitable long-term. Improve retention, upsells, or reduce CAC before scaling.", p: "high" }, good: { t: "Aggressive Scale Mode", d: "Strong LTV:CAC ratio. You can afford to acquire customers at higher costs. Consider increasing target CPA to capture more volume.", p: "low" } },
};

const INDUSTRY_NAMES: Record<string, string> = {
  ecomm: "E-commerce",
  saas: "SaaS",
  agency: "Agency / Services",
  leadgen: "Lead Generation",
  info: "Info Products / Courses",
};

const KPI_GROUPS: { label: string; kpis: string[] }[] = [
  { label: "Efficiency", kpis: ["roas", "mer", "cpa"] },
  { label: "Acquisition", kpis: ["cpl", "cpm", "cpc"] },
  { label: "Engagement", kpis: ["ctr", "freq", "thumbstop"] },
  { label: "Conversion", kpis: ["cvr", "aov", "ltv"] },
  { label: "Profitability", kpis: ["ncac", "ltvac"] },
];

function getStatus(kpi: string, val: number, industry: string): "good" | "warn" | "bad" {
  const bench = BENCHMARKS[industry]?.[kpi] ?? 0;
  const def = KPI_DEFS[kpi];
  if (!def) return "bad";
  const ratio = def.goodAbove ? val / bench : bench / val;
  if (ratio >= 1.1) return "good";
  if (ratio >= 0.8) return "warn";
  return "bad";
}

function getBenchFillPct(kpi: string, val: number, industry: string): number {
  const bench = BENCHMARKS[industry]?.[kpi] ?? 0;
  const def = KPI_DEFS[kpi];
  if (!def) return 0;
  if (def.goodAbove) return Math.min(100, (val / (bench * 1.5)) * 100);
  return Math.min(100, (bench / val) * 100 * (val <= bench ? 1 : 0.8));
}

function getBenchMarkerPct(bench: number, goodAbove: boolean): number {
  return Math.min(95, (bench / (bench * 1.5)) * 100);
}

export default function CustomReportBuilder() {
  const { isDarkMode } = useTheme();
  const T = isDarkMode ? DARK_T : LIGHT_T;
  const [activeKPIs, setActiveKPIs] = useState<Set<string>>(new Set());
  const [industry, setIndustry] = useState("ecomm");
  const [userValues, setUserValues] = useState<Record<string, number>>({});

  const toggleKPI = (kpi: string) => {
    setActiveKPIs((prev) => {
      const next = new Set(prev);
      if (next.has(kpi)) {
        next.delete(kpi);
        setUserValues((uv) => {
          const u = { ...uv };
          delete u[kpi];
          return u;
        });
      } else next.add(kpi);
      return next;
    });
  };

  const setUserValue = (kpi: string, value: number | undefined) => {
    if (value === undefined) {
      setUserValues((uv) => {
        const u = { ...uv };
        delete u[kpi];
        return u;
      });
    } else setUserValues((uv) => ({ ...uv, [kpi]: value }));
  };

  const reportDate = useMemo(
    () => new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    []
  );

  const count = activeKPIs.size;
  const activeArr = useMemo(() => Array.from(activeKPIs), [activeKPIs]);

  const activeRelationships = useMemo(() => {
    const found: { title: string; a: string; b: string; desc: string }[] = [];
    Object.entries(RELATIONSHIPS).forEach(([key, rel]) => {
      const [a, b] = key.split("-");
      if (activeArr.includes(a) && activeArr.includes(b)) found.push(rel);
    });
    return found;
  }, [activeArr]);

  const recommendations = useMemo(() => {
    const items: { t: string; d: string; p: string; kpi: string }[] = [];
    activeKPIs.forEach((kpi) => {
      const recSet = RECS[kpi];
      if (!recSet) return;
      const val = userValues[kpi];
      if (val === undefined) return;
      const status = getStatus(kpi, val, industry);
      const rec = status === "bad" ? recSet.bad : status === "warn" ? recSet.warn : recSet.good;
      if (rec) items.push({ ...rec, kpi });
    });
    const order: Record<string, number> = { high: 0, med: 1, low: 2 };
    items.sort((a, b) => order[a.p] - order[b.p]);
    return items;
  }, [activeKPIs, userValues, industry]);

  return (
    <div
      className="rounded-xl overflow-hidden border"
      style={{
        background: T.bg,
        borderColor: T.border,
        fontFamily: "'DM Sans', sans-serif",
        boxShadow: "0 24px 80px rgba(0,0,0,0.15)",
      }}
    >
      <div
        className="relative z-10 border-b flex items-center gap-4 px-4 md:px-8 py-3"
        style={{
          borderColor: T.border,
          background: isDarkMode ? "rgba(13,13,13,0.9)" : "rgba(255,255,255,0.9)",
          backdropFilter: "blur(10px)",
        }}
      >
        <span className="font-bold tracking-wide" style={{ color: T.green }}>
          My Process
        </span>
        <span style={{ color: T.border }}>|</span>
        <span className="text-xs uppercase tracking-wider" style={{ color: T.muted }}>
          Tool — Custom Report Builder
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] min-h-[calc(100vh-120px)] relative z-[1]">
        {/* Sidebar */}
        <aside
          className="border-r overflow-y-auto p-6 lg:sticky lg:top-0 lg:h-[calc(100vh-120px)]"
          style={{
            borderColor: T.border,
            background: isDarkMode ? "rgba(10,10,10,0.6)" : "rgba(248,248,248,0.8)",
          }}
        >
          <div
            className="text-[9px] uppercase tracking-[0.2em] mb-5 pb-3 border-b"
            style={{ color: T.muted, borderColor: T.border }}
          >
            Select Your KPIs
          </div>
          {KPI_GROUPS.map((group) => (
            <div key={group.label} className="mb-6">
              <div
                className="text-[10px] uppercase tracking-wider mb-2"
                style={{ color: T.green, fontFamily: "monospace" }}
              >
                {group.label}
              </div>
              {group.kpis.map((kpi) => {
                const def = KPI_DEFS[kpi];
                if (!def) return null;
                const active = activeKPIs.has(kpi);
                return (
                  <button
                    key={kpi}
                    type="button"
                    onClick={() => toggleKPI(kpi)}
                    className="w-full flex items-center gap-2.5 py-2 px-3 rounded-lg mb-1 border border-transparent transition-all duration-150 text-left"
                    style={{
                      background: active ? (isDarkMode ? "rgba(170,255,0,0.06)" : "rgba(170,255,0,0.12)") : "transparent",
                      borderColor: active ? "rgba(170,255,0,0.2)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = isDarkMode ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)";
                        e.currentTarget.style.borderColor = T.border2;
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!active) {
                        e.currentTarget.style.background = "transparent";
                        e.currentTarget.style.borderColor = "transparent";
                      }
                    }}
                  >
                    <span
                      className="w-7 h-4 rounded-full flex-shrink-0 relative transition-colors inline-block"
                      style={{
                        background: active ? T.green : T.border2,
                      }}
                    >
                      <span
                        className="absolute top-0.5 w-3 h-3 rounded-full transition-all duration-200"
                        style={{
                          background: active ? T.bg : T.grey,
                          left: active ? "15px" : "2px",
                        }}
                      />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium" style={{ color: T.white }}>
                        {def.name}
                      </div>
                      <div
                        className="text-[10px] font-mono"
                        style={{ color: active ? "rgba(170,255,0,0.5)" : T.grey }}
                      >
                        {def.abbr}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
          <div className="pt-5 mt-5 border-t" style={{ borderColor: T.border }}>
            <div
              className="text-[10px] uppercase tracking-wider mb-2 font-mono"
              style={{ color: T.grey }}
            >
              Industry Benchmarks
            </div>
            <select
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full rounded-lg px-3 py-2.5 text-sm outline-none cursor-pointer border"
              style={{
                background: T.card,
                borderColor: T.border2,
                color: T.white,
              }}
            >
              {Object.entries(INDUSTRY_NAMES).map(([value, name]) => (
                <option key={value} value={value} style={{ background: isDarkMode ? "#1a1a1a" : "#fff" }}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </aside>

        {/* Dashboard */}
        <div className="p-6 md:p-7 overflow-y-auto pb-16">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-7">
            <div>
              <h1
                className="text-3xl md:text-4xl font-bold tracking-wide leading-none"
                style={{ fontFamily: "'Bebas Neue', sans-serif" }}
              >
                YOUR <span style={{ color: T.green }}>REPORT</span>
              </h1>
              <p
                className="text-xs font-mono mt-1.5"
                style={{ color: T.grey }}
              >
                {count
                  ? `${count} metric${count > 1 ? "s" : ""} active · ${INDUSTRY_NAMES[industry]} benchmarks`
                  : "Toggle KPIs on the left to build your dashboard"}
              </p>
            </div>
            <div className="text-right font-mono text-[10px]" style={{ color: T.muted }}>
              <div>{INDUSTRY_NAMES[industry]}</div>
              <div className="mt-1">{reportDate}</div>
            </div>
          </div>

          {count === 0 && (
            <div
              className="text-center py-20 px-6 border border-dashed rounded-xl mt-5"
              style={{ borderColor: T.border2 }}
            >
              <div className="text-4xl opacity-30 mb-4">📊</div>
              <p className="text-sm font-mono leading-relaxed" style={{ color: T.grey }}>
                No KPIs selected yet.
                <br />
                Toggle metrics from the left panel
                <br />
                to populate your live dashboard.
              </p>
            </div>
          )}

          {count > 0 && (
            <>
              <div
                className="rounded-xl border p-5 mb-7"
                style={{ background: T.card, borderColor: T.border }}
              >
                <div
                  className="text-[10px] uppercase tracking-wider mb-4 font-mono"
                  style={{ color: T.grey }}
                >
                  Enter Your Numbers (optional — uses industry averages if blank)
                </div>
                <div className="flex flex-wrap gap-3 items-end">
                  {activeArr.map((kpi) => {
                    const def = KPI_DEFS[kpi];
                    const bench = BENCHMARKS[industry]?.[kpi] ?? 0;
                    const val = userValues[kpi];
                    return (
                      <div key={kpi} className="flex flex-col gap-1 flex-1 min-w-[120px]">
                        <label
                          className="text-[10px] font-mono uppercase tracking-wider"
                          style={{ color: T.grey }}
                        >
                          {def.inputLabel}
                        </label>
                        <input
                          type="number"
                          step={def.inputStep}
                          placeholder={def.fmt(bench)}
                          value={val !== undefined ? val : ""}
                          onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setUserValue(kpi, Number.isFinite(v) ? v : undefined);
                          }}
                          className="rounded-md px-3 py-2 text-sm font-mono outline-none w-full border transition-colors"
                          style={{
                            background: T.card2,
                            borderColor: T.border2,
                            color: T.white,
                          }}
                        />
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {}}
                    className="rounded-lg px-5 py-2.5 font-bold text-base tracking-wide whitespace-nowrap transition-all border-0 cursor-pointer"
                    style={{
                      background: T.green,
                      color: isDarkMode ? "#000" : "#0d0d0d",
                    }}
                  >
                    UPDATE →
                  </button>
                </div>
              </div>

              <div
                className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2.5 border-b flex items-center gap-2.5"
                style={{ color: T.muted, borderColor: T.border }}
              >
                <span className="w-4 h-px block" style={{ background: T.green }} />
                Live KPI Dashboard
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 mb-7">
                {activeArr.map((kpi, i) => {
                  const def = KPI_DEFS[kpi];
                  const bench = BENCHMARKS[industry]?.[kpi] ?? 0;
                  const val = userValues[kpi] !== undefined ? userValues[kpi]! : bench;
                  const status = userValues[kpi] !== undefined ? getStatus(kpi, val, industry) : "neutral";
                  const fillPct = userValues[kpi] !== undefined ? Math.min(98, getBenchFillPct(kpi, val, industry)) : 60;
                  const markerPct = getBenchMarkerPct(bench, def.goodAbove);
                  const statusLabel =
                    userValues[kpi] !== undefined
                      ? status === "good"
                        ? `↑ Above benchmark (${def.fmt(bench)})`
                        : status === "warn"
                          ? `≈ Near benchmark (${def.fmt(bench)})`
                          : `↓ Below benchmark (${def.fmt(bench)})`
                      : "Enter your number above to compare";
                  const statusColor =
                    status === "good" ? T.green : status === "warn" ? T.yellow : status === "bad" ? T.red : T.muted;
                  const topBarColor = status === "good" ? T.green : status === "warn" ? T.yellow : status === "bad" ? T.red : T.muted;
                  return (
                    <div
                      key={kpi}
                      className="rounded-xl border p-4 relative overflow-hidden transition-colors hover:border-opacity-80"
                      style={{
                        background: T.card,
                        borderColor: T.border,
                        animationDelay: `${i * 50}ms`,
                      }}
                    >
                      <div
                        className="absolute top-0 left-0 right-0 h-0.5"
                        style={{ background: topBarColor }}
                      />
                      <div
                        className="text-[9px] font-mono uppercase tracking-wider mb-2"
                        style={{ color: T.grey }}
                      >
                        {def.abbr} — {def.desc}
                      </div>
                      <div
                        className="text-3xl font-bold leading-none mb-1"
                        style={{ color: status !== "neutral" ? statusColor : T.white, fontFamily: "'Bebas Neue', sans-serif" }}
                      >
                        {def.fmt(val)}
                      </div>
                      <div className="text-[11px] mb-3" style={{ color: T.grey }}>
                        {def.name}
                      </div>
                      <div className="mb-2">
                        <div className="flex justify-between font-mono text-[9px] mb-1" style={{ color: T.grey }}>
                          <span>Your value</span>
                          <span>Benchmark: {def.fmt(bench)}</span>
                        </div>
                        <div
                          className="h-1 rounded-full relative overflow-visible"
                          style={{ background: T.border2 }}
                        >
                          <div
                            className="h-full rounded-full absolute top-0 left-0 transition-all duration-300 max-w-full"
                            style={{
                              width: `${fillPct}%`,
                              background: status !== "neutral" ? statusColor : T.grey,
                              boxShadow: status === "good" ? `0 0 8px ${T.green}40` : "none",
                            }}
                          />
                          <div
                            className="absolute top-[-3px] w-0.5 h-2.5 rounded-sm"
                            style={{ left: `${markerPct}%`, background: T.grey }}
                          />
                        </div>
                      </div>
                      <div className="text-[10px] font-mono mt-2" style={{ color: status !== "neutral" ? statusColor : T.muted }}>
                        {statusLabel}
                      </div>
                    </div>
                  );
                })}
              </div>

              {activeRelationships.length > 0 && (
                <>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2.5 border-b flex items-center gap-2.5"
                    style={{ color: T.muted, borderColor: T.border }}
                  >
                    <span className="w-4 h-px block" style={{ background: T.green }} />
                    How Your Metrics Interact
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-7">
                    {activeRelationships.map((rel) => (
                      <div
                        key={rel.title}
                        className="rounded-xl border p-4"
                        style={{ background: T.card, borderColor: T.border }}
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold mb-1.5" style={{ color: T.white }}>
                          <span>{rel.a}</span>
                          <span style={{ color: T.green }}>⇄</span>
                          <span>{rel.b}</span>
                        </div>
                        <div className="text-xs font-semibold mb-1.5" style={{ color: T.white }}>
                          {rel.title}
                        </div>
                        <p
                          className="text-xs leading-relaxed"
                          style={{ color: T.grey }}
                          dangerouslySetInnerHTML={{ __html: rel.desc }}
                        />
                      </div>
                    ))}
                  </div>
                </>
              )}

              {recommendations.length > 0 && (
                <>
                  <div
                    className="text-[10px] uppercase tracking-[0.2em] mb-4 pb-2.5 border-b flex items-center gap-2.5"
                    style={{ color: T.muted, borderColor: T.border }}
                  >
                    <span className="w-4 h-px block" style={{ background: T.green }} />
                    Action Recommendations
                  </div>
                  <div className="flex flex-col gap-2.5 mb-7">
                    {recommendations.map((item) => {
                      const icons: Record<string, string> = { high: "🚨", med: "⚠️", low: "✅" };
                      const borderColors: Record<string, string> = {
                        high: "rgba(255,68,85,0.2)",
                        med: "rgba(255,196,0,0.15)",
                        low: "rgba(170,255,0,0.1)",
                      };
                      const pillBg: Record<string, string> = {
                        high: "rgba(255,68,85,0.15)",
                        med: "rgba(255,196,0,0.12)",
                        low: "rgba(170,255,0,0.1)",
                      };
                      const pillColor: Record<string, string> = { high: T.red, med: T.yellow, low: T.green };
                      return (
                        <div
                          key={item.t + item.kpi}
                          className="rounded-lg border p-4 flex gap-3"
                          style={{ background: T.card, borderColor: borderColors[item.p] || T.border }}
                        >
                          <div className="text-base flex-shrink-0">{icons[item.p]}</div>
                          <div className="flex-1">
                            <div className="text-[13px] font-medium mb-0.5" style={{ color: T.white }}>
                              {item.t}
                            </div>
                            <div className="text-xs leading-snug" style={{ color: T.grey }}>
                              {item.d}
                            </div>
                          </div>
                          <div
                            className="font-mono text-[9px] px-2 py-0.5 rounded-full self-start mt-0.5 flex-shrink-0"
                            style={{ background: pillBg[item.p], color: pillColor[item.p] }}
                          >
                            {item.p.toUpperCase()}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>

    </div>
  );
}
