'use client';

import type { CSSProperties, ReactNode } from 'react';
import { useState } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

interface MarqueeProps {
  children: ReactNode;
  pauseOnHover?: boolean;
  reverse?: boolean;
  className?: string;
  speed?: number;
}

function Marquee({
  children,
  pauseOnHover = false,
  reverse = false,
  className,
  speed = 40,
}: MarqueeProps) {
  return (
    <div
      className={cn(
        'group flex overflow-hidden [--gap:1rem] [gap:var(--gap)]',
        className
      )}
      style={
        {
          '--duration': `${speed}s`,
        } as CSSProperties
      }
    >
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee',
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
      >
        {children}
      </div>
      <div
        className={cn(
          'flex min-w-full shrink-0 items-center justify-around gap-[var(--gap)] animate-marquee',
          reverse && '[animation-direction:reverse]',
          pauseOnHover && 'group-hover:[animation-play-state:paused]'
        )}
        aria-hidden="true"
      >
        {children}
      </div>
    </div>
  );
}

const images = [
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&h=400&fit=crop',
];

const images2 = [
  'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1617791160505-6f00504e3519?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1635776062127-d379bfcba9f8?w=400&h=400&fit=crop',
  'https://images.unsplash.com/photo-1548191265-cc70d3d45ba1?w=400&h=400&fit=crop',
];

function ScrambleButton() {
  const [displayText, setDisplayText] = useState('Read More');
  const [isScrambling, setIsScrambling] = useState(false);
  const originalText = 'Read More';
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';

  const scramble = () => {
    if (isScrambling) return;
    setIsScrambling(true);

    let iteration = 0;
    const maxIterations = originalText.length;

    const interval = setInterval(() => {
      setDisplayText(() =>
        originalText
          .split('')
          .map((letter, index) => {
            if (index < iteration) {
              return originalText[index];
            }
            return chars[Math.floor(Math.random() * chars.length)];
          })
          .join('')
      );

      if (iteration >= maxIterations) {
        clearInterval(interval);
        setIsScrambling(false);
        setDisplayText(originalText);
      }

      iteration += 1 / 3;
    }, 30);
  };

  return (
    <button
      type="button"
      onMouseEnter={scramble}
      className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-semibold hover:bg-primary/90 transition-colors"
    >
      {displayText}
    </button>
  );
}

export function HeroWithMarquee() {
  return (
    <section className="w-full bg-[#0F0F0F] text-white py-16 md:py-20 lg:py-24">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <p className="text-sm uppercase tracking-[0.2em] text-[#AAFF00]">
              Acquisition & Paid Media
            </p>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
              Systems that scale your acquisition, not just your ad spend.
            </h2>
            <p className="text-base md:text-lg text-neutral-300 max-w-xl">
              From Meta to Google, LinkedIn, and TikTok—I design performance engines that connect
              creative, targeting, and measurement into one clear growth loop.
            </p>
            <ScrambleButton />
          </div>

          <div className="space-y-4 overflow-hidden">
            <Marquee speed={30} reverse className="[--gap:1rem]">
              {images.map((src, idx) => (
                <div
                  key={src}
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`Acquisition visual ${idx + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </Marquee>
            <Marquee speed={30} className="[--gap:1rem]">
              {images2.map((src, idx) => (
                <div
                  key={src}
                  className="relative w-40 h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden flex-shrink-0"
                >
                  <Image
                    src={src}
                    alt={`Acquisition visual ${idx + 5}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </Marquee>
          </div>
        </div>
      </div>
    </section>
  );
}

