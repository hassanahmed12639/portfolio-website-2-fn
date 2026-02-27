'use client'

import { useEffect } from 'react'
import { registerGsapPlugins } from '@/lib/gsap'

/**
 * Registers GSAP plugins (ScrollTrigger) once when the app mounts.
 * Mount this high in the tree (e.g. root layout) so animations work in all sections.
 */
export default function GsapInit() {
  useEffect(() => {
    registerGsapPlugins()
  }, [])
  return null
}
