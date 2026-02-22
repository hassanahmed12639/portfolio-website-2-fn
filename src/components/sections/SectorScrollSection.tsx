'use client'

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '../../lib/gsap'

const SMOOTHNESS = 1.6
const EXIT_DURATION = 1.8
const READY_DURATION = 1.2
const SMOOTH_EASE = [0.25, 0.46, 0.45, 0.94] as const

const SECTORS = [
  { id: 'manufacturing', label: 'Manufacturing', letter: 'M', rest: 'anufacturing', emissions: '30%', description: 'The clean industrial revolution starts with transforming how we make everything in the world—from steel and cement to everyday materials.', cta: '29 Manufacturing Companies' },
  { id: 'electricity', label: 'Electricity', letter: 'E', rest: 'lectricity', emissions: '28%', description: 'The world must build 21st century grids while delivering energy abundance—clean, affordable, and reliable power for everyone.', cta: '26 Electricity Companies' },
  { id: 'agriculture', label: 'Agriculture', letter: null, rest: null, emissions: '19%', description: 'From growing rice to raising cattle, innovating how we feed ourselves is a prime opportunity. Meet the innovators who will feed the world for decades to come.', cta: '20 Agriculture Companies' },
  { id: 'transportation', label: 'Transportation', letter: 'T', rest: 'ransportation', emissions: '25%', description: 'Revolutionizing how people and goods move around the world with clean, efficient transportation solutions.', cta: '18 Transportation Companies' },
  { id: 'buildings', label: 'Buildings', letter: 'B', rest: 'uildings', emissions: '22%', description: 'Creating sustainable spaces where we live and work, reducing energy consumption while improving comfort and efficiency.', cta: '15 Building Companies' },
]

