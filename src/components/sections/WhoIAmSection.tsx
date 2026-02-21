'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '../../lib/gsap';
import { TextEffect } from '../ui/text-effect';

export default function WhoIAmSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const leadRef = useRef<HTMLParagraphElement>(null);
  const taglineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const [leadInView, setLeadInView] = useState(false);

  useEffect(() => {
    registerGsapPlugins();
    const section = sectionRef.current;
    const lead = leadRef.current;
    const tagline = taglineRef.current;
    const cta = ctaRef.current;
    if (!section || !lead || !tagline || !cta) return;

    const ctx = gsap.context(() => {
      gsap.set(lead, { x: -80, opacity: 0 });
      gsap.set(tagline, { y: 24, opacity: 0 });
      gsap.set(cta, { x: 80, opacity: 0 });

      gsap.to(lead, {
        x: 0,
        opacity: 1,
        duration: 0.7,
        delay: 0.35,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: lead,
          start: 'top 88%',
          toggleActions: 'play none none none',
          onEnter: () => setLeadInView(true),
        },
      });

      gsap.to(tagline, {
        y: 0,
        opacity: 1,
        duration: 0.6,
        delay: 0.4,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: tagline,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });

      gsap.to(cta, {
        x: 0,
        opacity: 1,
        duration: 0.5,
        delay: 0.35,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: cta,
          start: 'top 82%',
          toggleActions: 'play none none none',
        },
      });
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="who-i-am-section w-full bg-[#FFFFFF]">
      <div className="who-i-am-container">
        <div className="who-i-am-inner">
          <div className="who-i-am-content">
            <p ref={leadRef} className="who-i-am-lead">
              {!leadInView ? (
                <span className="invisible" aria-hidden>
                  I help brands drive revenue through campaigns powered by structured testing, data-led decisions, creative experimentation, and conversion systems built to scale profitably.
                </span>
              ) : (
                <>
                  <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                    I help{' '}
                  </TextEffect>
                  <span className="who-i-am-highlight who-i-am-highlight--blue">
                    <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                      brands
                    </TextEffect>
                  </span>
                  <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                    {' '}drive revenue through campaigns powered by{' '}
                  </TextEffect>
                  <span className="who-i-am-highlight who-i-am-highlight--orange">
                    <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                      structured testing
                    </TextEffect>
                  </span>
                  <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                    , data-led decisions, creative experimentation, and conversion systems built to{' '}
                  </TextEffect>
                  <span className="who-i-am-highlight who-i-am-highlight--green">
                    <TextEffect as="span" trigger={leadInView} per="word" preset="fade" delay={0.1}>
                      scale profitably.
                    </TextEffect>
                  </span>
                </>
              )}
            </p>
            <p ref={taglineRef} className="who-i-am-tagline">
              This Is Who I Am And I Will
              <br />
              <span className="who-i-am-tagline-accent">TAKE YOU FURTHER</span>
            </p>
          </div>
          <div className="who-i-am-cta-wrap">
            <Link ref={ctaRef} href="#about" className="who-i-am-cta">
              <span className="who-i-am-cta-icon" aria-hidden>+</span>
              About Me
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
