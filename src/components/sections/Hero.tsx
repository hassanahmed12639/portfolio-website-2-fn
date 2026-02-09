'use client';

import * as React from 'react';
import { LayoutGroup, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { TextRotate } from '@/components/ui/text-rotate';
import { MagicText } from '@/components/ui/magic-text';

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
        'relative w-full flex items-center justify-center overflow-hidden bg-background pt-12 pb-20 md:pt-16 md:pb-24 lg:pt-20 lg:pb-28',
        className
      )}
      {...props}
    >
      <div className="relative z-10 text-center px-4">
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 text-transparent bg-clip-text flex flex-col items-center justify-center">
          <LayoutGroup>
            <motion.span className="flex flex-col items-center gap-3 leading-[75px]" layout>
              <motion.span
                className="pt-0.5 sm:pt-1 md:pt-2"
                layout
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              >
                I build systems
              </motion.span>
              <span className="inline-flex items-center justify-center">
                <span className="mr-2 sm:mr-2.5 md:mr-3">that </span>
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
                mainClassName="text-white text-[38px] md:text-5xl px-1.5 sm:px-2 md:px-2.5 bg-[#ff5941] overflow-hidden py-0.5 sm:py-0.5 md:py-1 justify-center rounded-lg leading-tight"
                staggerFrom="last"
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '-120%' }}
                staggerDuration={0.025}
                splitLevelClassName="overflow-hidden pb-0.5 sm:pb-1 md:pb-1"
                transition={{ type: 'spring', damping: 30, stiffness: 400 }}
                rotationInterval={2000}
              />
              </span>
            </motion.span>
          </LayoutGroup>
        </h1>
        <MagicText text={subtitle} className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground" />
        <div className="mt-10">
          <Button asChild size="lg" className="px-8 py-6 text-base font-semibold">
            <a href={ctaHref}>{ctaText}</a>
          </Button>
        </div>
      </div>
    </section>
  );
});

FloatingIconsHero.displayName = 'FloatingIconsHero';

export { FloatingIconsHero };
