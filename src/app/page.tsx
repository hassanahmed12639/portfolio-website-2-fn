export const dynamic = 'force-dynamic'

import Footer from '../components/layout/Footer'
import { FloatingIconsHero } from '../components/sections/Hero'
import AboutSection from '../components/sections/AboutSection'
import GlowingCardSection from '../components/sections/GlowingCardSection'
import CaseStudiesPreviewSection from '../components/sections/CaseStudiesPreviewSection'
import ToolsArcSection from '../components/sections/ToolsArcSection'
import { Testimonials } from '../components/sections/Testimonials'
import { HomeCTA } from '../components/sections/HomeCTA'
import ScrambleIntroWrapper from '../components/ScrambleIntroWrapper'
import { getPortfolioProjects } from '@/lib/portfolio-projects'
import { getPortfolioTools } from '@/lib/portfolio-settings'

export default async function Home() {
  const projects = await getPortfolioProjects({ limit: 3 })
  const tools = await getPortfolioTools()

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
      <AboutSection />
      <GlowingCardSection />
      <CaseStudiesPreviewSection studies={projects} />
      <ToolsArcSection tools={tools} />
      <Testimonials />
      <HomeCTA />
      <Footer />
    </main>
  )
}
