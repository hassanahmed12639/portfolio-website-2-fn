'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '../../lib/gsap';

const LINES = [
  'When I see a tough problem, my first thought is always',
  '"how can innovation help solve this?"',
  "That's why I approach marketing – to bring the power of",
  'data and testing to bear on the toughest challenges.',
];

const PIN_SCROLL_DISTANCE = 800;

const PARALLAX_BG_STYLE: React.CSSProperties = {
  backgroundImage: "url('https://picsum.photos/1600/900')",
  backgroundAttachment: 'fixed',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundSize: 'cover',
};

export default function ParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const content = contentRef.current;
    const pinEl = pinRef.current;
    if (!section || !content || !pinEl) return;

    const lines = content.querySelectorAll('.parallax-line');
    if (lines.length === 0) return;

    gsap.set(lines, { x: 80, opacity: 0 });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: 'top top',
        end: `+=${PIN_SCROLL_DISTANCE}`,
        scrub: 1,
        pin: pinEl,
      },
    });

    const step = 1 / lines.length;
    lines.forEach((line, i) => {
      tl.to(line, { x: 0, opacity: 1, duration: 0.3, ease: 'power2.out' }, i * step);
    });

    const st = tl.scrollTrigger;
    return () => {
      st?.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="parallax-section relative min-h-screen w-full"
      style={PARALLAX_BG_STYLE}
    >
      <div
        ref={pinRef}
        className="parallax min-h-screen w-full flex items-center justify-end px-6 pt-24 md:px-[10%] md:pt-32 relative z-10"
      >
        <div
          ref={contentRef}
          className="parallax-quote max-w-xl text-left md:max-w-2xl text-white"
        >
          <div className="space-y-1" style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.7)' }}>
            {LINES.map((text, i) => (
              <div
                key={i}
                className="parallax-line text-xl leading-snug md:text-2xl font-medium"
              >
                {i === 1 ? (
                  <span className="text-[#b8e986]">{text}</span>
                ) : (
                  text
                )}
              </div>
            ))}
          </div>
          <div
            className="parallax-line mt-6 text-base text-[#b8e986]"
            style={{ textShadow: '2px 2px 10px rgba(0,0,0,0.7)' }}
          >
            Hassan Ahmed
            <br />
            Performance Marketer
          </div>
        </div>
      </div>
    </section>
  );
}
