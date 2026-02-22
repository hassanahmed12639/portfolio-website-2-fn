"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsapPlugins } from "../../lib/gsap";
import { Globe, TrendingUp, ArrowLeftRight } from "lucide-react";

type CardSize = "largest" | "medium" | "smallMedium" | "small";

const CARDS_LAYOUT: {
  color: string;
  size: CardSize;
  zIndex: number;
}[] = [
  { color: "#FFFFFF", size: "largest", zIndex: 1 },   // Top-left: Man with phone (image) - light section card
  { color: "#FFFFFF", size: "medium", zIndex: 3 },   // Top-right: Conversion Rate - light section card
  { color: "#AAFF00", size: "largest", zIndex: 2 },   // Bottom-left: Exchange (accent)
  { color: "#FFFFFF", size: "small", zIndex: 5 },     // Bottom-right: Coffee (image) - light section card
  { color: "#FFFFFF", size: "medium", zIndex: 4 },   // Right-center: Cross-Platform Scaling - light section card
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

      const stackOffset = 6; // offset for final stacking
      const BASE_W = 1062;
      const BASE_H = 602;
      const sx = sectionWidth / BASE_W;
      const sy = sectionHeight / BASE_H;
      const startPositions = [
        // Pixel-tuned against 1062x602 reference; starts out of frame and enters on scroll.
        { x: -730 * sx, y: -390 * sy }, // top-left - card 0
        { x: 730 * sx + stackOffset, y: -380 * sy }, // top-right - card 1
        { x: -760 * sx, y: -40 * sy }, // left-middle - card 2
        { x: 770 * sx + stackOffset, y: 140 * sy }, // right-middle - card 3
        { x: -180 * sx, y: 430 * sy }, // bottom center-left - card 4
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
          end: "+=165%",
          scrub: 1.7,
          pin: true,
          pinSpacing: true,
          anticipatePin: 4,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
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
          ease: "power1.inOut",
          force3D: true,
          smoothOrigin: true,
        },
        0 // Start shrinking as soon as scrolling begins
      );

      // Cards are already in final stacked position, no additional animation needed

      // No extra hold here: once stacked, next scroll continues to next section.
    }, sectionRef);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden flex items-center justify-center bg-[#FFFFFF]"
        aria-label="Winning Your Audience section"
      >
        {/* CENTER TEXT - Behind cards */}
        <h1
          ref={textRef}
          className="absolute text-center text-[clamp(3.5rem,9vw,7rem)] md:text-[clamp(4.5rem,10.5vw,8.5rem)] lg:text-[clamp(5.5rem,12.5vw,10.5rem)] xl:text-[clamp(6rem,14vw,12rem)] 2xl:text-[clamp(7rem,16vw,14rem)] font-bold tracking-tight z-0 px-4 leading-[1.1] text-[#0F0F0F]"
          style={{ 
            willChange: "transform, opacity", 
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
                "w-[116px] h-[130px] xs:w-[142px] xs:h-[160px] sm:w-[158px] sm:h-[176px] md:w-[154px] md:h-[172px] lg:w-[166px] lg:h-[186px] xl:w-[178px] xl:h-[200px] 2xl:w-[190px] 2xl:h-[214px]",
              medium:
                "w-[114px] h-[132px] xs:w-[140px] xs:h-[162px] sm:w-[154px] sm:h-[178px] md:w-[150px] md:h-[168px] lg:w-[162px] lg:h-[182px] xl:w-[174px] xl:h-[194px] 2xl:w-[186px] 2xl:h-[208px]",
              smallMedium:
                "w-[104px] h-[102px] xs:w-[126px] xs:h-[120px] sm:w-[136px] sm:h-[130px] md:w-[134px] md:h-[130px] lg:w-[144px] lg:h-[140px] xl:w-[154px] xl:h-[150px] 2xl:w-[164px] 2xl:h-[160px]",
              small:
                "w-[100px] h-[104px] xs:w-[118px] xs:h-[126px] sm:w-[132px] sm:h-[136px] md:w-[142px] md:h-[144px] lg:w-[154px] lg:h-[156px] xl:w-[164px] xl:h-[166px] 2xl:w-[176px] 2xl:h-[178px]",
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
                ...(i === 4 ? { border: "1px solid #E5E5E5", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", overflow: "visible" as const } : i !== 2 ? { border: "1px solid #E5E5E5", boxShadow: "0 2px 20px rgba(0,0,0,0.06)", overflow: "hidden" as const } : { border: "0", borderWidth: "0", borderStyle: "none", boxShadow: "none", overflow: "hidden" as const }),
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
                    src="/image-2.png"
                    alt="Person with phone at desk"
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                </div>
              ) : i === 1 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
                  <div className="flex items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-[#AAFF00] flex items-center justify-center flex-shrink-0">
                      <Globe className="w-3 h-3 sm:w-4 sm:h-4 text-[#0F0F0F]" />
                    </div>
                    <span className="text-xs sm:text-sm md:text-base font-semibold text-[#0F0F0F]">Conversion Rate</span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#0F0F0F]">15.7%</span>
                      <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-[#AAFF00] flex-shrink-0" />
                    </div>
                    <div className="text-xs sm:text-sm text-[#555555] mt-2">
                      impressions: 8.9M / Clicks: 670K
                    </div>
                  </div>
                  <div className="mt-auto">
                    <button className="w-full bg-[#AAFF00] hover:bg-[#AAFF00] text-[#0F0F0F] text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 rounded-full transition-colors border border-[#AAFF00]/20">
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
                <div className="h-full w-full">
                  <img
                    src="/image-1.png"
                    alt=""
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                </div>
              ) : i === 4 ? (
                <div className="h-full flex flex-col p-2 sm:p-3 md:p-4 items-center text-center overflow-visible">
                  <h3 className="text-xs sm:text-sm font-medium text-[#0F0F0F] mb-1.5 sm:mb-2 flex-shrink-0">
                    Cross-Platform Scaling
                  </h3>
                  <div className="flex-1 min-h-0 w-full flex items-center justify-center py-1">
                    <svg viewBox="0 0 120 100" className="w-full h-full max-h-[72px] sm:max-h-[88px] md:max-h-[100px]" preserveAspectRatio="xMidYMid meet">
                      <defs>
                        <linearGradient id="funnelGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stopColor="#AAFF00" />
                          <stop offset="100%" stopColor="rgba(170,255,0,0.5)" />
                        </linearGradient>
                        <marker id="arrow" markerWidth="6" markerHeight="6" refX="5" refY="3" orient="auto">
                          <path d="M0,0 L6,3 L0,6 Z" fill="#888888" />
                        </marker>
                      </defs>
                      <path d="M35 12 L85 12 L70 55 L50 55 Z" fill="url(#funnelGrad)" stroke="#AAFF00" strokeWidth="0.5" />
                      <line x1="20" y1="25" x2="38" y2="35" stroke="#888888" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="20" y1="55" x2="45" y2="48" stroke="#888888" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="82" y1="35" x2="100" y2="25" stroke="#888888" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <line x1="75" y1="48" x2="100" y2="55" stroke="#888888" strokeWidth="0.8" strokeDasharray="3 2" markerEnd="url(#arrow)" />
                      <circle cx="18" cy="25" r="10" fill="white" stroke="#AAFF00" strokeWidth="1" />
                      <circle cx="18" cy="55" r="10" fill="white" stroke="#AAFF00" strokeWidth="1" />
                      <circle cx="102" cy="25" r="10" fill="white" stroke="#AAFF00" strokeWidth="1" />
                      <circle cx="102" cy="55" r="10" fill="white" stroke="#AAFF00" strokeWidth="1" />
                      <g transform="translate(13.5, 20.5) scale(0.5)" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                        <path d="M3 3v5h5" />
                      </g>
                      <g transform="translate(13, 50) scale(0.5)" fill="none" stroke="#AAFF00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="4" width="14" height="12" rx="2" />
                        <path d="m2 7 7 5 7-5" />
                      </g>
                      <text x="102" y="28" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#1f2937" }}>18%</text>
                      <text x="102" y="58" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#1f2937" }}>50%</text>
                    </svg>
                  </div>
                  <div className="rounded-full bg-[#AAFF00] px-3 py-1.5 flex-shrink-0">
                    <span className="text-xs sm:text-sm font-medium text-[#0F0F0F]">Customer Journey</span>
                  </div>
                  <div className="flex items-center justify-center gap-1 sm:gap-1.5 text-[10px] sm:text-xs text-[#555555] mt-1 flex-shrink-0">
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
