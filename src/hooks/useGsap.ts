'use client'

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { registerGsapPlugins } from '@/lib/gsap'

/**
 * Custom hook for GSAP animations with ScrollTrigger support
 * Ensures animations only run on the client and are properly cleaned up
 * 
 * @param animationFunction - Function that receives GSAP context and returns cleanup function
 * @param dependencies - Dependency array for useEffect
 * 
 * @example
 * useGsap((ctx) => {
 *   ctx.add(() => {
 *     gsap.from('.hero-title', {
 *       opacity: 0,
 *       y: 50,
 *       duration: 1,
 *       scrollTrigger: {
 *         trigger: '.hero-title',
 *         start: 'top 80%',
 *       }
 *     })
 *   })
 * 
 *   return () => {
 *     // Cleanup function
 *     ScrollTrigger.getAll().forEach(trigger => trigger.kill())
 *   }
 * }, [])
 */
export const useGsap = (
  animationFunction: (ctx: gsap.Context) => (() => void) | void,
  dependencies: React.DependencyList = []
) => {
  const ctxRef = useRef<gsap.Context | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    // Register plugins on mount
    registerGsapPlugins()

    // Create GSAP context for proper cleanup
    ctxRef.current = gsap.context((ctx) => {
      const cleanup = animationFunction(ctx)
      if (cleanup) {
        cleanupRef.current = cleanup
      }
    })

    // Cleanup function
    return () => {
      // Kill all ScrollTriggers in this context
      if (ctxRef.current) {
        ctxRef.current.revert()
      }
      
      // Run custom cleanup if provided
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies)

  return ctxRef.current
}
