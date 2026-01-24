export default function PartnerHero() {
  return (
    <section
      className="relative min-h-[350px] w-full md:min-h-[450px] lg:min-h-[500px]"
      style={{
        backgroundImage: `url('https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1920&q=80')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Gradient overlay from bottom to middle */}
      <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />

      {/* Content container */}
      <div className="relative z-10 flex h-full min-h-[350px] w-full items-center justify-center px-5 py-16 md:min-h-[450px] md:px-10 md:py-20 lg:min-h-[500px] lg:py-24">
        <div className="mx-auto max-w-[900px] text-center">
          <h2 className="text-3xl font-bold leading-tight text-slate-800 md:text-4xl lg:text-5xl">
            Partner with Us for Measurable <em className="font-bold">Growth</em>
          </h2>
          <p className="mx-auto mt-5 max-w-[800px] text-base leading-relaxed text-slate-600 md:mt-6 md:text-lg lg:text-xl lg:leading-[1.7]">
            I help ambitious brands scale profitably through data-driven performance marketing
            strategies. From Google Ads to full-funnel optimization, let&apos;s turn your ad spend
            into predictable revenue growth.
          </p>
        </div>
      </div>
    </section>
  )
}
