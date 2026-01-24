import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import UnifyFinancesScroll from '@/components/sections/UnifyFinancesScroll'
import WhoWeAreBento from '@/components/sections/WhoWeAreBento'
import PartnerHero from '@/components/sections/PartnerHero'
import IntegrationsArcSection from '@/components/sections/IntegrationsArcSection'
import ServicesGradient from '@/components/sections/ServicesGradient'
import PerformanceMarketingArchitecture from '@/components/sections/PerformanceMarketingArchitecture'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <div className="py-16 md:py-24">
        <UnifyFinancesScroll />
      </div>
      <div className="py-10 md:py-16">
        <WhoWeAreBento />
      </div>
      <PartnerHero />
      <div className="py-16 md:py-24">
        <IntegrationsArcSection />
      </div>
      <ServicesGradient />
      <div className="py-16 md:py-24">
        <PerformanceMarketingArchitecture />
      </div>
    </main>
  )
}
