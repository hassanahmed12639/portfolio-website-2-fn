import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import { createAdminClient } from '@/lib/supabase/admin'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: page } = await supabase
    .from('pseo_pages')
    .select('meta_title, meta_description, title')
    .eq('slug', slug)
    .eq('type', 'usecase')
    .eq('published', true)
    .single()
  if (!page) return { title: 'Page Not Found' }
  return {
    title: page.meta_title || page.title,
    description: page.meta_description ?? undefined,
  }
}

export default async function UseCasePage({ params }: Props) {
  const { slug } = await params
  const supabase = createAdminClient()
  const { data: page } = await supabase
    .from('pseo_pages')
    .select('*')
    .eq('slug', slug)
    .eq('type', 'usecase')
    .eq('published', true)
    .single()

  if (!page) notFound()

  return (
    <div className="trackhive-flow min-h-screen bg-white antialiased" style={{ color: '#0f172a' }}>
      <TrackHiveNavbar />
      <main className="max-w-6xl mx-auto px-4 lg:px-8 pt-28 pb-16">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Sidebar: table of contents + share */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-8 text-sm">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2">
                  Table of Contents
                </p>
                <nav className="space-y-2 text-slate-600">
                  {page.section_1_title && (
                    <a href="#section-1" className="block hover:text-blue-600">
                      {page.section_1_title}
                    </a>
                  )}
                  {page.section_2_title && (
                    <a href="#section-2" className="block hover:text-blue-600">
                      {page.section_2_title}
                    </a>
                  )}
                </nav>
              </div>

              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2">
                  Share this article
                </p>
                <div className="flex flex-col gap-2">
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">
                      in
                    </span>
                    LinkedIn
                  </button>
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">
                      X
                    </span>
                    X (Twitter)
                  </button>
                  <button className="inline-flex items-center gap-2 text-xs font-medium text-slate-600 hover:text-blue-600">
                    <span className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-[11px]">
                      f
                    </span>
                    Facebook
                  </button>
                </div>
              </div>
            </div>
          </aside>

          {/* Main article */}
          <article>
            <div className="mb-10">
              <span className="inline-flex items-center text-xs font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full">
                Use Case
              </span>
              <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-4 mb-4 leading-tight">
                {page.h1 || page.title}
              </h1>
              <p className="text-lg text-slate-500 max-w-2xl">
                {page.hero_subtitle}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-6 border-t border-slate-100 pt-4">
                <span>
                  {new Date(page.updated_at || page.created_at || new Date()).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {page.read_time && (
                  <>
                    <span>•</span>
                    <span>{page.read_time} min read</span>
                  </>
                )}
              </div>
            </div>

            {page.stat_1_number && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                {[
                  { number: page.stat_1_number, label: page.stat_1_label },
                  { number: page.stat_2_number, label: page.stat_2_label },
                  { number: page.stat_3_number, label: page.stat_3_label },
                ]
                  .filter((s) => s.number)
                  .map((stat) => (
                    <div
                      key={stat.number}
                      className="bg-white border border-slate-100 rounded-xl p-5 text-center shadow-sm"
                    >
                      <p className="text-3xl font-black text-blue-600">{stat.number}</p>
                      <p className="font-semibold text-slate-900 text-sm mt-1">
                        {stat.label}
                      </p>
                    </div>
                  ))}
              </div>
            )}

            {page.section_1_title && (
              <section id="section-1" className="mb-12">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  {page.section_1_title}
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {page.section_1_body}
                </p>
              </section>
            )}

            {page.section_2_title && (
              <section id="section-2" className="mb-12">
                <h2 className="text-2xl font-black text-slate-900 mb-4">
                  {page.section_2_title}
                </h2>
                <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                  {page.section_2_body}
                </p>
              </section>
            )}

            <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-black mb-2">
                {page.cta_title || 'Get Started'}
              </h2>
              <p className="text-slate-400 mb-6">
                {page.cta_subtitle || 'Free plan available. No credit card required.'}
              </p>
              <Link
                href="/dashboard/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block"
              >
                {page.cta_button_text || 'Get Started Free'}
              </Link>
            </section>
          </article>
        </div>
      </main>
      <TrackHiveFooter />
    </div>
  )
}
