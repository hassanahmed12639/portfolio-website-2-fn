'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerGsapPlugins, ScrollTrigger } from '../../lib/gsap'
import OrbitalScrollAnimationSection from './OrbitalScrollAnimationSection'

const CARDS = [
  {
    id: 'manufacturing',
    src: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80',
    alt: 'Industrial facility',
    className: 'top-[8%] right-[22%] w-[82px] md:top-[2%] md:left-[-20%] md:right-auto md:w-44',
  },
  {
    id: 'electricity',
    src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
    alt: 'Electricity grid',
    className: 'top-[18%] left-[8%] w-[82px] md:top-[5%] md:right-[6%] md:left-auto md:w-44',
  },
  {
    id: 'agriculture',
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    alt: 'Green agriculture field',
    className: 'top-[35%] right-[2%] w-[82px] md:top-[32%] md:left-[16%] md:right-auto md:w-44',
  },
  {
    id: 'transportation',
    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    alt: 'Road transportation',
    className: 'top-auto bottom-[8%] left-[8%] w-[82px] md:top-auto md:bottom-[24%] md:right-[8%] md:left-auto md:w-44',
  },
  {
    id: 'buildings',
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80',
    alt: 'Buildings and city',
    className: 'top-[84%] right-[8%] w-[82px] md:bottom-[2%] md:left-[22%] md:right-auto md:top-auto md:w-44',
  },
]

const HEADLINE_LINES = [
  'We work to accelerate progress',
  'across every source of emissions,',
  'transforming the five sectors of the',
  'global economy into',
  'a landscape of opportunity.',
]

const FINAL_MESSAGE_LINE_1 = ['This', 'is', 'energy', 'innovation']
const FINAL_MESSAGE_LINE_2 = ['on', 'a', 'global', 'scale']
const MANUFACTURING_ZOOM_SCALE_FACTOR = 0.98

