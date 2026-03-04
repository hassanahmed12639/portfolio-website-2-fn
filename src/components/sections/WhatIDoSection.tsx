'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '@/lib/gsap';

const LIME = '#b3f000';
const LINK_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none">
    <path fill="#0a0a0a" d="M5 2c0 1.105-1.895 2-3 2a2 2 0 1 1 0-4c1.105 0 3 .895 3 2ZM11 3.5c0 1.105-.895 3-2 3s-2-1.895-2-3a2 2 0 1 1 4 0ZM6 9a2 2 0 1 1-4 0c0-1.105.895-3 2-3s2 1.895 2 3Z" />
  </svg>
);

const archItems = [
  {
    id: 'paid-media',
    title: 'Paid Media & Acquisition',
    desc: 'Strategy and execution across Meta, Google, LinkedIn, and TikTok. From audience design to creative testing and budget pacing—built to scale and last.',
    linkBg: LIME,
  },
  {
    id: 'attribution',
    title: 'Attribution & Analytics',
    desc: 'Conversion tracking, incrementality, and MMM so you know what actually drives revenue. Clean data pipelines and dashboards that inform decisions.',
    linkBg: LIME,
  },
  {
    id: 'funnel-cro',
    title: 'Funnel & CRO',
    desc: 'Landing pages, flows, and experiments that convert. I tie paid spend to on-site behavior and revenue so optimization is measurable end-to-end.',
    linkBg: LIME,
  },
  {
    id: 'campaign-ops',
    title: 'Campaign Operations',
    desc: 'Structures, automation, and reporting that keep campaigns running smoothly. Audits, playbooks, and tooling so your stack works for you.',
    linkBg: LIME,
  },
];

const images = [
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/cu8978xjlsjjpjk52ta0.webp', alt: 'Paid Media', index: 4 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/trh7c8ufv1dqfrofdytd.webp', alt: 'Analytics', index: 3 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/aw6qwur0pggp5r03whjq.webp', alt: 'Funnel', index: 2 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/sqwn8u84zd1besgl0zpd.webp', alt: 'Campaign Ops', index: 1 },
];

export default function WhatIDoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const root = sectionRef.current;
      if (!root) return;

      const imgWrappers = root.querySelectorAll('.what-i-do-section__right .what-i-do-section__img-wrapper');
      imgWrappers.forEach((el) => {
        const order = el.getAttribute('data-index');
        if (order != null) (el as HTMLElement).style.zIndex = order;
      });

      function handleMobileLayout() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const leftItems = gsap.utils.toArray('.what-i-do-section__left .what-i-do-section__info');
        const rightItems = gsap.utils.toArray('.what-i-do-section__right .what-i-do-section__img-wrapper');

        if (isMobile) {
          leftItems.forEach((item, i) => {
            (item as HTMLElement).style.order = String(i * 2);
          });
          rightItems.forEach((item, i) => {
            (item as HTMLElement).style.order = String(i * 2 + 1);
          });
        } else {
          leftItems.forEach((item) => { (item as HTMLElement).style.order = ''; });
          rightItems.forEach((item) => { (item as HTMLElement).style.order = ''; });
        }
      }

      let resizeTimeout: ReturnType<typeof setTimeout>;
      window.addEventListener('resize', () => {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(handleMobileLayout, 100);
      });
      handleMobileLayout();

      const imgs = Array.from(root.querySelectorAll('.what-i-do-section__img-wrapper img')) as HTMLImageElement[];

      ScrollTrigger.matchMedia({
        '(min-width: 769px)': function () {
          const mainTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.querySelector('.what-i-do-section__arch'),
              start: 'top top',
              end: 'bottom bottom',
              pin: root.querySelector('.what-i-do-section__right'),
              scrub: 1.4,
              anticipatePin: 1,
            },
          });

          gsap.set(imgs, {
            clipPath: 'inset(0)',
            objectPosition: '0px 0%',
          });

          imgs.forEach((_, index) => {
            const currentImage = imgs[index];
            const nextImage = imgs[index + 1] ?? null;
            const sectionTimeline = gsap.timeline();

            if (nextImage) {
              sectionTimeline
                .to(currentImage, {
                  clipPath: 'inset(0px 0px 100%)',
                  objectPosition: '0px 60%',
                  duration: 1.5,
                  ease: 'power1.inOut',
                }, 0)
                .to(nextImage, {
                  objectPosition: '0px 40%',
                  duration: 1.5,
                  ease: 'power1.inOut',
                }, 0);
            }
            mainTimeline.add(sectionTimeline);
          });
        },
        '(max-width: 768px)': function () {
          gsap.set(imgs, { objectPosition: '0px 60%' });
          imgs.forEach((image) => {
            gsap.timeline({
              scrollTrigger: {
                trigger: image,
                start: 'top-=70% top+=50%',
                end: 'bottom+=200% bottom',
                scrub: 1.2,
              },
            })
              .to(image, {
                objectPosition: '0px 30%',
                duration: 5,
                ease: 'power1.inOut',
              });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="what-i-do-section" ref={sectionRef} style={{ backgroundColor: '#0a0a0a' }} aria-labelledby="what-i-do-heading">
      <div className="what-i-do-section__container">
        <h2 id="what-i-do-heading" className="what-i-do-section__title">What I Do</h2>
        <div className="what-i-do-section__arch">
          <div className="what-i-do-section__left">
            {archItems.map((item) => (
              <div key={item.id} className="what-i-do-section__info" id={item.id}>
                <div className="what-i-do-section__content">
                  <h2 className="what-i-do-section__header">{item.title}</h2>
                  <p className="what-i-do-section__desc">{item.desc}</p>
                  <a className="what-i-do-section__link" href="#" style={{ backgroundColor: item.linkBg, color: '#0a0a0a' }}>
                    {LINK_SVG}
                    <span>Learn More</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="what-i-do-section__right">
            {images.map((img) => (
              <div key={img.index} className="what-i-do-section__img-wrapper" data-index={img.index}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
