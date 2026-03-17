'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '@/lib/gsap';
import type { CaseStudy } from '@/data/caseStudies';

const LIME = '#b3f000';
const BG_DARK = '#000000';
const CARD_BG = '#0f0f0f';
const BORDER = 'rgba(255,255,255,0.08)';

function CaseStudyCard({
  title,
  src,
  description,
  slug,
}: {
  title: string;
  src: string;
  description: string;
  slug: string;
}) {
  const truncated = description.length > 100 ? description.slice(0, 100) + '...' : description;
  return (
    <Link
      href={`/project/${slug}`}
      className="group block h-full rounded-[1.25rem] overflow-hidden transition hover:opacity-95"
      style={{
        border: '0.75px solid',
        borderColor: BORDER,
        backgroundColor: CARD_BG,
      }}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={src}
          alt=""
          fill
          className="object-cover transition group-hover:scale-[1.03]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        <div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ boxShadow: `inset 0 0 0 2px ${LIME}` }}
        />
      </div>
      <div className="p-5 md:p-6">
        <h3
          className="text-lg font-semibold leading-tight text-white group-hover:text-[#b3f000] transition-colors line-clamp-2"
          style={{
            fontFamily:
              'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          {title}
        </h3>
        <p
          className="mt-2 text-sm leading-relaxed line-clamp-3"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          {truncated}
        </p>
        <span
          className="mt-3 inline-flex items-center text-sm font-medium"
          style={{ color: LIME }}
        >
          View case study →
        </span>
      </div>
    </Link>
  );
}

export default function CaseStudiesPreviewSection({ studies }: { studies: CaseStudy[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const heading = headingRef.current;
    const cards = gridRef.current?.querySelectorAll('a');
    if (!section) return;

    const ctx = gsap.context(() => {
      if (heading) gsap.set(heading, { opacity: 0, y: 24 });
      if (cards?.length) gsap.set(cards, { opacity: 0, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 35%',
          scrub: 0.8,
        },
      });

      if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0);
      if (cards?.length) {
        cards.forEach((card, i) => {
          tl.to(card, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0.15 + i * 0.12);
        });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full overflow-hidden py-12 md:py-16 px-4 sm:px-6"
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="case-studies-preview-heading"
    >
      <div className="w-full max-w-6xl mx-auto space-y-10">
        <div className="text-center">
          <h2
            ref={headingRef}
            id="case-studies-preview-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily:
                'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Case Studies
          </h2>
        </div>
        <div ref={gridRef} className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {studies.map((study) => (
            <CaseStudyCard
              key={study.slug}
              title={study.title}
              src={study.src}
              description={study.description}
              slug={study.slug}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
