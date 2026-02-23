'use client'

export default function ManufacturingFeatureSection() {
  return (
    <section className="w-full bg-black px-6 py-16 md:px-[5%] md:py-24">
      <div className="mx-auto w-full max-w-7xl">
        <div className="relative mb-8 md:mb-12">
          <h2 className="text-[58px] font-semibold leading-[0.88] tracking-[-0.03em] text-white md:text-[140px]">
            Paid Media
          </h2>
          <h2
            aria-hidden="true"
            className="pointer-events-none absolute left-0 top-[22%] text-[58px] font-semibold leading-[0.88] tracking-[-0.03em] text-[#d7ff4c] md:text-[140px]"
          >
            Paid Media
          </h2>
        </div>

        <div className="relative overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1496247749665-49cf5b1022e9?auto=format&fit=crop&w=1800&q=80"
            alt="Industrial manufacturing detail"
            className="h-[320px] w-full object-cover md:h-[460px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-6 left-6 max-w-[430px] text-white md:bottom-10 md:left-10">
            <span className="mb-4 inline-flex rounded-full bg-white/20 px-3 py-1 text-sm font-medium text-white backdrop-blur-sm">
              30% emissions
            </span>
            <p className="text-2xl font-semibold leading-[1.18] md:text-[38px]">
              The clean industrial revolution starts with transforming how we make everything in
              the world from steel and cement to everyday materials.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
