'use client';

import { Sun } from 'lucide-react';

export default function Hero() {
  return (
    <section className="w-full m-0 py-12 md:py-16 lg:py-20 bg-[#F6F7ED]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 items-start justify-items-center gap-10 lg:grid-cols-12 lg:gap-12">
          <div className="flex flex-col items-center justify-center text-center lg:col-span-8 lg:col-start-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-[#393E41]/20 bg-white px-3.5 py-1.5 text-sm text-textPrimary/80">
              <Sun className="h-3.5 w-3.5 text-textPrimary/60" strokeWidth={1.5} />
              <span>2.0 version is here</span>
            </div>

            <h1 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-textPrimary sm:mt-6 sm:text-4xl md:text-[2.75rem] lg:text-5xl xl:text-[3.25rem]">
              Welcome to the
              <br />
              <span className="font-playfair text-4xl italic text-textPrimary/90 sm:text-5xl md:text-[3rem] lg:text-[3.5rem] xl:text-5xl">
                innovation
              </span>{' '}
              <span className="text-textPrimary">oasis</span>
            </h1>

            <p className="mt-4 max-w-lg text-base leading-relaxed text-textPrimary/80 sm:mt-5 sm:text-lg">
              Step into our innovation oasis, where groundbreaking ideas bloom, and every click is a step into a world of endless possibilities.
            </p>

            <div className="mt-8 flex flex-wrap justify-center gap-4 sm:mt-10">
              <button
                type="button"
                className="rounded-md bg-accent text-designBg px-6 md:px-8 py-3 text-sm font-semibold min-w-[120px] transition-colors hover:bg-accentHover sm:text-base"
              >
                Get Started
              </button>
              <button
                type="button"
                className="rounded-md border border-[#393E41]/20 bg-white px-6 md:px-8 py-3 text-sm font-medium text-textPrimary transition-colors hover:bg-[#393E41]/5 sm:text-base"
              >
                Watch Demo
              </button>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
