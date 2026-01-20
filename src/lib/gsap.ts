import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin only once
let isRegistered = false

export const registerGsapPlugins = () => {
  if (typeof window === 'undefined') return
  
  if (!isRegistered) {
    gsap.registerPlugin(ScrollTrigger)
    isRegistered = true
  }
}

// Export GSAP and ScrollTrigger for convenience
export { gsap, ScrollTrigger }
