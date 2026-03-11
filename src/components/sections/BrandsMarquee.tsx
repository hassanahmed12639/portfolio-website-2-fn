'use client';

import Image from 'next/image';

const BRANDS = [
  { src: '/ethan-allen.webp', alt: 'Ethan Allen' },
  { src: '/evolve.webp', alt: 'evolve Medical' },
  { src: '/flexcar.png', alt: 'FLEXCAR' },
  { src: '/innovate.webp', alt: 'Innovate Apparel' },
  { src: '/inzecto-1.png', alt: 'inzecto' },
  { src: '/law.webp', alt: 'Phil Votaw Law' },
  { src: '/mala.webp', alt: 'Mala Yachts' },
];

const COPIES = 4;

export default function BrandsMarquee() {
  const items = Array.from({ length: COPIES }, () => BRANDS).flat();

  return (
    <div className="w-full overflow-hidden mt-8 md:mt-10 pt-6 md:pt-8 px-4">
      <p className="text-center text-base md:text-lg font-medium uppercase tracking-[0.2em] text-foreground/50 mb-6 md:mb-8">
        Brands that I have worked with
      </p>
      <div className="relative overflow-hidden">
        <div className="flex w-max animate-marquee items-center gap-8 md:gap-12 lg:gap-16 [animation-duration:35s]">
          {items.map(({ src, alt }, i) => (
            <div key={`${alt}-${i}`} className="relative shrink-0 h-14 md:h-16 lg:h-20 w-auto">
              <Image
                src={src}
                alt={alt}
                width={200}
                height={80}
                className="h-full w-auto object-contain opacity-70"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
