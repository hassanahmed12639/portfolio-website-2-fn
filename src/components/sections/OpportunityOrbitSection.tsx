 'use client'

import { useEffect, useRef } from 'react'

const TEXT_BLOCKS = [
  {
    title: 'Investing in Opportunity',
    body: 'We survey the landscape for white space where we can drive technology discovery and leverage our unique talents to build great companies from the ground up.',
  },
  {
    title: 'Building for the Future',
    body: 'We partner with founders and teams to turn bold ideas into lasting companies, combining capital with hands-on expertise.',
  },
  {
    title: 'Where We Land',
    body: 'The final layer stays in view. Scroll further to continue to the next section.',
  },
  {
    title: 'What Comes Next',
    body: 'One more layer that rises from below and holds in place. You can replace this title and body with your own copy.',
  },
]

export default function OpportunityOrbitSection() {
  const scrollTrackRef = useRef<HTMLDivElement>(null)
  const sectionSlotRef = useRef<HTMLDivElement>(null)
  const pinSpacerRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement>(null)
  const radarContainerRef = useRef<HTMLDivElement>(null)
  const radarRef = useRef<HTMLDivElement>(null)
  const sweepGradientRef = useRef<HTMLDivElement>(null)
  const leftTextRef = useRef<HTMLDivElement>(null)
  const leftTextWrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const scrollTrack = scrollTrackRef.current
    const sectionSlot = sectionSlotRef.current
    const pinSpacer = pinSpacerRef.current
    const section = sectionRef.current
    const radarContainer = radarContainerRef.current
    const radar = radarRef.current
    const sweepGradient = sweepGradientRef.current
    const leftText = leftTextRef.current

    if (
      !scrollTrack ||
      !sectionSlot ||
      !pinSpacer ||
      !section ||
      !radarContainer ||
      !radar ||
      !sweepGradient ||
      !leftText
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
    const premiumLabelDot = radar.querySelector<HTMLSpanElement>('.premium-label-dot')
    const premiumLabelText = radar.querySelector<HTMLSpanElement>('.premium-label-text')
    const premiumAxis = radar.querySelector<HTMLDivElement>('.premium-axis')
    const premiumSeed = radar.querySelector<HTMLDivElement>('.premium-seed')

    if (
      !premiumContainer ||
      !premiumOuter ||
      !premiumMiddle ||
      !premiumInner ||
      !premiumCore ||
      !premiumLabel ||
      !premiumLabelLine ||
      !premiumLabelDot ||
      !premiumLabelText ||
      !premiumAxis ||
      !premiumSeed
    ) {
      return
    }

    const scannedDots = new Set<string>()
    const baseDotSizes = [18, 30, 50, 18, 50, 50]
    const RADAR_PHASE_PORTION = 0.4
    const DOTS_PHASE_END = 0.8
    const getPremiumBaseSize = () => Math.max(280, Math.min(radar.clientWidth, radar.clientHeight))
    let premiumBaseSize = getPremiumBaseSize()
    const PREMIUM_SCALE = 1
    const PREMIUM_INTRO_END = 0.28
    const PREMIUM_FILL_END = 0.55
    const FINAL_LABEL_START = 0.86
    const TEXT_ENTER_DURATION = 0.16
    const TEXT_EXIT_DURATION = 0.18
    const TEXT_GAP_AFTER_EXIT = 0.06
    const TEXT_BLOCK_SPAN = TEXT_ENTER_DURATION + TEXT_EXIT_DURATION + TEXT_GAP_AFTER_EXIT
    let textEntryOffsetPx = Math.round(window.innerHeight * 0.55)
    const TEXT_EXIT_OFFSET_PX = -500

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
    const finalDotPositions = phase4Positions.map((_, index) => ({
      x: 0,
      y: 0,
      scale: 1,
      size: index === 4 ? 80 : baseDotSizes[index],
    }))
    const PIN_SCROLL_MULTIPLIER = 3.2
    let pinDistance = window.innerHeight * PIN_SCROLL_MULTIPLIER
    let isAutoRotating = false
    let autoRotationAngle = 0
    let animationFrameId: number | null = null
    let smoothingFrameId: number | null = null
    let targetPinProgress = 0
    let renderedPinProgress = 0

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

    const textBlocks = Array.from(leftText.querySelectorAll<HTMLDivElement>('.left-text-block'))
    textBlocks.forEach((block) => {
      block.style.transform = `translateY(${textEntryOffsetPx}px)`
      block.style.opacity = '0'
      block.style.visibility = 'hidden'
    })

    const isLastBlock = (i: number) => i === textBlocks.length - 1

    const updateLeftText = (pinProgress: number) => {
      const p = clamp(pinProgress)
      textBlocks.forEach((block, i) => {
        const blockStart = i * TEXT_BLOCK_SPAN
        const enterEnd = blockStart + TEXT_ENTER_DURATION
        const exitEnd = blockStart + TEXT_ENTER_DURATION + TEXT_EXIT_DURATION

        if (p <= blockStart) {
          block.style.transform = `translateY(${textEntryOffsetPx}px)`
          block.style.opacity = '0'
          block.style.visibility = 'hidden'
          return
        }
        if (!isLastBlock(i) && p >= exitEnd) {
          block.style.transform = `translateY(${TEXT_EXIT_OFFSET_PX}px)`
          block.style.opacity = '0'
          block.style.visibility = 'hidden'
          return
        }
        if (isLastBlock(i) && p >= enterEnd) {
          block.style.visibility = 'visible'
          block.style.transform = 'translateY(0px)'
          block.style.opacity = '1'
          return
        }
        block.style.visibility = 'visible'
        if (p <= enterEnd) {
          const t = easeInOutCubic(clamp((p - blockStart) / TEXT_ENTER_DURATION))
          block.style.transform = `translateY(${textEntryOffsetPx * (1 - t)}px)`
          block.style.opacity = '1'
          return
        }
        const exitT = easeInOutCubic(clamp((p - enterEnd) / TEXT_EXIT_DURATION))
        block.style.transform = `translateY(${TEXT_EXIT_OFFSET_PX * exitT}px)`
        block.style.opacity = String(1 - exitT)
      })
    }

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
      const seedStart = premiumBaseSize * 0.04
      premiumContainer.style.opacity = '0'
      premiumContainer.style.transform = `translate(-50%, -50%) scale(${PREMIUM_SCALE * 0.96})`
      premiumLabel.style.opacity = '0'
      premiumLabel.style.top = '0'
      premiumLabelLine.style.width = '0px'
      premiumLabelLine.style.height = '1px'
      premiumLabelLine.style.background = 'rgba(0, 0, 0, 0.55)'
      premiumLabel.style.marginLeft = '-24px'
      premiumLabel.style.removeProperty('font-size')
      premiumLabel.style.removeProperty('font-weight')
      premiumLabel.style.removeProperty('letter-spacing')
      premiumLabel.style.removeProperty('color')
      premiumLabelLine.style.removeProperty('margin-right')
      premiumLabelDot.style.width = '6px'
      premiumLabelDot.style.height = '6px'
      premiumLabelDot.style.marginRight = '8px'
      premiumLabelText.style.removeProperty('font-size')
      premiumLabelText.style.removeProperty('font-weight')
      premiumLabelText.style.removeProperty('letter-spacing')
      premiumLabelText.style.removeProperty('color')
      premiumLabelText.style.removeProperty('white-space')
      premiumAxis.style.opacity = '0'
      premiumLabelText.textContent = ''
      premiumSeed.style.opacity = '0'
      premiumSeed.style.width = `${seedStart}px`
      premiumSeed.style.height = `${seedStart}px`
      premiumOuter.style.border = '0'
      premiumOuter.style.background = '#d7ff47'
    }

    const updateLayerLabel = (
      spreadProgress: number,
      outerSize: number,
      middleSize: number,
      innerSize: number
    ) => {
      const journeyProgress = easeInOutCubic(clamp(spreadProgress))
      const offsetY = lerp(outerSize / 2, 0, journeyProgress)
      const lineWidthPhase1 = lerp(36, 150, easeInOutCubic(clamp(spreadProgress / 0.28)))
      const lineWidthPhase2 = lerp(150, 320, easeInOutCubic(clamp((spreadProgress - 0.28) / 0.72)))
      const lineWidth = spreadProgress < 0.28 ? lineWidthPhase1 : lineWidthPhase2
      const textProgress = easeInOutCubic(clamp((spreadProgress - 0.34) / 0.36))
      const axisProgress = easeInOutCubic(clamp((spreadProgress - 0.2) / 0.5))

      premiumLabelText.textContent = textProgress > 0.02 ? 'Green Premiums' : ''
      premiumLabel.style.top = `calc(50% - ${offsetY}px)`
      premiumLabelLine.style.width = `${lineWidth}px`
      premiumLabelLine.style.height = `${lerp(1, 2, textProgress)}px`
      premiumLabelLine.style.background = `rgba(0, 0, 0, ${lerp(0.55, 0.62, textProgress)})`
      premiumLabel.style.marginLeft = `${lerp(-24, 0, textProgress)}px`
      premiumLabelLine.style.marginRight = `${lerp(8, 12, textProgress)}px`
      premiumLabelDot.style.width = `${lerp(6, 8, textProgress)}px`
      premiumLabelDot.style.height = `${lerp(6, 8, textProgress)}px`
      premiumLabelDot.style.marginRight = `${lerp(8, 12, textProgress)}px`
      premiumLabelText.style.fontSize = `${lerp(11, 20, textProgress)}px`
      premiumLabelText.style.fontWeight = `${Math.round(lerp(400, 500, textProgress))}`
      premiumLabelText.style.letterSpacing = `${lerp(0, -0.01, textProgress)}em`
      premiumLabelText.style.color = `rgba(0, 0, 0, ${lerp(0.72, 0.86, textProgress)})`
      premiumLabelText.style.whiteSpace = 'nowrap'
      premiumAxis.style.opacity = String(axisProgress)
    }

    const updatePremiumAnimation = (progress: number) => {
      const t = clamp(progress)
      const introProgress = clamp(t / PREMIUM_INTRO_END)
      const fillProgress = clamp((t - PREMIUM_INTRO_END) / (PREMIUM_FILL_END - PREMIUM_INTRO_END))
      const spreadProgress = clamp((t - PREMIUM_FILL_END) / (1 - PREMIUM_FILL_END))
      const outlineStart = premiumBaseSize * 0.24
      const seedStart = premiumBaseSize * 0.04
      const seedMid = premiumBaseSize * 0.2
      const seedEnd = premiumBaseSize * 0.976

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
      premiumContainer.style.transform = `translate(-50%, -50%) scale(${PREMIUM_SCALE * lerp(0.96, 1, t)})`

      if (t <= PREMIUM_FILL_END) {
        const outlineSize = lerp(outlineStart, premiumBaseSize, introProgress)
        premiumOuter.style.width = `${outlineSize}px`
        premiumOuter.style.height = `${outlineSize}px`
        premiumOuter.style.background = 'transparent'
        premiumOuter.style.border = '2px solid rgba(199, 231, 71, 0.9)'

        const seedSize = t <= PREMIUM_INTRO_END
          ? lerp(seedStart, seedMid, introProgress)
          : lerp(seedMid, seedEnd, fillProgress)
        premiumSeed.style.width = `${seedSize}px`
        premiumSeed.style.height = `${seedSize}px`
        premiumSeed.style.opacity = '1'

        premiumMiddle.style.width = `${premiumBaseSize}px`
        premiumMiddle.style.height = `${premiumBaseSize}px`
        premiumInner.style.width = `${premiumBaseSize}px`
        premiumInner.style.height = `${premiumBaseSize}px`
        premiumCore.style.width = `${premiumBaseSize}px`
        premiumCore.style.height = `${premiumBaseSize}px`
        premiumMiddle.style.opacity = '0'
        premiumInner.style.opacity = '0'
        premiumCore.style.opacity = '0'
        premiumLabel.style.opacity = '0'
        premiumLabel.style.top = '0'
        premiumLabelLine.style.width = '0px'
        premiumLabelText.textContent = ''
        premiumAxis.style.opacity = '0'
        return
      }

      premiumOuter.style.width = `${premiumBaseSize}px`
      premiumOuter.style.height = `${premiumBaseSize}px`
      premiumOuter.style.border = '1px solid rgba(0, 0, 0, 0.22)'
      premiumOuter.style.background = '#d7ff47'
      premiumSeed.style.opacity = '0'

      const middleSize = lerp(premiumBaseSize, premiumBaseSize * 0.84, spreadProgress)
      const innerSize = lerp(premiumBaseSize, premiumBaseSize * 0.68, spreadProgress)
      const coreSize = lerp(premiumBaseSize, premiumBaseSize * 0.48, spreadProgress)

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
      updateLayerLabel(spreadProgress, premiumBaseSize, middleSize, innerSize)
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

      const phaseStops = [
        { start: 0, end: 0.25, from: expansionInitialPositions, to: phase2Positions },
        { start: 0.25, end: 0.5, from: phase2Positions, to: phase3Positions },
        { start: 0.5, end: 0.7, from: phase3Positions, to: phase4Positions },
        { start: 0.7, end: 1, from: phase4Positions, to: finalDotPositions },
      ]

      const activeIndex = Math.max(
        0,
        Math.min(
          phaseStops.length - 1,
          phaseStops.findIndex((phase) => progress >= phase.start && progress <= phase.end)
        )
      )
      const activePhase = phaseStops[activeIndex] || phaseStops[phaseStops.length - 1]
      const phaseProgress = clamp((progress - activePhase.start) / (activePhase.end - activePhase.start))
      const endFadeProgress = easeInOutCubic(clamp((progress - 0.7) / 0.3))
      const blendWindow = 0.06
      const prevPhase = activeIndex > 0 ? phaseStops[activeIndex - 1] : null
      const nextPhase = activeIndex < phaseStops.length - 1 ? phaseStops[activeIndex + 1] : null
      const blendToNext = nextPhase && progress > activePhase.end - blendWindow
      const blendToPrev = prevPhase && progress < activePhase.start + blendWindow
      const blendNextT = blendToNext
        ? easeInOutCubic(clamp((progress - (activePhase.end - blendWindow)) / blendWindow))
        : 0
      const blendPrevT = blendToPrev
        ? easeInOutCubic(clamp((activePhase.start + blendWindow - progress) / blendWindow))
        : 0

      radarDots.forEach((dot, index) => {
        let position = interpolatePosition(activePhase.from[index], activePhase.to[index], phaseProgress)
        if (blendToNext && nextPhase) {
          const nextStart = interpolatePosition(nextPhase.from[index], nextPhase.to[index], 0)
          position = interpolatePosition(position, nextStart, blendNextT)
        } else if (blendToPrev && prevPhase) {
          const prevEnd = interpolatePosition(prevPhase.from[index], prevPhase.to[index], 1)
          position = interpolatePosition(prevEnd, position, 1 - blendPrevT)
        }
        const depthOpacity = Math.min(1, Math.max(0.25, 0.35 + position.scale * 0.5))
        const targetOpacity = index === 4 ? 1 : 0
        const opacity = lerp(depthOpacity, targetOpacity, endFadeProgress)
        applyDotPosition(dot, position, opacity)
      })
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

    let pinnedAbsoluteTop: number | null = null

    const updatePinnedState = (pinProgress: number) => {
      if (pinProgress <= 0) {
        section.style.position = 'absolute'
        section.style.top = '0px'
        section.style.left = '0px'
        section.style.width = '100%'
        pinnedAbsoluteTop = null
      } else if (pinProgress < 1) {
        section.style.position = 'fixed'
        section.style.top = '0px'
        section.style.left = '0px'
        section.style.width = '100%'
      } else {
        if (pinnedAbsoluteTop === null) {
          const trackRect = scrollTrack.getBoundingClientRect()
          const sectionRect = section.getBoundingClientRect()
          pinnedAbsoluteTop = sectionRect.top - trackRect.top
        }
        section.style.position = 'absolute'
        section.style.top = `${pinnedAbsoluteTop}px`
        section.style.left = '0px'
        section.style.width = '100%'
      }
      section.style.zIndex = '20'
    }

    const updateRadar = (pinProgress: number) => {
      const radarProgress = Math.max(0, Math.min(1, pinProgress / RADAR_PHASE_PORTION))
      const revealPortion = 0.55
      const revealProgress = Math.max(0, Math.min(1, radarProgress / revealPortion))
      const fadeProgress = Math.max(0, Math.min(1, (radarProgress - revealPortion) / (1 - revealPortion)))
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
        if (!isAutoRotating) {
          autoRotationAngle = 270
          resetDots()
          startAutoRotation()
        }
        const rawExpansion = (pinProgress - RADAR_PHASE_PORTION) / (DOTS_PHASE_END - RADAR_PHASE_PORTION)
        const expansionProgress = easeInOutCubic(Math.max(0, Math.min(1, rawExpansion)))
        updateDotsExpansion(expansionProgress)
        return
      }

      resetRadarDotVisual()
      hidePremium()
      sweepGradient.style.opacity = '1'
      radarCircles.forEach((circle, index) => {
        const layerProgress = Math.max(0, Math.min(1, revealProgress * radarCircles.length - index))
        const ringPhase = Math.max(0, Math.min(1, (fadeProgress - index / radarCircles.length) * radarCircles.length))
        const expandPhase = Math.min(1, ringPhase / 0.2)
        const ringFade = ringPhase <= 0.2 ? 0 : Math.min(1, (ringPhase - 0.2) / 0.8)
        const opacity = layerProgress * (1 - ringFade)
        const scale = 0.96 + layerProgress * 0.04 + expandPhase * 0.15
        circle.style.opacity = String(opacity)
        circle.style.transform = `translate(-50%, -50%) scale(${scale})`
      })

      if (rotation >= 270) {
        if (!isAutoRotating) {
          autoRotationAngle = rotation
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

    const readPinProgress = () => {
      const trackRect = scrollTrack.getBoundingClientRect()
      return Math.max(0, Math.min(1, -trackRect.top / pinDistance))
    }

    const startSmoothingLoop = () => {
      if (smoothingFrameId !== null) return

      const tick = () => {
        const delta = targetPinProgress - renderedPinProgress
        renderedPinProgress += delta * 0.065

        if (Math.abs(delta) < 0.0004) {
          renderedPinProgress = targetPinProgress
        }

        updateRadar(renderedPinProgress)
        updateLeftText(renderedPinProgress)

        if (Math.abs(targetPinProgress - renderedPinProgress) >= 0.0004) {
          smoothingFrameId = window.requestAnimationFrame(tick)
        } else {
          smoothingFrameId = null
        }
      }

      smoothingFrameId = window.requestAnimationFrame(tick)
    }

    let ticking = false
    const onScroll = () => {
      if (ticking) return
      window.requestAnimationFrame(() => {
        targetPinProgress = readPinProgress()
        startSmoothingLoop()
        ticking = false
      })
      ticking = true
    }

    const onResize = () => {
      textEntryOffsetPx = Math.round(window.innerHeight * 0.55)
      applyPinLayoutSizing()
      premiumBaseSize = getPremiumBaseSize()
      targetPinProgress = readPinProgress()
      startSmoothingLoop()
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onResize)
    applyPinLayoutSizing()
    premiumBaseSize = getPremiumBaseSize()
    targetPinProgress = readPinProgress()
    renderedPinProgress = targetPinProgress
    updateRadar(renderedPinProgress)
    updateLeftText(renderedPinProgress)

    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onResize)
      stopAutoRotation()
      if (smoothingFrameId !== null) {
        window.cancelAnimationFrame(smoothingFrameId)
      }
    }
  }, [])

  return (
    <div ref={scrollTrackRef} className="relative bg-white">
      <div ref={sectionSlotRef} aria-hidden />
      <div ref={pinSpacerRef} aria-hidden />
      <section ref={sectionRef} className="min-h-screen w-full overflow-hidden bg-white px-6 py-8 pb-40 md:px-[5%] md:py-12 md:pb-12">
      <div className="relative mx-auto flex h-full w-full max-w-7xl items-center">
        <div className="absolute left-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          <span className="h-[5px] w-[5px] rounded-full bg-[#cfff3f]" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
        </div>

        <div
          ref={leftTextWrapperRef}
          className="absolute left-6 bottom-4 z-20 w-full max-w-[min(45vw,340px)] translate-y-0 md:left-2 md:bottom-auto md:top-1/2 md:max-w-[min(38vw,340px)] md:-translate-y-1/2 md:pl-8 lg:max-w-[340px]"
        >
          <div ref={leftTextRef} className="relative w-full" style={{ minHeight: 124 }}>
            {TEXT_BLOCKS.map((block, i) => (
              <div
                key={i}
                className="left-text-block absolute left-0 top-0 w-full flex flex-col justify-center text-black"
                style={{ willChange: 'transform, opacity' }}
              >
                <h2 className="text-2xl font-semibold tracking-tight text-black md:text-3xl">
                  {block.title}
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-black/80 md:text-base">
                  {block.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid min-w-0 w-full grid-cols-1 items-center justify-items-center gap-12 min-h-[75vh] place-content-center md:min-h-0 md:place-content-stretch md:grid-cols-[1fr_minmax(280px,680px)_1fr] lg:grid-cols-[1fr_minmax(320px,760px)_1fr] xl:grid-cols-[1fr_minmax(360px,840px)_1fr] md:gap-6">
          <div className="hidden md:block min-w-0" aria-hidden />

          <div className="relative mx-auto mt-6 flex w-full min-w-[260px] max-w-[560px] items-center justify-center sm:max-w-[600px] sm:mt-8 md:mt-0 md:max-w-[600px] lg:max-w-[660px] xl:max-w-[720px] aspect-square max-h-[65vh] sm:max-h-[70vh] md:max-h-[520px] lg:max-h-[580px] xl:max-h-[620px]">
            <div ref={radarContainerRef} className="radar-container h-full w-full max-h-full flex items-center justify-center">
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
                      <span className="premium-label-text"></span>
                    </div>

                    <div className="premium-axis" aria-hidden="true" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <style jsx>{`
        .radar-container {
          container-type: size;
          container-name: radar;
          height: 100%;
          width: 100%;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .radar-sticky {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          pointer-events: none;
        }

        .radar {
          --radar-size: min(100cqw, 100cqh, 520px);
          width: var(--radar-size);
          height: var(--radar-size);
          position: relative;
          flex-shrink: 0;
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
          width: 100%;
          height: 100%;
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
          width: 100%;
          height: 100%;
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
          width: 100%;
          height: 100%;
          background: #d9ef7d;
          opacity: 0;
        }

        .premium-inner {
          width: 100%;
          height: 100%;
          background: #e1e6a6;
          opacity: 0;
        }

        .premium-core {
          width: 100%;
          height: 100%;
          background: #e6e2dd;
          opacity: 0;
        }

        .premium-label {
          position: absolute;
          top: 0;
          left: 50%;
          display: flex;
          align-items: center;
          transform: translateY(-50%);
          margin-left: -24px;
          opacity: 0;
          transition: none;
        }

        .premium-label-line {
          width: 240px;
          height: 1px;
          background: rgba(0, 0, 0, 0.55);
          margin-right: 8px;
          transition: none;
        }

        .premium-label-dot {
          width: 6px;
          height: 6px;
          background: #000;
          border-radius: 50%;
          margin-right: 8px;
        }

        .premium-label-text {
          font-size: 11px;
          color: #000;
        }

        .premium-axis {
          position: absolute;
          top: 0;
          bottom: 0;
          right: -170px;
          width: 92px;
          opacity: 0;
          transition: none;
          color: rgba(0, 0, 0, 0.7);
        }

        .axis-tick {
          position: absolute;
          right: 0;
          width: 14px;
          height: 1px;
          background: rgba(0, 0, 0, 0.45);
        }

        .axis-tick-top {
          top: 6%;
        }

        .axis-tick-mid {
          top: 50%;
        }

        .axis-tick-bot {
          bottom: 6%;
        }

        .axis-label {
          position: absolute;
          right: 0;
          font-size: 28px;
          line-height: 1;
          color: rgba(0, 0, 0, 0.72);
        }

        .axis-label-top {
          top: 2%;
        }

        .axis-label-bot {
          bottom: 2%;
        }

        /* Final label styles are interpolated by scroll progress in JS. */

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
          transition: none;
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
