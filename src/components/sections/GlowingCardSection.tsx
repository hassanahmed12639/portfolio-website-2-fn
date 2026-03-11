'use client';

import { useEffect, useRef } from 'react';
import { BarChart3, Target, Zap, LineChart, TrendingUp } from 'lucide-react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '@/lib/gsap';
import { GlowingEffect } from '@/components/ui/GlowingEffect';
import { cn } from '@/lib/utils';

const LIME = '#b3f000';
const BG_DARK = '#000000';
const CARD_BG = '#0f0f0f';
const BORDER = 'rgba(255,255,255,0.08)';

const cards = [
  {
    area: 'md:[grid-area:1/1/2/7] xl:[grid-area:1/1/2/5]',
    icon: <BarChart3 className="h-4 w-4" style={{ color: LIME }} />,
    title: 'Data-driven campaign strategy',
    description:
      'Audience design, creative testing, and budget pacing that scales.',
  },
  {
    area: 'md:[grid-area:1/7/2/13] xl:[grid-area:2/1/3/5]',
    icon: <Target className="h-4 w-4" style={{ color: LIME }} />,
    title: 'Multi-channel attribution',
    description:
      'Meta, Google, TikTok, LinkedIn—unified tracking and reporting.',
  },
  {
    area: 'md:[grid-area:2/1/3/7] xl:[grid-area:1/5/3/8]',
    icon: <Zap className="h-4 w-4" style={{ color: LIME }} />,
    title: 'Scale results fast',
    description: 'Performance marketing built for predictable growth.',
  },
  {
    area: 'md:[grid-area:2/7/3/13] xl:[grid-area:1/8/2/13]',
    icon: <LineChart className="h-4 w-4" style={{ color: LIME }} />,
    title: 'Server-side tracking',
    description:
      'Accurate conversions, better match rates, privacy-compliant.',
  },
  {
    area: 'md:[grid-area:3/1/4/13] xl:[grid-area:2/8/3/13]',
    icon: <TrendingUp className="h-4 w-4" style={{ color: LIME }} />,
    title: 'Custom dashboards & reporting',
    description: 'Real-time insights tailored to your business goals.',
  },
];

function GridItem({
  area,
  icon,
  title,
  description,
}: {
  area: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className={cn('min-h-[14rem] list-none', area)}>
      <div
        className="relative h-full rounded-[1.25rem] p-2 md:rounded-[1.5rem] md:p-3"
        style={{ border: '0.75px solid', borderColor: BORDER }}
      >
        <GlowingEffect
          variant="lime"
          spread={40}
          glow
          disabled={false}
          proximity={64}
          inactiveZone={0.01}
          borderWidth={3}
        />
        <div
          className="relative flex h-full flex-col justify-between gap-6 overflow-hidden rounded-xl p-6 shadow-sm md:p-6"
          style={{
            backgroundColor: CARD_BG,
            border: '0.75px solid',
            borderColor: BORDER,
          }}
        >
          <div className="relative flex flex-1 flex-col justify-between gap-3">
            <div
              className="w-fit rounded-lg p-2"
              style={{
                border: '0.75px solid',
                borderColor: BORDER,
                backgroundColor: `${LIME}15`,
              }}
            >
              {icon}
            </div>
            <div className="space-y-3">
              <h3
                className="pt-0.5 text-xl leading-[1.375rem] font-semibold tracking-[-0.04em] md:text-2xl md:leading-[1.875rem] text-balance text-white"
                style={{
                  fontFamily:
                    'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
                }}
              >
                {title}
              </h3>
              <p
                className="text-sm leading-[1.125rem] md:text-base md:leading-[1.375rem]"
                style={{ color: 'rgba(255,255,255,0.65)' }}
              >
                {description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}

export default function GlowingCardSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subRef = useRef<HTMLParagraphElement>(null);
  const cardsRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const heading = headingRef.current;
    const sub = subRef.current;
    const cardItems = cardsRef.current?.querySelectorAll('li');
    if (!section) return;

    const ctx = gsap.context(() => {
      if (heading) gsap.set(heading, { opacity: 0, y: 24 });
      if (sub) gsap.set(sub, { opacity: 0, y: 20 });
      if (cardItems?.length) gsap.set(cardItems, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 35%',
          scrub: 0.8,
        },
      });

      if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0);
      if (sub) tl.to(sub, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.1);
      if (cardItems?.length) {
        cardItems.forEach((li, i) => {
          tl.to(li, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.2 + i * 0.08);
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'w-full overflow-hidden min-h-0 py-12 md:py-16 px-4 sm:px-6',
        'flex flex-col items-center justify-center'
      )}
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="glowing-section-heading"
    >
      <div className="w-full max-w-6xl mx-auto space-y-10 sm:space-y-12">
        <h2
          ref={headingRef}
          id="glowing-section-heading"
          className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white text-center"
          style={{
            fontFamily:
              'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          What I Do
        </h2>
        <p ref={subRef} className="text-base sm:text-lg text-white/70 text-center max-w-2xl mx-auto leading-relaxed">
          I help brands grow through data-driven advertising, advanced tracking, and high-ROI performance marketing strategies.
        </p>
        <ul ref={cardsRef} className="grid grid-cols-1 grid-rows-none gap-4 md:grid-cols-12 md:grid-rows-3 lg:gap-4 xl:max-h-[34rem] xl:grid-rows-2">
          {cards.map((card) => (
            <GridItem
              key={card.title}
              area={card.area}
              icon={card.icon}
              title={card.title}
              description={card.description}
            />
          ))}
        </ul>
      </div>
    </section>
  );
}
