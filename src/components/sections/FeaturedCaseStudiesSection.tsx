'use client'

import Image from 'next/image'

const CASE_STUDIES = [
  {
    title: 'lorem lorem loremlorem lorem\nlorem lorem lorem lorem lorem',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
    productHref: '#',
  },
  {
    title: 'lorem lorem loremlorem lorem\nlorem lorem lorem lorem lorem',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
    productHref: '#',
  },
  {
    title: 'lorem lorem loremlorem lorem\nlorem lorem lorem lorem lorem',
    image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=500&fit=crop',
    productHref: '#',
  },
]

export default function FeaturedCaseStudiesSection() {
  return (
    <section className="w-full overflow-hidden bg-[#f2f2f0] px-6 py-12 pb-16 md:px-[5%] md:py-16">
      <div className="mx-auto max-w-5xl">
        <h2 className="mb-10 text-2xl font-semibold tracking-tight text-[#0F0F0F] md:mb-12 md:text-3xl">
          Featured Case Studies
        </h2>
        <div className="flex gap-5 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory md:grid md:grid-cols-2 md:overflow-visible md:snap-none lg:grid-cols-3 [scrollbar-width:none] [-webkit-overflow-scrolling:touch] [&::-webkit-scrollbar]:hidden">
          {CASE_STUDIES.map((study, i) => (
            <article className="relative aspect-[4/5] min-h-[300px] w-[85vw] min-w-[280px] flex-shrink-0 snap-center overflow-hidden rounded-2xl bg-white shadow-sm md:w-auto md:min-w-0 md:flex-shrink">
              <Image
                src={study.image}
                alt=""
                fill
                className="object-cover"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-black/50" />
              <p className="absolute left-4 right-4 top-4 whitespace-pre-line text-sm font-medium leading-snug text-white drop-shadow-md md:text-base">
                {study.title}
              </p>
              <div className="absolute bottom-4 left-4 flex w-fit max-w-[50%] flex-col gap-2">
                <a
                  href={study.productHref}
                  className="rounded-full border border-white/70 bg-white/15 px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur-md transition hover:bg-white/25"
                >
                  product
                </a>
                <a
                  href={study.productHref}
                  className="rounded-full border border-white/70 bg-white/15 px-3 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-white shadow-lg backdrop-blur-md transition hover:bg-white/25"
                >
                  product
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
