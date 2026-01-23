'use client'

import { useRef, useEffect } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '@/lib/gsap'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

interface TextRevealProps {
  children: React.ReactNode
  className?: string
  delay?: number
  duration?: number
  y?: number
}

export function TextReveal({ 
  children, 
  className = '', 
  delay = 0,
  duration = 0.8,
  y = 30
}: TextRevealProps) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    registerGsapPlugins()
    
    if (!ref.current) return

    const element = ref.current

    gsap.set(element, { opacity: 0, y })

    const animation = gsap.to(element, {
      opacity: 1,
      y: 0,
      duration,
      delay,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 85%',
        once: true,
      },
    })

    return () => {
      animation.kill()
      ScrollTrigger.getAll().forEach(trigger => {
        if (trigger.vars.trigger === element) {
          trigger.kill()
        }
      })
    }
  }, [delay, duration, y])

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  )
}

interface TextRevealByWordProps {
  text: string
  className?: string
}

export function TextRevealByWord({ text, className }: TextRevealByWordProps) {
  const ref = useRef<HTMLParagraphElement>(null)
  const isInView = useInView(ref, { once: true, margin: '0px 0px -100px 0px' })
  const words = text.split(' ')

  return (
    <p ref={ref} className={cn('flex flex-wrap', className)}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{
            duration: 0.5,
            delay: i * 0.05,
            ease: 'easeOut',
          }}
          className="mr-1.5"
        >
          {word}
        </motion.span>
      ))}
    </p>
  )
}
