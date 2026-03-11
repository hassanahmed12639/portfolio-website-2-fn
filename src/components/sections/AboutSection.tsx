'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '@/lib/gsap';

const LIME = '#AAFF00';
const BG_DARK = '#000000';
const TEXT_WHITE = '#FFFFFF';
const TEXT_MUTED = 'rgba(255,255,255,0.7)';

const bullets = [
  'Data-driven campaign strategy',
  'Performance-first optimization',
  'Iterative testing & refinement',
  'Collaborative partnership approach',
];

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const label = labelRef.current;
    const heading = headingRef.current;
    const paragraph = paragraphRef.current;
    const listItems = listRef.current?.querySelectorAll('li');
    const image = imageRef.current;
    if (!section || !paragraph || !listItems?.length) return;

    const ctx = gsap.context(() => {
      if (label) gsap.set(label, { opacity: 0, y: 20 });
      if (heading) gsap.set(heading, { opacity: 0, y: 20 });
      gsap.set(paragraph, { opacity: 0, y: 24 });
      gsap.set(listItems, { opacity: 0, y: 16 });
      if (image) gsap.set(image, { opacity: 0, x: 40 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top 80%',
          end: 'top 30%',
          scrub: 0.8,
        },
      });

      if (label) tl.to(label, { opacity: 1, y: 0, duration: 0.3, ease: 'power2.out' }, 0);
      if (heading) tl.to(heading, { opacity: 1, y: 0, duration: 0.35, ease: 'power2.out' }, 0.08);
      tl.to(paragraph, { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, 0.15);
      listItems.forEach((li, i) => {
        tl.to(li, { opacity: 1, y: 0, duration: 0.25, ease: 'power2.out' }, 0.25 + i * 0.12);
      });
      if (image) tl.to(image, { opacity: 1, x: 0, duration: 0.5, ease: 'power2.out' }, 0.1);
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="about"
      className="w-full min-h-screen pt-24 pb-16 md:pt-32 md:pb-24 px-4 sm:px-6 md:px-10 lg:px-16 flex items-center overflow-hidden"
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="about-heading"
    >
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-[1fr,minmax(0,460px)] gap-10 lg:gap-16 items-center w-full">
        {/* Left: Text content */}
        <div className="relative z-10 space-y-6 md:space-y-8 order-2 lg:order-1 min-w-0 max-w-2xl lg:max-w-none">
          <p
            ref={labelRef}
            className="text-xs md:text-sm font-medium uppercase tracking-[0.2em]"
            style={{ color: LIME }}
          >
            About
          </p>
          <h2
            ref={headingRef}
            id="about-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold leading-[1.2] tracking-tight break-words"
            style={{ color: TEXT_WHITE }}
          >
            Crafting marketing systems with precision and purpose.
          </h2>
          <p
            ref={paragraphRef}
            className="text-base md:text-lg leading-relaxed max-w-xl"
            style={{ color: TEXT_MUTED }}
          >
            With a focus on data-driven strategy and performance-led execution, I create
            advertising systems that resonate with audiences and deliver measurable business
            outcomes. Every campaign is an opportunity to push boundaries and set new standards.
          </p>
          <ul ref={listRef} className="space-y-3 list-none">
            {bullets.map((item) => (
              <li
                key={item}
                className="flex items-center gap-3 text-base md:text-lg"
                style={{ color: TEXT_MUTED }}
              >
                <span
                  className="h-1.5 w-1.5 shrink-0 rounded-full"
                  style={{ backgroundColor: LIME }}
                  aria-hidden
                />
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right: Image - centered and larger on mobile */}
        <div ref={imageRef} className="relative aspect-[4/5] max-h-[500px] lg:max-h-[520px] overflow-hidden rounded-lg order-1 lg:order-2 shrink-0 w-full max-w-[min(100%,400px)] lg:max-w-none mx-auto lg:mx-0">
          <Image
            src="/makreting-person.png"
            alt="Hassan Ahmed"
            fill
            className="object-cover object-center"
            sizes="(max-width: 1024px) min(100vw, 400px), 460px"
            priority={false}
          />
        </div>
      </div>
    </section>
  );
}
