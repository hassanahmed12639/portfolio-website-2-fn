'use client'

import { TestimonialStack } from '../ui/testimonial-stack'
import type { Testimonial } from '../ui/testimonial-stack'
import { Award } from 'lucide-react'

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    initials: 'DW',
    name: 'David Wong',
    role: 'Lead Designer at Creative Co.',
    quote:
      "The user interface is not just beautiful, it's intuitive. Our design team was able to adopt it instantly, streamlining our entire workflow and improving creative output.",
    tags: [{ text: 'Design', type: 'featured' }],
    stats: [{ icon: Award, text: 'Top UI/UX' }],
    avatarGradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
  },
  {
    id: '2',
    initials: 'MC',
    name: 'Marcus Chen',
    role: 'Product Lead at Scale Inc.',
    quote:
      'Integration was seamless. We connected our existing tools in under a day and saw measurable improvements in team velocity from week one.',
    tags: [{ text: 'Product', type: 'default' }, { text: 'Integration', type: 'featured' }],
    stats: [{ icon: Award, text: 'Best in class' }],
    avatarGradient: 'linear-gradient(135deg, #0ea5e9 0%, #06b6d4 100%)',
  },
  {
    id: '3',
    initials: 'SK',
    name: 'Sarah Kim',
    role: 'CTO at Flow Labs',
    quote:
      'Finally a platform that plays nicely with everything we use. The API is clean, documentation is solid, and support actually responds.',
    tags: [{ text: 'Engineering', type: 'default' }],
    stats: [{ icon: Award, text: 'Developer choice' }],
    avatarGradient: 'linear-gradient(135deg, #e94f37 0%, #f97316 100%)',
  },
]

export default function TestimonialSplitSection() {
  return (
    <section className="w-full min-h-[80vh] flex flex-col md:flex-row items-stretch bg-designBg py-12 md:py-16 lg:py-20 px-6 md:px-[5%]">
      <div className="w-full md:w-1/2 flex flex-col justify-center pr-0 md:pr-8 lg:pr-12 mb-10 md:mb-0">
        <h2 className="text-3xl md:text-4xl font-semibold text-textPrimary mb-4 md:mb-6">
          What people are saying
        </h2>
        <p className="text-textPrimary/80 text-lg md:text-xl leading-relaxed max-w-lg">
          Teams and leaders trust the approach. Read how they use it to ship faster and collaborate better.
        </p>
      </div>
      <div className="w-full md:w-1/2 flex flex-col justify-center pl-0 md:pl-8 lg:pl-12">
        <TestimonialStack testimonials={TESTIMONIALS} visibleBehind={2} />
      </div>
    </section>
  )
}
