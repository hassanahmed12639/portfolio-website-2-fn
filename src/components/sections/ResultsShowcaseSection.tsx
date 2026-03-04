'use client';

import * as React from 'react';
import { ChevronRight, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';

const LIME = '#b3f000';
const BG_DARK = '#0a0a0a';
const CARD_BG = '#141414';

const pillsTop = [
  { label: 'RESULTS', variant: 'outline' as const },
  { label: 'Paid performance', variant: 'nav' as const, icon: ChevronRight },
];
const pillCta = 'Case studies';
const heading = 'Efficiently transform your campaign performance.';
const description =
  "A performance marketing approach that ties paid spend to revenue—with clear attribution, testing, and optimization so you stay focused on what actually scales.";

const floatingCards = [
  { name: 'Meta Ads', role: '3.2x ROAS', company: 'E-commerce' },
  { name: 'Google PMax', role: 'Lead Gen', company: 'SaaS Co' },
  { name: 'LinkedIn', role: 'B2B', company: 'Tech' },
  { name: 'TikTok', role: 'UGC', company: 'D2C' },
  { name: 'Attribution', role: 'MMM', company: 'Multi-touch' },
  { name: 'CRO', role: 'Landing', company: 'Conversion' },
  { name: 'Audiences', role: 'LAL', company: 'Retargeting' },
  { name: 'Reporting', role: 'Dashboards', company: 'Real-time' },
];

export default function ResultsShowcaseSection() {
  return (
    <section
      className={cn(
        'w-full overflow-hidden py-16 sm:py-20 md:py-24 px-4 sm:px-6',
        'flex flex-col items-center'
      )}
      style={{ backgroundColor: BG_DARK }}
      aria-labelledby="results-showcase-heading"
    >
      <div
        className={cn(
          'w-full max-w-6xl rounded-3xl p-6 sm:p-8 md:p-10 lg:p-12',
          'flex flex-col lg:flex-row lg:items-center lg:gap-12 xl:gap-16'
        )}
        style={{ backgroundColor: '#0f0f0f' }}
      >
        {/* Left column: tags, heading, description */}
        <div className="flex-1 lg:max-w-[480px]">
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {pillsTop.map((p) => (
              <button
                key={p.label}
                type="button"
                className={cn(
                  'inline-flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold',
                  p.variant === 'outline'
                    ? 'border-white/30 text-white bg-transparent'
                    : 'border-white/30 text-white bg-transparent hover:border-[#b3f000]/50'
                )}
              >
                {p.label}
                {p.icon && <p.icon className="h-3.5 w-3.5" />}
              </button>
            ))}
            <button
              type="button"
              className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-white/90"
            >
              <ChevronDown className="h-3.5 w-3.5" />
              Match yours
            </button>
          </div>

          <div
            className="rounded-full border border-white/20 inline-block px-3 py-1.5 text-xs font-medium text-white/80 mb-6"
            style={{ borderColor: `${LIME}40` }}
          >
            {pillCta}
          </div>

          <h2
            id="results-showcase-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-white mb-4"
            style={{
              fontFamily: 'var(--font-sans), "Segoe UI", sans-serif',
            }}
          >
            {heading}
          </h2>
          <p className="text-base sm:text-lg text-white/75 leading-relaxed max-w-lg">
            {description}
          </p>
        </div>

        {/* Right column: central visual + floating cards */}
        <div className="flex-1 relative min-h-[380px] sm:min-h-[420px] mt-10 lg:mt-0 flex items-center justify-center">
          {/* Central “hero” area */}
          <div
            className="relative w-full max-w-sm aspect-[4/5] rounded-2xl overflow-hidden flex items-center justify-center"
            style={{ backgroundColor: CARD_BG, border: `1px solid ${LIME}30` }}
          >
            <div
              className="absolute inset-0 opacity-20"
              style={{
                background: `radial-gradient(ellipse 80% 60% at 50% 40%, ${LIME}40, transparent)`,
              }}
            />
            <div className="relative z-10 text-center px-6">
              <div
                className="w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center text-3xl"
                style={{ backgroundColor: `${LIME}20`, color: LIME }}
              >
                📈
              </div>
              <p className="text-sm font-semibold text-white/90">Performance</p>
              <p className="text-xs text-white/60 mt-1">Data-driven growth</p>
            </div>
          </div>

          {/* Floating cards */}
          {floatingCards.map((card, i) => {
            const positions: Array<Record<string, string>> = [
              { top: '5%', left: '-2%' },
              { top: '0%', right: '-2%', left: 'auto' },
              { top: '22%', right: '-6%', left: 'auto' },
              { bottom: '32%', left: '-8%', top: 'auto' },
              { bottom: '8%', left: '0%', top: 'auto' },
              { bottom: '24%', right: '-4%', left: 'auto', top: 'auto' },
              { top: '48%', left: '-10%' },
              { top: '68%', right: '-6%', left: 'auto' },
            ];
            const pos = positions[i % positions.length];
            return (
              <div
                key={`${card.name}-${i}`}
                className="absolute w-[130px] sm:w-[150px] rounded-xl p-2.5 sm:p-3 shadow-xl border backdrop-blur-sm"
                style={{
                  ...pos,
                  backgroundColor: `${CARD_BG}f2`,
                  borderColor: `${LIME}50`,
                  zIndex: 10 + i,
                }}
              >
                <p className="text-xs font-bold text-white truncate">{card.name}</p>
                <p className="text-xs font-medium truncate" style={{ color: LIME }}>
                  {card.role}
                </p>
                <p className="text-[10px] text-white/60 truncate mt-0.5">{card.company}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
