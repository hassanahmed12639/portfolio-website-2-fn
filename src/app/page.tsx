import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import UnifyFinancesScroll from '@/components/sections/UnifyFinancesScroll'
import BentoGridSection from '@/components/sections/BentoGridSection'
import IntegrationsArcSection from '@/components/sections/IntegrationsArcSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <UnifyFinancesScroll />
      <BentoGridSection />
      <IntegrationsArcSection />
    </main>
  )
}
