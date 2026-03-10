'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { registerGsapPlugins } from '@/lib/gsap';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const LIME = '#b3f000';
const HEADING =
  'Data-driven performance marketing strategies designed to scale results fast.';
const FIRST_VISIBLE_WORDS = 3;
const HIGHLIGHT_WORDS = new Set(['scale', 'fast.']);

export function FeaturesHeadingSection({ className }: { className?: string }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const words = HEADING.split(' ');
  const wordsToReveal = Math.max(words.length - FIRST_VISIBLE_WORDS, 1);
  const scrollSteps = wordsToReveal; // one step per word after the first 3

  React.useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top 65%',
      end: 'bottom 55%', // shorter range = faster progress per scroll
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    return () => {
      st.kill();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'w-full overflow-hidden min-h-[45vh] flex flex-col justify-center px-4 sm:px-6',
        'py-12 sm:py-16 md:py-20 pb-16',
        className
      )}
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="mx-auto max-w-3xl text-center -mt-16 sm:-mt-20 md:-mt-24">
        {/* Heading: 3 words visible by default, rest reveal on scroll */}
        <h2
          className={cn(
            'text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight',
            'text-white mx-auto'
          )}
          style={{
            fontFamily:
              'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
          }}
        >
          <span className="flex flex-wrap justify-center gap-x-2 gap-y-1">
            {words.map((word, i) => {
              const isFirstBatch = i < FIRST_VISIBLE_WORDS;
              const wordIndex = i - FIRST_VISIBLE_WORDS;
              const threshold =
                scrollSteps > 1 ? wordIndex / (scrollSteps - 1) : 0;
              const revealed = isFirstBatch || scrollProgress >= threshold;

              const isHighlight = HIGHLIGHT_WORDS.has(word);

              return (
                <motion.span
                  key={`${word}-${i}`}
                  initial={{
                    opacity: isFirstBatch ? 1 : 0,
                    y: isFirstBatch ? 0 : 14,
                  }}
                  animate={{
                    opacity: revealed ? 1 : 0,
                    y: revealed ? 0 : 14,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                  className="inline-block"
                  style={isHighlight ? { color: LIME } : undefined}
                >
                  {word}
                </motion.span>
              );
            })}
          </span>
        </h2>
      </div>
    </section>
  );
}
