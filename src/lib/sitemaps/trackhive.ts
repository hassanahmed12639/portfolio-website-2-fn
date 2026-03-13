import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = 'https://track.itshassanahmed.com'

export async function getTrackHiveSitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    // Ensure core evergreen blog posts are always present
    {
      url: `${BASE_URL}/blog/how-to-setup-tiktok-events-api-without-developer`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/server-side-tracking-vs-client-side-tracking-full-guide-2026`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/how-to-improve-meta-match-rate`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/meta-capi-vs-facebook-pixel-what-is-the-difference`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog/how-to-fix-ios14-tracking-loss-facebook-ads`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/features`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/integrations`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
  ]

  const blogUrls: MetadataRoute.Sitemap = []

  try {
    const supabase = createAdminClient()
    const { data: posts, error } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, published_at')
      .eq('published', true)

    if (error) {
      console.error('[sitemap] Supabase error fetching blog_posts:', error.message, error.details)
    } else if (posts?.length) {
      for (const post of posts) {
        const lastMod = post.updated_at || post.published_at || null
        blogUrls.push({
          url: `${BASE_URL}/blog/${post.slug}`,
          lastModified: lastMod ? new Date(lastMod) : new Date(),
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })
      }
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)
    console.error('[sitemap] Failed to fetch blog posts:', message)
  }

  return [...staticPages, ...blogUrls]
}
