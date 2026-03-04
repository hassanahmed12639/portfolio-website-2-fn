import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Blog — TrackHive | Server-Side Tracking Insights',
  description:
    'Learn about server-side tracking, Meta CAPI, TikTok Events API, Google Enhanced Conversions and how to recover lost conversions.',
  openGraph: {
    title: 'TrackHive Blog — Server-Side Tracking Insights',
    description:
      'Expert guides on server-side tracking, CAPI integration and conversion recovery.',
    url: 'https://track.itshassanahmed.com/blog',
  },
}

export default async function BlogPage() {
  const supabase = await createClient()
  const { data: posts } = await supabase
    .from('blog_posts')
    .select('*')
    .eq('published', true)
    .order('created_at', { ascending: false })

  const featured = posts?.[0]
  const rest = posts?.slice(1)

  return (
    <div className="min-h-screen bg-slate-50">
      <TrackHiveNavbar />

      <div className="max-w-6xl mx-auto px-6 pt-24 pb-16">
        {/* Header */}
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-blue-600 uppercase tracking-wider bg-blue-50 px-3 py-1 rounded-full">
            TrackHive Blog
          </span>
          <h1 className="text-4xl font-bold text-slate-900 mt-4 mb-3">
            Server-Side Tracking Insights
          </h1>
          <p className="text-slate-500 max-w-xl mx-auto">
            Expert guides on recovering lost conversions, implementing CAPI and
            maximizing your ad performance.
          </p>
        </div>

        {/* Featured post */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="block mb-10">
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="grid grid-cols-1 md:grid-cols-2">
                <div className="bg-gradient-to-br from-blue-600 to-blue-700 h-64 md:h-auto flex items-center justify-center">
                  <div className="text-center px-8">
                    <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                      Featured Post
                    </span>
                    <p className="text-white text-2xl font-bold mt-2">
                      {featured.title}
                    </p>
                  </div>
                </div>
                <div className="p-8 flex flex-col justify-center">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded-full w-fit mb-3">
                    {featured.category}
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-slate-500 mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{featured.author}</span>
                    <span>•</span>
                    <span>{featured.read_time} min read</span>
                    <span>•</span>
                    <span>
                      {new Date(featured.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'long',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rest?.map((post) => (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
                <div className="bg-gradient-to-br from-slate-100 to-blue-50 h-40 flex items-center justify-center">
                  <div className="text-4xl">
                    {post.category === 'Meta CAPI'
                      ? '📘'
                      : post.category === 'TikTok'
                        ? '🎵'
                        : post.category === 'Google'
                          ? '🔍'
                          : post.category === 'Analytics'
                            ? '📊'
                            : '⚡'}
                  </div>
                </div>
                <div className="p-5">
                  <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    {post.category}
                  </span>
                  <h3 className="font-bold text-slate-900 mt-2 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>{post.read_time} min read</span>
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty state */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <p className="text-4xl mb-3">📝</p>
            <p className="font-medium text-slate-700">No posts yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon for server-side tracking insights and guides.
            </p>
          </div>
        )}

        {/* CTA Section */}
        <div className="mt-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-10 text-center">
          <h2 className="text-2xl font-bold text-white mb-2">
            Ready to recover lost conversions?
          </h2>
          <p className="text-blue-200 mb-6">
            Start tracking server-side with TrackHive. Free forever, no credit
            card needed.
          </p>
          <Link
            href="/dashboard/signup"
            className="inline-block bg-white text-blue-600 font-bold px-6 py-3 rounded-xl hover:bg-blue-50 transition-colors"
          >
            Start for free →
          </Link>
        </div>
      </div>

      <TrackHiveFooter />
    </div>
  )
}
