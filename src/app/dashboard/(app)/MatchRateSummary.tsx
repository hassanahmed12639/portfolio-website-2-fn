'use client'

import { useEffect, useState } from 'react'

type MatchRateRes = {
  estimated_match_rate?: number
  trend_direction?: 'up' | 'down' | 'stable'
  error?: string
  message?: string
}

function dotClass(rate: number) {
  if (rate >= 80) return 'bg-emerald-500'
  if (rate >= 60) return 'bg-amber-500'
  return 'bg-red-500'
}

export default function MatchRateSummary({ avgScore }: { avgScore: number }) {
  const [data, setData] = useState<MatchRateRes | null>(null)

  useEffect(() => {
    fetch('/api/meta/match-rate')
      .then((r) => r.json())
      .then(setData)
      .catch(() => setData(null))
  }, [])

  const rate =
    typeof data?.estimated_match_rate === 'number' ? data.estimated_match_rate : Math.round(avgScore * 0.95)
  const dot = dotClass(rate)
  const trend =
    data?.trend_direction === 'up'
      ? '↑ Improving'
      : data?.trend_direction === 'down'
        ? '↓ Declining'
        : data?.trend_direction === 'stable'
          ? '→ Stable'
          : null

  return (
    <p className="text-sm text-zinc-400 mt-3 flex items-center gap-2 flex-wrap">
      <span className={`h-2 w-2 rounded-full shrink-0 ${dot}`} aria-hidden />
      {data?.error || data?.message === 'No events yet' ? (
        <span>Est. Match Rate: <span className="text-white font-medium">{rate}%</span></span>
      ) : (
        <>
          <span>
            Est. Match Rate: <span className="text-white font-medium">{rate}%</span>
          </span>
          {trend && (
            <span
              className={
                data?.trend_direction === 'up'
                  ? 'text-emerald-400'
                  : data?.trend_direction === 'down'
                    ? 'text-red-400'
                    : 'text-zinc-500'
              }
            >
              {trend}
            </span>
          )}
        </>
      )}
    </p>
  )
}
