'use client';

import Image from 'next/image';
import { Sun } from 'lucide-react';

const AVATAR_COLORS = [
  'bg-amber-400',
  'bg-blue-400',
  'bg-emerald-400',
  'bg-rose-400',
  'bg-violet-400',
  'bg-cyan-400',
];

export default function Hero() {
  return (
    <section className="w-full bg-white py-14 md:py-20 lg:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 md:px-8 lg:px-12">
        <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-12 lg:gap-12">
          {/* Left column: copy + CTA */}
          <div className="flex flex-col justify-center lg:col-span-7">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gray-200 bg-white px-3.5 py-1.5 text-sm text-gray-500">
              <Sun className="h-3.5 w-3.5 text-gray-400" strokeWidth={1.5} />
              <span>2.0 version is here</span>
            </div>

            <h1 className="mt-5 text-left text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:mt-6 sm:text-4xl md:text-[2.75rem] lg:text-5xl xl:text-[3.25rem]">
              Welcome to the
              <br />
              <span className="font-playfair text-4xl italic text-gray-700 sm:text-5xl md:text-[3rem] lg:text-[3.5rem] xl:text-5xl">
                innovation
              </span>{' '}
              <span className="text-gray-900">oasis</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-gray-600 sm:mt-5 sm:text-lg">
              Step into our innovation oasis, where groundbreaking ideas bloom, and every click is a step into a world of endless possibilities.
            </p>

            <div className="mt-8 flex flex-wrap gap-4 sm:mt-10">
              <button
                type="button"
                className="rounded-lg bg-gray-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-gray-800 sm:px-7 sm:py-3.5 sm:text-base"
              >
                Get Started
              </button>
              <button
                type="button"
                className="rounded-lg border border-gray-200 bg-white px-6 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 sm:px-7 sm:py-3.5 sm:text-base"
              >
                Watch Demo
              </button>
            </div>
          </div>

          {/* Right column: image + stat cards */}
          <div className="relative lg:col-span-5">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-[1fr_minmax(0,200px)] md:grid-rows-[auto_auto_auto]">
              <div className="row-span-2 overflow-hidden rounded-2xl bg-gray-100 shadow-[0_8px_30px_rgba(0,0,0,0.08)] md:min-h-0">
                <div className="relative aspect-[3/4] w-full min-h-[280px] sm:min-h-[340px] md:aspect-[3/4] md:min-h-0">
                  <Image
                    src="/hero-image.svg"
                    alt="App preview"
                    fill
                    className="object-cover object-center"
                    priority
                    sizes="(max-width: 1024px) 100vw, 42vw"
                  />
                </div>
              </div>

              <div className="flex flex-col justify-center rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-5 md:col-start-2 md:row-start-1">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">$14B</span>
                <span className="mt-0.5 text-sm text-gray-600 sm:text-base">Funds & Syndicates</span>
              </div>

              <div className="flex flex-col justify-center rounded-2xl bg-[#faf8f5] p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-5 md:col-start-2 md:row-start-2">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">80k</span>
                <span className="mt-0.5 text-sm text-gray-600 sm:text-base">Active members</span>
                <div className="mt-2 flex -space-x-2">
                  {AVATAR_COLORS.map((bg, i) => (
                    <div
                      key={i}
                      className={`h-6 w-6 rounded-full border-2 border-[#faf8f5] ${bg}`}
                      aria-hidden
                    />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(0,0,0,0.08)] sm:p-5 md:col-start-1 md:row-start-3">
                <span className="text-2xl font-bold text-gray-900 sm:text-3xl">27k+</span>
                <span className="mt-0.5 block text-sm text-gray-600 sm:text-base">Raised by startups</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
