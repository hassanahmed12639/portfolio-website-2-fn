'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '@/lib/gsap'

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
  const containerRef = useRef<HTMLDivElement>(null)
  const iconRefs = useRef<(HTMLDivElement | null)[]>([])

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
      if (!sectionRef.current || !containerRef.current) return

      const iconElements = iconRefs.current.filter(Boolean) as HTMLDivElement[]
      const totalIcons = iconElements.length
      const iconWidth = 144 // icon width + gap (120px box + 24px gap)
      const arcHeight = 55 // Height of the arc curve
      const containerWidth = containerRef.current.offsetWidth
      
      // Total width of all icons (for wrapping calculation)
      const totalTrackWidth = totalIcons * iconWidth

      // Function to calculate Y position on arc based on X
      const getArcY = (x: number) => {
        const normalizedX = (x - containerWidth / 2) / (containerWidth / 2)
        return -arcHeight * (1 - Math.min(1, normalizedX * normalizedX))
      }

      // Function to calculate opacity based on X position
      // Symmetric fade on both left and right edges
      const getOpacity = (x: number) => {
        const normalizedX = (x - containerWidth / 2) / (containerWidth / 2)
        const distFromCenter = Math.abs(normalizedX)
        // Fade out earlier (at 0.55) and faster (3.5x) for smoother edge transitions
        if (distFromCenter > 0.55) {
          return Math.max(0, 1 - (distFromCenter - 0.55) * 3.5)
        }
        return 1
      }

      // Function to calculate scale based on X position
      const getScale = (x: number) => {
        const normalizedX = (x - containerWidth / 2) / (containerWidth / 2)
        const distFromCenter = Math.abs(normalizedX)
        return 1 - Math.min(0.25, distFromCenter * 0.18)
      }

      // Set initial positions - evenly spaced, starting from left
      iconElements.forEach((icon, i) => {
        const x = i * iconWidth - iconWidth * 2 // Start a bit to the left
        const y = getArcY(x)
        const opacity = getOpacity(x)
        const scale = getScale(x)
        const shadowOpacity = opacity < 0.3 ? 0 : 0.08

        gsap.set(icon, {
          x: x,
          y: y,
          opacity: opacity,
          scale: scale,
          boxShadow: `0 4px 24px rgba(0,0,0,${shadowOpacity})`,
        })
      })

      // Create ScrollTrigger for the looping animation
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 4, // Higher = smoother, more lag
        onUpdate: (self) => {
          const progress = self.progress
          
          // Calculate how much to move based on scroll progress
          // Fewer loops = slower movement per scroll
          const loops = 0.8 // Number of complete loops (adjusted for shorter section)
          const totalMovement = totalTrackWidth * loops
          const currentOffset = progress * totalMovement

          iconElements.forEach((icon, i) => {
            // Base position for this icon
            const baseX = i * iconWidth - iconWidth * 2
            
            // Current X with scroll offset, wrapped for infinite loop
            let x = baseX - currentOffset
            
            // Wrap around: if icon goes too far left, move it to the right
            // Use same boundary distance on both sides for symmetric transitions
            const wrapBoundary = iconWidth * 2
            while (x < -wrapBoundary) {
              x += totalTrackWidth
            }
            while (x > containerWidth + wrapBoundary) {
              x -= totalTrackWidth
            }

            // Calculate arc position and styling
            const y = getArcY(x)
            const opacity = getOpacity(x)
            const scale = getScale(x)
            
            // Hide shadow when icon is fading out to prevent line artifacts
            const shadowOpacity = opacity < 0.3 ? 0 : 0.08

            gsap.set(icon, {
              x: x,
              y: y,
              opacity: opacity,
              scale: scale,
              boxShadow: `0 4px 24px rgba(0,0,0,${shadowOpacity})`,
            })
          })
        }
      })

    }, sectionRef)

    return () => {
      ctx.revert()
    }
  }, [])

  return (
    <section
      ref={sectionRef}
      className="relative min-h-[200vh] py-20 rounded-[48px]"
      style={{ backgroundColor: '#f0f1f3' }}
    >
      {/* Sticky container */}
      <div className="sticky top-0 h-screen flex flex-col items-center justify-center">
        <h2 className="text-3xl md:text-4xl font-semibold mb-16 md:mb-20 text-gray-900 text-center px-4">
          Integrate with your existing tools in seconds
        </h2>

        {/* Icons container with overflow hidden */}
        <div
          ref={containerRef}
          className="relative w-full max-w-[950px] h-[280px] overflow-hidden mx-auto"
          style={{
            clipPath: 'inset(0 0 0 0)',
            WebkitClipPath: 'inset(0 0 0 0)',
          }}
        >
          {icons.map((icon, index) => (
            <div
              key={index}
              ref={(el) => {
                iconRefs.current[index] = el
              }}
              className="absolute flex items-center justify-center bg-white rounded-2xl"
              style={{
                width: '120px',
                height: '120px',
                top: '50%',
                marginTop: '-60px',
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                border: 'none',
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
