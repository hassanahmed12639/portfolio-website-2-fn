'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

const LIME = '#b3f000';

const line1 = [
  { word: 'This', highlight: false },
  { word: 'is', highlight: false },
  { word: 'performance', highlight: true },
  { word: 'marketing', highlight: true },
];
const line2 = [
  { word: 'on', highlight: false },
  { word: 'a', highlight: false },
  { word: 'global', highlight: false },
  { word: 'scale', highlight: false },
];

const baseClass = 'text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight';
const fontStyle = { fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif" };

function WordLine({ words }: { words: typeof line1 }) {
  return (
    <span className={`block flex flex-wrap justify-center gap-x-2 gap-y-1 ${baseClass}`} style={fontStyle}>
      {words.map(({ word, highlight }, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: false, amount: 0.05, margin: '-10% 0px -30% 0px' }}
          transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
          className="inline-block"
          style={highlight ? { color: LIME } : undefined}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}

export default function ScrollRevealSection() {
  return (
    <section
      className="relative min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-12 py-16 md:py-20 gap-10 md:gap-12 bg-[#0a0a0a]"
      aria-labelledby="scroll-reveal-heading"
    >
      <h2 id="scroll-reveal-heading" className="sr-only">
        Performance marketing statement
      </h2>
      <div className="max-w-5xl mx-auto text-center flex flex-col gap-2">
        <WordLine words={line1} />
        <WordLine words={line2} />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: false, amount: 0.3 }}
        transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          href="/contact"
          className="inline-block px-8 py-4 rounded-2xl font-semibold text-[#0a0a0a] transition-all hover:opacity-90"
          style={{
            background: LIME,
            boxShadow: `0 0 30px ${LIME}66`,
            fontFamily: "'Segoe UI', system-ui, -apple-system, sans-serif",
          }}
        >
          Let&apos;s Work Together
        </Link>
      </motion.div>
    </section>
  );
}
