'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerGsapPlugins } from '../../lib/gsap'

const CARDS = [
  {
    id: 'manufacturing',
    src: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=900&q=80',
    alt: 'Industrial facility',
    className: 'top-4 left-[8%] w-32 md:top-0 md:left-[6%] md:w-40',
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
    className: 'bottom-4 left-[46%] w-36 -translate-x-1/2 md:bottom-0 md:left-[50%] md:w-44',
  },
]

const HEADLINE_LINES = [
  'We work to accelerate progress',
  'across every source of emissions,',
  'transforming the five sectors of the',
  'global economy into',
  'a landscape of opportunity.',
]

const getManufacturingZoomConfig = () => {
  const viewportWidth = window.innerWidth

  if (viewportWidth < 768) {
    return {
      driftX: -76,
      zoomX: -104,
      zoomY: 500,
      zoomScale: 4.15,
    }
  }

  if (viewportWidth < 1200) {
    return {
      driftX: -92,
      zoomX: -122,
      zoomY: 506,
      zoomScale: 4.55,
    }
  }

  return {
    driftX: -105,
    zoomX: -138,
    zoomY: 512,
    zoomScale: 4.8,
  }
}

export default function EmissionsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const textBlockRef = useRef<HTMLDivElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  const revealWrapRef = useRef<HTMLDivElement>(null)
  const revealTitleRef = useRef<HTMLDivElement>(null)
  const revealImageRef = useRef<HTMLImageElement>(null)
  const revealCopyRef = useRef<HTMLDivElement>(null)
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
      cards.length !== CARDS.length
    )
      return

    const lines = Array.from(heading.querySelectorAll<HTMLElement>('.intro-line'))
    if (!lines.length) return

    gsap.set(contentWrap, { y: 50, opacity: 0.35 })
    gsap.set(revealWrap, { autoAlpha: 0 })
    gsap.set(revealTitle, { y: 28, opacity: 0 })
    gsap.set(revealImage, {
      scale: 1.08,
      clipPath: 'inset(36% 24% 36% 24% round 8px)',
      filter: 'blur(8px)',
      transformOrigin: 'center center',
    })
    gsap.set(revealCopy, { y: 32, opacity: 0 })
    const [firstLine, ...otherLines] = lines
    gsap.set(firstLine, { x: 0, opacity: 1 })
    gsap.set(otherLines, { x: -48, opacity: 0 })
    gsap.set(cards, { force3D: true, transformOrigin: 'center center' })

    const [manufacturingCard, ...otherCards] = cards
    gsap.set(manufacturingCard, { zIndex: 30 })
    gsap.set(otherCards, { zIndex: 20 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=2150',
        scrub: 1,
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

    // All cards move down in a linear way as the user scrolls.
    tl.to(cards, {
      y: 170,
      duration: 1.25,
      stagger: 0.1,
      ease: 'none',
    })

    // Four cards continue down and fade away.
    tl.to(
      otherCards,
      {
        y: '+=260',
        opacity: 0,
        scale: 0.92,
        duration: 1.25,
        ease: 'none',
      },
      '<'
    )

    // Manufacturing card keeps moving and does not disappear.
    tl.to(
      manufacturingCard,
      {
        y: '+=300',
        x: () => getManufacturingZoomConfig().driftX,
        duration: 1.35,
        ease: 'none',
      },
      '<'
    )

    tl.to(
      textBlock,
      {
        opacity: 0,
        x: -48,
        duration: 0.9,
        ease: 'none',
      },
      '<+0.2'
    )

    // Final push: manufacturing card zooms, then transitions into section content.
    tl.to(manufacturingCard, {
      x: () => getManufacturingZoomConfig().zoomX,
      y: () => getManufacturingZoomConfig().zoomY,
      scale: () => getManufacturingZoomConfig().zoomScale,
      transformOrigin: 'center center',
      duration: 1.85,
      ease: 'power2.inOut',
    })

    // Clean handoff: expanded card finishes first, then swap to reveal layer.
    tl.set(revealWrap, { autoAlpha: 1 })
    tl.set(manufacturingCard, { autoAlpha: 0 })

    tl.to(revealImage, {
      scale: 1,
      clipPath: 'inset(0% 0% 0% 0% round 0px)',
      filter: 'blur(0px)',
      duration: 0.95,
      ease: 'power2.out',
    })

    // Text appears after the image expansion is established.
    tl.to(
      revealTitle,
      {
        y: 0,
        opacity: 1,
        duration: 0.85,
        ease: 'power2.out',
      },
      '>-0.1'
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

    // Small hold to avoid abrupt unpin right after reveal.
    tl.to(
      {},
      {
        duration: 0.8,
      }
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-black px-6 py-16 md:px-[5%] md:py-24"
    >
      <div
        ref={contentWrapRef}
        className="mx-auto flex min-h-[540px] w-full max-w-7xl flex-col justify-center gap-12 md:min-h-[640px] md:flex-row md:items-center md:gap-8"
      >
        <div ref={textBlockRef} className="max-w-xl md:w-[48%]">
          <h2
            ref={headingRef}
            className="text-2xl font-semibold leading-[1.25] text-white md:text-[34px]"
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
                src={card.src}
                alt={card.alt}
                className="h-[78px] w-full rounded-[2px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:h-[96px]"
              />
            </div>
          ))}
        </div>
      </div>

      <div ref={revealWrapRef} className="pointer-events-none absolute inset-0">
        <div className="mx-auto flex h-full w-full max-w-7xl items-center">
          <div className="w-full">
            <div ref={revealTitleRef} className="relative mb-8 md:mb-12">
              <h2 className="text-[58px] font-semibold leading-[0.88] tracking-[-0.03em] text-white md:text-[140px]">
                Manufacturing
              </h2>
              <h2
                aria-hidden="true"
                className="pointer-events-none absolute left-0 top-[22%] text-[58px] font-semibold leading-[0.88] tracking-[-0.03em] text-[#d7ff4c] md:text-[140px]"
              >
                Manufacturing
              </h2>
            </div>

            <div className="relative overflow-hidden">
              <img
                ref={revealImageRef}
                src={CARDS[0].src}
                alt="Industrial manufacturing detail"
                className="h-[320px] w-full object-cover md:h-[460px]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
              <div
                ref={revealCopyRef}
                className="absolute bottom-6 left-6 max-w-[430px] text-white md:bottom-10 md:left-10"
              >
                <span className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
                  30% emissions
                </span>
                <p className="text-2xl font-semibold leading-[1.18] text-white md:text-[38px]">
                  The clean industrial revolution starts with transforming how we make everything in
                  the world from steel and cement to everyday materials.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
