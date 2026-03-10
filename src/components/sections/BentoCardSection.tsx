'use client';

import Image from 'next/image';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

const LIME = '#b3f000';
const BG_DARK = '#0a0a0a';
const CARD_BG = '#0f0f0f';
const BORDER = 'rgba(255,255,255,0.08)';

const bentoCards = [
  {
    id: 1,
    area: 'md:col-span-1 md:row-span-1',
    image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&q=80',
    title: 'Data-driven campaign strategy',
    description: 'Audience design, creative testing, and budget pacing that scales.',
  },
  {
    id: 2,
    area: 'md:col-span-2 md:row-span-1',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
    title: 'Multi-channel attribution',
    description: 'Meta, Google, TikTok, LinkedIn—unified tracking and reporting.',
  },
  {
    id: 3,
    area: 'md:col-span-1 md:row-span-2',
    image: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=500&q=80',
    title: 'Scale results fast',
    description: 'Performance marketing built for predictable growth.',
  },
  {
    id: 4,
    area: 'md:col-span-2 md:row-span-1',
    image: 'https://images.unsplash.com/photo-1555949963-ff9fe0c870eb?w=800&q=80',
    title: 'Server-side tracking',
    description: 'Accurate conversions, better match rates, privacy-compliant.',
  },
  {
    id: 5,
    area: 'md:col-span-1 md:row-span-1',
    image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=600&q=80',
    title: 'Custom dashboards & reporting',
    description: 'Real-time insights tailored to your business goals.',
  },
];

function BentoCard({
  id,
  area,
  image,
  title,
  description,
}: (typeof bentoCards)[0]) {
  return (
    <article
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-2xl border min-h-[280px]',
        'hover:border-white/15 transition-colors',
        area
      )}
      style={{
        backgroundColor: CARD_BG,
        borderColor: BORDER,
      }}
    >
      <div className="absolute top-3 left-3 z-10 text-xs text-neutral-500 font-medium">
        #{id} Block
      </div>
      <button
        type="button"
        className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
        aria-label="Learn more"
      >
        <HelpCircle className="w-4 h-4" />
      </button>
      <div className="relative flex-1 min-h-[140px] overflow-hidden">
        <Image
          src={image}
          alt=""
          fill
          sizes="(max-width: 768px) 100vw, 400px"
          className="object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background: `linear-gradient(to bottom, transparent 30%, ${CARD_BG} 85%)`,
          }}
        />
      </div>
      <div className="relative p-5 border-t" style={{ borderColor: BORDER }}>
        <h3
          className="text-lg md:text-xl font-bold text-white mb-2"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        >
          {title}
        </h3>
        <p
          className="text-sm text-neutral-400 leading-relaxed"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        >
          {description}
        </p>
      </div>
      <div
        className="absolute bottom-0 right-0 w-24 h-24 opacity-5 group-hover:opacity-10 transition-opacity pointer-events-none"
        style={{
          background: `radial-gradient(circle at 100% 100%, ${LIME}, transparent 70%)`,
        }}
      />
    </article>
  );
}

export default function BentoCardSection() {
  return (
    <section
      className="w-full overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 flex flex-col items-center justify-center"
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="bento-section-heading"
    >
      <div className="w-full max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <h2
          id="bento-section-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-center"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        >
          What I Do
        </h2>
        <p
          className="text-base sm:text-lg text-white/70 text-center max-w-2xl mx-auto leading-relaxed"
          style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
        >
          I help brands grow through data-driven advertising, advanced tracking, and high-ROI performance marketing strategies.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4 auto-rows-fr">
          {bentoCards.map((card) => (
            <BentoCard key={card.id} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}
