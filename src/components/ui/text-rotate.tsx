'use client';

import * as React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export interface TextRotateProps {
  texts: string[];
  mainClassName?: string;
  staggerFrom?: 'first' | 'last';
  initial?: { y: string };
  animate?: { y: number };
  exit?: { y: string };
  staggerDuration?: number;
  splitLevelClassName?: string;
  transition?: { type: 'spring'; damping: number; stiffness: number };
  rotationInterval?: number;
}

export function TextRotate({
  texts,
  mainClassName,
  staggerFrom = 'first',
  initial = { y: '100%' },
  animate = { y: 0 },
  exit = { y: '-120%' },
  staggerDuration = 0.025,
  splitLevelClassName,
  transition = { type: 'spring', damping: 30, stiffness: 400 },
  rotationInterval = 2000,
}: TextRotateProps) {
  const [index, setIndex] = React.useState(0);
  const currentText = texts[index % texts.length];
  const chars = currentText.split('');

  React.useEffect(() => {
    if (texts.length <= 1) return;
    const id = setInterval(() => setIndex((i) => i + 1), rotationInterval);
    return () => clearInterval(id);
  }, [texts.length, rotationInterval]);

  const staggerDelay = (i: number) =>
    staggerFrom === 'last' ? (chars.length - 1 - i) * staggerDuration : i * staggerDuration;

  return (
    <span className={cn('inline-flex overflow-hidden', mainClassName)}>
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={transition}
          className="inline-flex overflow-hidden"
        >
          {splitLevelClassName ? (
            chars.map((char, i) => (
              <span key={i} className={cn('overflow-hidden', splitLevelClassName)}>
                <motion.span
                  initial={initial}
                  animate={animate}
                  transition={{ ...transition, delay: staggerDelay(i) }}
                  className="inline-block"
                >
                  {char}
                </motion.span>
              </span>
            ))
          ) : (
            currentText
          )}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
