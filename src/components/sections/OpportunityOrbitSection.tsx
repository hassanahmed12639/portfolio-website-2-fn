 'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { registerGsapPlugins } from '../../lib/gsap'

export default function OpportunityOrbitSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const bodyTextRef = useRef<HTMLParagraphElement>(null)
  const orbitWrapRef = useRef<HTMLDivElement>(null)
  const orbitGlowRef = useRef<HTMLDivElement>(null)
  const limeTopDotRef = useRef<HTMLDivElement>(null)
  const limeRightDotRef = useRef<HTMLDivElement>(null)
  const limeBottomDotRef = useRef<HTMLDivElement>(null)
  const limeCenterDotRef = useRef<HTMLDivElement>(null)
  const whiteDotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsapPlugins()

    const section = sectionRef.current
    const bodyText = bodyTextRef.current
    const orbitWrap = orbitWrapRef.current
    const orbitGlow = orbitGlowRef.current
    const limeTopDot = limeTopDotRef.current
    const limeRightDot = limeRightDotRef.current
    const limeBottomDot = limeBottomDotRef.current
    const limeCenterDot = limeCenterDotRef.current
    const whiteDot = whiteDotRef.current

    if (
      !section ||
      !bodyText ||
      !orbitWrap ||
      !orbitGlow ||
      !limeTopDot ||
      !limeRightDot ||
      !limeBottomDot ||
      !limeCenterDot ||
      !whiteDot
    ) {
      return
    }

    gsap.set(orbitWrap, { transformOrigin: '50% 50%' })
    gsap.set(orbitGlow, { autoAlpha: 0.16, rotate: -20, transformOrigin: '50% 50%' })

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top 78%',
        end: 'bottom top',
        scrub: 1,
        invalidateOnRefresh: true,
      },
    })

    // Text rises while orbit graphic stays in place.
    tl.to(bodyText, { y: -250, ease: 'none', duration: 1 }, 0)

    const orbitState = { progress: 0 }
    const positionDot = (el: HTMLDivElement, radius: number, angleDeg: number) => {
      const angle = (angleDeg * Math.PI) / 180
      gsap.set(el, {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      })
    }

    const renderOrbit = (p: number) => {
      positionDot(limeTopDot, 132, -100 + p * 300)
      positionDot(limeRightDot, 170, -30 + p * 235)
      positionDot(limeBottomDot, 178, 60 + p * 325)
      positionDot(limeCenterDot, 26, 42 + p * 260)
      positionDot(whiteDot, 148, 112 + p * 210)
      gsap.set(orbitGlow, { rotate: -18 + p * 72, autoAlpha: 0.12 + p * 0.2 })
    }

    renderOrbit(0)
    tl.to(
      orbitState,
      {
        progress: 1,
        duration: 1,
        ease: 'none',
        onUpdate: () => renderOrbit(orbitState.progress),
      },
      0
    )

    return () => {
      tl.scrollTrigger?.kill()
      tl.kill()
    }
  }, [])

  return (
    <section ref={sectionRef} className="relative w-full overflow-hidden bg-[#f2f2f0] px-6 py-14 md:px-[5%] md:py-24">
      <div className="mx-auto flex min-h-[560px] w-full max-w-7xl items-center">
        <div className="absolute left-2 top-1/2 hidden -translate-y-1/2 flex-col items-center gap-3 md:flex">
          <span className="h-[5px] w-[5px] rounded-full bg-[#cfff3f]" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
          <span className="h-[5px] w-[5px] rounded-full border border-black/20" />
        </div>

        <p className="absolute right-2 top-1/2 hidden -translate-y-1/2 text-xs font-semibold tracking-[0.16em] text-black/55 md:block">
          DISCOVER
        </p>

        <div className="grid w-full items-center gap-12 md:grid-cols-[1fr_1.2fr] md:gap-6">
          <div className="max-w-[520px] md:pl-12">
            <h2 className="text-[30px] font-semibold leading-[1.1] text-[#202020] md:text-[42px]">
              Investing in Opportunity
            </h2>
            <p
              ref={bodyTextRef}
              className="mt-6 text-[28px] font-semibold leading-[1.08] tracking-[-0.02em] text-[#6d6d6d] md:text-[46px]"
            >
              We survey the landscape for white space where we can drive technology discovery and
              leverage our unique talents to build great companies from the ground up.
            </p>
          </div>

          <div ref={orbitWrapRef} className="relative mx-auto h-[400px] w-full max-w-[560px] md:h-[500px]">
            <div className="absolute left-1/2 top-[6%] -translate-x-1/2 text-xl text-black/60">✿</div>

            <div
              ref={orbitGlowRef}
              className="pointer-events-none absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full"
              style={{
                background:
                  'conic-gradient(from 0deg, transparent 0deg, transparent 296deg, rgba(207,255,63,0.28) 320deg, rgba(207,255,63,0.12) 360deg)',
                WebkitMask:
                  'radial-gradient(circle, transparent 52%, rgba(0,0,0,1) 52%, rgba(0,0,0,1) 80%, transparent 80%)',
                mask: 'radial-gradient(circle, transparent 52%, rgba(0,0,0,1) 52%, rgba(0,0,0,1) 80%, transparent 80%)',
              }}
            />

            <div className="absolute left-1/2 top-1/2 h-[110px] w-[110px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/8" />
            <div className="absolute left-1/2 top-1/2 h-[180px] w-[180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
            <div className="absolute left-1/2 top-1/2 h-[250px] w-[250px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
            <div className="absolute left-1/2 top-1/2 h-[320px] w-[320px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />
            <div className="absolute left-1/2 top-1/2 h-[390px] w-[390px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/10" />

            <div
              ref={limeCenterDotRef}
              className="absolute left-1/2 top-1/2 h-[10px] w-[10px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cfff3f]"
            />
            <div className="absolute left-[33%] top-[42%] h-[9px] w-[9px] rounded-full border border-black/18 bg-[#f2f2f0]" />
            <div className="absolute left-[73%] top-[53%] h-[18px] w-[18px] rounded-full border border-black/12 bg-[#f2f2f0]" />
            <div
              ref={limeRightDotRef}
              className="absolute left-1/2 top-1/2 h-[22px] w-[22px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cfff3f]"
            />
            <div
              ref={limeBottomDotRef}
              className="absolute left-1/2 top-1/2 h-[42px] w-[42px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cfff3f]"
            />
            <div
              ref={whiteDotRef}
              className="absolute left-1/2 top-1/2 h-[20px] w-[20px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-black/12 bg-[#f2f2f0]"
            />
            <div className="absolute left-[22%] top-[16%] h-[9px] w-[9px] rounded-full border border-black/16 bg-[#f2f2f0]" />
            <div
              ref={limeTopDotRef}
              className="absolute left-1/2 top-1/2 h-[30px] w-[30px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#cfff3f]"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
