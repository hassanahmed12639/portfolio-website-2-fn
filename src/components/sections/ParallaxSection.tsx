'use client';

import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { motion, useInView } from 'framer-motion';
import { useRef, useEffect, useState } from 'react';

const Shader3 = dynamic(
  () => import('@/components/ui/Shader3').then((mod) => mod.Shader3),
  { ssr: false }
);

const LIME = '#b3f000';

const lines = [
  'When I see a tough problem, my first thought is always',
  '"how can data drive the solution?"',
  "That's why I focus on performance marketing – to bring the power of data to bear on growth.",
];

export default function ParallaxSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.3 });
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const shaderEl = (
    <div
      className="fixed inset-0 pointer-events-none"
      style={{ minHeight: '100vh', minWidth: '100%', zIndex: 0 }}
    >
      <Shader3 color={LIME} />
    </div>
  );

  return (
    <section
      ref={sectionRef}
      className="relative min-h-screen min-h-[100dvh] flex flex-col justify-start items-end py-12 md:py-16 px-4 sm:px-6 lg:px-12 overflow-visible"
      aria-labelledby="parallax-section-heading"
    >
      {/* Fixed shader via portal – renders at body level so it sits behind all sections */}
      {mounted && typeof document !== 'undefined' && createPortal(shaderEl, document.body)}

      <h2 id="parallax-section-heading" className="sr-only">
        Parallax quote section
      </h2>
      <div className="relative z-10 max-w-4xl ml-auto flex flex-col gap-8 md:gap-12">
        <div
          className="text-white text-base sm:text-lg md:text-xl lg:text-2xl font-medium leading-relaxed flex flex-col gap-3"
          style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
        >
          {lines.map((line, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: 120 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false, amount: 0.1 }}
              transition={{
                duration: 0.8,
                delay: i * 0.15,
                ease: [0.22, 1, 0.36, 1],
              }}
              style={i === 1 ? { color: LIME } : undefined}
            >
              {line}
            </motion.div>
          ))}
        </div>
      </div>

      <motion.div
        initial={{ opacity: 0, x: -40 }}
        animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -40 }}
        transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-6 md:bottom-8 left-4 sm:left-6 lg:left-12 z-10 text-white/90 text-base md:text-lg"
        style={{ textShadow: '0 1px 10px rgba(0,0,0,0.5)' }}
      >
        Hassan Ahmed
        <br />
        <span style={{ color: LIME }}>Performance Marketer</span>
      </motion.div>
    </section>
  );
}
