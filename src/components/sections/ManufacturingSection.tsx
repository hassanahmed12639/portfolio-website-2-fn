'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '../../lib/gsap'

const cardData = [
  { id: 1, label: 'Manufacturing', color: '#4A5568' },
  { id: 2, label: 'Electricity', color: '#87CEEB' },
  { id: 3, label: 'Agriculture', color: '#90EE90' },
  { id: 4, label: 'Transportation', color: '#D2B48C' },
  { id: 5, label: 'Buildings', color: '#708090' },
]

export default function ManufacturingSection() {
  const sectionRef = useRef<HTMLDivElement>(null)
  const cardsContainerRef = useRef<HTMLDivElement>(null)
  const initialTextRef = useRef<HTMLDivElement>(null)
  const finalContentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsapPlugins()

    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>('.manufacturing-image-card')
      const initialText = initialTextRef.current
      const finalContent = finalContentRef.current
      if (!initialText || !finalContent || cards.length === 0) return

      gsap.set(cards, {
        x: (i) => gsap.utils.random(-100, 200),
        y: (i) => gsap.utils.random(-150, 150),
        scale: 0.7,
        rotation: (i) => gsap.utils.random(-15, 15),
      })

      gsap.set(finalContent, { opacity: 0, y: 10 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: '+=150%',
          scrub: 1,
          pin: true,
        },
      })

      tl.to(initialText, {
        opacity: 0,
        y: -50,
        duration: 0.3,
      })

      tl.to(
        cards,
        {
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          stagger: 0.1,
          duration: 0.5,
        },
        '-=0.1'
      )

      tl.to(
        finalContent,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
        },
        '-=0.2'
      )
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <div ref={sectionRef} className="relative w-full min-h-screen bg-white overflow-hidden">
      <div className="container mx-auto px-8 py-20 h-screen flex items-center">
        <div ref={initialTextRef} className="w-1/2 pr-12">
          <h2 className="text-5xl font-bold leading-tight">
            We work to accelerate progress across every source of emissions, transforming the five
            sectors of the global economy into{' '}
            <span className="text-lime-400">a landscape of opportunity.</span>
          </h2>
        </div>

        <div
          ref={cardsContainerRef}
          className="w-1/2 relative h-full flex items-center justify-center"
        >
          <div className="grid grid-cols-2 gap-6 w-full max-w-2xl">
            {cardData.map((card, index) => (
              <div
                key={card.id}
                className={`manufacturing-image-card aspect-video rounded-lg shadow-lg flex items-center justify-center text-white font-semibold text-xl ${
                  index === 0 ? 'col-span-2' : ''
                }`}
                style={{ backgroundColor: card.color }}
              >
                {card.label}
              </div>
            ))}
          </div>
        </div>

        <div
          ref={finalContentRef}
          className="absolute inset-0 flex items-center opacity-0 translate-y-10 pointer-events-none bg-white"
        >
          <div className="container mx-auto px-8 w-full">
            <div className="max-w-4xl flex flex-col md:flex-row md:items-center md:justify-between gap-8">
              <div>
                <h2 className="text-6xl md:text-8xl font-bold mb-6">
                  <span className="text-lime-400">Manufacturing</span>
                </h2>
                <div className="inline-block bg-gray-900 text-white px-6 py-3 rounded-full mb-6">
                  30% emissions
                </div>
                <p className="text-xl md:text-2xl text-gray-800 max-w-2xl leading-relaxed">
                  The clean industrial revolution starts with transforming how we make everything in
                  the world—from steel and cement to everyday materials.
                </p>
                <div className="mt-8">
                  <button
                    type="button"
                    className="bg-lime-400 text-black px-8 py-4 rounded-full font-semibold text-lg hover:bg-lime-500 transition"
                  >
                    29 Manufacturing Companies
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-md shrink-0">
                {cardData.map((card) => (
                  <div
                    key={`final-${card.id}`}
                    className="aspect-video rounded-lg shadow-xl"
                    style={{ backgroundColor: card.color }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
