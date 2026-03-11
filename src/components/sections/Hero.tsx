'use client';

import * as React from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TextRotate } from '@/components/ui/text-rotate';
import { MagicText } from '@/components/ui/magic-text';
import Header from '@/components/layout/Header';
import BrandsMarquee from '@/components/sections/BrandsMarquee';

export interface FloatingIconsHeroProps {
  title: string;
  subtitle: string;
  ctaText: string;
  ctaHref: string;
}

const FloatingIconsHero = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & FloatingIconsHeroProps
>(({ className, title, subtitle, ctaText, ctaHref, ...props }, ref) => {
  return (
    <section
      ref={ref}
      className={cn(
        'relative w-full min-h-screen min-h-[100dvh] flex flex-col items-center overflow-hidden bg-black pb-8 md:pb-12',
        className
      )}
      {...props}
    >
      <Header />
      <div className="relative z-10 mx-auto w-full max-w-4xl text-center px-4 sm:max-w-4xl md:max-w-5xl pt-20 md:pt-14 lg:pt-20">
        <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground flex flex-col items-center justify-center">
          <LayoutGroup>
            <motion.span className="flex flex-col items-center gap-2 sm:gap-3 leading-[44px] sm:leading-[52px] md:leading-[58px] lg:leading-[75px]" layout>
              <motion.span
                className="pt-0.5 sm:pt-1 md:pt-2"
                layout
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              >
                I build systems that
              </motion.span>
              <TextRotate
                texts={[
                  'Convert!',
                  'Scale!',
                  'Perform!',
                  'Grow!',
                  'Sell!',
                  'Win!',
                  'Deliver!',
                ]}
                mainClassName="text-[#0F0F0F] text-[32px] sm:text-[38px] md:text-4xl lg:text-5xl font-extrabold px-1.5 sm:px-2 md:px-2.5 bg-[#AAFF00] overflow-hidden py-0.5 sm:py-0.5 md:py-1 justify-center rounded-lg leading-tight shadow-[0_0_25px_rgba(170,255,0,0.5),0_0_60px_rgba(170,255,0,0.2)]"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
            </motion.span>
          </LayoutGroup>
        </h1>
        <MagicText text={subtitle} className="mt-6 w-full max-w-4xl mx-auto text-base md:text-lg text-foreground md:max-w-5xl justify-center md:justify-start" />
        <div className="mt-10">
          <Button asChild size="lg" className="px-8 py-6 text-base font-semibold bg-[#AAFF00] text-[#0F0F0F] hover:bg-[#AAFF00]/90 hover:opacity-95 focus-visible:ring-[#AAFF00] dark:bg-[#AAFF00] dark:text-[#0F0F0F] dark:hover:bg-[#AAFF00]/90">
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        </div>
      </div>
      <div className="relative z-10 w-screen max-w-none left-1/2 -translate-x-1/2">
        <BrandsMarquee />
      </div>
    </section>
  );
});

FloatingIconsHero.displayName = 'FloatingIconsHero';

export { FloatingIconsHero };
