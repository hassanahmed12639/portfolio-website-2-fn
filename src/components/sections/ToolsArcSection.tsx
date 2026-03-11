'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '@/lib/gsap';

const BG_DARK = '#000000';
const CARD_BG = '#ffffff';
const BORDER = 'rgba(255,255,255,0.12)';

const TOOLS = [
  { slug: 'meta', name: 'Meta' },
  { slug: 'googleads', name: 'Google Ads' },
  { slug: 'tiktok', name: 'TikTok' },
  { slug: 'snapchat', name: 'Snapchat' },
  { slug: 'googletagmanager', name: 'GTM' },
  { slug: 'shopify', name: 'Shopify' },
  { slug: 'woocommerce', name: 'WooCommerce' },
  { slug: 'googleanalytics', name: 'Google Analytics' },
  { slug: 'zapier', name: 'Zapier' },
  { slug: 'stripe', name: 'Stripe' },
  { slug: 'hotjar', name: 'Hotjar' },
  { slug: 'supabase', name: 'Supabase' },
  { slug: 'cursor', name: 'Cursor' },
];

export default function ToolsArcSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);
  const applyProgressRef = useRef<(p: number) => void>(() => {});
  const cardSize = 100;
  const gap = 20;

  useEffect(() => {
    registerGsapPlugins();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (!sectionRef.current || !containerRef.current) return;

      const iconElements = Array.from(containerRef.current.children) as HTMLDivElement[];
      const totalIcons = iconElements.length;
      if (totalIcons === 0) return;
      const iconWidth = cardSize + gap;
      const totalTrackWidth = totalIcons * iconWidth;
      const arcHeight = 85;

      const getArcY = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2;
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2);
        const mobileArcHeight = containerWidth < 768 ? 60 : arcHeight;
        return -mobileArcHeight * (1 - Math.min(1, normalizedX * normalizedX));
      };

      const getOpacity = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2;
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2);
        const distFromCenter = Math.abs(normalizedX);
        const isDesktop = containerWidth >= 768;
        const fadeStart = isDesktop ? 0.5 : 0.82;
        const fadeStrength = isDesktop ? 2.2 : 1.5;
        const minOpacity = isDesktop ? 0 : 0.4;
        if (distFromCenter > fadeStart) {
          return Math.max(minOpacity, 1 - (distFromCenter - fadeStart) * fadeStrength);
        }
        return 1;
      };

      const getScale = (x: number, containerWidth: number) => {
        const cardCenterX = x + cardSize / 2;
        const normalizedX = (cardCenterX - containerWidth / 2) / (containerWidth / 2);
        const distFromCenter = Math.abs(normalizedX);
        const centerScale = containerWidth < 768 ? 1.15 : 1.18;
        const shrinkAmount = containerWidth < 768 ? 0.22 : 0.2;
        return centerScale - Math.min(shrinkAmount, distFromCenter * 0.35);
      };

      const loops = 1.1;
      const totalMovement = totalTrackWidth * loops;

      const applyProgress = (progress: number) => {
        if (!containerRef.current) return;

        const containerWidth = containerRef.current.offsetWidth;
        if (!containerWidth) return;

        progressRef.current = progress;
        const centerX = containerWidth / 2 - cardSize / 2;
        const centerAnchorIndex = containerWidth < 768 ? 1 : 2;
        const initialXOffset = centerX - centerAnchorIndex * iconWidth;

        const p = Math.max(0, Math.min(1, progress));
        const rawOffset = p * totalMovement;
        const currentOffset = Math.round(rawOffset / iconWidth) * iconWidth;
        const wrapBoundary = iconWidth * 2;

        iconElements.forEach((icon, i) => {
          const baseX = i * iconWidth + initialXOffset;
          let x = baseX - currentOffset;
          while (x < -wrapBoundary) x += totalTrackWidth;
          while (x > containerWidth + wrapBoundary) x -= totalTrackWidth;
          const y = getArcY(x, containerWidth);
          const opacity = getOpacity(x, containerWidth);
          const scale = getScale(x, containerWidth);
          const roundedX = Math.round(x * 100) / 100;
          const roundedY = Math.round(y * 100) / 100;
          const isDesktop = containerWidth >= 768;
          gsap.to(icon, {
            x: roundedX,
            y: roundedY,
            opacity,
            scale,
            duration: isDesktop ? 0.22 : 0.12,
            ease: isDesktop ? 'power1.out' : 'power2.out',
            overwrite: true,
            force3D: true,
          });
          gsap.set(icon, {
            zIndex: Math.round(scale * 100),
          });
        });
      };

      applyProgress(0);
      applyProgressRef.current = applyProgress;

      const scrubVal = containerRef.current.offsetWidth >= 768 ? 10 : 6;
      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: '+=500vh',
        scrub: scrubVal,
        pin: true,
        pinSpacing: true,
        anticipatePin: 2,
        fastScrollEnd: true,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          progressRef.current = self.progress;
          applyProgress(self.progress);
        },
        onLeave: () => {
          applyProgress(1);
          requestAnimationFrame(() => applyProgress(1));
        },
        onRefresh: (self) => {
          applyProgress(self.progress);
        },
      });

      const container = containerRef.current;
      const sensitivity = 500;
      let startX = 0;
      let startProgress = 0;
      let isDragging = false;

      const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

      let activePointerId = 0;
      const onPointerDown = (e: PointerEvent) => {
        if ((e.target as HTMLElement).closest('a, button')) return;
        isDragging = true;
        activePointerId = e.pointerId;
        startX = e.clientX;
        startProgress = progressRef.current;
        container.setPointerCapture?.(e.pointerId);
      };

      const onPointerMove = (e: PointerEvent) => {
        if (!isDragging) return;
        const deltaX = startX - e.clientX;
        const offset = deltaX / sensitivity;
        applyProgressRef.current(clamp01(startProgress + offset));
      };

      const onPointerUp = () => {
        if (!isDragging) return;
        isDragging = false;
        try {
          container.releasePointerCapture?.(activePointerId);
        } catch {
          /* ignore */
        }
      };

      container.addEventListener('pointerdown', onPointerDown);
      container.addEventListener('pointermove', onPointerMove);
      container.addEventListener('pointerup', onPointerUp);
      container.addEventListener('pointerleave', onPointerUp);

      ScrollTrigger.refresh();

      return () => {
        container.removeEventListener('pointerdown', onPointerDown);
        container.removeEventListener('pointermove', onPointerMove);
        container.removeEventListener('pointerup', onPointerUp);
        container.removeEventListener('pointerleave', onPointerUp);
      };
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="w-full min-h-screen flex flex-col items-center justify-center overflow-hidden py-24 md:py-32 px-4 sm:px-6"
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="tools-arc-heading"
    >
      <div className="w-full max-w-6xl mx-auto space-y-14 md:space-y-16">
        <div className="space-y-3 text-center">
          <h2
            id="tools-arc-heading"
            className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white"
            style={{
              fontFamily:
                'var(--font-sans), "Segoe UI", -apple-system, BlinkMacSystemFont, sans-serif',
            }}
          >
            Tools I Use
          </h2>
          <p className="text-base sm:text-lg text-white/65 max-w-2xl mx-auto">
            Platforms and technologies that power my marketing systems and tracking solutions.
          </p>
        </div>

        <div
          ref={containerRef}
          className="relative w-full h-[280px] md:h-[320px] overflow-hidden shrink-0 max-w-[90vw] mx-auto cursor-grab active:cursor-grabbing touch-none select-none"
          style={{
            contain: 'layout style paint',
            transform: 'translateZ(0)',
          }}
        >
          {TOOLS.map((tool) => (
            <div
              key={tool.slug}
              className="absolute flex items-center justify-center rounded-xl overflow-hidden"
              style={{
                width: `${cardSize}px`,
                height: `${cardSize}px`,
                left: 0,
                top: '50%',
                marginTop: `-${cardSize / 2}px`,
                backgroundColor: CARD_BG,
                border: '0.75px solid',
                borderColor: BORDER,
                willChange: 'transform, opacity',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                transform: 'translateZ(0)',
                boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
              }}
            >
              <img
                src={`https://cdn.simpleicons.org/${tool.slug}`}
                alt={tool.name}
                className="w-12 h-12 object-contain"
                draggable={false}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
