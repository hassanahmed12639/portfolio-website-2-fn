"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsapPlugins } from "@/lib/gsap";
import { TrendingDown, BarChart3, ArrowLeftRight, CheckCircle2, Megaphone, Lock } from "lucide-react";

type CardSize = "largest" | "medium" | "smallMedium" | "small";

const CARDS_LAYOUT: {
  color: string;
  size: CardSize;
  zIndex: number;
}[] = [
  { color: "#5897D4", size: "medium", zIndex: 3 }, // Blue EUR
  { color: "#2CC84D", size: "largest", zIndex: 2 }, // Green Exchange
  { color: "#FCDA7F", size: "small", zIndex: 4 }, // Pink
  { color: "#EF4444", size: "largest", zIndex: 5 }, // Coffee
  { color: "#8B5CF6", size: "smallMedium", zIndex: 1 }, // Person laptop
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
            opacity: 0,
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
        opacity: 1,
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
        className="relative h-screen overflow-hidden flex items-center justify-center bg-white"
        aria-label="Winning Your Audience section"
      >
        {/* CENTER TEXT - Behind cards */}
        <h1
          ref={textRef}
          className="absolute text-center text-[clamp(3.5rem,9vw,7rem)] md:text-[clamp(4.5rem,10.5vw,8.5rem)] lg:text-[clamp(5.5rem,12.5vw,10.5rem)] xl:text-[clamp(6rem,14vw,12rem)] 2xl:text-[clamp(7rem,16vw,14rem)] font-bold tracking-tight z-0 px-4 leading-[1.1]"
          style={{ 
            willChange: "transform, opacity", 
            color: "#FF4B3A",
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
                "w-[120px] h-[115px] xs:w-[150px] xs:h-[143px] sm:w-[180px] sm:h-[172px] md:w-[200px] md:h-[191px] lg:w-[240px] lg:h-[230px] xl:w-[280px] xl:h-[268px] 2xl:w-[320px] 2xl:h-[306px]",
              medium:
                "w-[104px] h-[100px] xs:w-[131px] xs:h-[124px] sm:w-[157px] sm:h-[150px] md:w-[174px] md:h-[166px] lg:w-[209px] lg:h-[200px] xl:w-[244px] xl:h-[233px] 2xl:w-[278px] 2xl:h-[266px]",
              smallMedium:
                "w-[96px] h-[92px] xs:w-[120px] xs:h-[114px] sm:w-[144px] sm:h-[138px] md:w-[160px] md:h-[153px] lg:w-[192px] lg:h-[184px] xl:w-[224px] xl:h-[214px] 2xl:w-[256px] 2xl:h-[245px]",
              small:
                "w-[90px] h-[86px] xs:w-[113px] xs:h-[107px] sm:w-[135px] sm:h-[129px] md:w-[150px] md:h-[143px] lg:w-[180px] lg:h-[173px] xl:w-[210px] xl:h-[201px] 2xl:w-[240px] 2xl:h-[230px]",
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
                border: "0",
                borderWidth: "0",
                borderStyle: "none",
                boxShadow: "none",
                overflow: "hidden",
                isolation: "isolate",
                contain: "layout style paint",
                WebkitFontSmoothing: "antialiased",
                MozOsxFontSmoothing: "grayscale",
              }}
              aria-hidden="true"
            >
              {i === 0 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
                  {/* White Content Panel */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-3 sm:p-4 md:p-5 flex-1 flex flex-col mb-3 sm:mb-4">
                    {/* Top Row */}
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-full bg-blue-600 flex items-center justify-center flex-shrink-0">
                          <span className="text-white text-[10px] sm:text-xs md:text-sm font-bold">€</span>
                        </div>
                        <span className="text-xs sm:text-sm md:text-base font-semibold text-gray-900">EUR</span>
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-orange-500 flex-shrink-0" />
                      </div>
                      <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-500 flex-shrink-0" />
                    </div>
                    
                    {/* Middle Section - Conversions */}
                    <div className="mb-3 sm:mb-4">
                      <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 leading-tight">
                        Conversions: 1,245
                      </div>
                      <div className="text-xs sm:text-sm md:text-base text-gray-700 mt-1.5 sm:mt-2">
                        CTR: 5.2%
                      </div>
                    </div>
                    
                    {/* Bottom - Balance */}
                    <div className="mt-auto text-xs sm:text-sm text-gray-400 text-center pt-2">
                      Balance
                    </div>
                  </div>
                  
                  {/* CTA Button */}
                  <button className="w-full bg-blue-700 hover:bg-blue-800 text-white text-xs sm:text-sm md:text-base font-medium py-2.5 sm:py-3 md:py-3.5 rounded-full transition-colors">
                    Optimize Campaign
                  </button>
                </div>
              ) : i === 1 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6 text-white">
                  {/* Top Section */}
                  <div className="flex items-center gap-2 mb-4 sm:mb-5">
                    <ArrowLeftRight className="w-4 h-4 sm:w-5 sm:h-5 text-white/80" />
                    <span className="text-xs sm:text-sm md:text-base text-white/70 font-medium">
                      Campaign Budget
                    </span>
                  </div>
                  
                  {/* Middle Section - Currency Values */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white mb-2 sm:mb-3">
                      - €500.00
                    </div>
                    <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-white">
                      + zł2,179.92
                    </div>
                  </div>
                  
                  {/* Bottom - Approved Badge */}
                  <div className="mt-auto">
                    <div className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 bg-white/20 backdrop-blur-sm rounded-full">
                      <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                      <span className="text-xs sm:text-sm font-medium text-white">Approved</span>
                    </div>
                  </div>
                </div>
              ) : i === 2 ? (
                <div className="h-full flex flex-col p-3 sm:p-4 md:p-5 lg:p-6">
                  {/* Top Content Panel - White */}
                  <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl p-4 sm:p-5 md:p-6 mb-3 sm:mb-4 flex flex-col items-center">
                    {/* Megaphone Icon */}
                    <Megaphone className="w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 text-red-500 mb-2 sm:mb-3" />
                    {/* Text */}
                    <div className="text-sm sm:text-base md:text-lg lg:text-xl font-bold text-gray-900 text-center">
                      Audience Marketing
                    </div>
                  </div>
                  
                  {/* Middle Section - Secure Payment */}
                  <div className="flex items-center gap-2 mb-4 sm:mb-5">
                    <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />
                    <span className="text-xs sm:text-sm md:text-base text-gray-600">
                      Secure Payment
                    </span>
                  </div>
                  
                  {/* Bottom - Send Button */}
                  <div className="mt-auto">
                    <button className="w-full bg-[#FCDA7F] hover:bg-[#FCD34D] text-purple-900 text-xs sm:text-sm md:text-base font-bold py-2.5 sm:py-3 md:py-3.5 rounded-full transition-colors">
                      Send
                    </button>
                  </div>
                </div>
              ) : i === 3 ? (
                <div className="h-full w-full">
                  {/* Fashion Image - Full Card, No Padding */}
                  <img 
                    src="/fashion-clothing.jpeg" 
                    alt="Fashion clothing" 
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
                </div>
              ) : i === 4 ? (
                <div className="h-full w-full">
                  {/* Serrum Image - Full Card, No Padding */}
                  <img 
                    src="/serrum.webp" 
                    alt="Serrum" 
                    className="w-full h-full object-cover rounded-2xl sm:rounded-3xl"
                  />
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