export default function SectorScrollSection() {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const heroSectionRef = useRef<HTMLDivElement>(null)
  const scrollHintRef = useRef<HTMLDivElement>(null)

  const cardManufacturingRef = useRef<HTMLDivElement>(null)
  const cardElectricityRef = useRef<HTMLDivElement>(null)
  const cardAgricultureRef = useRef<HTMLDivElement>(null)
  const cardTransportationRef = useRef<HTMLDivElement>(null)
  const cardBuildingsRef = useRef<HTMLDivElement>(null)

  const manufacturingSectionRef = useRef<HTMLDivElement>(null)
  const electricitySectionRef = useRef<HTMLDivElement>(null)
  const agricultureSectionRef = useRef<HTMLDivElement>(null)
  const transportationSectionRef = useRef<HTMLDivElement>(null)
  const buildingsSectionRef = useRef<HTMLDivElement>(null)

  const titleManufacturingRef = useRef<HTMLHeadingElement>(null)
  const titleElectricityRef = useRef<HTMLHeadingElement>(null)
  const titleAgricultureRef = useRef<HTMLHeadingElement>(null)
  const titleTransportationRef = useRef<HTMLHeadingElement>(null)
  const titleBuildingsRef = useRef<HTMLHeadingElement>(null)

  const contentManufacturingRef = useRef<HTMLDivElement>(null)
  const contentElectricityRef = useRef<HTMLDivElement>(null)
  const contentAgricultureRef = useRef<HTMLDivElement>(null)
  const contentTransportationRef = useRef<HTMLDivElement>(null)
  const contentBuildingsRef = useRef<HTMLDivElement>(null)

  const manufacturingImageRef = useRef<HTMLImageElement>(null)

  const [activeDot, setActiveDot] = useState(0)

  useEffect(() => {
    registerGsapPlugins()
    gsap.registerPlugin(ScrollTrigger)

    const container = scrollContainerRef.current
    if (!container) return

    const fullSections = [manufacturingSectionRef, electricitySectionRef, agricultureSectionRef, transportationSectionRef, buildingsSectionRef]
    const titles = [titleManufacturingRef, titleElectricityRef, titleAgricultureRef, titleTransportationRef, titleBuildingsRef]
    const contents = [contentManufacturingRef, contentElectricityRef, contentAgricultureRef, contentTransportationRef, contentBuildingsRef]

    const allRefsReady = [cardManufacturingRef, cardElectricityRef, cardAgricultureRef, cardTransportationRef, cardBuildingsRef, manufacturingImageRef, ...fullSections, ...titles, ...contents].every(r => r.current)
    if (!allRefsReady) return

    const ctx = gsap.context(() => {
      gsap.set(fullSections.map(r => r.current).filter(Boolean), { opacity: 0, visibility: 'hidden' })
      gsap.set(titles.map(r => r.current).filter(Boolean), { opacity: 0, y: 50 })
      gsap.set(contents.map(r => r.current).filter(Boolean), { opacity: 0, y: 40 })
      gsap.set(manufacturingImageRef.current, { opacity: 0, scale: 1.25 })

      gsap.set(cardManufacturingRef.current, { opacity: 0, x: -120, y: -80 })
      gsap.set(cardElectricityRef.current, { opacity: 0, x: 120, y: -90 })
      gsap.set(cardAgricultureRef.current, { opacity: 0, x: '-50%', y: 120 })
      gsap.set(cardTransportationRef.current, { opacity: 0, x: 140, y: 60 })
      gsap.set(cardBuildingsRef.current, { opacity: 0, x: 'calc(-50% - 100px)', y: 140 })

      const layout3 = { manufacturing: { top: '20%', left: '38%' }, electricity: { top: '18%', left: '70%' }, agriculture: { top: '50%', left: '50%' } }
      const layout2 = { manufacturing: { top: '35%', left: '45%' }, electricity: { top: '60%', left: '55%' } }

      // Cast to any to avoid GSAP timeline.to() overload conflicts with TweenVars
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: container,
          start: 'top top',
          end: 'bottom bottom',
          scrub: SMOOTHNESS,
          onUpdate: (self) => {
            const totalSections = 6
            let active = Math.floor(self.progress * totalSections)
            if (active >= totalSections) active = totalSections - 1
            setActiveDot(active)
            if (self.progress > 0.03) gsap.to(scrollHintRef.current, { opacity: 0, duration: 0.3 })
            else gsap.to(scrollHintRef.current, { opacity: 0.6, duration: 0.3 })
          },
        },
      }) as any

      tl.to(cardManufacturingRef.current, { opacity: 1, x: 0, y: 0, duration: 1.2, ease: [0.22, 1, 0.36, 1] }, 0)
        .to(cardElectricityRef.current, { opacity: 1, x: 0, y: 0, duration: 1.2, delay: 0.15, ease: [0.22, 1, 0.36, 1] }, 0)
        .to(cardAgricultureRef.current, { opacity: 1, x: '-50%', y: 0, duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }, 0)
        .to(cardTransportationRef.current, { opacity: 1, x: 0, y: 0, duration: 1.2, delay: 0.45, ease: [0.22, 1, 0.36, 1] }, 0)
        .to(cardBuildingsRef.current, { opacity: 1, x: '-50%', y: 0, duration: 1.2, delay: 0.6, ease: [0.22, 1, 0.36, 1] }, 0)
        .to({}, { duration: 2 })

        .to(cardBuildingsRef.current, { y: 500, scale: 1.15, duration: EXIT_DURATION * 1.4, ease: [0.6, 0.04, 0.98, 0.34] })
        .to(buildingsSectionRef.current, { opacity: 1, visibility: 'visible', duration: 1.2, ease: SMOOTH_EASE }, '<+0.8')
        .to(titleBuildingsRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.5')
        .to(contentBuildingsRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2 })
        .to([titleBuildingsRef.current, contentBuildingsRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(buildingsSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')

        .to(cardTransportationRef.current, { y: 500, scale: 1.15, duration: EXIT_DURATION * 1.4, ease: [0.6, 0.04, 0.98, 0.34] })
        .to(transportationSectionRef.current, { opacity: 1, visibility: 'visible', duration: 1.2, ease: SMOOTH_EASE }, '<+0.8')
        .to(titleTransportationRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.5')
        .to(contentTransportationRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2 })
        .to([titleTransportationRef.current, contentTransportationRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(transportationSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(cardManufacturingRef.current, { top: layout3.manufacturing.top, left: layout3.manufacturing.left, x: '-50%', y: 0, duration: READY_DURATION * 1.5, ease: SMOOTH_EASE })
        .to(cardElectricityRef.current, { top: layout3.electricity.top, left: layout3.electricity.left, x: '-50%', y: 0, duration: READY_DURATION * 1.5, ease: SMOOTH_EASE }, '<')
        .to(cardAgricultureRef.current, { top: layout3.agriculture.top, left: layout3.agriculture.left, x: '-50%', y: 0, duration: READY_DURATION * 1.5, ease: SMOOTH_EASE }, '<')
        .to({}, { duration: 0.8 })

        .to(cardAgricultureRef.current, { y: 500, scale: 1.15, duration: EXIT_DURATION * 1.4, ease: [0.6, 0.04, 0.98, 0.34] })
        .to(agricultureSectionRef.current, { opacity: 1, visibility: 'visible', duration: 1.2, ease: SMOOTH_EASE }, '<+0.8')
        .to(titleAgricultureRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.5')
        .to(contentAgricultureRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2 })
        .to([titleAgricultureRef.current, contentAgricultureRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(agricultureSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(cardManufacturingRef.current, { top: layout2.manufacturing.top, left: layout2.manufacturing.left, x: '-50%', y: 0, duration: READY_DURATION * 1.5, ease: SMOOTH_EASE })
        .to(cardElectricityRef.current, { top: layout2.electricity.top, left: layout2.electricity.left, x: '-50%', y: 0, duration: READY_DURATION * 1.5, ease: SMOOTH_EASE }, '<')
        .to({}, { duration: 0.8 })

        .to(cardElectricityRef.current, { y: 500, scale: 1.15, duration: EXIT_DURATION * 1.4, ease: [0.6, 0.04, 0.98, 0.34] })
        .to(electricitySectionRef.current, { opacity: 1, visibility: 'visible', duration: 1.2, ease: SMOOTH_EASE }, '<+0.8')
        .to(titleElectricityRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.5')
        .to(contentElectricityRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2 })
        .to([titleElectricityRef.current, contentElectricityRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(electricitySectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')

        .to(cardManufacturingRef.current, { y: 500, scale: 1.35, duration: EXIT_DURATION * 1.4, ease: [0.6, 0.04, 0.98, 0.34] })
        .to(heroSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.8, ease: SMOOTH_EASE }, '<')
        .to(manufacturingSectionRef.current, { opacity: 1, visibility: 'visible', duration: 1.2, ease: SMOOTH_EASE }, '<+0.8')
        .to(manufacturingImageRef.current, { opacity: 1, scale: 1, duration: 2, ease: 'power2.out' }, '<')
        .to(titleManufacturingRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.5')
        .to(contentManufacturingRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 3 })

      tl.to([titleManufacturingRef.current, contentManufacturingRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(manufacturingSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(electricitySectionRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: SMOOTH_EASE })
        .to(titleElectricityRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.8')
        .to(contentElectricityRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2.5 })

      tl.to([titleElectricityRef.current, contentElectricityRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(electricitySectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(agricultureSectionRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: SMOOTH_EASE })
        .to(titleAgricultureRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.8')
        .to(contentAgricultureRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2.5 })

      tl.to([titleAgricultureRef.current, contentAgricultureRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(agricultureSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(transportationSectionRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: SMOOTH_EASE })
        .to(titleTransportationRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.8')
        .to(contentTransportationRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 2.5 })

      tl.to([titleTransportationRef.current, contentTransportationRef.current], { opacity: 0, y: -30, duration: 0.9, ease: SMOOTH_EASE })
        .to(transportationSectionRef.current, { opacity: 0, visibility: 'hidden', duration: 0.4 }, '<+0.5')
        .to(buildingsSectionRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: SMOOTH_EASE })
        .to(titleBuildingsRef.current, { opacity: 1, y: 0, duration: 1.3, ease: SMOOTH_EASE }, '<+0.8')
        .to(contentBuildingsRef.current, { opacity: 1, y: 0, duration: 1.2, ease: SMOOTH_EASE }, '<+0.3')
        .to({}, { duration: 3 })
    }, container)

    return () => ctx.revert()
  }, [])

  const scrollToSection = (index: number) => {
    const el = scrollContainerRef.current
    if (!el) return
    const height = el.offsetHeight
    const target = el.offsetTop + (index / 6) * height
    window.scrollTo({ top: target, behavior: 'smooth' })
  }

  return (
    <section className="sector-scroll-section relative rounded-3xl bg-white">
      <div ref={scrollContainerRef} className="sector-scroll-container">
        <div className="sector-sticky-viewport">
          {/* Hero layer */}
          <div ref={heroSectionRef} className="sector-layer sector-hero-layer">
            <div className="sector-hero-content">
              <h1 className="sector-hero-title">
                We work to accelerate progress across every source of emissions,
                transforming the five sectors of the global economy into{' '}
                <span className="highlight">a landscape of opportunity.</span>
              </h1>
            </div>
            <div className="sector-cards-container">
              <div ref={cardManufacturingRef} className="sector-card" style={{ top: '8%', left: '32%' }}>
                <div className="sector-card-label">Manufacturing</div>
              </div>
              <div ref={cardElectricityRef} className="sector-card" style={{ top: '10%', right: '12%', left: 'auto' }}>
                <div className="sector-card-label">Electricity</div>
              </div>
              <div ref={cardAgricultureRef} className="sector-card sector-card-center" style={{ top: '32%', left: '50%', transform: 'translateX(-50%)' }}>
                <div className="sector-card-label">Agriculture</div>
              </div>
              <div ref={cardTransportationRef} className="sector-card" style={{ top: '52%', right: '18%', left: 'auto' }}>
                <div className="sector-card-label">Transportation</div>
              </div>
              <div ref={cardBuildingsRef} className="sector-card sector-card-center" style={{ bottom: '12%', left: '46%', top: 'auto', transform: 'translateX(-50%)' }}>
                <div className="sector-card-label">Buildings</div>
              </div>
            </div>
            <div ref={scrollHintRef} className="sector-scroll-hint">
              <span>SCROLL</span>
              <div className="sector-scroll-mouse" />
            </div>
          </div>

          {/* Full sections */}
          {SECTORS.map((sector, i) => {
            const sectionRef = [manufacturingSectionRef, electricitySectionRef, agricultureSectionRef, transportationSectionRef, buildingsSectionRef][i]
            const titleRef = [titleManufacturingRef, titleElectricityRef, titleAgricultureRef, titleTransportationRef, titleBuildingsRef][i]
            const contentRef = [contentManufacturingRef, contentElectricityRef, contentAgricultureRef, contentTransportationRef, contentBuildingsRef][i]
            return (
              <div key={sector.id} ref={sectionRef} className="sector-layer sector-full-section" id={`${sector.id}-section`}>
                {sector.id === 'manufacturing' && (
                  <div className="sector-full-section-image">
                    <img
                      ref={manufacturingImageRef}
                      src="/hero-image-1.png"
                      alt=""
                      className="sector-zoomed-image"
                    />
                  </div>
                )}
                <div className="sector-section-content">
                  <h2 ref={titleRef} className={`sector-section-title ${sector.letter === null ? 'title-all-green' : ''}`}>
                    {sector.id !== 'buildings' && sector.id !== 'transportation' && sector.id !== 'agriculture' && sector.id !== 'electricity' && (sector.letter ? <><span className="letter-white">{sector.letter}</span><span className="letter-green">{sector.rest}</span></> : sector.label)}
                  </h2>
                  <div ref={contentRef} className="sector-info-content">
                    {sector.id !== 'buildings' && sector.id !== 'transportation' && sector.id !== 'agriculture' && sector.id !== 'electricity' && (
                      <>
                        <span className="sector-emissions-badge">{sector.emissions} emissions</span>
                        <p className="sector-description-text">{sector.description}</p>
                        <button type="button" className="sector-action-button">{sector.cta}</button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <nav className="sector-nav-dots" aria-label="Section navigation">
          {[0, 1, 2, 3, 4, 5].map((index) => (
            <button
              key={index}
              type="button"
              className={`sector-nav-dot ${activeDot === index ? 'active' : ''}`}
              onClick={() => scrollToSection(index)}
              aria-label={`Section ${index + 1}`}
            />
          ))}
        </nav>
      </div>
    </section>
  )
}
