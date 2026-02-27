'use client'

import { useRef, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { caseStudies } from '@/data/caseStudies'

const CARD_WIDTH = 320
const GAP = 24
const CARD_TOTAL = CARD_WIDTH + GAP
const FEATURED = caseStudies.slice(0, 9)

function CaseStudyCard({
  title,
  src,
  author,
  description,
  slug,
}: {
  title: string
  src: string
  author: string
  description: string
  slug: string
}) {
  const truncated = description.length > 120 ? description.slice(0, 120) + '...' : description
  return (
    <Link
      href={`/project/${slug}`}
      className="group flex-shrink-0 snap-center overflow-hidden rounded-xl bg-black shadow-lg transition hover:shadow-xl dark:bg-white"
      style={{ width: CARD_WIDTH }}
    >
      <h3 className="px-4 pt-4 text-sm font-medium leading-snug text-white dark:text-[#0F0F0F]">
        {title}
      </h3>
      <div className="relative mt-3 aspect-[4/3] w-full overflow-hidden bg-[#1a1a1a] dark:bg-[#f5f5f5]">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover transition group-hover:scale-[1.02]"
          sizes="320px"
        />
      </div>
      <div className="mt-3 flex items-center gap-2 px-4">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-white/20 text-xs font-semibold text-white dark:bg-[#e5e5e5] dark:text-[#0F0F0F]">
          {author.charAt(0)}
        </span>
        <span className="text-sm text-white/90 dark:text-[#0F0F0F]/80">
          by <span className="font-medium text-[#AAFF00]">{author}</span>
        </span>
      </div>
      <p className="mt-2 line-clamp-3 px-4 pb-4 text-sm leading-relaxed text-white/80 dark:text-[#0F0F0F]/80">
        {truncated}
      </p>
    </Link>
  )
}

export default function FeaturedCaseStudiesSection() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const rafRef = useRef<number>()
  const tickingRef = useRef(false)

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    const setWidth = FEATURED.length * CARD_TOTAL

    const loopScroll = () => {
      const { scrollLeft } = el
      if (scrollLeft >= setWidth * 2) {
        el.scrollLeft = setWidth
      } else if (scrollLeft <= 0) {
        el.scrollLeft = setWidth
      }
      tickingRef.current = false
    }

    const onScroll = () => {
      if (tickingRef.current) return
      tickingRef.current = true
      rafRef.current = requestAnimationFrame(loopScroll)
    }

    el.addEventListener('scroll', onScroll, { passive: true })
    el.scrollLeft = setWidth

    return () => {
      el.removeEventListener('scroll', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [])

  const scrollBy = useCallback((direction: 'left' | 'right') => {
    const el = scrollRef.current
    if (!el) return
    const delta = direction === 'left' ? -CARD_TOTAL : CARD_TOTAL
    el.scrollTo({ left: el.scrollLeft + delta, behavior: 'smooth' })
  }, [])

  const setWidth = FEATURED.length * CARD_TOTAL
  const triple = [...FEATURED, ...FEATURED, ...FEATURED]

  return (
    <section className="w-full overflow-hidden bg-white px-4 py-12 pb-16 md:px-6 md:py-16 dark:bg-black">
      <div className="relative w-full">
        <h2 className="mb-10 text-center text-2xl font-semibold tracking-tight text-[#0F0F0F] md:mb-12 md:text-3xl dark:text-white">
          Featured Case Studies
        </h2>
        <div className="relative flex items-center">
          <button
            type="button"
            onClick={() => scrollBy('left')}
            className="absolute left-0 z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0F0F0F]/15 text-[#0F0F0F] shadow-lg backdrop-blur-sm transition hover:bg-[#0F0F0F]/25 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 md:left-2"
            aria-label="Previous cards"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
          <div
            ref={scrollRef}
            className="flex flex-1 gap-6 overflow-x-auto overflow-y-hidden px-12 pb-2 scroll-smooth snap-x snap-mandatory md:px-16 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden"
            style={{ scrollSnapType: 'x mandatory' }}
          >
            {triple.map((study, i) => (
              <CaseStudyCard
                key={`${study.slug}-${i}`}
                title={study.title}
                src={study.src}
                author={study.author}
                description={study.description}
                slug={study.slug}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={() => scrollBy('right')}
            className="absolute right-0 z-10 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[#0F0F0F]/15 text-[#0F0F0F] shadow-lg backdrop-blur-sm transition hover:bg-[#0F0F0F]/25 dark:bg-white/15 dark:text-white dark:hover:bg-white/25 md:right-2"
            aria-label="Next cards"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  )
}
