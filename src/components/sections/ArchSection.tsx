'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { registerGsapPlugins } from '../../lib/gsap';

const LINK_SVG = (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" fill="none">
    <path fill="#121212" d="M5 2c0 1.105-1.895 2-3 2a2 2 0 1 1 0-4c1.105 0 3 .895 3 2ZM11 3.5c0 1.105-.895 3-2 3s-2-1.895-2-3a2 2 0 1 1 4 0ZM6 9a2 2 0 1 1-4 0c0-1.105.895-3 2-3s2 1.895 2 3Z" />
  </svg>
);

const archItems = [
  { id: 'green-arch', title: 'Green Cityscape', desc: 'Vibrant streets with vertical gardens and solar buildings. This oasis thrives on renewable energy, smart transport, and green spaces for biodiversity.', linkBg: '#D5FF37' },
  { id: 'blue-arch', title: 'Blue Urban Oasis', desc: 'Avenues with azure facades and eco-structures. This hub uses clean energy, smart transit, and parks for urban wildlife.', linkBg: '#7DD6FF' },
  { id: 'pink-arch', title: 'Fluid Architecture', desc: 'Desert refuge with fluid architecture and glowing interiors. This sanctuary harnesses solar power, sustainable design, and natural harmony for resilient living.', linkBg: '#FFA0B0' },
  { id: 'orange-arch', title: 'Martian Arches', desc: 'Ethereal structures arc over tranquil waters, bathed in the glow of a setting Martian sun. This desolate beauty showcases the stark, captivating landscape of the red planet.', linkBg: '#FFA17B' },
];

const images = [
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/cu8978xjlsjjpjk52ta0.webp', alt: 'Green Architecture', index: 4 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/trh7c8ufv1dqfrofdytd.webp', alt: 'Blue Architecture', index: 3 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/aw6qwur0pggp5r03whjq.webp', alt: 'Pink Architecture', index: 2 },
  { src: 'https://ik.imagekit.io/kg2nszxjp/GSAP%20pinned%20image%20mask%20reveal%20on%20scroll/sqwn8u84zd1besgl0zpd.webp', alt: 'Orange Architecture', index: 1 },
];

const BG_COLORS = ['#EDF9FF', '#FFECF2', '#FFE8DB'];

export default function ArchSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    registerGsapPlugins();
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const root = sectionRef.current;
      if (!root) return;

      const imgWrappers = root.querySelectorAll('.arch__right .img-wrapper');
      imgWrappers.forEach((el) => {
        const order = el.getAttribute('data-index');
        if (order !== null) (el as HTMLElement).style.zIndex = order;
      });

      function handleMobileLayout() {
        const isMobile = window.matchMedia('(max-width: 768px)').matches;
        const leftItems = gsap.utils.toArray('.arch__left .arch__info');
        const rightItems = gsap.utils.toArray('.arch__right .img-wrapper');

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

      const imgs = Array.from(root.querySelectorAll('.img-wrapper img')) as HTMLImageElement[];

      ScrollTrigger.matchMedia({
        '(min-width: 769px)': function () {
          const mainTimeline = gsap.timeline({
            scrollTrigger: {
              trigger: root.querySelector('.arch'),
              start: 'top top',
              end: 'bottom bottom',
              pin: root.querySelector('.arch__right'),
              scrub: true,
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
                .to('body', {
                  backgroundColor: BG_COLORS[index],
                  duration: 1.5,
                  ease: 'power2.inOut',
                }, 0)
                .to(currentImage, {
                  clipPath: 'inset(0px 0px 100%)',
                  objectPosition: '0px 60%',
                  duration: 1.5,
                  ease: 'none',
                }, 0)
                .to(nextImage, {
                  objectPosition: '0px 40%',
                  duration: 1.5,
                  ease: 'none',
                }, 0);
            }
            mainTimeline.add(sectionTimeline);
          });
        },
        '(max-width: 768px)': function () {
          gsap.set(imgs, { objectPosition: '0px 60%' });
          imgs.forEach((image, index) => {
            const innerTimeline = gsap.timeline({
              scrollTrigger: {
                trigger: image,
                start: 'top-=70% top+=50%',
                end: 'bottom+=200% bottom',
                scrub: true,
              },
            });
            innerTimeline
              .to(image, {
                objectPosition: '0px 30%',
                duration: 5,
                ease: 'none',
              })
              .to('body', {
                backgroundColor: BG_COLORS[index],
                duration: 1.5,
                ease: 'power2.inOut',
              });
          });
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="arch-section" ref={sectionRef}>
      <div className="container">
        <div className="spacer" />
        <div className="arch">
          <div className="arch__left">
            {archItems.map((item) => (
              <div key={item.id} className="arch__info" id={item.id}>
                <div className="content">
                  <h2 className="header">{item.title}</h2>
                  <p className="desc">{item.desc}</p>
                  <a className="link" href="#" style={{ backgroundColor: item.linkBg }}>
                    {LINK_SVG}
                    <span>Learn More</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
          <div className="arch__right">
            {images.map((img) => (
              <div key={img.index} className="img-wrapper" data-index={img.index}>
                <img src={img.src} alt={img.alt} />
              </div>
            ))}
          </div>
        </div>
        <div className="spacer" />
      </div>
    </div>
  );
}
