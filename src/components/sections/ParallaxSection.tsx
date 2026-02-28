'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '../../lib/gsap';

const LINES = [
  'When I see a business struggling to scale, my first thought is always,',
  '"where\'s the data, and what\'s it telling us?"',
  "That's how I approach performance marketing, cutting through guesswork to drive measurable growth",
  'through precision targeting, relentless testing, and campaigns that convert.',
];

const PIN_SCROLL_DISTANCE = 900;

const PARALLAX_IMAGE =
  'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=1600&q=80';

export default function ParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const nameRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const content = contentRef.current;
    const pinEl = pinRef.current;
    const nameEl = nameRef.current;
    if (!section || !content || !pinEl) return;

    const lines = content.querySelectorAll('.parallax-line');
    if (lines.length === 0) return;

    gsap.set(lines, { x: 80, opacity: 0 });
    if (nameEl) gsap.set(nameEl, { x: -80, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${PIN_SCROLL_DISTANCE}`,
        scrub: 1.6,
        pin: pinEl,
        pinSpacing: true,
        anticipatePin: 1.2,
      },
    });

    // Phase 1: reveal all quote lines.
    lines.forEach((line) => {
      tl.to(line, { x: 0, opacity: 1, duration: 0.2, ease: 'power2.out' });
    });

    // Phase 2: name/role slides in from left to right.
    if (nameEl) {
      tl.to(nameEl, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' });
    }

    // Keep full text visible briefly before releasing to next section.
    tl.to({}, { duration: 1.2 });

    const st = tl.scrollTrigger;
    return () => {
      st?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="parallax-section relative z-20 min-h-screen w-full overflow-hidden"
      style={{ backgroundColor: '#0F0F0F' }}
    >
      <div
        ref={pinRef}
        className="parallax min-h-screen w-full flex items-center justify-start md:items-start md:justify-end md:pt-10 px-6 md:px-[10%] relative"
      >
        {/* Background image and overlay live inside pinned div so they stay visible when GSAP pins */}
        <Image
          src={PARALLAX_IMAGE}
          alt=""
          fill
          className="object-cover pointer-events-none"
          style={{ zIndex: 0 }}
          sizes="100vw"
          priority
        />
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ zIndex: 0, backgroundColor: 'rgba(15,15,15,0.72)' }}
          aria-hidden
        />
        <div
          ref={contentRef}
          className="parallax-quote relative z-10 max-w-xl text-left md:max-w-2xl text-[#FFFFFF]"
        >
          <div className="space-y-1" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.7)' }}>
            {LINES.map((text, i) => (
              <div
                key={i}
                className="parallax-line text-lg leading-snug md:text-2xl lg:text-3xl font-medium"
              >
                {i === 1 ? (
                  <span className="text-[#AAFF00]">{text}</span>
                ) : (
                  text
                )}
              </div>
            ))}
          </div>
        </div>
        <div
          ref={nameRef}
          className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-[10%] md:right-auto z-10 text-sm text-[#AAFF00] md:text-base"
          style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.7)' }}
        >
          Hassan Ahmed
          <br />
          Performance Marketer
        </div>
      </div>
    </section>
  );
}
