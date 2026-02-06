import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import LogoMarquee from '../components/sections/LogoMarquee'
import UnifyFinancesScroll from '../components/sections/UnifyFinancesScroll'
import ArchSection from '../components/sections/ArchSection'
import WhoIAmSection from '../components/sections/WhoIAmSection'
import IntegrationsArcSection from '../components/sections/IntegrationsArcSection'
export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <LogoMarquee />
      <div className="py-16 md:py-24">
        <UnifyFinancesScroll />
      </div>
      <ArchSection />
      <WhoIAmSection />
      <div className="py-16 md:py-24">
        <IntegrationsArcSection />
      </div>
      <Footer />
    </main>
  )
}
