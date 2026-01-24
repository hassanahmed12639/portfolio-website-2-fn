import { Check } from 'lucide-react'

const SERVICES = [
  'Social Media Growth',
  'Content Marketing',
  'Performance Marketing',
  'Brand Strategy',
  'PPC & Paid Ads',
  'Conversion Optimization',
]

const TEAM_IMAGE = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=900&q=60'
const OFFICE_IMAGE = 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80'

export default function WhoWeAreBento() {

  return (
    <section className="bg-white px-4 py-10 md:px-6 md:py-12" aria-label="Who We Are">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-col gap-4 md:mb-10 md:flex-row md:items-start md:justify-between md:gap-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="text-orange-400">*</span>
            <span>Who We Are</span>
          </div>
          <p className="max-w-3xl text-lg leading-relaxed text-slate-600 md:text-xl">
            <span className="font-semibold text-slate-900">Rankey</span> was built to{' '}
            <span className="font-semibold text-slate-900">empower businesses</span> in today&apos;s
            fast-paced digital world. We specialize in helping startups, SaaS companies, and global
            brands grow through{' '}
            <span className="font-semibold text-slate-900">performance-driven marketing</span>.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-3 lg:grid-rows-[260px_260px_280px]">
          {/* Card 1: Team image - spans 2 cols, 2 rows */}
          <div className="group relative overflow-hidden rounded-[18px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-0.5 lg:col-span-2 lg:row-span-2">
            <img
              src={TEAM_IMAGE}
              alt="Team collaboration"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              loading="lazy"
              decoding="async"
            />
          </div>

          {/* Card 2: CTA - dark */}
          <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-[#0B1D24] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 md:p-6 lg:row-span-1">
            <div className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-gradient-to-br from-blue-500/20 via-purple-500/10 to-orange-400/0 blur-2xl" />
            <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">
              Looking to Boost Your Digital Impact?
            </h3>
            <p className="text-sm leading-relaxed text-slate-300 md:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
          </div>

          {/* Card 3: Text content area (compact, like screenshot) */}
          <div className="flex flex-col justify-between lg:row-span-1">
            <a
              href="#contact"
              className="mb-4 inline-flex w-fit self-start items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-orange-400 px-6 py-3 text-sm font-semibold text-white transition-all duration-200 hover:opacity-90 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 md:self-end"
            >
              Get a Free Consultation
            </a>
            <div className="space-y-3 text-sm leading-relaxed text-slate-600 md:text-base">
              <p>
                Our team brings decades of combined experience in performance marketing, from
                managing six-figure ad budgets to launching brands from zero to seven figures.
              </p>
              <p>
                We&apos;ve worked across tech, SaaS, eCommerce, and creative industries—helping
                businesses scale acquisition, improve ROAS, and build predictable growth engines.
              </p>
              <p>
                We focus on data-driven strategy, creative testing, and continuous optimization.
                Every campaign is built to convert and scale.
              </p>
            </div>
          </div>

          {/* Card 4: Services - dark */}
          <div className="rounded-[18px] border border-white/10 bg-[#0B1D24] p-5 shadow-[0_18px_45px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:-translate-y-0.5 md:p-6 lg:row-span-1">
            <h3 className="mb-3 text-xl font-bold text-white md:text-2xl">What We Do Best</h3>
            <p className="mb-4 text-sm leading-relaxed text-slate-300 md:text-base">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut elit tellus, luctus nec
              ullamcorper mattis.
            </p>
            <ul className="space-y-2">
              {SERVICES.map((item) => (
                <li key={item} className="flex items-center gap-2.5 text-sm text-slate-200 md:text-base">
                  <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-orange-400/15">
                    <Check className="h-3 w-3 text-orange-400" strokeWidth={2.5} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: Office image - spans 2 cols, larger row */}
          <div className="relative overflow-hidden rounded-[18px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-transform duration-300 hover:-translate-y-0.5 lg:col-span-2">
            <img
              src={OFFICE_IMAGE}
              alt="Modern office workspace"
              className="h-full w-full object-cover"
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  )
}
