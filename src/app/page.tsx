import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import UnifyFinancesScroll from '@/components/sections/UnifyFinancesScroll'
import AnimatedCardsSection from '@/components/sections/AnimatedCardsSection'

export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      <Header />
      <Hero />
      <UnifyFinancesScroll />
      <AnimatedCardsSection />
    </main>
  )
}
