'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerGsapPlugins } from '../../lib/gsap'
import OrbitalScrollAnimationSection from './OrbitalScrollAnimationSection'

const CARDS = [
  {
    id: 'manufacturing',
    src: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80',
    alt: 'Industrial facility',
    className: 'top-4 left-[8%] w-32 md:top-0 md:left-[4.5%] md:w-40',
  },
  {
    id: 'electricity',
    src: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?auto=format&fit=crop&w=900&q=80',
    alt: 'Electricity grid',
    className: 'top-6 right-[4%] w-36 md:top-2 md:right-[2%] md:w-48',
  },
  {
    id: 'agriculture',
    src: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=900&q=80',
    alt: 'Green agriculture field',
    className: 'top-[32%] left-[42%] w-36 -translate-x-1/2 md:top-[26%] md:left-[45%] md:w-52',
  },
  {
    id: 'transportation',
    src: 'https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?auto=format&fit=crop&w=900&q=80',
    alt: 'Road transportation',
    className: 'bottom-[20%] right-[6%] w-36 md:bottom-[22%] md:right-[4%] md:w-48',
  },
  {
    id: 'buildings',
    src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80',
    alt: 'Buildings and city',
    className: 'bottom-4 left-[46%] w-36 -translate-x-1/2 md:bottom-[10%] md:left-[50%] md:w-44',
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
const MANUFACTURING_ZOOM_SCALE_FACTOR = 0.86

export default function EmissionsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textBlockRef = useRef<HTMLDivElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  const manufacturingImageRef = useRef<HTMLImageElement>(null)
  const revealWrapRef = useRef<HTMLDivElement>(null)
  const revealTitleRef = useRef<HTMLDivElement>(null)
  const revealImageRef = useRef<HTMLImageElement>(null)
  const revealCopyRef = useRef<HTMLDivElement>(null)
  const electricityStageRef = useRef<HTMLDivElement>(null)
  const electricityTitleRef = useRef<HTMLDivElement>(null)
  const electricityImageRef = useRef<HTMLImageElement>(null)
  const electricityCopyRef = useRef<HTMLDivElement>(null)
  const agricultureStageRef = useRef<HTMLDivElement>(null)
  const agricultureTitleRef = useRef<HTMLDivElement>(null)
  const agricultureImageRef = useRef<HTMLImageElement>(null)
  const agricultureCopyRef = useRef<HTMLDivElement>(null)
  const transportationStageRef = useRef<HTMLDivElement>(null)
  const transportationTitleRef = useRef<HTMLDivElement>(null)
  const transportationImageRef = useRef<HTMLImageElement>(null)
  const transportationCopyRef = useRef<HTMLDivElement>(null)
  const buildingsStageRef = useRef<HTMLDivElement>(null)
  const buildingsTitleRef = useRef<HTMLDivElement>(null)
  const buildingsImageRef = useRef<HTMLImageElement>(null)
  const buildingsCopyRef = useRef<HTMLDivElement>(null)
  const messageStageRef = useRef<HTMLDivElement>(null)
  const messageTextRef = useRef<HTMLDivElement>(null)
  const cardRefs = useRef<Array<HTMLDivElement | null>>([])

  useEffect(() => {
    registerGsapPlugins()

    const section = sectionRef.current
    const heading = headingRef.current
    const textBlock = textBlockRef.current
    const contentWrap = contentWrapRef.current
    const revealWrap = revealWrapRef.current
    const revealTitle = revealTitleRef.current
    const revealImage = revealImageRef.current
    const revealCopy = revealCopyRef.current
    const electricityStage = electricityStageRef.current
    const electricityTitle = electricityTitleRef.current
    const electricityImage = electricityImageRef.current
    const electricityCopy = electricityCopyRef.current
    const agricultureStage = agricultureStageRef.current
    const agricultureTitle = agricultureTitleRef.current
    const agricultureImage = agricultureImageRef.current
    const agricultureCopy = agricultureCopyRef.current
    const transportationStage = transportationStageRef.current
    const transportationTitle = transportationTitleRef.current
    const transportationImage = transportationImageRef.current
    const transportationCopy = transportationCopyRef.current
    const buildingsStage = buildingsStageRef.current
    const buildingsTitle = buildingsTitleRef.current
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
      !revealImage ||
      !revealCopy ||
      !electricityStage ||
      !electricityTitle ||
      !electricityImage ||
      !electricityCopy ||
      !agricultureStage ||
      !agricultureTitle ||
      !agricultureImage ||
      !agricultureCopy ||
      !transportationStage ||
      !transportationTitle ||
      !transportationImage ||
      !transportationCopy ||
      !buildingsStage ||
      !buildingsTitle ||
      !buildingsImage ||
      !buildingsCopy ||
      !messageStage ||
      !messageText ||
      cards.length !== CARDS.length
    )
      return

    const lines = Array.from(heading.querySelectorAll<HTMLElement>('.intro-line'))
    if (!lines.length) return

    gsap.set(contentWrap, { y: 50, opacity: 0.35 })
    gsap.set(revealWrap, { autoAlpha: 0 })
    gsap.set(revealTitle, { y: 28, opacity: 0 })
    gsap.set(revealImage, {
      x: 0,
      y: 0,
      scaleX: 1,
      scaleY: 1,
      transformOrigin: 'center center',
    })
    gsap.set(revealCopy, { y: 32, opacity: 0 })
    gsap.set(electricityStage, { autoAlpha: 0 })
    gsap.set(electricityTitle, { y: 22, opacity: 0 })
    gsap.set(electricityImage, { y: 180, scale: 0.9, transformOrigin: 'center center' })
    gsap.set(electricityCopy, { y: 20, opacity: 0 })
    gsap.set(agricultureStage, { autoAlpha: 0 })
    gsap.set(agricultureTitle, { y: 22, opacity: 0 })
    gsap.set(agricultureImage, { y: 180, scale: 0.9, transformOrigin: 'center center' })
    gsap.set(agricultureCopy, { y: 20, opacity: 0 })
    gsap.set(transportationStage, { autoAlpha: 0 })
    gsap.set(transportationTitle, { y: 22, opacity: 0 })
    gsap.set(transportationImage, { y: 180, scale: 0.9, transformOrigin: 'center center' })
    gsap.set(transportationCopy, { y: 20, opacity: 0 })
    gsap.set(buildingsStage, { autoAlpha: 0 })
    gsap.set(buildingsTitle, { y: 22, opacity: 0 })
    gsap.set(buildingsImage, { y: 180, scale: 0.9, transformOrigin: 'center center' })
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

    const getManufacturingZoomTarget = () => {
      const sourceImage = manufacturingImageRef.current
      const targetImage = revealImageRef.current
      const fallbackX = Number(gsap.getProperty(manufacturingCard, 'x')) || 0
      const fallbackY = Number(gsap.getProperty(manufacturingCard, 'y')) || 0

      if (!sourceImage || !targetImage) {
        return { x: fallbackX, y: fallbackY, scale: 3.8 }
      }

      const sourceRect = sourceImage.getBoundingClientRect()
      const targetRect = targetImage.getBoundingClientRect()
      if (!sourceRect.width || !sourceRect.height || !targetRect.width || !targetRect.height) {
        return { x: fallbackX, y: fallbackY, scale: 3.8 }
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
        scale: targetScale,
      }
    }

    const getRevealImageMatchTransform = () => {
      const sourceImage = manufacturingImageRef.current
      const targetImage = revealImageRef.current
      if (!sourceImage || !targetImage) return { x: 0, y: 0, scaleX: 1, scaleY: 1 }

      const sourceRect = sourceImage.getBoundingClientRect()
      const targetRect = targetImage.getBoundingClientRect()
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
    let revealImageMatch = { x: 0, y: 0, scaleX: 1, scaleY: 1 }

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=5200',
        scrub: 1.1,
        pin: true,
        anticipatePin: 2,
        invalidateOnRefresh: true,
      },
    })

    // First: visibly reveal the whole section right after parallax handoff.
    tl.to(contentWrap, {
      y: 0,
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
      ease: 'none',
    })

    // First drop order with continuous staggered flow.
    tl.to(firstDropOrder, {
      y: 170,
      duration: 0.56,
      stagger: {
        each: 0.14,
        from: 'start',
      },
      ease: 'none',
    })

    // Buildings exits first (down, out of frame).
    tl.to(buildingsCard, {
      y: '+=360',
      opacity: 0,
      scale: 0.92,
      duration: 0.52,
      ease: 'none',
    })

    // Transportation exits second (down, out of frame).
    tl.to(
      transportationCard,
      {
        y: '+=360',
        opacity: 0,
        scale: 0.92,
        duration: 0.52,
        ease: 'none',
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
        ease: 'none',
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
        ease: 'none',
      },
      '<'
    )
    tl.to(agricultureCard, {
      opacity: 0,
      y: '+=120',
      duration: 0.34,
      ease: 'none',
    })

    // Electricity moves to bottom-center with a slight size increase.
    tl.to(electricityCard, {
      x: () => getBottomCenterTarget(electricityCard, 26, 72).x,
      y: () => getBottomCenterTarget(electricityCard, 26, 72).y,
      scale: 1.1,
      duration: 0.62,
      ease: 'none',
    })

    tl.to(
      textBlock,
      {
        opacity: 0,
        x: -48,
        duration: 0.74,
        ease: 'none',
      },
      '<+0.08'
    )

    // Electricity exits while manufacturing advances.
    tl.to(electricityCard, {
      y: '+=280',
      opacity: 0,
      scale: 0.94,
      duration: 0.54,
      ease: 'none',
    })
    tl.to(
      manufacturingCard,
      {
        y: '+=240',
        x: -46,
        duration: 0.9,
        ease: 'none',
      },
      '<'
    )

    // Final manufacturing zoom into reveal.
    tl.add(() => {
      manufacturingZoomTarget = getManufacturingZoomTarget()
    })
    tl.to(
      manufacturingCard,
      {
        x: () => manufacturingZoomTarget.x,
        y: () => manufacturingZoomTarget.y,
        scale: () => manufacturingZoomTarget.scale,
        transformOrigin: 'center center',
        duration: 2.1,
        ease: 'none',
      },
      '>'
    )

    // Hard cut handoff: keep reveal image exactly same size as final card frame.
    tl.add(() => {
      revealImageMatch = getRevealImageMatchTransform()
    })
    tl.set(revealImage, {
      x: () => revealImageMatch.x,
      y: () => revealImageMatch.y,
      scaleX: () => revealImageMatch.scaleX,
      scaleY: () => revealImageMatch.scaleY,
      opacity: 1,
    })
    tl.set(revealWrap, { autoAlpha: 1 }, '>')
    tl.set(manufacturingCard, { autoAlpha: 0 }, '>')

    // Text appears after the image expansion is established.
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

    // Scroll-by-scroll handoff: hold, current exits up, then next enters (no overlap).
    const handoffToNextStage = (
      currentStage: HTMLDivElement,
      nextStage: HTMLDivElement,
      nextImage: HTMLImageElement,
      nextTitle: HTMLDivElement,
      nextCopy: HTMLDivElement
    ) => {
      // Hold current card for extra scroll distance (2-3 wheel steps feel).
      tl.to(
        {},
        {
          duration: 0.9,
        }
      )

      // Strict handoff: current exits first, then next enters (prevents overlap).
      tl.to(
        currentStage,
        {
          y: -520,
          scale: 0.92,
          duration: 0.95,
          ease: 'none',
        }
      )
      tl.set(currentStage, { autoAlpha: 0 }, '>')
      tl.set(nextStage, { autoAlpha: 1 }, '>')
      tl.to(
        nextImage,
        {
          y: 0,
          scale: 1,
          duration: 0.95,
          ease: 'none',
        },
        '>'
      )
      tl.to(
        nextTitle,
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
        },
        '<+0.12'
      )
      tl.to(
        nextCopy,
        {
          y: 0,
          opacity: 1,
          duration: 0.55,
          ease: 'power2.out',
        },
        '<+0.08'
      )
    }

    handoffToNextStage(revealWrap, electricityStage, electricityImage, electricityTitle, electricityCopy)
    handoffToNextStage(
      electricityStage,
      agricultureStage,
      agricultureImage,
      agricultureTitle,
      agricultureCopy
    )
    handoffToNextStage(
      agricultureStage,
      transportationStage,
      transportationImage,
      transportationTitle,
      transportationCopy
    )
    handoffToNextStage(
      transportationStage,
      buildingsStage,
      buildingsImage,
      buildingsTitle,
      buildingsCopy
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
        ease: 'none',
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

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-[130vh] w-full overflow-hidden bg-black px-6 py-8 md:h-[140vh] md:px-[5%] md:py-12"
      >
      <div
        ref={contentWrapRef}
        className="mx-auto flex h-full w-full max-w-7xl flex-col items-center justify-center gap-12 md:flex-row md:gap-8"
      >
        <div ref={textBlockRef} className="max-w-xl md:w-[48%]">
          <h2
            ref={headingRef}
            className="text-2xl font-semibold leading-[1.25] text-white md:-translate-y-2 md:text-[34px]"
          >
            {HEADLINE_LINES.map((line, i) => (
              <span
                key={line}
                className={`intro-line block ${i > 0 ? 'mt-1.5' : ''} ${
                  i === HEADLINE_LINES.length - 1 ? 'text-[#b8e986]' : ''
                } will-change-transform`}
              >
                {line}
              </span>
            ))}
          </h2>
        </div>

        <div className="relative h-[360px] w-full md:h-[560px] md:w-[52%]">
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
                className="h-[78px] w-full rounded-[2px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:h-[96px]"
              />
            </div>
          ))}
        </div>
      </div>

      <div ref={revealWrapRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-8 py-8 md:px-14 md:py-10">
          <div className="relative w-full md:-translate-y-20">
            <div
              ref={revealTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[920px] -translate-y-2 text-center md:-mb-10 md:-translate-y-7"
            >
              <h2 className="text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-white md:text-[110px]">
                Manufacturing
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[22%] -translate-x-1/2 text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-[#d7ff4c] md:text-[110px]"
              >
                Manufacturing
              </h2>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <img
                ref={revealImageRef}
                src={CARDS[0].src}
                alt="Industrial manufacturing detail"
                className="aspect-[22/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={revealCopyRef}
                className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10"
              >
                <span className="mb-4 inline-flex w-fit self-start rounded-full border border-white/70 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  30% emissions
                </span>
                <p className="max-w-[340px] text-[16px] font-semibold leading-[1.3] text-white md:max-w-[420px]">
                  The clean industrial revolution starts with transforming how we make everything in
                  the world from steel and cement to everyday materials.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:mt-8">
            </div>
          </div>
        </div>
      </div>

      <div ref={electricityStageRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-8 py-8 md:px-14 md:py-10">
          <div className="w-full md:-translate-y-20">
            <div
              ref={electricityTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[920px] -translate-y-2 text-center md:-mb-10 md:-translate-y-7"
            >
              <h2 className="text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-white md:text-[110px]">
                Electricity
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[22%] -translate-x-1/2 text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-[#d7ff4c] md:text-[110px]"
              >
                Electricity
              </h2>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <img
                ref={electricityImageRef}
                src={CARDS[1].src}
                alt="Electricity infrastructure"
                className="aspect-[22/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={electricityCopyRef}
                className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10"
              >
                <span className="mb-4 inline-flex w-fit self-start rounded-full border border-white/70 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  28% emissions
                </span>
                <p className="max-w-[340px] text-[16px] font-semibold leading-[1.3] text-white md:max-w-[420px]">
                  The world must build 21st century grids while delivering energy abundance - clean,
                  affordable, and reliable power for everyone.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:mt-8">
            </div>
          </div>
        </div>
      </div>

      <div ref={agricultureStageRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-8 py-8 md:px-14 md:py-10">
          <div className="w-full md:-translate-y-20">
            <div
              ref={agricultureTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[920px] -translate-y-2 text-center md:-mb-10 md:-translate-y-7"
            >
              <h2 className="text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-white md:text-[110px]">
                Agriculture
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[22%] -translate-x-1/2 text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-[#d7ff4c] md:text-[110px]"
              >
                Agriculture
              </h2>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <img
                ref={agricultureImageRef}
                src={CARDS[2].src}
                alt="Agriculture fields"
                className="aspect-[22/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={agricultureCopyRef}
                className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10"
              >
                <span className="mb-4 inline-flex w-fit self-start rounded-full border border-white/70 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  19% emissions
                </span>
                <p className="max-w-[340px] text-[16px] font-semibold leading-[1.3] text-white md:max-w-[420px]">
                  From growing rice to raising cattle, innovating how we feed ourselves is a prime
                  opportunity. Meet the innovators who will feed the world for decades to come.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:mt-8">
            </div>
          </div>
        </div>
      </div>

      <div ref={transportationStageRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-8 py-8 md:px-14 md:py-10">
          <div className="w-full md:-translate-y-20">
            <div
              ref={transportationTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[920px] -translate-y-2 text-center md:-mb-10 md:-translate-y-7"
            >
              <h2 className="text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-white md:text-[110px]">
                Transportation
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[22%] -translate-x-1/2 text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-[#d7ff4c] md:text-[110px]"
              >
                Transportation
              </h2>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <img
                ref={transportationImageRef}
                src={CARDS[3].src}
                alt="Transportation networks"
                className="aspect-[22/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={transportationCopyRef}
                className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10"
              >
                <span className="mb-4 inline-flex w-fit self-start rounded-full border border-white/70 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  25% emissions
                </span>
                <p className="max-w-[340px] text-[16px] font-semibold leading-[1.3] text-white md:max-w-[420px]">
                  Revolutionizing how people and goods move around the world with clean, efficient
                  transportation solutions.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:mt-8">
            </div>
          </div>
        </div>
      </div>

      <div ref={buildingsStageRef} className="pointer-events-none absolute inset-0 z-20">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center px-8 py-8 md:px-14 md:py-10">
          <div className="w-full md:-translate-y-20">
            <div
              ref={buildingsTitleRef}
              className="relative z-20 mx-auto -mb-6 w-full max-w-[920px] -translate-y-2 text-center md:-mb-10 md:-translate-y-7"
            >
              <h2 className="text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-white md:text-[110px]">
                Buildings
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-1/2 top-[22%] -translate-x-1/2 text-[54px] font-semibold leading-[0.9] tracking-[-0.03em] text-[#d7ff4c] md:text-[110px]"
              >
                Buildings
              </h2>
            </div>

            <div className="relative z-10 mx-auto w-full max-w-[980px] overflow-hidden rounded-2xl shadow-[0_30px_90px_rgba(0,0,0,0.8)]">
              <img
                ref={buildingsImageRef}
                src={CARDS[4].src}
                alt="Urban buildings"
                className="aspect-[22/9] w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/25 to-transparent" />
              <div
                ref={buildingsCopyRef}
                className="absolute inset-0 flex flex-col justify-end p-6 text-white md:p-10"
              >
                <span className="mb-4 inline-flex w-fit self-start rounded-full border border-white/70 bg-black/35 px-3 py-1 text-sm font-semibold text-white backdrop-blur-sm">
                  22% emissions
                </span>
                <p className="max-w-[340px] text-[16px] font-semibold leading-[1.3] text-white md:max-w-[420px]">
                  Creating sustainable spaces where we live and work, reducing energy consumption
                  while improving comfort and efficiency.
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-center md:mt-8">
            </div>
          </div>
        </div>
      </div>

      <div
        ref={messageStageRef}
        className="pointer-events-none absolute inset-0 z-10 grid place-items-center"
      >
        <div className="w-full px-6 md:px-10">
          <div
            ref={messageTextRef}
            className="mx-auto max-w-[780px] text-center text-[46px] font-semibold leading-[1.1] tracking-[-0.02em] text-white md:text-[64px]"
          >
            <div className="flex flex-wrap items-center justify-center gap-x-3 md:gap-x-4">
              {FINAL_MESSAGE_LINE_1.map((word) => (
                <span
                  key={word}
                  className={`message-word inline-block ${
                    word === 'energy' || word === 'innovation' ? 'text-[#d7ff4c]' : 'text-white'
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
