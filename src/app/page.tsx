import Footer from '../components/layout/Footer'
import { FloatingIconsHero } from '../components/sections/Hero'
import { FeaturesHeadingSection } from '../components/sections/FeaturesHeadingSection'
import WhatIDoSection from '../components/sections/WhatIDoSection'
import ScrambleIntroWrapper from '../components/ScrambleIntroWrapper'
import { HeroWithMarquee } from '../components/sections/HeroWithMarquee'

export default function Home() {
  return (
    <main className="w-full min-h-screen m-0 p-0 pt-14 lg:pt-0 bg-transparent">
      <ScrambleIntroWrapper />
      <FloatingIconsHero
        id="hero"
        title="Welcome to the innovation oasis"
        subtitle="Hi, I'm Hassan Ahmed, a performance marketer with 5 years of experience. I design marketing systems that analyze, optimize, and amplify results, turning complex campaigns into predictable growth."
        ctaText="Get Started"
        ctaHref="#"
      />
      <FeaturesHeadingSection />
      <WhatIDoSection />
      <HeroWithMarquee />
      <Footer />
    </main>
  )
}