export default function EmissionsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textBlockRef = useRef<HTMLDivElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  const manufacturingImageRef = useRef<HTMLImageElement>(null)
  const revealWrapRef = useRef<HTMLDivElement>(null)
  const revealTitleRef = useRef<HTMLDivElement>(null)
  const revealTitleTextRef = useRef<HTMLHeadingElement>(null)
  const revealFrameRef = useRef<HTMLDivElement>(null)
  const revealImageRef = useRef<HTMLImageElement>(null)
  const revealCopyRef = useRef<HTMLDivElement>(null)
  const electricityStageRef = useRef<HTMLDivElement>(null)
  const electricityTitleRef = useRef<HTMLDivElement>(null)
  const electricityTitleTextRef = useRef<HTMLHeadingElement>(null)
  const electricityFrameRef = useRef<HTMLDivElement>(null)
  const electricityImageRef = useRef<HTMLImageElement>(null)
  const electricityCopyRef = useRef<HTMLDivElement>(null)
  const agricultureStageRef = useRef<HTMLDivElement>(null)
  const agricultureTitleRef = useRef<HTMLDivElement>(null)
  const agricultureTitleTextRef = useRef<HTMLHeadingElement>(null)
  const agricultureFrameRef = useRef<HTMLDivElement>(null)
  const agricultureImageRef = useRef<HTMLImageElement>(null)
  const agricultureCopyRef = useRef<HTMLDivElement>(null)
  const transportationStageRef = useRef<HTMLDivElement>(null)
  const transportationTitleRef = useRef<HTMLDivElement>(null)
  const transportationTitleTextRef = useRef<HTMLHeadingElement>(null)
  const transportationFrameRef = useRef<HTMLDivElement>(null)
  const transportationImageRef = useRef<HTMLImageElement>(null)
  const transportationCopyRef = useRef<HTMLDivElement>(null)
  const buildingsStageRef = useRef<HTMLDivElement>(null)
  const buildingsTitleRef = useRef<HTMLDivElement>(null)
  const buildingsTitleTextRef = useRef<HTMLHeadingElement>(null)
  const buildingsFrameRef = useRef<HTMLDivElement>(null)
  const buildingsImageRef = useRef<HTMLImageElement>(null)
  const buildingsCopyRef = useRef<HTMLDivElement>(null)
  const messageStageRef = useRef<HTMLDivElement>(null)
  const messageTextRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])
  const parallaxLayerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsapPlugins()
    const isMobile = window.matchMedia('(max-width: 767px)').matches

    const section = sectionRef.current
    const heading = headingRef.current
    const textBlock = textBlockRef.current
    const contentWrap = contentWrapRef.current
    const revealWrap = revealWrapRef.current
    const revealTitle = revealTitleRef.current
    const revealTitleText = revealTitleTextRef.current
    const revealFrame = revealFrameRef.current
    const revealImage = revealImageRef.current
    const revealCopy = revealCopyRef.current
    const electricityStage = electricityStageRef.current
    const electricityTitle = electricityTitleRef.current
    const electricityTitleText = electricityTitleTextRef.current
    const electricityImage = electricityImageRef.current
    const electricityCopy = electricityCopyRef.current
    const agricultureStage = agricultureStageRef.current
    const agricultureTitle = agricultureTitleRef.current
    const agricultureTitleText = agricultureTitleTextRef.current
    const agricultureImage = agricultureImageRef.current
    const agricultureCopy = agricultureCopyRef.current
    const transportationStage = transportationStageRef.current
    const transportationTitle = transportationTitleRef.current
    const transportationTitleText = transportationTitleTextRef.current
    const transportationImage = transportationImageRef.current
    const transportationCopy = transportationCopyRef.current
    const buildingsStage = buildingsStageRef.current
    const buildingsTitle = buildingsTitleRef.current
    const buildingsTitleText = buildingsTitleTextRef.current
    const buildingsImage = buildingsImageRef.current
    const buildingsCopy = buildingsCopyRef.current
    const messageStage = messageStageRef.current
    const messageText = messageTextRef.current
    const cards = cardRefs.current.filter(Boolean) as HTMLDivElement[]
    if (
      !section ||
      !heading ||
      !textBlock ||
      !contentWrap ||
      !revealWrap ||
      !revealTitle ||
      !revealTitleText ||
      !revealFrame ||
      !revealImage ||
      !revealCopy ||
      !electricityStage ||
      !electricityTitle ||
      !electricityTitleText ||
      !electricityImage ||
      !electricityCopy ||
      !agricultureStage ||
      !agricultureTitle ||
      !agricultureTitleText ||
      !agricultureImage ||
      !agricultureCopy ||
      !transportationStage ||
      !transportationTitle ||
      !transportationTitleText ||
      !transportationImage ||
      !transportationCopy ||
      !buildingsStage ||
      !buildingsTitle ||
      !buildingsTitleText ||
      !buildingsImage ||
      !buildingsCopy ||
      !messageStage ||
      !messageText ||
      cards.length !== CARDS.length
    )
      return

    const lines = Array.from(heading.querySelectorAll<HTMLElement>('.intro-line'))
    if (!lines.length) return

    gsap.set(contentWrap, { y: 0, opacity: 0 })
    gsap.set(revealWrap, { autoAlpha: 0 })
    gsap.set(revealTitle, { y: 28, opacity: 0 })
    gsap.set(revealImage, {
      x: 0,
      y: 0,
      scale: 1,
      transformOrigin: 'center center',
    })
    gsap.set(revealFrame, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: 'center center',
    })
    gsap.set(revealCopy, { y: 32, opacity: 0 })
    gsap.set(electricityStage, { autoAlpha: 0 })
    gsap.set(electricityTitle, { y: 22, opacity: 0 })
    gsap.set(electricityImage, { y: 50, scale: 0.88, transformOrigin: 'center center' })
    gsap.set(electricityCopy, { y: 20, opacity: 0 })
    gsap.set(agricultureStage, { autoAlpha: 0 })
    gsap.set(agricultureTitle, { y: 22, opacity: 0 })
    gsap.set(agricultureImage, { y: 0, scale: 1, transformOrigin: 'center center' })
    gsap.set(agricultureCopy, { y: 20, opacity: 0 })
    gsap.set(transportationStage, { autoAlpha: 0 })
    gsap.set(transportationTitle, { y: 22, opacity: 0 })
    gsap.set(transportationImage, { y: 50, scale: 0.88, transformOrigin: 'center center' })
    gsap.set(transportationCopy, { y: 20, opacity: 0 })
    gsap.set(buildingsStage, { autoAlpha: 0 })
    gsap.set(buildingsTitle, { y: 22, opacity: 0 })
    gsap.set(buildingsImage, { y: 0, scale: 1, transformOrigin: 'center center' })
    gsap.set(buildingsCopy, { y: 20, opacity: 0 })
    gsap.set(messageStage, { autoAlpha: 0 })
    const messageWords = Array.from(messageText.querySelectorAll<HTMLElement>('.message-word'))
    gsap.set(messageWords, { autoAlpha: 0 })
    const [firstLine, ...otherLines] = lines
    gsap.set(firstLine, { x: 0, opacity: 1 })
    gsap.set(otherLines, { x: -48, opacity: 0 })
    gsap.set(cards, { force3D: true, transformOrigin: 'center center' })

    const [manufacturingCard, ...otherCards] = cards
    const electricityCard = cards[1]
    const agricultureCard = cards[2]
    const transportationCard = cards[3]
    const buildingsCard = cards[4]
    const firstDropOrder = [buildingsCard, transportationCard, agricultureCard, electricityCard, manufacturingCard]
    gsap.set(manufacturingCard, { zIndex: 30 })
    gsap.set(otherCards, { zIndex: 20 })
    gsap.set(buildingsCard, { zIndex: 18 })
    gsap.set(transportationCard, { zIndex: 19 })
    gsap.set(agricultureCard, { zIndex: 21 })
    gsap.set(electricityCard, { zIndex: 22 })

    const getBottomCenterTarget = (card: HTMLDivElement, bottomOffset = 24, laneOffsetX = 0) => {
      const stage = card.parentElement as HTMLDivElement | null
      const fallbackX = Number(gsap.getProperty(card, 'x')) || 0
      const fallbackY = Number(gsap.getProperty(card, 'y')) || 0
      if (!stage) return { x: fallbackX, y: fallbackY }

      const stageRect = stage.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()
      if (!stageRect.width || !cardRect.width || !cardRect.height) return { x: fallbackX, y: fallbackY }

      const cardCenterX = cardRect.left + cardRect.width / 2
      const targetCenterX = stageRect.left + stageRect.width / 2 + laneOffsetX
      const targetTop = stageRect.bottom - bottomOffset - cardRect.height

      return {
        x: fallbackX + (targetCenterX - cardCenterX),
        y: fallbackY + (targetTop - cardRect.top),
      }
    }

    const getSectionCenterTarget = (card: HTMLDivElement, laneOffsetX = 0, laneOffsetY = 0) => {
      const stage = section
      const fallbackX = Number(gsap.getProperty(card, 'x')) || 0
      const fallbackY = Number(gsap.getProperty(card, 'y')) || 0
      if (!stage) return { x: fallbackX, y: fallbackY }

      const stageRect = stage.getBoundingClientRect()
      const cardRect = card.getBoundingClientRect()
      if (!stageRect.width || !stageRect.height || !cardRect.width || !cardRect.height) {
        return { x: fallbackX, y: fallbackY }
      }

      const cardCenterX = cardRect.left + cardRect.width / 2
      const cardCenterY = cardRect.top + cardRect.height / 2
      const targetCenterX = stageRect.left + stageRect.width / 2 + laneOffsetX
      const targetCenterY = stageRect.top + stageRect.height / 2 + laneOffsetY

      return {
        x: fallbackX + (targetCenterX - cardCenterX),
        y: fallbackY + (targetCenterY - cardCenterY),
      }
    }

    const getManufacturingZoomTarget = () => {
      const sourceImage = manufacturingImageRef.current
      const targetImage = revealImageRef.current
      const fallbackX = Number(gsap.getProperty(manufacturingCard, 'x')) || 0
      const fallbackY = Number(gsap.getProperty(manufacturingCard, 'y')) || 0

      if (!sourceImage || !targetImage) {
        return { x: fallbackX, y: fallbackY, scale: isMobile ? 2.2 : 3.8 }
      }

      const sourceRect = sourceImage.getBoundingClientRect()
      const targetRect = targetImage.getBoundingClientRect()
      if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) {
        return { x: fallbackX, y: fallbackY, scale: isMobile ? 2.2 : 3.8 }
      }

      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2
      const targetCenterX = targetRect.left + targetRect.width / 2
      const targetCenterY = targetRect.top + targetRect.height / 2

      const targetScale =
        Math.max(targetRect.width / sourceRect.width, targetRect.height / sourceRect.height) *
        MANUFACTURING_ZOOM_SCALE_FACTOR

      return {
        x: fallbackX + (targetCenterX - sourceCenterX),
        y: fallbackY + (targetCenterY - sourceCenterY),
        scale: isMobile ? Math.min(targetScale, 2.2) : targetScale,
      }
    }

    const getRevealFrameMatchTransform = () => {
      const sourceImage = manufacturingImageRef.current
      const targetFrame = revealFrameRef.current
      if (!sourceImage || !targetFrame) return { x: 0, y: 0, scaleX: 1, scaleY: 1 }

      const sourceRect = sourceImage.getBoundingClientRect()
      const targetRect = targetFrame.getBoundingClientRect()
      if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) {
        return { x: 0, y: 0, scaleX: 1, scaleY: 1 }
      }

      const sourceCenterX = sourceRect.left + sourceRect.width / 2
      const sourceCenterY = sourceRect.top + sourceRect.height / 2
      const targetCenterX = targetRect.left + targetRect.width / 2
      const targetCenterY = targetRect.top + targetRect.height / 2

      return {
        x: sourceCenterX - targetCenterX,
        y: sourceCenterY - targetCenterY,
        scaleX: sourceRect.width / targetRect.width,
        scaleY: sourceRect.height / targetRect.height,
      }
    }

    let manufacturingZoomTarget = { x: 0, y: 0, scale: 1 }
    let revealFrameMatch = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

    function setAdaptiveTitleSplit(titleEl: HTMLElement | null, cardEl: HTMLElement | null) {
      if (!titleEl || !cardEl) return
      const tr = titleEl.getBoundingClientRect()
      const cr = cardEl.getBoundingClientRect()
      const overlapLeft = Math.max(tr.left, cr.left) - 1.5
      const overlapRight = Math.min(tr.right, cr.right) + 1.5
      const overlapTop = Math.max(tr.top, cr.top)
      // Slight descender compensation so glyph bottoms don't leave green slivers.
      const overlapBottom = Math.min(tr.bottom, cr.bottom) + 8
      const overlapWidth = overlapRight - overlapLeft
      const overlapHeight = overlapBottom - overlapTop
      if (
        overlapWidth <= 0 ||
        overlapHeight <= 0 ||
        tr.width <= 0 ||
        tr.height <= 0
      ) {
        titleEl.style.setProperty('--title-clip-left', '100%')
        titleEl.style.setProperty('--title-clip-right', '0%')
        titleEl.style.setProperty('--title-clip-top', '0%')
        titleEl.style.setProperty('--title-clip-bottom', '0%')
        return
      }
      const leftPct = ((overlapLeft - tr.left) / tr.width) * 100
      const rightPct = ((tr.right - overlapRight) / tr.width) * 100
      const topPct = ((overlapTop - tr.top) / tr.height) * 100
      const bottomPct = ((tr.bottom - overlapBottom) / tr.height) * 100
      const xCompPct = (3 / tr.width) * 100
      const yCompPct = (2 / tr.height) * 100
      const clipLeft = Math.max(0, Math.min(100, leftPct - xCompPct))
      const clipRight = Math.max(0, Math.min(100, rightPct - xCompPct))
      const clipTop = Math.max(0, Math.min(100, topPct - yCompPct))
      const clipBottom = Math.max(0, Math.min(100, bottomPct - yCompPct))
      titleEl.style.setProperty('--title-clip-left', `${clipLeft}%`)
      titleEl.style.setProperty('--title-clip-right', `${clipRight}%`)
      titleEl.style.setProperty('--title-clip-top', `${clipTop}%`)
      titleEl.style.setProperty('--title-clip-bottom', `${clipBottom}%`)
    }

    function updateAllTitleSplits() {
      setAdaptiveTitleSplit(revealTitleText, revealImage)
      setAdaptiveTitleSplit(electricityTitleText, electricityImage)
      setAdaptiveTitleSplit(agricultureTitleText, agricultureImage)
      setAdaptiveTitleSplit(transportationTitleText, transportationImage)
      setAdaptiveTitleSplit(buildingsTitleText, buildingsImage)
    }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=5200',
        scrub: 1.6,
        pin: true,
        anticipatePin: 2,
        invalidateOnRefresh: true,
      },
    })

    // First: reveal the whole section without vertical motion so it feels like
    // it appears from behind the previous pinned parallax panel.
    tl.to(contentWrap, {
      opacity: 1,
      duration: 0.9,
      ease: 'power1.out',
    })

    // Then run the line-by-line headline reveal.
    tl.to(otherLines, {
      x: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.7,
      ease: 'power1.out',
    })

    // Slight hold before cards begin moving.
    tl.to({}, { duration: 0.2 })

    if (isMobile) {
      // Mobile choreography matching requested sequence:
      // 1) bottom cards move down first while text fades
      // 2) remaining cards move down and slightly scale up one-by-one
      // 3) then manufacturing prepares for expansion
      tl.to(
        [buildingsCard, transportationCard],
        {
          y: '+=230',
          opacity: 0.95,
          duration: 0.5,
          stagger: 0.12,
          ease: 'power1.inOut',
        },
        '>'
      )
      tl.to(
        textBlock,
        {
          autoAlpha: 0,
          x: -28,
          duration: 0.45,
          ease: 'power1.out',
        },
        '<+0.02'
      )

      tl.to(
        agricultureCard,
        {
          y: '+=120',
          scale: 1.06,
          duration: 0.58,
          ease: 'power1.inOut',
        },
        '>'
      )
      tl.to(
        electricityCard,
        {
          y: '+=145',
          scale: 1.07,
          duration: 0.62,
          ease: 'power1.inOut',
        },
        '<+0.08'
      )
      tl.to(
        manufacturingCard,
        {
          y: '+=76',
          scale: 1.05,
          duration: 0.62,
          ease: 'power1.inOut',
        },
        '<+0.08'
      )

      tl.to(
        agricultureCard,
        {
          y: '+=210',
          opacity: 0,
          duration: 0.5,
          ease: 'power1.in',
        },
        '>'
      )
      tl.to(
        electricityCard,
        {
          y: '+=260',
          opacity: 0,
          duration: 0.55,
          ease: 'power1.in',
        },
        '<+0.06'
      )
      tl.to(
        manufacturingCard,
        {
          y: '+=190',
          x: -18,
          duration: 0.86,
          ease: 'power1.inOut',
        },
        '<'
      )
    } else {
      // Desktop behavior unchanged
      tl.to(firstDropOrder, {
        y: 170,
        duration: 0.56,
        stagger: {
          each: 0.14,
          from: 'start',
        },
        ease: 'power1.inOut',
      })
      tl.to(
        textBlock,
        {
          autoAlpha: 0,
          x: -48,
          duration: 0.56,
          ease: 'power1.inOut',
        },
        '<'
      )

      // Buildings exits first (down, out of frame).
      tl.to(buildingsCard, {
        y: '+=360',
        opacity: 0,
        scale: 0.92,
        duration: 0.52,
        ease: 'power1.in',
      })

      // Transportation exits second (down, out of frame).
      tl.to(
        transportationCard,
        {
          y: '+=360',
          opacity: 0,
          scale: 0.92,
          duration: 0.52,
          ease: 'power1.in',
        },
        '<+0.1'
      )

      // Agriculture moves to bottom-center with a slight size increase.
      tl.to(
        agricultureCard,
        {
          x: () => getBottomCenterTarget(agricultureCard, 26, -72).x,
          y: () => getBottomCenterTarget(agricultureCard, 26, -72).y,
          scale: 1.08,
          duration: 0.62,
          ease: 'power1.inOut',
        },
        '<+0.08'
      )
      // Keep manufacturing subtly moving so flow never feels paused.
      tl.to(
        manufacturingCard,
        {
          y: '+=64',
          x: -14,
          duration: 0.62,
          ease: 'power1.inOut',
        },
        '<'
      )
      tl.to(agricultureCard, {
        opacity: 0,
        y: '+=120',
        duration: 0.34,
        ease: 'power1.in',
      })

      // Electricity moves to bottom-center with a slight size increase.
      tl.to(electricityCard, {
        x: () => getBottomCenterTarget(electricityCard, 26, 72).x,
        y: () => getBottomCenterTarget(electricityCard, 26, 72).y,
        scale: 1.1,
        duration: 0.62,
        ease: 'power1.inOut',
      })

      // Electricity exits while manufacturing advances.
      tl.to(electricityCard, {
        y: '+=280',
        opacity: 0,
        scale: 0.94,
        duration: 0.54,
        ease: 'power1.in',
      })
      tl.to(
        manufacturingCard,
        {
          // Center the card before expansion so the morph starts from the middle.
          x: () => getSectionCenterTarget(manufacturingCard).x,
          y: () => getSectionCenterTarget(manufacturingCard).y,
          duration: 0.9,
          ease: 'power1.inOut',
        },
        '<'
      )
    }

    // Final manufacturing transition into reveal.
    if (isMobile) {
      // Mobile-only: small pre-expand before exact frame-match handoff.
      tl.to(
        manufacturingCard,
        {
          y: '+=20',
          scale: 1.08,
          duration: 0.86,
          ease: 'power2.out',
        },
        '>'
      )
    } else {
      // Desktop: no pre-step here; handoff is handled in one continuous frame morph.
    }

    if (isMobile) {
      // Mobile-only: exact tiny-card -> full-frame geometry match.
      tl.add(() => {
        revealFrameMatch = getRevealFrameMatchTransform()
      })
      tl.set(revealFrame, {
        x: () => revealFrameMatch.x,
        y: () => revealFrameMatch.y,
        scaleX: () => revealFrameMatch.scaleX,
        scaleY: () => revealFrameMatch.scaleY,
        opacity: 0.95,
      })
      tl.set(revealImage, { x: 0, y: 0, scale: 1, opacity: 1 })
      tl.set(revealWrap, { autoAlpha: 0 }, '>')
      tl.to(revealWrap, { autoAlpha: 1, duration: 0.2, ease: 'power1.out' }, '>')
      tl.to(
        revealFrame,
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          opacity: 1,
          duration: 1.18,
          ease: 'power2.inOut',
        },
        '<'
      )
      tl.to(
        revealImage,
        {
          scale: 1.04,
          duration: 1.18,
          ease: 'power2.out',
        },
        '<+0.02'
      )
      tl.to(
        manufacturingCard,
        { autoAlpha: 0, duration: 0.86, ease: 'power2.out' },
        '<+0.05'
      )
      tl.set(revealFrame, { clearProps: 'x,y,scaleX,scaleY,opacity' })
    } else {
      // Desktop: apply small state in callback (so it's correct when scrubbing), then animate to full.
      tl.add(() => {
        revealFrameMatch = getRevealFrameMatchTransform()
        gsap.set(revealFrame, {
          x: revealFrameMatch.x,
          y: revealFrameMatch.y,
          scaleX: revealFrameMatch.scaleX,
          scaleY: revealFrameMatch.scaleY,
          transformOrigin: 'center center',
          force3D: true,
        })
      })
      tl.set(revealImage, { x: 0, y: 0, scale: 1, transformOrigin: 'center center', force3D: true })
      tl.set(manufacturingCard, { autoAlpha: 0 }, '>')
      tl.set(revealWrap, { autoAlpha: 1 }, '>')
      tl.to(
        revealFrame,
        {
          x: 0,
          y: 0,
          scaleX: 1,
          scaleY: 1,
          duration: 1.85,
          ease: 'power2.inOut',
          force3D: true,
        },
        '>'
      )
      tl.set(revealFrame, { clearProps: 'x,y,scaleX,scaleY,transform' }, '+=0')
    }

    // Text timing: mobile reveals title first, then copy; desktop keeps prior timing.
    if (isMobile) {
      tl.to(
        revealTitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.52,
          ease: 'power2.out',
        },
        '<+0.46'
      )
      tl.to(
        revealCopy,
        {
          y: 0,
          opacity: 1,
          duration: 0.62,
          ease: 'power2.out',
        },
        '<+0.3'
      )
    } else {
      tl.to(
        revealTitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
        },
        '+=0.14'
      )

      tl.to(
        revealCopy,
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: 'power2.out',
        },
        '<+0.1'
      )
    }

    // Sequential handoff: current exits fully then next enters (no overlap).
    const CARD_ENTER_Y = () => Math.max(420, window.innerHeight * 0.5)
    const CARD_ENTER_DURATION = 1.25
    const FRAME_ENTER_SCALE = 0.88
    const FRAME_ENTER_Y = 50
    const EXIT_DURATION = 0.82
    const CARD_GAP = 72
    const EXIT_Y = -(window.innerHeight + 120)

    const handoffToNextStage = (
      currentStage: HTMLDivElement,
      nextStage: HTMLDivElement,
      nextImage: HTMLImageElement,
      nextTitle: HTMLDivElement,
      nextCopy: HTMLDivElement,
      nextFrame?: HTMLDivElement | null
    ) => {
      tl.to({}, { duration: 0.02 })

      // Next card visible below (won’t overlap current); then both animations start together.
      tl.to(currentStage, { y: EXIT_Y, scale: 0.92, duration: EXIT_DURATION, ease: 'power1.in' }, '>')
      tl.set(currentStage, { autoAlpha: 0 }, '>')
      tl.to({}, { duration: 0.28 })
      tl.set(nextStage, { autoAlpha: 1, y: CARD_ENTER_Y() }, '>')
      tl.set(nextImage, { y: 0, scale: 1, transformOrigin: 'center center' }, '>')
      if (nextFrame) {
        tl.set(nextFrame, {
          boxShadow: 'none',
          y: FRAME_ENTER_Y,
          scale: FRAME_ENTER_SCALE,
          transformOrigin: 'center center',
        }, '>')
      }
      tl.to(nextStage, { y: CARD_GAP, duration: CARD_ENTER_DURATION, ease: [0.33, 1, 0.38, 1] }, '>')
      if (nextFrame) {
        tl.to(nextFrame, { y: 0, scale: 1, duration: CARD_ENTER_DURATION, ease: [0.33, 1, 0.38, 1] }, '<')
        tl.to(nextFrame, { boxShadow: '0 30px 90px rgba(0,0,0,0.8)', duration: 0.35, ease: 'power2.out' }, '<+0.65')
        tl.set(nextFrame, { clearProps: 'y,scale' }, '>+0.1')
      }
      tl.to(nextTitle, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, '<+0.2')
      tl.to(nextCopy, { y: 0, opacity: 1, duration: 0.55, ease: 'power2.out' }, '<+0.12')
    }

    // Slight pause after Manufacturing reveal before handoff to Electricity.
    tl.to({}, { duration: 0.25 })

    const electricityFrame = electricityFrameRef.current
    const agricultureFrame = agricultureFrameRef.current
    const transportationFrame = transportationFrameRef.current
    const buildingsFrame = buildingsFrameRef.current

    handoffToNextStage(revealWrap, electricityStage, electricityImage, electricityTitle, electricityCopy, electricityFrame)
    handoffToNextStage(
      electricityStage,
      agricultureStage,
      agricultureImage,
      agricultureTitle,
      agricultureCopy,
      agricultureFrame
    )
    handoffToNextStage(
      agricultureStage,
      transportationStage,
      transportationImage,
      transportationTitle,
      transportationCopy,
      transportationFrame
    )
    handoffToNextStage(
      transportationStage,
      buildingsStage,
      buildingsImage,
      buildingsTitle,
      buildingsCopy,
      buildingsFrame
    )

    // Hold final card briefly before revealing the statement section.
    tl.to({}, { duration: 0.7 })

    tl.add('finalMessageStart')
    tl.set(messageStage, { autoAlpha: 1 }, 'finalMessageStart')
    tl.to(
      buildingsStage,
      {
        y: -540,
        scale: 0.94,
        duration: 2.2,
        ease: 'power1.inOut',
      },
      'finalMessageStart'
    )

    // Reveal words while the final card section is moving up.
    messageWords.forEach((word, index) => {
      tl.set(
        word,
        { autoAlpha: 1 },
        `finalMessageStart+=${0.22 + index * 0.22}`
      )
    })

    tl.set(buildingsStage, { autoAlpha: 0 }, 'finalMessageStart+=2.2')

    // Hold the full sentence on screen before unpin.
    tl.to({}, { duration: 0.7 })

    const adaptiveSt = ScrollTrigger.create({
      trigger: section,
      start: 'top top',
      end: '+=5200',
      onUpdate: updateAllTitleSplits,
    })
    updateAllTitleSplits()

    const parallaxEl = parallaxLayerRef.current
    if (parallaxEl) {
      gsap.set(parallaxEl, { y: 0 })
      const parallaxSt = ScrollTrigger.create({
        trigger: section,
        start: 'top top',
        end: '+=5200',
        scrub: 1.2,
        onUpdate: (self) => {
          gsap.set(parallaxEl, { y: self.progress * -80 })
        },
      })
      return () => {
        parallaxSt.kill()
        adaptiveSt.kill()
        tl.scrollTrigger?.kill()
        tl.kill()
      }
    }

    return () => {
      adaptiveSt.kill()
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        className="relative min-h-screen w-full overflow-hidden bg-[#0F0F0F] px-4 py-6 sm:px-6 sm:py-8 md:px-[4%] md:py-10 lg:px-[5%] lg:py-12"
      >
        <div
          ref={parallaxLayerRef}
          className="pointer-events-none absolute inset-0 z-0"
          aria-hidden
        >
          <div
            className="absolute inset-0 opacity-[0.07]"
            style={{
              background: 'radial-gradient(ellipse 80% 60% at 50% 40%, rgba(170,255,0,0.25) 0%, transparent 55%)',
            }}
          />
        </div>
      <div
        ref={contentWrapRef}
        className="relative z-10 mx-auto h-full w-full md:flex md:items-center md:justify-between"
      >
        <div ref={textBlockRef} className="absolute left-0 right-3 top-[45%] z-20 max-w-[93%] md:static md:max-w-xl md:w-auto md:flex-shrink-0 md:pr-4">
          <h2
            ref={headingRef}
            className="text-[13px] font-semibold leading-[1.06] tracking-[-0.015em] text-white md:-translate-y-2 md:text-[26px] md:leading-[1.25] md:tracking-normal lg:text-[30px] xl:text-[34px]"
          >
            {HEADLINE_LINES.map((line, i) => (
              <span
                key={line}
                className={`intro-line block ${i > 0 ? 'mt-0.5 md:mt-1.5' : ''} ${
                  i === HEADLINE_LINES.length - 1 ? 'text-[#AAFF00]' : ''
                } will-change-transform`}
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="absolute inset-0 z-10 h-full w-full md:relative md:ml-auto md:h-[420px] md:w-[52%] md:flex-shrink-0 lg:h-[500px] xl:h-[560px]">
          {CARDS.map((card, index) => (
            <div
              key={card.id}
              ref={(el) => {
                cardRefs.current[index] = el
              }}
              className={`absolute ${card.className} will-change-transform`}
            >
              <img
                ref={card.id === 'manufacturing' ? manufacturingImageRef : null}
                src={card.src}
                alt={card.alt}
                className={
                  card.id === 'manufacturing'
                    ? 'aspect-[1/1.06] w-full rounded-[2px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:h-[96px]'
                    : 'h-[82px] w-full rounded-[2px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:h-[96px]'
                }
              />
            </div>
          ))}
        </div>
      </div>

      <div
        ref={revealWrapRef}
        className="pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-start px-3 pt-14 pb-3 md:items-center md:px-6 md:pt-16 md:pb-8 lg:px-10 lg:pt-20 lg:pb-10 xl:px-14 xl:pt-24 xl:pb-10">
          <div className="relative w-full md:translate-y-0 lg:translate-y-0">
            <div
              ref={revealTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[1020px] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw] -translate-y-2 text-center md:-mb-8 md:-translate-y-5 lg:-mb-10 lg:-translate-y-7"
              style={{ ['--title-split' as string]: 0 }}
            >
              <h2
                ref={revealTitleTextRef}
                className="relative inline-block text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] md:text-[72px] lg:text-[90px] xl:text-[110px]"
                style={{
                  ['--title-clip-left' as string]: '100%',
                  ['--title-clip-right' as string]: '0%',
                  ['--title-clip-top' as string]: '0%',
                  ['--title-clip-bottom' as string]: '0%',
                }}
              >
                <span className="block text-[#AAFF00]" aria-hidden>Manufacturing</span>
                <span
                  className="absolute inset-0 block text-white"
                  style={{
                    clipPath:
                      'inset(var(--title-clip-top, 0%) var(--title-clip-right, 0%) var(--title-clip-bottom, 0%) var(--title-clip-left, 100%))',
                    WebkitTextStroke: '0.4px #fff',
                  }}
                  aria-hidden
                >
                  Manufacturing
                </span>
              </h2>
            </div>

            <div
              ref={revealFrameRef}
              className="relative z-10 mx-auto w-full max-w-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] md:max-w-[95%] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw]"
            >
              <img
                ref={revealImageRef}
                src={CARDS[0].src}
                alt="Industrial manufacturing detail"
                className="h-[72vh] w-full object-cover md:h-auto md:aspect-[20/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={revealCopyRef}
                className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-5 text-center text-white md:items-start md:px-6 md:pb-6 lg:px-10 lg:pb-8 md:text-left"
              >
                <span className="mb-2 inline-flex w-fit self-center rounded-full border border-white/70 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm md:mb-3 md:self-start md:px-3 md:py-1 lg:mb-4 md:text-sm">
                  30% emissions
                </span>
                <p className="max-w-[300px] text-[12px] font-semibold leading-[1.2] text-white md:max-w-[360px] md:text-[16px] lg:max-w-[420px] lg:text-[20px]">
                  The clean industrial revolution starts with transforming how we make everything in
                  the world from steel and cement to everyday materials.
                </p>
              </div>
            </div>
            <div className="mt-20 flex justify-center md:mt-28">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={electricityStageRef}
        className="pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-start px-3 pt-14 pb-3 md:items-center md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-14 xl:py-10">
          <div className="w-full md:-translate-y-4 lg:-translate-y-6">
            <div
              ref={electricityTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[1020px] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw] -translate-y-2 text-center md:-mb-8 md:-translate-y-5 lg:-mb-10 lg:-translate-y-7"
              style={{ ['--title-split' as string]: 0 }}
            >
              <h2
                ref={electricityTitleTextRef}
                className="relative inline-block text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] md:text-[72px] lg:text-[90px] xl:text-[110px]"
                style={{
                  ['--title-clip-left' as string]: '100%',
                  ['--title-clip-right' as string]: '0%',
                  ['--title-clip-top' as string]: '0%',
                  ['--title-clip-bottom' as string]: '0%',
                }}
              >
                <span className="block text-[#AAFF00]" aria-hidden>Electricity</span>
                <span
                  className="absolute inset-0 block text-white"
                  style={{
                    clipPath:
                      'inset(var(--title-clip-top, 0%) var(--title-clip-right, 0%) var(--title-clip-bottom, 0%) var(--title-clip-left, 100%))',
                    WebkitTextStroke: '0.4px #fff',
                  }}
                  aria-hidden
                >
                  Electricity
                </span>
              </h2>
            </div>

            <div
              ref={electricityFrameRef}
              className="relative z-10 mx-auto w-full max-w-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] md:max-w-[95%] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw]"
            >
              <img
                ref={electricityImageRef}
                src={CARDS[1].src}
                alt="Electricity infrastructure"
                className="h-[72vh] w-full object-cover md:h-auto md:aspect-[20/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={electricityCopyRef}
                className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-5 text-center text-white md:items-start md:px-6 md:pb-6 lg:px-10 lg:pb-8 md:text-left"
              >
                <span className="mb-2 inline-flex w-fit self-center rounded-full border border-white/70 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm md:mb-3 md:self-start md:px-3 md:py-1 lg:mb-4 md:text-sm">
                  28% emissions
                </span>
                <p className="max-w-[300px] text-[12px] font-semibold leading-[1.2] text-white md:max-w-[360px] md:text-[16px] lg:max-w-[420px] lg:text-[20px]">
                  The world must build 21st century grids while delivering energy abundance - clean,
                  affordable, and reliable power for everyone.
                </p>
              </div>
            </div>
            <div className="mt-20 flex justify-center md:mt-28">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={agricultureStageRef}
        className="pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-start px-3 pt-14 pb-3 md:items-center md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-14 xl:py-10">
          <div className="w-full md:-translate-y-4 lg:-translate-y-6">
            <div
              ref={agricultureTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[1020px] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw] -translate-y-2 text-center md:-mb-8 md:-translate-y-5 lg:-mb-10 lg:-translate-y-7"
              style={{ ['--title-split' as string]: 0 }}
            >
              <h2
                ref={agricultureTitleTextRef}
                className="relative inline-block text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] md:text-[72px] lg:text-[90px] xl:text-[110px]"
                style={{
                  ['--title-clip-left' as string]: '100%',
                  ['--title-clip-right' as string]: '0%',
                  ['--title-clip-top' as string]: '0%',
                  ['--title-clip-bottom' as string]: '0%',
                }}
              >
                <span className="block text-[#AAFF00]" aria-hidden>Agriculture</span>
                <span
                  className="absolute inset-0 block text-white"
                  style={{
                    clipPath:
                      'inset(var(--title-clip-top, 0%) var(--title-clip-right, 0%) var(--title-clip-bottom, 0%) var(--title-clip-left, 100%))',
                    WebkitTextStroke: '0.4px #fff',
                  }}
                  aria-hidden
                >
                  Agriculture
                </span>
              </h2>
            </div>

            <div
              ref={agricultureFrameRef}
              className="relative z-10 mx-auto w-full max-w-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] md:max-w-[95%] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw]"
            >
              <img
                ref={agricultureImageRef}
                src={CARDS[2].src}
                alt="Agriculture fields"
                className="h-[72vh] w-full object-cover md:h-auto md:aspect-[20/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={agricultureCopyRef}
                className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-5 text-center text-white md:items-start md:px-6 md:pb-6 lg:px-10 lg:pb-8 md:text-left"
              >
                <span className="mb-2 inline-flex w-fit self-center rounded-full border border-white/70 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm md:mb-3 md:self-start md:px-3 md:py-1 lg:mb-4 md:text-sm">
                  19% emissions
                </span>
                <p className="max-w-[300px] text-[12px] font-semibold leading-[1.2] text-white md:max-w-[360px] md:text-[16px] lg:max-w-[420px] lg:text-[20px]">
                  From growing rice to raising cattle, innovating how we feed ourselves is a prime
                  opportunity. Meet the innovators who will feed the world for decades to come.
                </p>
              </div>
            </div>
            <div className="mt-20 flex justify-center md:mt-28">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={transportationStageRef}
        className="pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-start px-3 pt-14 pb-3 md:items-center md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-14 xl:py-10">
          <div className="w-full md:-translate-y-4 lg:-translate-y-6">
            <div
              ref={transportationTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[1020px] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw] -translate-y-2 text-center md:-mb-8 md:-translate-y-5 lg:-mb-10 lg:-translate-y-7"
              style={{ ['--title-split' as string]: 0 }}
            >
              <h2
                ref={transportationTitleTextRef}
                className="relative inline-block text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] md:text-[72px] lg:text-[90px] xl:text-[110px]"
                style={{
                  ['--title-clip-left' as string]: '100%',
                  ['--title-clip-right' as string]: '0%',
                  ['--title-clip-top' as string]: '0%',
                  ['--title-clip-bottom' as string]: '0%',
                }}
              >
                <span className="block text-[#AAFF00]" aria-hidden>Transportation</span>
                <span
                  className="absolute inset-0 block text-white"
                  style={{
                    clipPath:
                      'inset(var(--title-clip-top, 0%) var(--title-clip-right, 0%) var(--title-clip-bottom, 0%) var(--title-clip-left, 100%))',
                    WebkitTextStroke: '0.4px #fff',
                  }}
                  aria-hidden
                >
                  Transportation
                </span>
              </h2>
            </div>

            <div
              ref={transportationFrameRef}
              className="relative z-10 mx-auto w-full max-w-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] md:max-w-[95%] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw]"
            >
              <img
                ref={transportationImageRef}
                src={CARDS[3].src}
                alt="Transportation networks"
                className="h-[72vh] w-full object-cover md:h-auto md:aspect-[20/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={transportationCopyRef}
                className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-5 text-center text-white md:items-start md:px-6 md:pb-6 lg:px-10 lg:pb-8 md:text-left"
              >
                <span className="mb-2 inline-flex w-fit self-center rounded-full border border-white/70 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm md:mb-3 md:self-start md:px-3 md:py-1 lg:mb-4 md:text-sm">
                  25% emissions
                </span>
                <p className="max-w-[300px] text-[12px] font-semibold leading-[1.2] text-white md:max-w-[360px] md:text-[16px] lg:max-w-[420px] lg:text-[20px]">
                  Revolutionizing how people and goods move around the world with clean, efficient
                  transportation solutions.
                </p>
              </div>
            </div>
            <div className="mt-20 flex justify-center md:mt-28">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={buildingsStageRef}
        className="pointer-events-none invisible absolute inset-0 z-20 opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="mx-auto flex h-full w-full max-w-7xl items-start px-3 pt-14 pb-3 md:items-center md:px-6 md:py-8 lg:px-10 lg:py-10 xl:px-14 xl:py-10">
          <div className="w-full md:-translate-y-4 lg:-translate-y-6">
            <div
              ref={buildingsTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[1020px] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw] -translate-y-2 text-center md:-mb-8 md:-translate-y-5 lg:-mb-10 lg:-translate-y-7"
              style={{ ['--title-split' as string]: 0 }}
            >
              <h2
                ref={buildingsTitleTextRef}
                className="relative inline-block text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] md:text-[72px] lg:text-[90px] xl:text-[110px]"
                style={{
                  ['--title-clip-left' as string]: '100%',
                  ['--title-clip-right' as string]: '0%',
                  ['--title-clip-top' as string]: '0%',
                  ['--title-clip-bottom' as string]: '0%',
                }}
              >
                <span className="block text-[#AAFF00]" aria-hidden>Buildings</span>
                <span
                  className="absolute inset-0 block text-white"
                  style={{
                    clipPath:
                      'inset(var(--title-clip-top, 0%) var(--title-clip-right, 0%) var(--title-clip-bottom, 0%) var(--title-clip-left, 100%))',
                    WebkitTextStroke: '0.4px #fff',
                  }}
                  aria-hidden
                >
                  Buildings
                </span>
              </h2>
            </div>

            <div
              ref={buildingsFrameRef}
              className="relative z-10 mx-auto w-full max-w-none overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)] md:max-w-[95%] lg:max-w-[2000px] xl:max-w-[2400px] 2xl:max-w-[92vw]"
            >
              <img
                ref={buildingsImageRef}
                src={CARDS[4].src}
                alt="Urban buildings"
                className="h-[72vh] w-full object-cover md:h-auto md:aspect-[20/9]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={buildingsCopyRef}
                className="absolute inset-0 flex flex-col justify-end items-center px-4 pb-5 text-center text-white md:items-start md:px-6 md:pb-6 lg:px-10 lg:pb-8 md:text-left"
              >
                <span className="mb-2 inline-flex w-fit self-center rounded-full border border-white/70 bg-black/35 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm md:mb-3 md:self-start md:px-3 md:py-1 lg:mb-4 md:text-sm">
                  22% emissions
                </span>
                <p className="max-w-[300px] text-[12px] font-semibold leading-[1.2] text-white md:max-w-[360px] md:text-[16px] lg:max-w-[420px] lg:text-[20px]">
                  Creating sustainable spaces where we live and work, reducing energy consumption
                  while improving comfort and efficiency.
                </p>
              </div>
            </div>
            <div className="mt-20 flex justify-center md:mt-28">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={messageStageRef}
        className="pointer-events-none invisible absolute inset-0 z-10 grid place-items-center opacity-0"
        style={{ visibility: 'hidden', opacity: 0 }}
      >
        <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10">
          <div
            ref={messageTextRef}
            className="mx-auto max-w-[780px] text-center text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-white sm:text-[32px] md:text-[36px] lg:text-[44px]"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-4">
              {FINAL_MESSAGE_LINE_1.map((word) => (
                <span
                  key={word}
                  className={`message-word inline-block ${
                    word === 'energy' || word === 'innovation' ? 'text-[#AAFF00]' : 'text-white'
                  }`}
                >
                  {word}
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 md:mt-3 md:gap-x-4">
              {FINAL_MESSAGE_LINE_2.map((word) => (
                <span key={word} className="message-word inline-block text-white">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </section>
      <OrbitalScrollAnimationSection />
    </>
  )
}
