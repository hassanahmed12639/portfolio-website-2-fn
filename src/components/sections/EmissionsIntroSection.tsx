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

export default function EmissionsIntroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsapPlugins()

    const section = sectionRef.current
    const heading = headingRef.current
    const contentWrap = contentWrapRef.current
    if (!section || !heading || !contentWrap) return

    const lines = Array.from(heading.querySelectorAll<HTMLElement>('.intro-line'))
    if (!lines.length) return

    gsap.set(contentWrap, { y: 50, opacity: 0.35 })
    const [firstLine, ...otherLines] = lines
    gsap.set(firstLine, { x: 0, opacity: 1 })
    gsap.set(otherLines, { x: -48, opacity: 0 })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: '+=460',
        scrub: 1.5,
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
      ease: 'power2.out',
    })

    // Then run the line-by-line headline reveal.
    tl.to(otherLines, {
      x: 0,
      opacity: 1,
      duration: 1,
      stagger: 0.7,
      ease: 'none',
    })

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full bg-black px-6 py-16 md:px-[5%] md:py-24">
      <div
        ref={contentWrapRef}
        className="mx-auto flex min-h-[540px] w-full max-w-7xl flex-col justify-center gap-12 md:min-h-[640px] md:flex-row md:items-center md:gap-8"
      >
        <div className="max-w-xl md:w-[48%]">
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
          {CARDS.map((card) => (
            <div key={card.id} className={`absolute ${card.className}`}>
              <img
                src={card.src}
                alt={card.alt}
                className="h-[78px] w-full rounded-[2px] object-cover shadow-[0_10px_30px_rgba(0,0,0,0.5)] md:h-[96px]"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
