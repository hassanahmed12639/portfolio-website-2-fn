"use client"

import { useEffect, useMemo, useState } from "react"

type Side = "left" | "right"

type Lane = {
  p0: [number, number]
  p1: [number, number]
  p2: [number, number]
  p3: [number, number]
}

type Mover = {
  id: number
  side: Side
  laneIndex: number
  durationMs: number
  delayMs: number
}

const ICONS = [
  "/landing-meta.png",
  "/landing-google-ads.png",
  "/landing-tiktok-ads.png",
  "https://cdn.simpleicons.org/googleanalytics/E37400",
]

const LEFT_LANES: Lane[] = [
  { p0: [0, 16], p1: [180, 16], p2: [300, 158], p3: [600, 160] }, // top solid
  { p0: [0, 74], p1: [220, 74], p2: [350, 157], p3: [600, 160] }, // top dotted
  { p0: [0, 160], p1: [200, 160], p2: [400, 160], p3: [600, 160] }, // center
  { p0: [0, 246], p1: [220, 246], p2: [350, 163], p3: [600, 160] }, // bottom dotted
  { p0: [0, 304], p1: [180, 304], p2: [300, 162], p3: [600, 160] }, // bottom solid
]

const RIGHT_LANES: Lane[] = [
  { p0: [1200, 16], p1: [1020, 16], p2: [900, 158], p3: [600, 160] }, // top solid
  { p0: [1200, 74], p1: [980, 74], p2: [850, 157], p3: [600, 160] }, // top dotted
  { p0: [1200, 160], p1: [1000, 160], p2: [800, 160], p3: [600, 160] }, // center
  { p0: [1200, 246], p1: [980, 246], p2: [850, 163], p3: [600, 160] }, // bottom dotted
  { p0: [1200, 304], p1: [1020, 304], p2: [900, 162], p3: [600, 160] }, // bottom solid
]

function cubicPoint(t: number, lane: Lane) {
  const mt = 1 - t
  const mt2 = mt * mt
  const t2 = t * t

  const x =
    lane.p0[0] * mt2 * mt +
    3 * lane.p1[0] * mt2 * t +
    3 * lane.p2[0] * mt * t2 +
    lane.p3[0] * t2 * t
  const y =
    lane.p0[1] * mt2 * mt +
    3 * lane.p1[1] * mt2 * t +
    3 * lane.p2[1] * mt * t2 +
    lane.p3[1] * t2 * t

  return { x, y }
}

function pickIcon(loop: number, id: number) {
  const idx = Math.abs((loop * 7 + id * 11 + loop * loop) % ICONS.length)
  return ICONS[idx]
}

export default function WireFlowIcons() {
  const [now, setNow] = useState(0)

  const movers = useMemo<Mover[]>(
    () => [
      { id: 0, side: "left", laneIndex: 0, durationMs: 5400, delayMs: 0 },
      { id: 1, side: "left", laneIndex: 1, durationMs: 6200, delayMs: 420 },
      { id: 2, side: "left", laneIndex: 2, durationMs: 5000, delayMs: 760 },
      { id: 3, side: "left", laneIndex: 3, durationMs: 6400, delayMs: 1100 },
      { id: 4, side: "left", laneIndex: 4, durationMs: 5600, delayMs: 1450 },
      { id: 5, side: "right", laneIndex: 0, durationMs: 5800, delayMs: 260 },
      { id: 6, side: "right", laneIndex: 1, durationMs: 6500, delayMs: 620 },
      { id: 7, side: "right", laneIndex: 2, durationMs: 5100, delayMs: 920 },
      { id: 8, side: "right", laneIndex: 3, durationMs: 6100, delayMs: 1300 },
      { id: 9, side: "right", laneIndex: 4, durationMs: 5700, delayMs: 1680 },
    ],
    []
  )

  useEffect(() => {
    let raf = 0
    const tick = () => {
      setNow(performance.now())
      raf = window.requestAnimationFrame(tick)
    }
    raf = window.requestAnimationFrame(tick)
    return () => window.cancelAnimationFrame(raf)
  }, [])

  return (
    <div className="pointer-events-none absolute inset-0 z-[1]">
      {movers.map((mover) => {
        const elapsed = Math.max(0, now - mover.delayMs)
        const loop = Math.floor(elapsed / mover.durationMs)
        const t = (elapsed % mover.durationMs) / mover.durationMs

        const lane = mover.side === "left" ? LEFT_LANES[mover.laneIndex] : RIGHT_LANES[mover.laneIndex]
        const { x, y } = cubicPoint(t, lane)

        // Fade in early, stay visible, then fade behind CTA near convergence.
        let opacity = 1
        if (t < 0.08) opacity = t / 0.08
        if (t > 0.9) opacity = Math.max(0, (1 - t) / 0.1)

        const iconSrc = pickIcon(loop, mover.id)

        return (
          <div
            key={mover.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{
              left: `${(x / 1200) * 100}%`,
              top: `${(y / 320) * 100}%`,
              opacity,
            }}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-[#cbd5e1] bg-white shadow-sm sm:h-9 sm:w-9">
              <img src={iconSrc} alt="" aria-hidden="true" className="h-4 w-4 object-contain sm:h-5 sm:w-5" />
            </div>
          </div>
        )
      })}
    </div>
  )
}
