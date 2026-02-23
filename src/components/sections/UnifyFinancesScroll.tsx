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
            xPercent: -50,
            yPercent: -50,
            x: startPositions[i].x,
            y: startPositions[i].y,
            scale: 0.35,
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
          scrub: 2.5,
          pin: true,
          pinSpacing: true,
          anticipatePin: 4,
          fastScrollEnd: true,
          invalidateOnRefresh: true,
        },
      });

      const animationConfig = {
        duration: 3.2,
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
              xPercent: -50,
              yPercent: -50,
              x: (i % 2) * 6, // slight offset for stacking (left/right)
              y: Math.floor(i / 2) * 6, // slight offset for stacking (top/bottom)
              scale: 1,
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
                "w-[136px] h-[150px] xs:w-[150px] xs:h-[168px] sm:w-[158px] sm:h-[176px] md:w-[154px] md:h-[172px] lg:w-[176px] lg:h-[196px] xl:w-[188px] xl:h-[210px] 2xl:w-[200px] 2xl:h-[224px]",
              medium:
                "w-[134px] h-[152px] xs:w-[148px] xs:h-[170px] sm:w-[154px] sm:h-[178px] md:w-[150px] md:h-[168px] lg:w-[172px] lg:h-[192px] xl:w-[184px] xl:h-[204px] 2xl:w-[196px] 2xl:h-[218px]",
              smallMedium:
                "w-[122px] h-[120px] xs:w-[134px] xs:h-[128px] sm:w-[136px] sm:h-[130px] md:w-[134px] md:h-[130px] lg:w-[154px] lg:h-[150px] xl:w-[164px] xl:h-[160px] 2xl:w-[174px] 2xl:h-[170px]",
              small:
                "w-[118px] h-[122px] xs:w-[126px] xs:h-[134px] sm:w-[132px] sm:h-[136px] md:w-[142px] md:h-[144px] lg:w-[164px] lg:h-[166px] xl:w-[174px] xl:h-[176px] 2xl:w-[186px] 2xl:h-[188px]",
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
                <div className="h-full flex flex-col p-2 sm:p-3 md:p-4 items-center text-center">
                  <h3 className="text-[10px] sm:text-sm font-semibold text-[#0F0F0F] mb-1 sm:mb-2 flex-shrink-0">
                    Conversion Rate
                  </h3>
                  <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center gap-0.5 sm:gap-1.5 py-0.5 sm:py-1 mt-1 sm:mt-0">
                    <div className="w-6 h-6 sm:w-9 sm:h-9 rounded-full bg-[#AAFF00] flex items-center justify-center flex-shrink-0 -mt-0.5 sm:mt-0">
                      <Globe className="w-3 h-3 sm:w-5 sm:h-5 text-[#0F0F0F]" />
                    </div>
                    <div className="flex items-center justify-center gap-1 sm:gap-1.5">
                      <span className="text-sm sm:text-xl md:text-2xl font-bold text-[#0F0F0F]">15.7%</span>
                      <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-[#0F0F0F] flex-shrink-0" />
                    </div>
                    <p className="text-[9px] sm:text-xs text-[#757575] leading-tight">
                      impressions: 8.9M / Clicks: 670K
                    </p>
                  </div>
                  <button className="w-full max-w-[90%] mt-1.5 sm:mt-2 bg-[#AAFF00] hover:opacity-95 text-[#0F0F0F] text-[9px] sm:text-xs font-bold py-1.5 sm:py-2.5 rounded-full transition-opacity flex-shrink-0 shadow-sm">
                    Analyze Funnel
                  </button>
                </div>
              ) : i === 2 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6 text-left text-[#0F0F0F]">
                  <div className="mb-2 sm:mb-3">
                    <div className="text-[10px] sm:text-xs md:text-sm font-bold">
                      Profitability
                    </div>
                    <div className="text-[9px] sm:text-[10px] md:text-xs font-semibold">
                      E-commerce Growth
                    </div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-lg sm:text-xl md:text-2xl font-bold leading-tight">
                      4.2x ROAS
                    </div>
                    <div className="text-[8px] sm:text-[9px] md:text-[10px] text-[#0F0F0F]/70 mt-1.5">
                      Reduced CPA by 22% YoY
                    </div>
                  </div>
                  <div className="mt-auto pt-2">
                    <div className="inline-flex items-center px-4 sm:px-5 py-2 sm:py-2.5 bg-[#0F0F0F] rounded-full shadow-sm">
                      <span className="text-[10px] sm:text-xs font-semibold text-white">
                        Shopify + Meta
                      </span>
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
                  <h3 className="text-[11px] sm:text-xs font-bold text-[#0F0F0F] mb-2 sm:mb-3 flex-shrink-0 leading-tight">
                    <span className="block">Technical</span>
                    <span className="block">Tracking Accuracy</span>
                  </h3>
                  <div className="flex-1 min-h-0 w-full flex flex-col items-center justify-center py-1">
                    <div className="relative w-[128px] h-[76px] sm:w-[140px] sm:h-[82px] flex items-center justify-center flex-shrink-0">
                      <svg viewBox="0 0 162 96" className="w-full h-full" preserveAspectRatio="xMidYMid meet">
                        <defs>
                          <path id="lensShape" d="M 81 54 A 25 25 0 0 1 81 29 A 25 25 0 0 1 81 54 Z" />
                          <clipPath id="topClip">
                            <rect x="0" y="0" width="162" height="44" />
                          </clipPath>
                          <clipPath id="bottomClip">
                            <rect x="0" y="44" width="162" height="52" />
                          </clipPath>
                        </defs>
                        <use href="#lensShape" fill="#AAFF00" clipPath="url(#topClip)" />
                        <use href="#lensShape" fill="#1f6b2e" clipPath="url(#bottomClip)" />
                        <circle cx="56" cy="44" r="25" fill="#FFFFFF" stroke="#AAFF00" strokeWidth="2" />
                        <circle cx="94" cy="44" r="25" fill="#FFFFFF" stroke="#AAFF00" strokeWidth="2" />
                        <text x="56" y="42" textAnchor="middle" style={{ fontSize: "9px", fontWeight: 600, fill: "#0F0F0F" }}>
                          CAPI
                        </text>
                        <text x="56" y="52" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#0F0F0F" }}>
                          (98%)
                        </text>
                        <text x="94" y="42" textAnchor="middle" style={{ fontSize: "9px", fontWeight: 600, fill: "#0F0F0F" }}>
                          GTM
                        </text>
                        <text x="94" y="52" textAnchor="middle" style={{ fontSize: "8px", fontWeight: 600, fill: "#0F0F0F" }}>
                          (98%)
                        </text>
                      </svg>
                    </div>
                    <p className="text-xs sm:text-base font-bold text-[#0F0F0F] text-center -mt-2.5 sm:-mt-1.5">
                      98% Match Rate
                    </p>
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
