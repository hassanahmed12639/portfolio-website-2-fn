'use client'

import ScrambleIntro from './ScrambleIntro'

const SCROLL_DELAY_MS = 200

export default function ScrambleIntroWrapper() {
  const scrollToHero = () => {
    if (typeof window === 'undefined') return
    window.scrollTo(0, 0)
    const hero = document.getElementById('hero')
    if (hero) hero.scrollIntoView({ block: 'start' })
    setTimeout(() => {
      document.body.style.overflow = ''
      document.documentElement.style.overflow = ''
    }, SCROLL_DELAY_MS)
  }
  return <ScrambleIntro onComplete={scrollToHero} />
}
