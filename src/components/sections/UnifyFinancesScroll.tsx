"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, registerGsapPlugins } from "@/lib/gsap";

export default function UnifyFinancesScroll() {
  const sectionRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLHeadingElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);
  const actionsRef = useRef<(HTMLDivElement | null)[]>([]);
  const actionsSectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    const ctx = gsap.context(() => {
      if (!sectionRef.current) return;

      const section = sectionRef.current as HTMLElement;
      const sectionWidth = section.offsetWidth;
      const sectionHeight = section.offsetHeight;

      // Initial positions: cards start from outside screen corners
      // Add extra offset to ensure they're completely off-screen
      const offScreenOffset = 500;
      const cardPositions = [
        { x: -(sectionWidth / 2 + offScreenOffset), y: -(sectionHeight / 2 + offScreenOffset) }, // top-left - card 0
        { x: sectionWidth / 2 + offScreenOffset, y: -(sectionHeight / 2 + offScreenOffset) }, // top-right - card 1
        { x: -(sectionWidth / 2 + offScreenOffset), y: sectionHeight / 2 + offScreenOffset }, // bottom-left - card 2
        { x: sectionWidth / 2 + offScreenOffset, y: sectionHeight / 2 + offScreenOffset }, // bottom-right - card 3
        { x: sectionWidth / 2 + offScreenOffset, y: 0 }, // right-center - card 4
      ];

      // Set initial positions (off-screen and invisible) for all 5 cards
      cardsRef.current.forEach((card, i) => {
        if (card && cardPositions[i]) {
          gsap.set(card, {
            x: cardPositions[i].x,
            y: cardPositions[i].y,
            opacity: 0,
            force3D: true,
            transformOrigin: "center center",
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

      // Set initial state for action elements: invisible
      actionsRef.current.forEach((action) => {
        if (action) {
          gsap.set(action, {
            opacity: 0,
            y: 20,
            force3D: true,
          });
        }
      });

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

      /* Cards animate in from corners and stack in center - all 5 cards */
      cardsRef.current.forEach((card, i) => {
        if (card) {
          tl.to(
            card,
            {
              x: (i % 2) * 6, // slight offset for stacking (left/right)
              y: Math.floor(i / 2) * 6, // slight offset for stacking (top/bottom)
              opacity: 1,
              duration: 3,
              ease: "sine.out",
              force3D: true,
              immediateRender: false,
            },
            i * 0.3 // stagger slightly - each card starts after the previous
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

    // Separate ScrollTrigger for actions section - scroll by scroll animation
    const actionsCtx = gsap.context(() => {
      if (!actionsSectionRef.current) return;

      // Create timeline for sequential scroll-based animation
      const actionsTl = gsap.timeline({
        scrollTrigger: {
          trigger: actionsSectionRef.current,
          start: "top 80%",
          end: "top 20%",
          scrub: 1,
        },
      });

      // Animate action elements (Add, Send, Exchange) to appear one by one
      // Each element appears sequentially as user scrolls
      actionsRef.current.forEach((action, i) => {
        if (action) {
          actionsTl.to(
            action,
            {
              opacity: 1,
              y: 0,
              duration: 1,
              ease: "power2.out",
              force3D: true,
            },
            i * 0.5 // Stagger each element by 0.5 in timeline (scroll-based)
          );
        }
      });
    }, actionsSectionRef);

    return () => {
      ctx.revert();
      actionsCtx.revert();
    };
  }, []);

  const actions = [
    { 
      label: "Add", 
      color: "#10B981", 
      icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
      )
    },
    { 
      label: "Send", 
      color: "#3B82F6", 
      icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22 2L11 13M22 2L15 22L11 13M22 2L2 9L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
    { 
      label: "Exchange", 
      color: "#EF4444", 
      icon: (
        <svg width="100%" height="100%" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 7H16M16 7L13 4M16 7L13 10M16 17H8M8 17L11 20M8 17L11 14" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      )
    },
  ];

  return (
    <>
      <section
        ref={sectionRef}
        className="relative h-screen overflow-hidden flex items-center justify-center bg-white"
        aria-label="Unify your finances section"
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
          <span className="block whitespace-nowrap">Unifying your</span>
          <span className="block mt-0 whitespace-nowrap">finances</span>
        </h1>

        {/* CARDS - On top */}
        <div className="relative w-full h-full pointer-events-none z-10">
          {[0, 1, 2, 3, 4].map((i) => (
            <div
              key={i}
              ref={(el) => {
                cardsRef.current[i] = el;
              }}
              className="absolute left-1/2 top-1/2 w-[120px] h-[115px] xs:w-[150px] xs:h-[143px] sm:w-[180px] sm:h-[172px] md:w-[200px] md:h-[191px] lg:w-[240px] lg:h-[230px] xl:w-[280px] xl:h-[268px] 2xl:w-[320px] 2xl:h-[306px] rounded-2xl sm:rounded-3xl shadow-xl bg-white"
              style={{
                transform: "translate(-50%, -50%)",
                willChange: "transform, opacity",
              }}
              aria-hidden="true"
            >
              {/* Replace with real card UI or images */}
            </div>
          ))}
        </div>
      </section>

      {/* ACTION ELEMENTS - Add, Send, Exchange - Below cards */}
      <section ref={actionsSectionRef} className="w-full bg-white pt-0 pb-12 md:pt-0 md:pb-16 lg:pt-0 lg:pb-20 xl:pt-0 xl:pb-24 2xl:pt-0 2xl:pb-32">
        <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10 lg:gap-12 xl:gap-14 w-full max-w-[95%] xs:max-w-[90%] sm:max-w-5xl md:max-w-6xl lg:max-w-7xl xl:max-w-[1400px] 2xl:max-w-[1600px] px-3 xs:px-4 sm:px-5 md:px-8 lg:px-12 xl:px-16 mx-auto">
          {actions.map((action, i) => (
            <div
              key={action.label}
              ref={(el) => {
                actionsRef.current[i] = el;
              }}
              className="flex items-center gap-4 sm:gap-5 md:gap-6 lg:gap-7 xl:gap-8"
              style={{
                willChange: "transform, opacity",
              }}
            >
              <div
                className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 lg:w-[72px] lg:h-[72px] xl:w-20 xl:h-20 rounded-lg flex items-center justify-center flex-shrink-0 p-2.5 sm:p-3 md:p-3.5"
                style={{ backgroundColor: action.color }}
              >
                {action.icon}
              </div>
              <span
                className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl 2xl:text-7xl font-bold leading-tight"
                style={{ color: action.color }}
              >
                {action.label}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
