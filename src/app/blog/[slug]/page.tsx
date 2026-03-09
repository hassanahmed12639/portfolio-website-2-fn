import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
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

  if (!post) return {}

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

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: post } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('slug', slug)
    .eq('published', true)
    .single()

  if (!post) notFound()

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

      <div className="max-w-3xl mx-auto px-6 pt-24 pb-16">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
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
          <div className="flex items-center gap-4 text-sm text-slate-400 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
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
            <span>•</span>
            <span>{post.read_time} min read</span>
            <span>•</span>
            <span>{post.views} views</span>
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
      </div>

      <TrackHiveFooter />
    </div>
  )
}
