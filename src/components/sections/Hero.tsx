'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

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
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight bg-gradient-to-b from-foreground to-foreground/70 text-transparent bg-clip-text">
          {title}
        </h1>
        <p className="mt-6 max-w-xl mx-auto text-lg text-muted-foreground">
          {subtitle}
        </p>
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
