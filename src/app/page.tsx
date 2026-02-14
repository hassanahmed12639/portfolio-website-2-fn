import Header from '../components/layout/Header'
import Footer from '../components/layout/Footer'
import { FloatingIconsHero } from '../components/sections/Hero'
import LogoMarquee from '../components/sections/LogoMarquee'
import UnifyFinancesScroll from '../components/sections/UnifyFinancesScroll'
import WhoIAmSection from '../components/sections/WhoIAmSection'
import ParallaxSection from '../components/sections/ParallaxSection'
import EmissionsIntroSection from '../components/sections/EmissionsIntroSection'
import IntegrationsArcSection from '../components/sections/IntegrationsArcSection'
import CTASection from '../components/sections/CTASection'

export default function Home() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-designBg">
      <Header />
      <FloatingIconsHero
        title="Welcome to the innovation oasis"
        subtitle="Hi, I'm Hassan Ahmed, a performance marketer with 5 years of experience. I design marketing systems that analyze, optimize, and amplify results, turning complex campaigns into predictable growth."
        ctaText="Get Started"
        ctaHref="#"
      />
      <LogoMarquee />
      <UnifyFinancesScroll />
      <WhoIAmSection />
      <ParallaxSection />
      <EmissionsIntroSection />
      <IntegrationsArcSection />
      <section className="w-full m-0 py-12 md:py-16 lg:py-20 px-6 md:px-[5%] bg-designBg">
        <div className="max-w-7xl mx-auto">
          <CTASection />
        </div>
      </section>
      <Footer />
    </main>
  )
}
