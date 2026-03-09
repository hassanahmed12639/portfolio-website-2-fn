import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { notFound } from 'next/navigation'
import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import type { Metadata } from 'next'

type Props = { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data: post } = await supabase
    .from('blog_posts')
    .select('title, meta_title, meta_description, excerpt, primary_keyword, author, slug')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (post) {
    return {
      title: post.meta_title || post.title + ' | TrackHive',
      description: (post.meta_description || post.excerpt) ?? undefined,
      keywords: post.primary_keyword ?? undefined,
      authors: [{ name: post.author || 'TrackHive Team' }],
      openGraph: {
        title: post.meta_title || post.title,
        description: (post.meta_description || post.excerpt) ?? undefined,
        url: `https://track.itshassanahmed.com/blog/${post.slug}`,
        type: 'article',
      },
    }
  }

  // Fallback: problem-type pSEO pages are shown under /blog/[slug] in admin
  const admin = createAdminClient()
  const { data: problemPage } = await admin
    .from('pseo_pages')
    .select('meta_title, meta_description, title, slug')
    .eq('slug', slug)
    .eq('type', 'problem')
    .eq('published', true)
    .single()

  if (!problemPage) return {}

  return {
    title: problemPage.meta_title || problemPage.title + ' | TrackHive',
    description: problemPage.meta_description ?? undefined,
    openGraph: {
      title: problemPage.meta_title || problemPage.title,
      description: problemPage.meta_description ?? undefined,
      url: `https://track.itshassanahmed.com/blog/${problemPage.slug}`,
      type: 'article',
    },
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()
  const admin = createAdminClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  // Fallback: serve problem-type pSEO pages under /blog/[slug] (admin shows them as /blog/...)
  if (!post) {
    const { data: problemPage } = await admin
      .from('pseo_pages')
      .select('*')
      .eq('slug', slug)
      .eq('type', 'problem')
      .eq('published', true)
      .single()

    if (problemPage) {
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
                      {problemPage.section_1_title && (
                        <a href="#section-1" className="block hover:text-blue-600">
                          {problemPage.section_1_title}
                        </a>
                      )}
                      {problemPage.section_2_title && (
                        <a href="#section-2" className="block hover:text-blue-600">
                          {problemPage.section_2_title}
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
                  <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                    <Link href="/blog" className="hover:text-blue-600">
                      Blog
                    </Link>
                    <span>→</span>
                    <span className="text-slate-600">{problemPage.category || 'Guide'}</span>
                  </div>

                  <span className="inline-flex items-center text-xs font-bold bg-amber-100 text-amber-700 px-3 py-1 rounded-full">
                    Solution Guide
                  </span>
                  <h1 className="text-3xl md:text-5xl font-black text-slate-900 mt-4 mb-4 leading-tight">
                    {problemPage.h1 || problemPage.title}
                  </h1>
                  <p className="text-lg text-slate-500 max-w-2xl">
                    {problemPage.hero_subtitle}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 mt-6 border-t border-slate-100 pt-4">
                    <span>
                      {new Date(problemPage.updated_at || problemPage.created_at || new Date()).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </span>
                    {problemPage.read_time && (
                      <>
                        <span>•</span>
                        <span>{problemPage.read_time} min read</span>
                      </>
                    )}
                  </div>
                </div>

                {problemPage.stat_1_number && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mb-12">
                    {[
                      { number: problemPage.stat_1_number, label: problemPage.stat_1_label },
                      { number: problemPage.stat_2_number, label: problemPage.stat_2_label },
                      { number: problemPage.stat_3_number, label: problemPage.stat_3_label },
                    ]
                      .filter((s) => s.number)
                      .map((stat) => (
                        <div
                          key={String(stat.number)}
                          className="bg-white border border-slate-100 rounded-xl p-5 text-center shadow-sm"
                        >
                          <p className="text-3xl font-black text-blue-600">{stat.number}</p>
                          <p className="font-semibold text-slate-900 text-sm mt-1">{stat.label}</p>
                        </div>
                      ))}
                  </div>
                )}

                {problemPage.section_1_title && (
                  <section id="section-1" className="mb-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">
                      {problemPage.section_1_title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {problemPage.section_1_body}
                    </p>
                  </section>
                )}

                {problemPage.section_2_title && (
                  <section id="section-2" className="mb-12">
                    <h2 className="text-2xl font-black text-slate-900 mb-4">
                      {problemPage.section_2_title}
                    </h2>
                    <p className="text-slate-600 leading-relaxed whitespace-pre-line">
                      {problemPage.section_2_body}
                    </p>
                  </section>
                )}

                <section className="bg-slate-900 rounded-2xl p-8 text-center text-white">
                  <h2 className="text-2xl font-black mb-2">
                    {problemPage.cta_title || 'Get Started'}
                  </h2>
                  <p className="text-slate-400 mb-6">
                    {problemPage.cta_subtitle || 'Free plan available. No credit card required.'}
                  </p>
                  <Link
                    href="/dashboard/signup"
                    className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-colors inline-block"
                  >
                    {problemPage.cta_button_text || 'Get Started Free'}
                  </Link>
                </section>
              </article>
            </div>
          </main>
          <TrackHiveFooter />
        </div>
      )
    }
    notFound()
  }

  // Increment view count (fire-and-forget)
  supabase
    .from('blog_posts')
    .update({ views: (post.views || 0) + 1 })
    .eq('id', post.id)
    .then(() => {})

  // Get related posts
  const { data: related } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .eq('category', post.category)
    .neq('id', post.id)
    .limit(3)

  return (
    <div className="min-h-screen bg-slate-50">
      <TrackHiveNavbar />

      <div className="max-w-6xl mx-auto px-4 lg:px-8 pt-24 pb-16">
        <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:gap-12">
          {/* Sidebar (share / meta) */}
          <aside className="hidden lg:block">
            <div className="sticky top-28 space-y-6 text-sm">
              <div>
                <p className="text-xs font-semibold tracking-wide text-slate-400 uppercase mb-2">
                  Published
                </p>
                <p className="text-slate-600">
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
                {post.read_time != null && (
                  <p className="text-slate-500 mt-1">{post.read_time} min read</p>
                )}
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

          {/* Main article column */}
          <article>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
              <Link href="/blog" className="hover:text-blue-600">
                Blog
              </Link>
              <span>→</span>
              <span className="text-slate-600">{post.category}</span>
            </div>

            {/* Post header */}
            <div className="mb-8">
              <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                {post.category}
              </span>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mt-4 mb-4 leading-tight">
                {post.title}
              </h1>
              <p className="text-lg text-slate-500 mb-6">{post.excerpt}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-400 pb-6 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                    TH
                  </div>
                  <span className="font-medium text-slate-600">{post.author}</span>
                </div>
                <span>•</span>
                <span>
                  {new Date(post.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </span>
                {post.read_time != null && (
                  <>
                    <span>•</span>
                    <span>{post.read_time} min read</span>
                  </>
                )}
                {post.views != null && (
                  <>
                    <span>•</span>
                    <span>{post.views} views</span>
                  </>
                )}
              </div>
            </div>

            {/* Post content */}
            <div
              className="prose prose-slate max-w-none
            prose-headings:font-bold prose-headings:text-slate-900
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-slate-600 prose-p:leading-7 prose-p:mb-4
            prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-slate-900
            prose-code:bg-slate-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:text-blue-700
            prose-pre:bg-slate-950 prose-pre:text-green-400 prose-pre:rounded-xl
            prose-ul:text-slate-600 prose-li:mb-1
            prose-blockquote:border-blue-500 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:py-2"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />

            {/* CTA Box */}
            <div className="mt-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-8 text-center">
              <h3 className="text-xl font-bold text-white mb-2">
                Ready to implement server-side tracking?
              </h3>
              <p className="text-blue-200 mb-4 text-sm">
                TrackHive makes it easy. Set up in 5 minutes, free forever.
              </p>
              <Link
                href="/dashboard/signup"
                className="inline-block bg-white text-blue-600 font-bold px-6 py-2.5 rounded-xl hover:bg-blue-50 transition-colors text-sm"
              >
                Start for free →
              </Link>
            </div>

            {/* Related posts */}
            {related && related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Related Articles
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {related.map((r) => (
                    <Link key={r.id} href={`/blog/${r.slug}`}>
                      <div className="bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow">
                        <span className="text-xs text-blue-600 font-semibold">
                          {r.category}
                        </span>
                        <p className="text-sm font-semibold text-slate-900 mt-1 line-clamp-2">
                          {r.title}
                        </p>
                        <p className="text-xs text-slate-400 mt-2">
                          {r.read_time} min read
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </article>
        </div>
      </div>

      <TrackHiveFooter />
    </div>
  )
}
