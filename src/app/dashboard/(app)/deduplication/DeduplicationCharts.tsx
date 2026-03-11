'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  CartesianGrid,
} from 'recharts'

type BarDatum = { name: string; count: number }
type DailyDatum = { date: string; duplicates: number; total: number }

export function DeduplicationCharts({
  barData,
  dailyTrend,
  mode,
}: {
  barData: BarDatum[]
  dailyTrend: DailyDatum[]
  mode: 'bar' | 'line'
}) {
  const tooltipStyle = {
    contentStyle: { backgroundColor: '#ffffff', border: '1px solid #e2e8f0', borderRadius: 8 },
    labelStyle: { color: '#0f172a' },
  }
  const tickStyle = { fill: '#94a3b8', fontSize: 11 }

  if (mode === 'bar') {
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={barData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis dataKey="name" tick={tickStyle} />
          <YAxis tick={tickStyle} />
          <RechartsTooltip {...tooltipStyle} />
          <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} name="Duplicates" />
        </BarChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={dailyTrend} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis
          dataKey="date"
          tick={tickStyle}
          tickFormatter={(v) => (v || '').slice(5)}
        />
        <YAxis tick={tickStyle} />
        <RechartsTooltip {...tooltipStyle} labelFormatter={(label) => label} />
        <Line
          type="monotone"
          dataKey="duplicates"
          stroke="#2563eb"
          strokeWidth={2}
          dot={{ fill: '#2563eb' }}
          name="Duplicates"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
