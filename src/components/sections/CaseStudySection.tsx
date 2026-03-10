'use client';

import Image from 'next/image';
import Link from 'next/link';

const LIME = '#b3f000';
const CARD_BG = '#0f0f0f';
const BORDER = 'rgba(255,255,255,0.08)';

const cases = [
  { brand: 'Family Builders', slug: 'family-builders', image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&q=80' },
  { brand: 'Alliance Shipping', slug: 'alliance-shipping', image: 'https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=800&q=80' },
  { brand: 'Digital District', slug: 'digital-district', image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80' },
  { brand: 'Win Networks', slug: 'win-networks', image: 'https://images.unsplash.com/photo-1553877522-43269d4ea984?w=800&q=80' },
];

export default function CaseStudySection() {
  return (
    <section
      className="relative w-full min-h-screen min-h-[100dvh] flex flex-col justify-start sm:justify-center py-12 md:py-16 px-4 sm:px-6 lg:px-12 bg-black"
      aria-labelledby="case-studies-heading"
    >
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <div className="mb-8 sm:mb-12 md:mb-16 text-center">
          <h2
            id="case-studies-heading"
            className="text-white font-extrabold tracking-tight"
            style={{
              fontFamily: "'Segoe UI', system-ui, sans-serif",
              fontSize: 'clamp(1.75rem, 4vw, 2.5rem)',
              letterSpacing: '-0.02em',
            }}
          >
            Case Studies
          </h2>
        </div>

        {/* Cards: simple 2-column grid, mobile: one card per viewport for scroll-by-scroll */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4 md:gap-6">
          {cases.map((c) => (
            <Link key={c.brand} href={`/project/${c.slug}`} className="block">
              <article
                className="group relative rounded-2xl border overflow-hidden min-h-[72dvh] sm:min-h-[280px] md:min-h-[320px] cursor-pointer touch-manipulation active:scale-[0.98] transition-transform"
                style={{ backgroundColor: CARD_BG, borderColor: BORDER }}
              >
                <div className="absolute inset-0">
                  <Image
                    src={c.image}
                    alt={c.brand}
                    fill
                    sizes="(max-width: 640px) 100vw, 50vw"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* Hover/tap overlay: black layer rises from below (group-active for mobile tap) */}
                  <div
                    className="absolute inset-x-0 bottom-0 top-0 translate-y-full group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-300 ease-out flex flex-col items-center justify-end pb-6"
                    style={{
                      background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.3) 50%, transparent 100%)',
                    }}
                  >
                    <span
                      className="text-base md:text-lg font-semibold"
                      style={{ color: LIME, fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                    >
                      View Case Study
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-5 md:p-6">
                  <h3
                    className="text-lg md:text-xl font-bold text-white"
                    style={{ fontFamily: "'Segoe UI', system-ui, sans-serif" }}
                  >
                    {c.brand}
                  </h3>
                </div>
              </article>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
