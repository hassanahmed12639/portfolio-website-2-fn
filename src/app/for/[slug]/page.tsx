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
      <main className="max-w-4xl mx-auto px-4 pt-28 pb-16">
        <div className="text-center mb-12">
          <span className="text-xs font-bold bg-green-100 text-green-600 px-3 py-1 rounded-full">
            Use Case
          </span>
          <h1 className="text-4xl md:text-5xl font-black text-slate-900 mt-4 mb-4">
            {page.h1 || page.title}
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            {page.hero_subtitle}
          </p>
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link
              href="/dashboard/signup"
              className="bg-blue-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors"
            >
              {page.cta_button_text || 'Get Started Free'}
            </Link>
          </div>
        </div>

        {page.stat_1_number && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
            {[
              { number: page.stat_1_number, label: page.stat_1_label },
              { number: page.stat_2_number, label: page.stat_2_label },
              { number: page.stat_3_number, label: page.stat_3_label },
            ]
              .filter((s) => s.number)
              .map((stat) => (
                <div
                  key={stat.number}
                  className="bg-white border border-slate-100 rounded-xl p-5 text-center"
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
          <section className="mb-12">
            <h2 className="text-2xl font-black text-slate-900 mb-4">
              {page.section_1_title}
            </h2>
            <p className="text-slate-600 leading-relaxed whitespace-pre-line">
              {page.section_1_body}
            </p>
          </section>
        )}

        {page.section_2_title && (
          <section className="mb-12">
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
      </main>
      <TrackHiveFooter />
    </div>
  )
}
