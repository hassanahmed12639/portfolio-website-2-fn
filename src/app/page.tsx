import Footer from '../components/layout/Footer'
import { FloatingIconsHero } from '../components/sections/Hero'
import ScrambleIntroWrapper from '../components/ScrambleIntroWrapper'

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
      <Footer />
    </main>
  )
}
