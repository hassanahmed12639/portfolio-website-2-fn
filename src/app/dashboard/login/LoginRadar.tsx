'use client'

import { useEffect, useRef } from 'react'

const SWEEP_WIDTH = 30
const ROTATION_SPEED = 1.8

export default function LoginRadar() {
  const radarRef = useRef<HTMLDivElement>(null)
  const sweepGradientRef = useRef<HTMLDivElement>(null)
  const animationFrameId = useRef<number | null>(null)
  const rotationRef = useRef(0)
  const scannedDotsRef = useRef<Set<string>>(new Set())

  useEffect(() => {
    const radar = radarRef.current
    const sweepGradient = sweepGradientRef.current
    if (!radar || !sweepGradient) return

    const radarCircles = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-circle'))
    const radarDots = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-dot'))
    const circleFills = Array.from(radar.querySelectorAll<HTMLDivElement>('.circle-fill'))

    radarDots.forEach((dot, index) => {
      const angle = Number.parseFloat(dot.dataset.angle ?? '0')
      const distance = Number.parseFloat(dot.dataset.distance ?? '0')
      const radarScale = radar.clientWidth / 390
      const radians = (angle - 90) * (Math.PI / 180)
      const x = Math.cos(radians) * (distance * 1.68 * radarScale)
      const y = Math.sin(radians) * (distance * 1.68 * radarScale)
      dot.style.left = `calc(50% + ${x}px)`
      dot.style.top = `calc(50% + ${y}px)`
      dot.dataset.index = String(index)
    })

    radarCircles.forEach((circle, index) => {
      const size = [100, 82, 64, 46, 28][index]
      circle.style.width = `${size}%`
      circle.style.height = `${size}%`
      circle.style.opacity = '1'
      circle.style.transform = 'translate(-50%, -50%) scale(1)'
    })

    const applyRadarSweep = (rotation: number) => {
      sweepGradient.style.transform = `rotate(${rotation}deg)`
      circleFills.forEach((fill) => {
        fill.style.background = `conic-gradient(from 0deg at 50% 50%, rgba(37, 99, 235, 0.12) 0deg, rgba(37, 99, 235, 0.12) ${rotation}deg, transparent ${rotation}deg, transparent 360deg)`
      })
    }

    const updateDots = (currentAngle: number) => {
      radarDots.forEach((dot) => {
        const dotAngle = Number.parseFloat(dot.dataset.angle ?? '0')
        const dotIndex = dot.dataset.index ?? ''
        const angleDiff = (dotAngle - currentAngle + 360) % 360
        const isSweepOver = angleDiff <= SWEEP_WIDTH

        if (isSweepOver) {
          scannedDotsRef.current.add(dotIndex)
          dot.classList.add('detected')
          dot.classList.add('active')
          return
        }
        if (scannedDotsRef.current.has(dotIndex)) {
          dot.classList.add('detected')
          dot.classList.remove('active')
          return
        }
        dot.classList.remove('detected')
        dot.classList.remove('active')
      })
    }

    const animate = () => {
      rotationRef.current += ROTATION_SPEED
      if (rotationRef.current >= 360) rotationRef.current = 0
      applyRadarSweep(rotationRef.current)
      updateDots(rotationRef.current % 360)
      animationFrameId.current = window.requestAnimationFrame(animate)
    }
    animate()

    return () => {
      if (animationFrameId.current !== null) {
        window.cancelAnimationFrame(animationFrameId.current)
      }
    }
  }, [])

  return (
    <div className="login-radar-container h-full w-full flex flex-col items-center justify-center gap-6">
      <h2
        className="login-radar-heading text-center font-bold text-[var(--dash-text)] px-4 tracking-tight leading-tight max-w-[480px] text-xl sm:text-2xl md:text-3xl"
        style={{ fontFamily: '"Segoe UI", "Segoe UI Variable", -apple-system, BlinkMacSystemFont, "Helvetica Neue", Arial, sans-serif' }}
      >
        Missing 50% of your conversions? Fix your tracking now.
      </h2>
      <div ref={radarRef} className="login-radar">
        <div className="radar-circle circle-1">
          <div className="circle-fill" data-circle="1" />
        </div>
        <div className="radar-circle circle-2">
          <div className="circle-fill" data-circle="2" />
        </div>
        <div className="radar-circle circle-3">
          <div className="circle-fill" data-circle="3" />
        </div>
        <div className="radar-circle circle-4">
          <div className="circle-fill" data-circle="4" />
        </div>
        <div className="radar-circle circle-5">
          <div className="circle-fill" data-circle="5" />
        </div>

        <div className="center-dot" />

        <div className="radar-sweep">
          <div ref={sweepGradientRef} className="sweep-gradient" />
        </div>

        <div className="radar-dot radar-dot-icon small" data-angle="105" data-distance="70">
          <img src="/x-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon medium" data-angle="285" data-distance="70">
          <img src="/shopify-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon medium" data-angle="322" data-distance="95">
          <img src="/google-ads-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon large" data-angle="0" data-distance="50">
          <img src="/meta-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon small pinterest" data-angle="55" data-distance="95">
          <img src="/pinterest-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon large" data-angle="150" data-distance="95">
          <img src="/snapchat-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
        <div className="radar-dot radar-dot-icon large" data-angle="240" data-distance="95">
          <img src="/tiktok-icon.png" alt="" className="radar-dot-icon-img" />
        </div>
      </div>
      <style jsx>{`
        .login-radar-container {
          position: relative;
          min-height: 320px;
        }

        .login-radar {
          --radar-size: min(90vw, 90vh, 420px);
          width: var(--radar-size);
          height: var(--radar-size);
          position: relative;
          flex-shrink: 0;
        }

        .radar-circle {
          position: absolute;
          border: 1.5px solid rgba(113, 113, 122, 0.5);
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          overflow: hidden;
        }

        .circle-1 {
          width: 100%;
          height: 100%;
        }

        .circle-2 {
          width: 82%;
          height: 82%;
        }

        .circle-3 {
          width: 64%;
          height: 64%;
        }

        .circle-4 {
          width: 46%;
          height: 46%;
        }

        .circle-5 {
          width: 28%;
          height: 28%;
        }

        .circle-fill {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background: transparent;
          opacity: 1;
        }

        .center-dot {
          position: absolute;
          width: 8px;
          height: 8px;
          background: #64748b;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .radar-sweep {
          position: absolute;
          width: 100%;
          height: 100%;
          top: 0;
          left: 0;
          overflow: hidden;
          border-radius: 50%;
          pointer-events: none;
        }

        .sweep-gradient {
          position: absolute;
          width: 100%;
          height: 100%;
          background: conic-gradient(
            from 0deg at 50% 50%,
            transparent 0deg,
            rgba(200, 230, 100, 0.14) 15deg,
            rgba(200, 230, 100, 0.1) 40deg,
            rgba(200, 230, 100, 0.05) 70deg,
            transparent 90deg
          );
          transform: rotate(0deg);
        }

        .radar-dot {
          position: absolute;
          border-radius: 50%;
          background: transparent !important;
          border: 2px solid rgba(148, 163, 184, 0.8) !important;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 5;
          box-shadow: none !important;
          transition: background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease;
        }

        .radar-dot.small {
          width: 18px;
          height: 18px;
        }

        .radar-dot.medium {
          width: 30px;
          height: 30px;
        }

        .radar-dot.large {
          width: 50px;
          height: 50px;
        }

        .radar-dot.radar-dot-icon {
          border: none !important;
          background: transparent !important;
          padding: 0;
        }

        .radar-dot.radar-dot-icon.small {
          width: 44px;
          height: 44px;
        }

        .radar-dot.radar-dot-icon.pinterest {
          width: 68px;
          height: 68px;
        }

        .radar-dot.radar-dot-icon.medium {
          width: 50px;
          height: 50px;
        }

        .radar-dot.radar-dot-icon.large {
          width: 68px;
          height: 68px;
        }

        .radar-dot.radar-dot-icon .radar-dot-icon-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          display: block;
        }

        .radar-dot.radar-dot-icon.detected {
          background: transparent !important;
        }

        .radar-dot.radar-dot-icon.detected .radar-dot-icon-img {
          filter: drop-shadow(0 0 12px rgba(37, 99, 235, 0.6))
            drop-shadow(0 0 24px rgba(37, 99, 235, 0.4));
        }

        .radar-dot.radar-dot-icon.active .radar-dot-icon-img {
          filter: drop-shadow(0 0 12px rgba(200, 230, 100, 0.9))
            drop-shadow(0 0 24px rgba(200, 230, 100, 0.5))
            drop-shadow(0 0 40px rgba(200, 230, 100, 0.35));
        }

        .radar-dot.detected {
          background: rgba(37, 99, 235, 0.9) !important;
          border-color: #2563eb !important;
          box-shadow: 0 0 20px rgba(37, 99, 235, 0.5), 0 0 40px rgba(37, 99, 235, 0.25),
            inset 0 0 15px rgba(255, 255, 255, 0.5) !important;
        }

        .radar-dot.active {
          animation: radarPulse 1.5s ease-in-out infinite;
        }

        @keyframes radarPulse {
          0%,
          100% {
            transform: translate(-50%, -50%) scale(1);
          }
          50% {
            transform: translate(-50%, -50%) scale(1.2);
          }
        }

        .radar-dot.active::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 150%;
          height: 150%;
          border-radius: 50%;
          border: 2px solid rgba(200, 230, 100, 0.4);
          animation: radarRingPulse 1.5s ease-in-out infinite;
        }

        @keyframes radarRingPulse {
          0%,
          100% {
            width: 150%;
            height: 150%;
            opacity: 0.4;
          }
          50% {
            width: 200%;
            height: 200%;
            opacity: 0.1;
          }
        }
      `}</style>
    </div>
  )
}




