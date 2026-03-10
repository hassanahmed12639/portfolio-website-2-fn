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
const WORDS_PER_SCROLL = 2;
const HIGHLIGHT_WORDS = new Set(['scale', 'fast.']);

export function FeaturesHeadingSection({ className }: { className?: string }) {
  const sectionRef = React.useRef<HTMLElement>(null);
  const [scrollProgress, setScrollProgress] = React.useState(0);

  const words = HEADING.split(' ');
  const wordsToReveal = Math.max(words.length - FIRST_VISIBLE_WORDS, 0);
  const scrollSteps = Math.ceil(wordsToReveal / WORDS_PER_SCROLL) || 1;

  React.useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    if (!section) return;

    const st = ScrollTrigger.create({
      trigger: section,
      start: 'top top', // lock when section reaches top – fills viewport, text centers in middle
      end: `+=${400 * scrollSteps}`, // ~400px per scroll-step (2 words)
      pin: true,
      pinSpacing: true,
      onUpdate: (self) => setScrollProgress(self.progress),
    });

    return () => {
      st.kill();
    };
  }, [scrollSteps]);

  return (
    <section
      ref={sectionRef}
      className={cn(
        'w-full overflow-hidden min-h-screen min-h-[100dvh] flex flex-col justify-center py-12 md:py-16 px-4 sm:px-6',
        className
      )}
      style={{ backgroundColor: '#0a0a0a' }}
    >
      <div className="mx-auto max-w-3xl text-center">
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
              const stepIndex = Math.floor(wordIndex / WORDS_PER_SCROLL);
              const threshold =
                scrollSteps > 1 ? (stepIndex + 1) / scrollSteps : 1;
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
