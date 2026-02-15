 'use client'

import { useEffect, useRef } from 'react'

export default function OpportunityOrbitSection() {
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const radarContainerRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const sweepGradientRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollTrack = scrollTrackRef.current
    const section = sectionRef.current
    const radarContainer = radarContainerRef.current
    const radar = radarRef.current
    const sweepGradient = sweepGradientRef.current

    if (!scrollTrack || !section || !radarContainer || !radar || !sweepGradient) return

    const radarCircles = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-circle'))
    const radarDots = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-dot'))
    const circleFills = Array.from(radar.querySelectorAll<HTMLDivElement>('.circle-fill'))

    let isAutoRotating = false
    let autoRotationAngle = 0
    let animationFrameId: number | null = null
    let firstRotationComplete = false
    const scannedDots = new Set<string>()

    const radarScale = radar.clientWidth / 390

    radarDots.forEach((dot, index) => {
      const angle = Number.parseFloat(dot.dataset.angle ?? '0')
      const distance = Number.parseFloat(dot.dataset.distance ?? '0')
      const radians = (angle - 90) * (Math.PI / 180)
      const x = Math.cos(radians) * (distance * 1.68 * radarScale)
      const y = Math.sin(radians) * (distance * 1.68 * radarScale)
      dot.style.left = `calc(50% + ${x}px)`
      dot.style.top = `calc(50% + ${y}px)`
      dot.dataset.index = String(index)
    })

    radarCircles.forEach((circle) => {
      circle.style.opacity = '0'
      circle.style.transform = 'translate(-50%, -50%) scale(0.96)'
    })

    const updateDots = (currentAngle: number) => {
      const sweepWidth = 30
      radarDots.forEach((dot) => {
        const dotAngle = Number.parseFloat(dot.dataset.angle ?? '0')
        const dotIndex = dot.dataset.index ?? ''
        const angleDiff = (dotAngle - currentAngle + 360) % 360
        const isSweepOver = angleDiff <= sweepWidth

        if (isSweepOver) {
          scannedDots.add(dotIndex)
          dot.classList.add('detected')
          dot.classList.add('active')
          return
        }

        if (scannedDots.has(dotIndex)) {
          dot.classList.add('detected')
          dot.classList.remove('active')
          return
        }

        dot.classList.remove('detected')
        dot.classList.remove('active')
      })
    }

    const startAutoRotation = () => {
      if (isAutoRotating) return
      isAutoRotating = true

      const animate = () => {
        if (!isAutoRotating) return
        autoRotationAngle += 2
        if (autoRotationAngle >= 360) autoRotationAngle = 0

        sweepGradient.style.transform = `rotate(${autoRotationAngle}deg)`
        circleFills.forEach((fill) => {
          fill.style.background = `conic-gradient(from 0deg at 50% 50%, rgba(200, 230, 100, 0.10) 0deg, rgba(200, 230, 100, 0.10) ${autoRotationAngle}deg, transparent ${autoRotationAngle}deg, transparent 360deg)`
        })
        updateDots(autoRotationAngle)
        animationFrameId = window.requestAnimationFrame(animate)
      }

      animate()
    }

    const updateRadar = () => {
      const trackRect = scrollTrack.getBoundingClientRect()
      const viewportHeight = window.innerHeight
      const totalTravel = scrollTrack.offsetHeight + viewportHeight
      const traveled = viewportHeight - trackRect.top
      const scrollProgress = Math.max(0, Math.min(1, traveled / totalTravel))
      const revealPortion = 0.28
      const sweepPortion = 0.52
      const autoTriggerPortion = 0.9
      const revealProgress = Math.max(0, Math.min(1, scrollProgress / revealPortion))
      const radarProgress = Math.max(0, Math.min(1, (scrollProgress - revealPortion) / sweepPortion))
      const rotation = radarProgress * 360

      radarCircles.forEach((circle, index) => {
        const layerProgress = Math.max(0, Math.min(1, revealProgress * radarCircles.length - index))
        circle.style.opacity = String(layerProgress)
        circle.style.transform = `translate(-50%, -50%) scale(${0.96 + layerProgress * 0.04})`
      })

      if (radarProgress >= 1 && !firstRotationComplete) {
        firstRotationComplete = true
      }

      if (firstRotationComplete && scrollProgress >= autoTriggerPortion && !isAutoRotating) {
        autoRotationAngle = 0
        startAutoRotation()
        return
      }
      if (isAutoRotating) return

      sweepGradient.style.transform = `rotate(${rotation}deg)`
      circleFills.forEach((fill) => {
        if (radarProgress > 0) {
          fill.style.background = `conic-gradient(from 0deg at 50% 50%, rgba(200, 230, 100, 0.10) 0deg, rgba(200, 230, 100, 0.10) ${rotation}deg, transparent ${rotation}deg, transparent 360deg)`
        } else {
          fill.style.background = 'transparent'
        }
      })

      const currentAngle = rotation % 360
      const sweepWidth = 30
      radarDots.forEach((dot) => {
        const dotAngle = Number.parseFloat(dot.dataset.angle ?? '0')
        const dotIndex = dot.dataset.index ?? ''

        if (radarProgress <= 0) {
          dot.classList.remove('detected')
          dot.classList.remove('active')
          scannedDots.delete(dotIndex)
          return
        }

        const angleDiff = (dotAngle - currentAngle + 360) % 360
        const isSweepOver = angleDiff <= sweepWidth

        if (isSweepOver) {
          scannedDots.add(dotIndex)
          dot.classList.add('detected')
          dot.classList.add('active')
          return
        }

        if (scannedDots.has(dotIndex)) {
          dot.classList.add('detected')
          dot.classList.remove('active')
          return
        }

        dot.classList.remove('detected')
        dot.classList.remove('active')
      })
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      window.requestAnimationFrame(() => {
        updateRadar()
        ticking = false
      })
      ticking = true
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    updateRadar()

    return () => {
      window.removeEventListener('scroll', onScroll)
      isAutoRotating = false
      if (animationFrameId !== null) window.cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <div ref={scrollTrackRef} className="relative h-[260vh] bg-[#f2f2f0] md:h-[300vh]">
      <section ref={sectionRef} className="sticky top-0 h-screen w-full overflow-hidden bg-[#f2f2f0] px-6 py-14 md:px-[5%] md:py-24">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl items-center">
        <div className="absolute left-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          <span className="h-[5px] w-[5px] rounded-full bg-[#cfff3f]" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
        </div>

        <p className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-xs font-semibold tracking-[0.16em] text-black/55 md:block">
          DISCOVER
        </p>

        <div className="grid w-full items-center justify-items-center gap-12 md:gap-6">
          <div className="hidden max-w-[520px] md:pl-12">
          </div>

          <div className="relative mx-auto h-[460px] w-full max-w-[680px] md:h-[620px] md:max-w-[760px]">
            <div ref={radarContainerRef} className="radar-container">
              <div className="radar-sticky">
                <div ref={radarRef} className="radar">
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

                  <div className="radar-dot small" data-angle="180" data-distance="20" />
                  <div className="radar-dot medium" data-angle="65" data-distance="50" />
                  <div className="radar-dot large" data-angle="0" data-distance="50" />
                  <div className="radar-dot small" data-angle="30" data-distance="70" />
                  <div className="radar-dot large" data-angle="150" data-distance="95" />
                  <div className="radar-dot large" data-angle="240" data-distance="95" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .radar-container {
          height: 100%;
          position: relative;
        }

        .radar-sticky {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .radar {
          width: 520px;
          height: 520px;
          position: relative;
        }

        .radar-circle {
          position: absolute;
          border: 1.5px solid #e8e8dc;
          border-radius: 50%;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          overflow: hidden;
          transition: opacity 0.18s linear, transform 0.18s linear;
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
          background: #d4d4c0;
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
            rgba(200, 230, 100, 0.08) 15deg,
            rgba(200, 230, 100, 0.05) 40deg,
            rgba(200, 230, 100, 0.02) 70deg,
            transparent 90deg
          );
          transform: rotate(0deg);
        }

        .radar-dot {
          position: absolute;
          border-radius: 50%;
          background: transparent !important;
          border: 2px solid #e8e8dc !important;
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

        .radar-dot.detected {
          background: #c8e664 !important;
          border-color: #c8e664 !important;
          box-shadow: 0 0 20px rgba(200, 230, 100, 0.6), 0 0 40px rgba(200, 230, 100, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.5) !important;
        }

        .radar-dot.active {
          animation: pulse 1.5s ease-in-out infinite;
        }

        @keyframes pulse {
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
          animation: ringPulse 1.5s ease-in-out infinite;
        }

        @keyframes ringPulse {
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
      </section>
    </div>
  )
}
