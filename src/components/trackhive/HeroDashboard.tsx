'use client'

import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

const CONVERSION_DATA = [
  { name: 'W1', value: 12 },
  { name: 'W2', value: 18 },
  { name: 'W3', value: 14 },
  { name: 'W4', value: 22 },
]

const PIE_DATA = [
  { name: 'Matched', value: 87, color: '#0f172a' },
  { name: 'Pending', value: 13, color: '#2563eb' },
]

const TREND_DATA = [
  { month: 'Jan', conversions: 12 },
  { month: 'Feb', conversions: 18 },
  { month: 'Mar', conversions: 15 },
  { month: 'Apr', conversions: 24 },
  { month: 'May', conversions: 28 },
  { month: 'Jun', conversions: 35 },
]

const cardStyle = 'rounded-2xl bg-white p-4 shadow-lg border border-slate-100/80'

export default function HeroDashboard() {
  return (
    <div className="w-full max-w-md space-y-4 relative">
      {/* Decorative doodle */}
      <div className="absolute -top-2 -right-2 text-amber-400/80" aria-hidden>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="drop-shadow-sm">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z" />
        </svg>
      </div>
      {/* Top row: Conversion events + Match rate */}
      <div className="grid grid-cols-2 gap-3">
        {/* Conversion events card */}
        <div className={cardStyle} style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)' }}>
          <p className="text-sm font-semibold text-slate-700 mb-2">Conversion events</p>
          <div className="flex items-end justify-between gap-2">
            <div>
              <span className="text-2xl font-bold text-[#0f172a]">520</span>
              <span className="ml-2 text-sm font-semibold text-[#2563eb]">+12%</span>
            </div>
            <div className="h-10 w-16">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={CONVERSION_DATA} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Match rate donut card */}
        <div className={cardStyle} style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)' }}>
          <p className="text-sm font-semibold text-slate-700 mb-2">Match rate</p>
          <div className="h-16 -mx-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={18}
                  outerRadius={28}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {PIE_DATA.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-3 mt-1 text-xs">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#0f172a]" />
              <span className="text-slate-600">87% matched</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#2563eb]" />
              <span className="text-slate-600">13% pending</span>
            </span>
          </div>
        </div>
      </div>

      {/* Monthly report line chart */}
      <div className={cardStyle} style={{ boxShadow: '0 20px 40px -12px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)' }}>
        <p className="text-sm font-semibold text-slate-700 mb-3">Conversions over time</p>
        <p className="text-xs text-slate-500 mb-3">
          Server-side tracking delivers full visibility to Meta, Google & TikTok
        </p>
        <div className="h-32">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="heroChartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2563eb" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#93c5fd" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={24} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  fontSize: '12px',
                }}
                formatter={(value: unknown) => [`${Number(value) || 0} conversions`, '']}
              />
              <Area
                type="monotone"
                dataKey="conversions"
                stroke="#2563eb"
                strokeWidth={2}
                fill="url(#heroChartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <a
          href="/dashboard/signup"
          className="inline-block mt-2 text-xs font-semibold text-[#2563eb] hover:text-[#1d4ed8] transition-colors"
        >
          View live dashboard →
        </a>
      </div>
    </div>
  )
}
