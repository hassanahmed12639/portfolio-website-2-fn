'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '../../lib/gsap'
import { SwipeCards } from '../ui/swipe-cards'

/**
 * IntegrationsArcSection
 * 
 * Scroll-driven arc animation with INFINITE LOOP:
 * - 5 boxes visible initially in center arc
 * - On scroll, boxes move left along arc path
 * - When icons exit left, they reappear on right (loop)
 * - Smooth continuous carousel effect
 */
export default function IntegrationsArcSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const stickyContentRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])
  const cardSize = 120
  const gap = 24

  // 17 icons for the carousel
  const icons = [
    { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Gmail_icon_%282020%29.svg', name: 'Gmail' },
    { src: 'https://cdn-icons-png.flaticon.com/512/5968/5968517.png', name: 'Calendar' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/9/9b/Google_Meet_icon_%282020%29.svg', name: 'Google Meet' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/d/df/Microsoft_Office_Outlook_%282018%E2%80%93present%29.svg', name: 'Outlook' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/c/c9/Microsoft_Office_Teams_%282018%E2%80%93present%29.svg', name: 'Teams' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/d/d5/Slack_icon_2019.svg', name: 'Slack' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/d/da/Google_Drive_logo.png', name: 'Google Drive' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e9/Notion-logo.svg', name: 'Notion' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/7/7e/Dropbox_Icon.svg', name: 'Dropbox' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg', name: 'Google Calendar' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/9/91/Octicons-mark-github.svg', name: 'GitHub' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/4/45/Notion_app_logo.png', name: 'Figma' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg', name: 'WhatsApp' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg', name: 'Telegram' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg', name: 'Instagram' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/0/05/Facebook_Logo_%282019%29.png', name: 'Facebook' },
    { src: 'https://upload.wikimedia.org/wikipedia/commons/c/ca/LinkedIn_logo_initials.png', name: 'LinkedIn' },
  ]

  useEffect(() => {
    registerGsapPlugins()
    gsap.registerPlugin(ScrollTrigger)

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !stickyContentRef.current || !containerRef.current) return

      const iconElements = iconRefs.current.filter(Boolean) as HTMLDivElement[]
      const totalIcons = iconElements.length
      const iconWidth = cardSize + gap // distance between icon starts
      const arcHeight = 55 // Height of the arc curve
      
      // Total width of all icons (for wrapping calculation)
      const totalTrackWidth = totalIcons * iconWidth

      // Function to calculate Y position on arc based on X
      const getArcY = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2)
        const mobileArcHeight = containerWidth < 768 ? 42 : arcHeight
        return -mobileArcHeight * (1 - Math.min(1, normalizedX * normalizedX))
      }

      // Function to calculate opacity based on X position
      // Symmetric fade on both left and right edges
      const getOpacity = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2)
        const distFromCenter = Math.abs(normalizedX)
        // On small screens keep edge cards visible longer so layout stays visually centered.
        const fadeStart = containerWidth < 768 ? 0.82 : 0.55
        const fadeStrength = containerWidth < 768 ? 1.6 : 3.5
        if (distFromCenter > fadeStart) {
          return Math.max(0.35, 1 - (distFromCenter - fadeStart) * fadeStrength)
        }
        return 1
      }

      // Function to calculate scale based on X position
      const getScale = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2)
        const distFromCenter = Math.abs(normalizedX)
        const centerScale = containerWidth < 768 ? 1.08 : 1.05
        const shrinkAmount = containerWidth < 768 ? 0.22 : 0.16
        return centerScale - Math.min(shrinkAmount, distFromCenter * 0.22)
      }

      const loops = 1.1
      const totalMovement = totalTrackWidth * loops

      const applyProgress = (progress: number) => {
        if (!containerRef.current) return

        const containerWidth = containerRef.current.offsetWidth
        if (!containerWidth) return

        const centerX = containerWidth / 2 - cardSize / 2
        const centerAnchorIndex = containerWidth < 768 ? 1 : 2
        const initialXOffset = centerX - centerAnchorIndex * iconWidth

        const p = Math.max(0, Math.min(1, progress))
        const rawOffset = p * totalMovement
        const currentOffset = Math.round(rawOffset / iconWidth) * iconWidth
        const wrapBoundary = iconWidth * 2

        iconElements.forEach((icon, i) => {
          const baseX = i * iconWidth + initialXOffset
          let x = baseX - currentOffset
          while (x < -wrapBoundary) x += totalTrackWidth
          while (x > containerWidth + wrapBoundary) x -= totalTrackWidth
          const y = getArcY(x, containerWidth)
          const opacity = getOpacity(x, containerWidth)
          const scale = getScale(x, containerWidth)
          const shadowOpacity = opacity < 0.3 ? 0 : 0.08
          const roundedX = Math.round(x * 100) / 100
          const roundedY = Math.round(y * 100) / 100
          gsap.to(icon, {
            x: roundedX,
            y: roundedY,
            opacity,
            scale,
            duration: 0.14,
            ease: 'power2.out',
            overwrite: true,
            force3D: true,
          })
          gsap.set(icon, {
            zIndex: Math.round(scale * 100),
            boxShadow: `0 4px 24px rgba(0,0,0,${shadowOpacity})`,
          })
        })
      }

      applyProgress(0)

      // Start when sticky content is nearly full in view so handoff from previous section is smooth.
      ScrollTrigger.create({
        trigger: stickyContentRef.current,
        start: 'bottom 98%',
        end: '+=1000vh',
        pin: sectionRef.current,
        anticipatePin: 2,
        scrub: 2.2,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          applyProgress(self.progress)
        },
        onLeave: () => {
          applyProgress(1)
          requestAnimationFrame(() => applyProgress(1))
        },
        onRefresh: (self) => {
          applyProgress(self.progress)
        },
      })

    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative w-full min-h-screen overflow-hidden rounded-3xl bg-[#0F0F0F]"
      style={{ transform: 'translateZ(0)' }}
    >
      <div
        ref={stickyContentRef}
        className="sticky top-0 w-full min-h-screen flex flex-col items-center justify-center"
      >
        <h2 className="text-3xl md:text-4xl font-semibold mb-6 md:mb-8 text-[#FFFFFF] text-center px-4">
          Integrate with your existing tools
        </h2>

        {/* Icons container with overflow hidden */}
        <div
          ref={containerRef}
          className="relative w-full h-[280px] overflow-hidden shrink-0"
          style={{
            clipPath: 'inset(0 0 0 0)',
            WebkitClipPath: 'inset(0 0 0 0)',
            contain: 'layout style paint',
            transform: 'translateZ(0)',
          }}
        >
          {icons.map((icon, index) => (
            <div
              key={index}
              ref={(el) => {
                iconRefs.current[index] = el
              }}
              className="absolute flex items-center justify-center rounded-2xl bg-[#1A1A1A] border border-[#222222]"
              style={{
                width: `${cardSize}px`,
                height: `${cardSize}px`,
                left: 0,
                top: '50%',
                marginTop: `-${cardSize / 2}px`,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                boxShadow: 'none',
                outline: 'none',
              }}
            >
              <img
                src={icon.src}
                alt={icon.name}
                className="w-14 h-14 object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}
