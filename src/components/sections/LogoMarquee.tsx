'use client';

const LOGOS = [
  { name: 'Coinbase' },
  { name: 'Spotify' },
  { name: 'Slack' },
  { name: 'Dropbox' },
  { name: 'Webflow' },
  { name: 'Zoom' },
];

export default function LogoMarquee() {
  return (
    <section className="w-full overflow-hidden bg-white py-6 md:py-8">
      <div className="relative">
        <div className="flex w-max animate-marquee items-center gap-12 md:gap-16 lg:gap-20">
          {[...LOGOS, ...LOGOS].map((logo, i) => (
            <span
              key={i}
              className="shrink-0 text-xl font-semibold tracking-tight text-gray-800 md:text-2xl"
            >
              {logo.name}
            </span>
          ))}
        </div>
        <div
          className="pointer-events-none absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-white to-transparent md:w-32"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-white to-transparent md:w-32"
          aria-hidden
        />
      </div>
    </section>
  );
}
