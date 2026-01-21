import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { MotionPathPlugin } from 'gsap/MotionPathPlugin'

// Register GSAP plugins only once
let isRegistered = false

export const registerGsapPlugins = () => {
  if (typeof window === 'undefined') return
  
  if (!isRegistered) {
    gsap.registerPlugin(ScrollTrigger, MotionPathPlugin)
    isRegistered = true
  }
}

// Export GSAP and plugins for convenience
export { gsap, ScrollTrigger, MotionPathPlugin }
