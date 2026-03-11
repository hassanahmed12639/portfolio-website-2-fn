import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import Link from 'next/link'

export default function AboutMePage() {
  return (
    <main className="w-full min-h-screen m-0 p-0 bg-background text-foreground">
      <Header />
      <div className="w-full min-h-[calc(100vh-120px)] pt-24 md:pt-32 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-[#AAFF00] text-xs font-semibold uppercase tracking-widest mb-4">
            About
          </p>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-8">
            Hi, I&apos;m Hassan Ahmed
          </h1>
          <div className="space-y-6 text-muted-foreground text-lg leading-relaxed">
            <p>
              I&apos;m a performance marketer with 5 years of experience. I design marketing systems
              that analyze, optimize, and amplify results — turning complex campaigns into predictable
              growth.
            </p>
            <p>
              I help{' '}
              <span className="text-foreground font-medium">brands</span> grow revenue through
              performance marketing built on{' '}
              <span className="text-foreground font-medium">structured testing</span>, data-led
              decisions, and conversion systems designed to scale profitably.
            </p>
            <p>
              Whether it&apos;s Paid Social & Paid Search, funnel strategy, marketing automation, or
              campaign audits — I focus on systems that deliver measurable outcomes.
            </p>
          </div>
          <div className="mt-12 flex flex-wrap gap-4">
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#AAFF00] text-black font-semibold transition-all hover:shadow-[0_0_24px_rgba(170,255,0,0.4)] hover:-translate-y-0.5"
            >
              Get in Touch
            </Link>
            <Link
              href="/resume"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-foreground font-medium transition-colors hover:border-[#AAFF00] hover:text-[#AAFF00]"
            >
              View Resume
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
