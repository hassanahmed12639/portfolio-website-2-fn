export const dynamic = 'force-dynamic'

import Footer from '../components/layout/Footer'
import { FloatingIconsHero } from '../components/sections/Hero'
import { FeaturesHeadingSection } from '../components/sections/FeaturesHeadingSection'
import GlowingCardSection from '../components/sections/GlowingCardSection'
import ParallaxSection from '../components/sections/ParallaxSection'
import ScrollRevealSection from '../components/sections/ScrollRevealSection'
import CaseStudySection from '../components/sections/CaseStudySection'
import ScrambleIntroWrapper from '../components/ScrambleIntroWrapper'
import { HeroWithMarquee } from '../components/sections/HeroWithMarquee'

export default function Home() {
  return (
    <main className="w-full min-h-screen m-0 p-0 pt-14 lg:pt-0 bg-transparent overflow-x-hidden">
      <ScrambleIntroWrapper />
      <FloatingIconsHero
        id="hero"
        title="Welcome to the innovation oasis"
        subtitle="Hi, I'm Hassan Ahmed, a performance marketer with 5 years of experience. I design marketing systems that analyze, optimize, and amplify results, turning complex campaigns into predictable growth."
        ctaText="Get Started"
        ctaHref="#"
      />
      <FeaturesHeadingSection />
      <GlowingCardSection />
      <ParallaxSection />
      <ScrollRevealSection />
      <CaseStudySection />
      <HeroWithMarquee />
      <Footer />
    </main>
  )
}
