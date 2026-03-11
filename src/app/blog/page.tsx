import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import TrackHiveNavbar from '@/components/trackhive/Navbar'
import TrackHiveFooter from '@/components/trackhive/Footer'
import { TrackHiveCTASection } from '@/components/trackhive/TrackHiveCTASection'
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
                <div className="relative h-64 md:h-auto min-h-[200px] bg-gradient-to-br from-blue-600 to-blue-700 overflow-hidden">
                  {(featured.featured_image || featured.featured_image_url || featured.cover_image) ? (
                    <img
                      src={featured.featured_image || featured.featured_image_url || featured.cover_image}
                      alt={featured.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center px-8">
                        <span className="text-blue-200 text-xs font-semibold uppercase tracking-wider">
                          Featured Post
                        </span>
                        <p className="text-white text-2xl font-bold mt-2">
                          {featured.title}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
                <div className="p-8 flex flex-col justify-center">
                  {featured.category && (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full w-fit mb-3">
                      {featured.category}
                    </span>
                  )}
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">
                    {featured.title}
                  </h2>
                  <p className="text-slate-500 mb-4">{featured.excerpt}</p>
                  <div className="flex items-center gap-3 text-xs text-slate-400">
                    <span>{featured.author}</span>
                    {featured.read_time != null && (
                      <>
                        <span>•</span>
                        <span>{featured.read_time} min read</span>
                      </>
                    )}
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
          {rest?.map((post) => {
            const postImage = post.featured_image || post.featured_image_url || post.cover_image
            return (
            <Link key={post.id} href={`/blog/${post.slug}`}>
              <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden hover:shadow-md transition-all hover:-translate-y-0.5 h-full">
                <div className="relative h-40 bg-gradient-to-br from-blue-600 to-blue-800 overflow-hidden">
                  {postImage ? (
                    <img
                      src={postImage}
                      alt={post.title}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 border-2 border-white/30 rounded-xl" />
                    </div>
                  )}
                </div>
                <div className="p-5">
                  {post.category && (
                    <span className="text-xs font-semibold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                      {post.category}
                    </span>
                  )}
                  <h3 className="font-bold text-slate-900 mt-2 mb-2 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-sm text-slate-500 line-clamp-2 mb-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    {post.read_time != null && (
                      <span className="text-xs text-slate-400">{post.read_time} min read</span>
                    )}
                    <span>
                      {new Date(post.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          )})}
        </div>

        {/* Empty state */}
        {(!posts || posts.length === 0) && (
          <div className="text-center py-16 bg-white rounded-2xl border border-slate-100">
            <div className="w-12 h-12 bg-slate-200 rounded-xl mx-auto mb-3 flex items-center justify-center">
              <svg className="w-6 h-6 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p className="font-medium text-slate-700">No posts yet</p>
            <p className="text-sm text-slate-500 mt-1">
              Check back soon for server-side tracking insights and guides.
            </p>
          </div>
        )}

        <div className="mt-16">
          <TrackHiveCTASection
            title="Ready to connect your stack?"
            description="Get started in 5 minutes. No credit card required."
            buttonText="Start for free →"
          />
        </div>
      </div>

      <TrackHiveFooter />
    </div>
  )
}
