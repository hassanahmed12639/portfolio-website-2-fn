 'use client'

import { useEffect, useRef } from 'react'

export default function OpportunityOrbitSection() {
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const sectionSlotRef = useRef<HTMLDivElement>(null)
  const pinSpacerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const radarContainerRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const sweepGradientRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollTrack = scrollTrackRef.current
    const sectionSlot = sectionSlotRef.current
    const pinSpacer = pinSpacerRef.current
    const section = sectionRef.current
    const radarContainer = radarContainerRef.current
    const radar = radarRef.current
    const sweepGradient = sweepGradientRef.current

    if (
      !scrollTrack ||
      !sectionSlot ||
      !pinSpacer ||
      !section ||
      !radarContainer ||
      !radar ||
      !sweepGradient
    ) {
      return
    }

    const radarCircles = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-circle'))
    const radarDots = Array.from(radar.querySelectorAll<HTMLDivElement>('.radar-dot'))
    const circleFills = Array.from(radar.querySelectorAll<HTMLDivElement>('.circle-fill'))
    const premiumContainer = radar.querySelector<HTMLDivElement>('.premium-container')
    const premiumOuter = radar.querySelector<HTMLDivElement>('.premium-outer')
    const premiumMiddle = radar.querySelector<HTMLDivElement>('.premium-middle')
    const premiumInner = radar.querySelector<HTMLDivElement>('.premium-inner')
    const premiumCore = radar.querySelector<HTMLDivElement>('.premium-core')
    const premiumLabel = radar.querySelector<HTMLDivElement>('.premium-label')
    const premiumLabelLine = radar.querySelector<HTMLSpanElement>('.premium-label-line')
    const premiumLabelText = radar.querySelector<HTMLSpanElement>('.premium-label-text')
    const premiumSeed = radar.querySelector<HTMLDivElement>('.premium-seed')

    if (
      !premiumContainer ||
      !premiumOuter ||
      !premiumMiddle ||
      !premiumInner ||
      !premiumCore ||
      !premiumLabel ||
      !premiumLabelLine ||
      !premiumLabelText ||
      !premiumSeed
    ) {
      return
    }

    const scannedDots = new Set<string>()
    const baseDotSizes = [18, 30, 50, 18, 50, 50]
    const RADAR_PHASE_PORTION = 0.4
    const DOTS_PHASE_END = 0.8
    const PREMIUM_BASE_SIZE = 620
    const PREMIUM_INTRO_END = 0.28
    const PREMIUM_FILL_END = 0.55
    const FINAL_LABEL_START = 0.86

    const expansionInitialPositions = [
      { x: -140, y: 120, scale: 0.9, size: 50 },
      { x: 50, y: -100, scale: 1.2, size: 60 },
      { x: 140, y: -140, scale: 0.7, size: 35 },
      { x: 120, y: -40, scale: 0.8, size: 40 },
      { x: 140, y: 160, scale: 1.3, size: 70 },
      { x: -30, y: 20, scale: 0.6, size: 30 },
    ]

    const phase2Positions = [
      { x: -160, y: 180, scale: 1.1, size: 55 },
      { x: -120, y: -100, scale: 1.3, size: 65 },
      { x: 140, y: -120, scale: 1.0, size: 50 },
      { x: 20, y: 20, scale: 0.5, size: 25 },
      { x: 160, y: 140, scale: 1.1, size: 55 },
      { x: 20, y: 140, scale: 0.65, size: 33 },
    ]

    const phase3Positions = [
      { x: -180, y: 140, scale: 0.8, size: 40 },
      { x: -140, y: -80, scale: 0.55, size: 28 },
      { x: 150, y: -120, scale: 1.0, size: 50 },
      { x: 70, y: 0, scale: 0.6, size: 30 },
      { x: 200, y: 110, scale: 2.2, size: 110 },
      { x: 20, y: 180, scale: 0.5, size: 25 },
    ]

    const phase4Positions = [
      { x: -200, y: 100, scale: 0.4, size: 20 },
      { x: -100, y: -60, scale: 0.3, size: 15 },
      { x: 60, y: -150, scale: 0.9, size: 45 },
      { x: 80, y: 20, scale: 0.35, size: 18 },
      { x: 220, y: 90, scale: 2.8, size: 140 },
      { x: -20, y: 120, scale: 0.3, size: 15 },
    ]
    const PIN_SCROLL_MULTIPLIER = 2
    let pinDistance = window.innerHeight * PIN_SCROLL_MULTIPLIER
    let isAutoRotating = false
    let autoRotationAngle = 0
    let animationFrameId: number | null = null

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

    const easeInOutCubic = (t: number) => {
      return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    const clamp = (value: number) => {
      return Math.max(0, Math.min(1, value))
    }

    const lerp = (start: number, end: number, progress: number) => {
      return start + (end - start) * progress
    }

    const interpolatePosition = (
      start: { x: number; y: number; scale: number; size: number },
      end: { x: number; y: number; scale: number; size: number },
      progress: number
    ) => {
      return {
        x: start.x + (end.x - start.x) * progress,
        y: start.y + (end.y - start.y) * progress,
        scale: start.scale + (end.scale - start.scale) * progress,
        size: start.size + (end.size - start.size) * progress,
      }
    }

    const applyExpansionDotVisual = () => {
      radarDots.forEach((dot) => {
        dot.classList.remove('detected')
        dot.classList.remove('active')
        dot.classList.add('expansion-dot')
      })
    }

    const resetRadarDotVisual = () => {
      radarDots.forEach((dot, index) => {
        dot.classList.remove('expansion-dot')
        dot.classList.remove('detected')
        dot.classList.remove('active')
        dot.style.width = `${baseDotSizes[index]}px`
        dot.style.height = `${baseDotSizes[index]}px`
        dot.style.opacity = '1'
      })
    }

    const applyDotPosition = (
      dot: HTMLDivElement,
      position: { x: number; y: number; scale: number; size: number },
      opacity: number
    ) => {
      dot.style.left = `calc(50% + ${position.x}px)`
      dot.style.top = `calc(50% + ${position.y}px)`
      dot.style.width = `${position.size}px`
      dot.style.height = `${position.size}px`
      dot.style.transform = `translate(-50%, -50%) scale(${position.scale})`
      dot.style.opacity = String(Math.min(1, Math.max(0, opacity)))
    }

    const hidePremium = () => {
      premiumContainer.style.opacity = '0'
      premiumContainer.style.transform = 'translate(-50%, -50%) scale(0.96)'
      premiumLabel.style.opacity = '0'
      premiumLabel.style.top = 'calc(50% - 310px)'
      premiumLabelLine.style.width = '0px'
      premiumLabelText.textContent = 'Layer 1'
      premiumSeed.style.opacity = '0'
      premiumSeed.style.width = '20px'
      premiumSeed.style.height = '20px'
      premiumOuter.style.border = '0'
      premiumOuter.style.background = '#d7ff47'
    }

    const updateLayerLabel = (
      spreadProgress: number,
      outerSize: number,
      middleSize: number,
      innerSize: number
    ) => {
      let layerText = 'Layer 1'
      let trackedSize = outerSize

      if (spreadProgress < 0.34) {
        layerText = 'Layer 1'
      } else if (spreadProgress < 0.67) {
        layerText = 'Layer 2'
        trackedSize = middleSize
      } else {
        layerText = 'Layer 3'
        trackedSize = innerSize
      }

      premiumLabelText.textContent = layerText
      premiumLabel.style.top = `calc(50% - ${trackedSize / 2}px)`
      const lineWidth = Math.max(210, Math.min(340, trackedSize * 0.52))
      premiumLabelLine.style.width = `${lineWidth}px`
    }

    const updatePremiumAnimation = (progress: number) => {
      const t = clamp(progress)
      const introProgress = clamp(t / PREMIUM_INTRO_END)
      const fillProgress = clamp((t - PREMIUM_INTRO_END) / (PREMIUM_FILL_END - PREMIUM_INTRO_END))
      const spreadProgress = clamp((t - PREMIUM_FILL_END) / (1 - PREMIUM_FILL_END))

      radarCircles.forEach((circle) => {
        circle.style.opacity = '0'
      })
      circleFills.forEach((fill) => {
        fill.style.background = 'transparent'
      })
      sweepGradient.style.opacity = '0'

      radarDots.forEach((dot) => {
        dot.classList.remove('detected')
        dot.classList.remove('active')
        dot.classList.remove('expansion-dot')
        dot.style.opacity = '0'
      })

      premiumContainer.style.opacity = String(clamp(t * 3))
      premiumContainer.style.transform = `translate(-50%, -50%) scale(${lerp(0.96, 1, t)})`

      if (t <= PREMIUM_FILL_END) {
        const outlineSize = lerp(120, PREMIUM_BASE_SIZE, introProgress)
        premiumOuter.style.width = `${outlineSize}px`
        premiumOuter.style.height = `${outlineSize}px`
        premiumOuter.style.background = 'transparent'
        premiumOuter.style.border = '2px solid rgba(199, 231, 71, 0.9)'

        const seedSize = t <= PREMIUM_INTRO_END
          ? lerp(20, 100, introProgress)
          : lerp(100, PREMIUM_BASE_SIZE - 12, fillProgress)
        premiumSeed.style.width = `${seedSize}px`
        premiumSeed.style.height = `${seedSize}px`
        premiumSeed.style.opacity = '1'

        premiumMiddle.style.width = `${PREMIUM_BASE_SIZE}px`
        premiumMiddle.style.height = `${PREMIUM_BASE_SIZE}px`
        premiumInner.style.width = `${PREMIUM_BASE_SIZE}px`
        premiumInner.style.height = `${PREMIUM_BASE_SIZE}px`
        premiumCore.style.width = `${PREMIUM_BASE_SIZE}px`
        premiumCore.style.height = `${PREMIUM_BASE_SIZE}px`
        premiumMiddle.style.opacity = '0'
        premiumInner.style.opacity = '0'
        premiumCore.style.opacity = '0'
        premiumLabel.style.opacity = '0'
        premiumLabel.style.top = 'calc(50% - 310px)'
        premiumLabelLine.style.width = '0px'
        premiumLabelText.textContent = 'Layer 1'
        return
      }

      premiumOuter.style.width = `${PREMIUM_BASE_SIZE}px`
      premiumOuter.style.height = `${PREMIUM_BASE_SIZE}px`
      premiumOuter.style.border = '0'
      premiumOuter.style.background = '#d7ff47'
      premiumSeed.style.opacity = '0'

      const middleSize = lerp(PREMIUM_BASE_SIZE, 520, spreadProgress)
      const innerSize = lerp(PREMIUM_BASE_SIZE, 420, spreadProgress)
      const coreSize = lerp(PREMIUM_BASE_SIZE, 300, spreadProgress)

      premiumMiddle.style.width = `${middleSize}px`
      premiumMiddle.style.height = `${middleSize}px`
      premiumInner.style.width = `${innerSize}px`
      premiumInner.style.height = `${innerSize}px`
      premiumCore.style.width = `${coreSize}px`
      premiumCore.style.height = `${coreSize}px`
      premiumMiddle.style.bottom = '0px'
      premiumInner.style.bottom = '0px'
      premiumCore.style.bottom = '0px'
      premiumMiddle.style.opacity = '1'
      premiumInner.style.opacity = '1'
      premiumCore.style.opacity = String(clamp((spreadProgress - 0.25) * 2.5))
      premiumLabel.style.opacity = String(clamp((spreadProgress - 0.08) * 2.2))
      if (spreadProgress >= FINAL_LABEL_START) {
        const finalProgress = clamp((spreadProgress - FINAL_LABEL_START) / (1 - FINAL_LABEL_START))
        premiumLabelText.textContent = 'Green Premiums'
        premiumLabel.style.top = `calc(50% - ${coreSize / 2}px)`
        const targetLineWidth = Math.max(240, Math.min(500, PREMIUM_BASE_SIZE * 0.78))
        premiumLabelLine.style.width = `${lerp(0, targetLineWidth, easeInOutCubic(finalProgress))}px`
      } else {
        updateLayerLabel(spreadProgress, PREMIUM_BASE_SIZE, middleSize, innerSize)
      }
    }

    const updateDotsExpansion = (progress: number) => {
      applyExpansionDotVisual()
      hidePremium()
      sweepGradient.style.opacity = '0'
      radarCircles.forEach((circle) => {
        circle.style.opacity = '0'
      })
      circleFills.forEach((fill) => {
        fill.style.background = 'transparent'
      })

      if (progress <= 0.25) {
        const phaseProgress = easeInOutCubic(progress / 0.25)
        radarDots.forEach((dot, index) => {
          const position = interpolatePosition(
            expansionInitialPositions[index],
            phase2Positions[index],
            phaseProgress
          )
          const depthOpacity = 0.5 + position.scale * 0.5
          applyDotPosition(dot, position, depthOpacity)
        })
      } else if (progress <= 0.5) {
        const phaseProgress = easeInOutCubic((progress - 0.25) / 0.25)
        radarDots.forEach((dot, index) => {
          const position = interpolatePosition(phase2Positions[index], phase3Positions[index], phaseProgress)
          const depthOpacity = 0.4 + position.scale * 0.5
          applyDotPosition(dot, position, depthOpacity)
        })
      } else if (progress <= 0.7) {
        const phaseProgress = easeInOutCubic((progress - 0.5) / 0.2)
        radarDots.forEach((dot, index) => {
          const position = interpolatePosition(phase3Positions[index], phase4Positions[index], phaseProgress)
          const depthOpacity = position.scale < 0.5 ? 0.3 : 0.4 + position.scale * 0.4
          applyDotPosition(dot, position, depthOpacity)
        })
      } else {
        const phaseProgress = easeInOutCubic((progress - 0.7) / 0.3)
        radarDots.forEach((dot, index) => {
          const start = phase4Positions[index]
          const currentX = start.x * (1 - phaseProgress)
          const currentY = start.y * (1 - phaseProgress)

          dot.style.left = `calc(50% + ${currentX}px)`
          dot.style.top = `calc(50% + ${currentY}px)`
          dot.style.transform = 'translate(-50%, -50%) scale(1)'

          if (index !== 4) {
            dot.style.opacity = String(Math.max(0, 1 - phaseProgress * 1.2))
          } else {
            dot.style.opacity = '1'
            const finalSize = 50 + phaseProgress * 30
            dot.style.width = `${finalSize}px`
            dot.style.height = `${finalSize}px`
          }
        })
      }
    }

    const resetDots = () => {
      scannedDots.clear()
      radarDots.forEach((dot) => {
        dot.classList.remove('detected')
        dot.classList.remove('active')
      })
    }

    const applyRadarSweep = (rotation: number, shouldFill = true) => {
      sweepGradient.style.transform = `rotate(${rotation}deg)`
      circleFills.forEach((fill) => {
        if (shouldFill) {
          fill.style.background = `conic-gradient(from 0deg at 50% 50%, rgba(200, 230, 100, 0.10) 0deg, rgba(200, 230, 100, 0.10) ${rotation}deg, transparent ${rotation}deg, transparent 360deg)`
        } else {
          fill.style.background = 'transparent'
        }
      })
    }

    const stopAutoRotation = () => {
      isAutoRotating = false
      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
        animationFrameId = null
      }
    }

    const startAutoRotation = () => {
      if (isAutoRotating) return
      isAutoRotating = true

      const animate = () => {
        if (!isAutoRotating) return
        autoRotationAngle += 1.8
        if (autoRotationAngle >= 360) autoRotationAngle = 0

        applyRadarSweep(autoRotationAngle, true)
        updateDots(autoRotationAngle)
        animationFrameId = window.requestAnimationFrame(animate)
      }

      animate()
    }

    const applyPinLayoutSizing = () => {
      const sectionHeight = section.getBoundingClientRect().height
      pinDistance = window.innerHeight * PIN_SCROLL_MULTIPLIER
      sectionSlot.style.height = `${sectionHeight}px`
      pinSpacer.style.height = `${pinDistance}px`
      scrollTrack.style.minHeight = `${sectionHeight + pinDistance}px`
    }

    const updatePinnedState = (pinProgress: number) => {
      if (pinProgress <= 0) {
        section.style.position = 'absolute'
        section.style.top = '0px'
        section.style.left = '0px'
        section.style.width = '100%'
      } else if (pinProgress < 1) {
        section.style.position = 'fixed'
        section.style.top = '0px'
        section.style.left = '0px'
        section.style.width = '100%'
      } else {
        section.style.position = 'absolute'
        section.style.top = `${pinDistance}px`
        section.style.left = '0px'
        section.style.width = '100%'
      }
      section.style.zIndex = '20'
    }

    const updateRadar = () => {
      const trackRect = scrollTrack.getBoundingClientRect()
      const pinProgress = Math.max(0, Math.min(1, -trackRect.top / pinDistance))
      const radarProgress = Math.max(0, Math.min(1, pinProgress / RADAR_PHASE_PORTION))
      const revealPortion = 0.3
      const revealProgress = Math.max(0, Math.min(1, radarProgress / revealPortion))
      const rotation = radarProgress * 360

      updatePinnedState(pinProgress)

      if (pinProgress <= 0) {
        stopAutoRotation()
        applyRadarSweep(0, false)
        sweepGradient.style.opacity = '1'
        resetDots()
        resetRadarDotVisual()
        hidePremium()
        radarCircles.forEach((circle, index) => {
          const size = [100, 82, 64, 46, 28][index]
          circle.style.width = `${size}%`
          circle.style.height = `${size}%`
          circle.style.opacity = '0'
          circle.style.transform = 'translate(-50%, -50%) scale(0.96)'
        })
        return
      }

      if (pinProgress > DOTS_PHASE_END) {
        stopAutoRotation()
        const premiumProgress = (pinProgress - DOTS_PHASE_END) / (1 - DOTS_PHASE_END)
        updatePremiumAnimation(premiumProgress)
        return
      }

      if (pinProgress > RADAR_PHASE_PORTION) {
        stopAutoRotation()
        const expansionProgress = (pinProgress - RADAR_PHASE_PORTION) / (DOTS_PHASE_END - RADAR_PHASE_PORTION)
        updateDotsExpansion(Math.max(0, Math.min(1, expansionProgress)))
        return
      }

      resetRadarDotVisual()
      hidePremium()
      sweepGradient.style.opacity = '1'
      radarCircles.forEach((circle, index) => {
        const layerProgress = Math.max(0, Math.min(1, revealProgress * radarCircles.length - index))
        circle.style.opacity = String(layerProgress)
        circle.style.transform = `translate(-50%, -50%) scale(${0.96 + layerProgress * 0.04})`
      })

      if (radarProgress >= 1) {
        if (!isAutoRotating) {
          autoRotationAngle = 0
          resetDots()
          startAutoRotation()
        }
        return
      }

      if (isAutoRotating) {
        stopAutoRotation()
      }

      applyRadarSweep(rotation, true)
      const currentAngle = rotation % 360
      updateDots(currentAngle)
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
    window.addEventListener('resize', applyPinLayoutSizing)
    applyPinLayoutSizing()
    updateRadar()

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', applyPinLayoutSizing)
      stopAutoRotation()
    }
  }, [])

  return (
    <div ref={scrollTrackRef} className="relative bg-[#f2f2f0]">
      <div ref={sectionSlotRef} aria-hidden />
      <div ref={pinSpacerRef} aria-hidden />
      <section ref={sectionRef} className="h-[130vh] w-full overflow-hidden bg-[#f2f2f0] px-6 py-8 md:h-[140vh] md:px-[5%] md:py-12">
      <div className="mx-auto flex h-full w-full max-w-7xl items-center">
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

          <div className="relative mx-auto h-[520px] w-full max-w-[720px] md:h-[700px] md:max-w-[840px]">
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

                  <div className="premium-container">
                    <div className="premium-circle premium-outer" />
                    <div className="premium-circle premium-seed" />
                    <div className="premium-circle premium-middle" />
                    <div className="premium-circle premium-inner" />
                    <div className="premium-circle premium-core" />

                    <div className="premium-label">
                      <span className="premium-label-line" />
                      <span className="premium-label-dot" />
                      <span className="premium-label-text">Layer 1</span>
                    </div>
                  </div>
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
          width: 620px;
          height: 620px;
          position: relative;
        }

        .radar-circle {
          position: absolute;
          border: 1.5px solid rgba(0, 0, 0, 0.24);
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
            rgba(200, 230, 100, 0.14) 15deg,
            rgba(200, 230, 100, 0.1) 40deg,
            rgba(200, 230, 100, 0.05) 70deg,
            transparent 90deg
          );
          transform: rotate(0deg);
        }

        .premium-container {
          position: absolute;
          top: 50%;
          left: 50%;
          width: 620px;
          height: 620px;
          transform: translate(-50%, -50%) scale(0.98);
          opacity: 0;
          pointer-events: none;
          z-index: 12;
          transition: opacity 0.3s ease-out, transform 0.3s ease-out;
        }

        .premium-circle {
          position: absolute;
          left: 50%;
          bottom: 0;
          transform: translateX(-50%);
          border-radius: 50%;
        }

        .premium-outer {
          width: 620px;
          height: 620px;
          background: #d7ff47;
          top: 50%;
          bottom: auto;
          transform: translate(-50%, -50%);
        }

        .premium-seed {
          width: 20px;
          height: 20px;
          background: #c8e664;
          opacity: 0;
          top: 50%;
          bottom: auto;
          transform: translate(-50%, -50%);
          box-shadow: 0 0 24px rgba(200, 230, 100, 0.75), 0 0 50px rgba(200, 230, 100, 0.35);
        }

        .premium-middle {
          width: 620px;
          height: 620px;
          background: #d9ef7d;
          opacity: 0;
        }

        .premium-inner {
          width: 620px;
          height: 620px;
          background: #e1e6a6;
          opacity: 0;
        }

        .premium-core {
          width: 620px;
          height: 620px;
          background: #e6e2dd;
          opacity: 0;
        }

        .premium-label {
          position: absolute;
          top: calc(50% - 310px);
          left: 50%;
          display: flex;
          align-items: center;
          transform: translateY(-50%);
          margin-left: -24px;
          opacity: 0;
          transition: top 0.24s ease-out, opacity 0.24s ease-out;
        }

        .premium-label-line {
          width: 240px;
          height: 1px;
          background: rgba(0, 0, 0, 0.55);
          margin-right: 8px;
          transition: width 0.24s ease-out;
        }

        .premium-label-dot {
          width: 6px;
          height: 6px;
          background: #000;
          border-radius: 50%;
          margin-right: 8px;
        }

        .premium-label-text {
          font-size: 14px;
          color: #000;
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

        .radar-dot.expansion-dot {
          background: #c8e664 !important;
          border: none !important;
          box-shadow: 0 0 20px rgba(200, 230, 100, 0.6), 0 0 40px rgba(200, 230, 100, 0.3), inset 0 0 15px rgba(255, 255, 255, 0.5) !important;
          transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
          transform-style: preserve-3d;
          will-change: transform, opacity, left, top, width, height;
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
