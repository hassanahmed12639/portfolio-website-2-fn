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
  {
    id: '4',
    initials: 'JR',
    name: 'James Rivera',
    role: 'Head of Marketing at Growth Co.',
    quote:
      'We cut our campaign setup time in half. The analytics are clear, the workflows are logical, and our team actually enjoys using it.',
    tags: [{ text: 'Marketing', type: 'featured' }],
    stats: [{ icon: Award, text: 'Top pick' }],
    avatarGradient: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
  },
  {
    id: '5',
    initials: 'EL',
    name: 'Emma Liu',
    role: 'Operations Director at Nexus',
    quote:
      'From day one we had better visibility into our pipeline. Reporting that used to take days now takes minutes.',
    tags: [{ text: 'Operations', type: 'default' }, { text: 'Reporting', type: 'featured' }],
    stats: [{ icon: Award, text: 'Efficiency' }],
    avatarGradient: 'linear-gradient(135deg, #db2777 0%, #ec4899 100%)',
  },
  {
    id: '6',
    initials: 'PT',
    name: 'Priya Thompson',
    role: 'Founder at Startup Labs',
    quote:
      'As a small team we needed something that scaled with us. This was the right choice—simple to start, powerful when we grew.',
    tags: [{ text: 'Startup', type: 'featured' }],
    stats: [{ icon: Award, text: 'Scalable' }],
    avatarGradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
  },
  {
    id: '7',
    initials: 'AK',
    name: 'Alex Kowalski',
    role: 'Senior Developer at DevHouse',
    quote:
      'Clean code, sensible defaults, and docs that don’t lie. We shipped our integration in a weekend. Would recommend.',
    tags: [{ text: 'Dev', type: 'default' }],
    stats: [{ icon: Award, text: 'Dev favorite' }],
    avatarGradient: 'linear-gradient(135deg, #0f766e 0%, #14b8a6 100%)',
  },
  {
    id: '8',
    initials: 'MN',
    name: 'Maya Nguyen',
    role: 'UX Lead at Pixel Studio',
    quote:
      'Our designers love the component library and design tokens. Consistency across products improved overnight.',
    tags: [{ text: 'UX', type: 'featured' }],
    stats: [{ icon: Award, text: 'Design system' }],
    avatarGradient: 'linear-gradient(135deg, #be185d 0%, #e11d48 100%)',
  },
  {
    id: '9',
    initials: 'DR',
    name: 'Daniel Reyes',
    role: 'VP Sales at Enterprise Inc.',
    quote:
      'The CRM sync and pipeline views saved us countless hours. Our reps stay in the flow instead of updating spreadsheets.',
    tags: [{ text: 'Sales', type: 'default' }, { text: 'CRM', type: 'featured' }],
    stats: [{ icon: Award, text: 'Sales tool' }],
    avatarGradient: 'linear-gradient(135deg, #1d4ed8 0%, #3b82f6 100%)',
  },
  {
    id: '10',
    initials: 'TW',
    name: 'Taylor Williams',
    role: 'Customer Success at ScaleUp',
    quote:
      'Onboarding new customers got so much easier. We have one source of truth and fewer support tickets.',
    tags: [{ text: 'CS', type: 'default' }],
    stats: [{ icon: Award, text: 'Onboarding' }],
    avatarGradient: 'linear-gradient(135deg, #b45309 0%, #f59e0b 100%)',
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
