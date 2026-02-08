"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsapPlugins } from "../../lib/gsap";
import { Globe, TrendingUp, ArrowLeftRight, Calendar, Lock } from "lucide-react";

type CardSize = "largest" | "medium" | "smallMedium" | "small";

const CARDS_LAYOUT: {
  color: string;
  size: CardSize;
  zIndex: number;
}[] = [
  { color: "#F6F7ED", size: "largest", zIndex: 1 },   // Top-left: Man with phone (image)
  { color: "#F6F7ED", size: "medium", zIndex: 3 },   // Top-right: Conversion Rate
  { color: "#E94F37", size: "largest", zIndex: 2 },   // Bottom-left: Exchange (accent)
  { color: "#F6F7ED", size: "small", zIndex: 5 },     // Bottom-right: Coffee (image)
  { color: "#ffffff", size: "medium", zIndex: 4 },   // Right-center: Cross-Platform Scaling (white, accent border)
];

export default function UnifyFinancesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    registerGsapPlugins();
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      const section = sectionRef.current as HTMLElement;
      const sectionWidth = section.offsetWidth;
      const sectionHeight = section.offsetHeight;

      const offScreenOffset = 600;
      const stackOffset = 6; // offset for final stacking
      const startPositions = [
        { x: -(sectionWidth / 2 + offScreenOffset), y: -(sectionHeight / 2 + offScreenOffset) }, // top-left - card 0
        { x: sectionWidth / 2 + offScreenOffset + stackOffset, y: -(sectionHeight / 2 + offScreenOffset) }, // top-right - card 1
        { x: -(sectionWidth / 2 + offScreenOffset), y: sectionHeight / 2 + offScreenOffset }, // bottom-left - card 2
        { x: sectionWidth / 2 + offScreenOffset + stackOffset, y: sectionHeight / 2 + offScreenOffset }, // bottom-right - card 3
        { x: sectionWidth / 2 + offScreenOffset, y: 0 }, // right-center - card 4
      ];

      cardsRef.current.forEach((card, i) => {
        if (card && startPositions[i]) {
          gsap.set(card, {
            x: startPositions[i].x,
            y: startPositions[i].y,
            opacity: 1,
            force3D: true,
            transformOrigin: "center center",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
          });
        }
      });

      // Set initial state for text: fully visible and normal size by default
      // Use xPercent and yPercent for proper centering via transforms
      if (textRef.current) {
        gsap.set(textRef.current, {
          xPercent: -50,
          yPercent: -50,
          left: "50%",
          top: "50%",
          y: 0,
          opacity: 1,
          scale: 1,
          force3D: true,
          smoothOrigin: true,
        });
      }

      // Calculate when all animations finish
      // Cards finish around position 1.9, final stack at 3.0
      // Add 100% scroll distance after all animations (2 scroll wheel events)
      // Total: 250% for animations + 100% delay = 350% scroll distance
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top top",
          end: "+=300%",
          scrub: 3,
          pin: true,
        },
      });

      const animationConfig = {
        duration: 3,
        ease: "sine.out" as const,
        force3D: true,
        immediateRender: false,
      };

      cardsRef.current.forEach((card, i) => {
        if (card) {
          gsap.set(card, { boxShadow: "none" });
          tl.to(
            card,
            {
              x: (i % 2) * 6, // slight offset for stacking (left/right)
              y: Math.floor(i / 2) * 6, // slight offset for stacking (top/bottom)
              opacity: 1,
              ...animationConfig,
            },
            i * 0.3 // stagger slightly - each card starts after the previous
          );
          tl.to(
            card,
            {
              boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
              duration: 0.1,
            },
            `>${i * 0.3 + 2.9}` // Add shadow near the end of each card's animation
          );
        }
      });

      /* Text gradually shrinks as cards approach */
      tl.to(
        textRef.current,
        {
          scale: 0.45,
          opacity: 0,
          duration: 3.5,
          ease: "none",
          force3D: true,
          smoothOrigin: true,
        },
        0 // Start shrinking as soon as scrolling begins
      );

      // Cards are already in final stacked position, no additional animation needed

      // Add empty timeline space after all animations finish (for 2 scroll events)
      // This creates scrollable space where nothing animates, just static final state
      // All animations finish around position 3.0, so delay starts after that
      tl.to({}, { duration: 0.5 }, ">");
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden flex items-center justify-center bg-designBg"
        aria-label="Winning Your Audience section"
      >
        {/* CENTER TEXT - Behind cards */}
        <h1
          ref={textRef}
          className="absolute text-center text-[clamp(3.5rem,9vw,7rem)] md:text-[clamp(4.5rem,10.5vw,8.5rem)] lg:text-[clamp(5.5rem,12.5vw,10.5rem)] xl:text-[clamp(6rem,14vw,12rem)] 2xl:text-[clamp(7rem,16vw,14rem)] font-bold tracking-tight z-0 px-4 leading-[1.1]"
          style={{ 
            willChange: "transform, opacity", 
            color: "#E94F37",
            backfaceVisibility: "hidden",
            WebkitBackfaceVisibility: "hidden",
            transform: "translateZ(0)",
            WebkitTransform: "translateZ(0)"
          }}
        >
          <span className="block whitespace-nowrap">Winning Your</span>
          <span className="block mt-0 whitespace-nowrap">Audience</span>
        </h1>

        {/* CARDS - On top */}
        <div className="relative w-full h-full pointer-events-none z-10" style={{ overflow: "hidden" }}>
          {(() => {
            const sizeClasses: Record<CardSize, string> = {
              largest:
                "w-[96px] h-[110px] xs:w-[120px] xs:h-[138px] sm:w-[144px] sm:h-[166px] md:w-[160px] md:h-[184px] lg:w-[192px] lg:h-[220px] xl:w-[224px] xl:h-[256px] 2xl:w-[256px] 2xl:h-[294px]",
              medium:
                "w-[94px] h-[112px] xs:w-[118px] xs:h-[140px] sm:w-[142px] sm:h-[168px] md:w-[156px] md:h-[188px] lg:w-[188px] lg:h-[224px] xl:w-[220px] xl:h-[262px] 2xl:w-[250px] 2xl:h-[300px]",
              smallMedium:
                "w-[86px] h-[84px] xs:w-[108px] xs:h-[102px] sm:w-[130px] sm:h-[124px] md:w-[144px] md:h-[138px] lg:w-[172px] lg:h-[166px] xl:w-[200px] xl:h-[192px] 2xl:w-[230px] 2xl:h-[220px]",
              small:
                "w-[82px] h-[86px] xs:w-[100px] xs:h-[108px] sm:w-[122px] sm:h-[130px] md:w-[136px] md:h-[144px] lg:w-[162px] lg:h-[172px] xl:w-[190px] xl:h-[200px] 2xl:w-[216px] 2xl:h-[230px]",
            };
            return CARDS_LAYOUT.map((card, i) => (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className={`absolute left-1/2 top-1/2 ${sizeClasses[card.size]} rounded-2xl sm:rounded-3xl`}
              style={{
                backgroundColor: card.color,
                opacity: 1,
                zIndex: card.zIndex,
                transform: "translate(-50%, -50%) translateZ(0)",
                willChange: "transform, opacity",
                backfaceVisibility: "hidden",
                WebkitBackfaceVisibility: "hidden",
                WebkitTransform: "translate(-50%, -50%) translateZ(0)",
                outline: "none",
                ...(i === 4 ? { border: "none", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.08)", overflow: "visible" as const } : { border: "0", borderWidth: "0", borderStyle: "none", boxShadow: "none", overflow: "hidden" as const }),
                isolation: "isolate",
                contain: i === 4 ? "none" : "layout style paint",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
              aria-hidden="true"
            >
              {i === 0 ? (
                <div className="h-full w-full">
                  <img
                    src="/man-phone.jpeg"
                    alt="Person with phone at desk"
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                </div>
              ) : i === 1 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-designBg" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-semibold text-textPrimary">Conversion Rate</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-textPrimary">15.7%</span>
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-accent flex-shrink-0" />
                    </div>
                    <div className="text-xs sm:text-sm text-textPrimary/70 mt-2">
                      impressions: 8.9M / Clicks: 670K
                    </div>
                  </div>
                  <div className="mt-auto">
                    <button className="w-full bg-accent hover:bg-accentHover text-designBg text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 rounded-full transition-colors border border-accent/20">
                      Analyze Funnel
                    </button>
                  </div>
                </div>
              ) : i === 2 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center gap-2 mb-3 sm:mb-4">
                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-designBg/90" />
                    <span className="text-xs sm:text-sm md:text-base text-designBg/90 font-medium">
                      Exchange
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center gap-1 sm:gap-1.5">
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-designBg">
                      Campaign ROI
                    </div>
                    <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-designBg leading-tight">
                      +350%
                    </div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-designBg">
                      Budget Allocation
                    </div>
                    <div className="text-xs sm:text-sm md:text-base font-semibold text-designBg">
                      Optimization +€12k
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="inline-flex items-center px-3 sm:px-4 py-1.5 sm:py-2 bg-designBg/20 rounded-full">
                      <span className="text-xs sm:text-sm font-medium text-designBg">Approved</span>
                    </div>
                  </div>
                </div>
              ) : i === 3 ? (
                <div className="h-full w-full relative">
                  <img
                    src="/coffee.jpeg"
                    alt="People enjoying coffee"
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                  <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex items-center gap-1.5 px-2 py-1.5 sm:px-3 sm:py-2 bg-white/95 rounded-lg shadow-sm">
                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-textPrimary flex-shrink-0" />
                    <span className="text-xs sm:text-sm font-medium text-textPrimary">Enjoy the coffee!</span>
                  </div>
                </div>
              ) : i === 4 ? (
                <div className="h-full flex flex-col p-2 sm:p-3 md:p-4 items-center text-center overflow-visible">
                  <h3 className="text-xs sm:text-sm font-medium text-textPrimary mb-1.5 sm:mb-2 flex-shrink-0">
                    Cross-Platform Scaling
                  </h3>
                  <div className="flex-1 min-h-0 w-full flex items-center justify-center py-1">
                    <svg viewBox="0 0 120 100" className="w-full h-full max-h-[72px] sm:max-h-[88px] md:max-h-[100px]" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#a5f3fc" />
                          <stop offset="100%" stopColor="#67e8f9" />
                        </linearGradient>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                          <path d="M0,0 L6,3 L0,6 Z" fill="#94a3b8" />
                        </marker>
                      </defs>
                      <path d="M35 12 L85 12 L70 55 L50 55 Z" fill="url(#funnelGrad)" stroke="#a5f3fc" strokeWidth="0.5" />
                      <line x1="20" y1="25" x2="38" y2="35" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="20" y1="55" x2="45" y2="48" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="82" y1="35" x2="100" y2="25" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="75" y1="48" x2="100" y2="55" stroke="#cbd5e1" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <circle cx="18" cy="25" r="10" fill="white" stroke="#a5f3fc" strokeWidth="1" />
                      <circle cx="18" cy="55" r="10" fill="white" stroke="#a5f3fc" strokeWidth="1" />
                      <circle cx="102" cy="25" r="10" fill="white" stroke="#a5f3fc" strokeWidth="1" />
                      <circle cx="102" cy="55" r="10" fill="white" stroke="#a5f3fc" strokeWidth="1" />
                      <g transform="translate(13.5, 20.5) scale(0.5)" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </g>
                      <g transform="translate(13, 50) scale(0.5)" fill="none" stroke="#22d3ee" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="14" height="12" rx="2" />
                        <path d="m2 7 7 5 7-5" />
                      </g>
                      <text x="102" y="28" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#1f2937" }}>18%</text>
                      <text x="102" y="58" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#1f2937" }}>50%</text>
                    </svg>
                  </div>
                  <div className="rounded-full bg-accent px-3 py-1.5 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-designBg">Customer Journey</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-textPrimary/60 mt-1 flex-shrink-0">
                    <span>0</span>
                    <span className="w-3 h-3 rounded-full bg-gray-300/80" aria-hidden />
                    <span>2</span>
                  </div>
                </div>
              ) : null}
            </div>
            ));
          })()}
        </div>
      </section>
    </>
  );
}
