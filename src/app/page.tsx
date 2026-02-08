import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import Hero from '../components/sections/Hero'
import LogoMarquee from '../components/sections/LogoMarquee'
import UnifyFinancesScroll from '../components/sections/UnifyFinancesScroll'
import ArchSection from '../components/sections/ArchSection'
import WhoIAmSection from '../components/sections/WhoIAmSection'
import IntegrationsArcSection from '../components/sections/IntegrationsArcSection'
import { HomePage } from '../components/sections/EmpoweringSection'
import CTASection from '../components/sections/CTASection'

export default function Home() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-designBg">
      <Header />
      <Hero />
      <LogoMarquee />
      <UnifyFinancesScroll />
      <ArchSection />
      <WhoIAmSection />
      <IntegrationsArcSection />
      <HomePage />
      <section className="w-full m-0 py-12 md:py-16 lg:py-20 px-6 md:px-[5%] bg-designBg">
        <div className="max-w-7xl mx-auto">
          <CTASection />
        </div>
      </section>
      <Footer />
    </main>
  )
}
