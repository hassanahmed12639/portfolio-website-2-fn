import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = 'https://track.itshassanhamed.com'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${BASE_URL}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/features`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/docs`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/integrations`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
  ]

  // Dynamic blog posts from Supabase
  let blogPages: MetadataRoute.Sitemap = []

  try {
    const supabase = createAdminClient()
    const { data: posts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at, created_at')
      .eq('published', true)
      .order('created_at', { ascending: false })

    if (posts) {
      blogPages = posts.map((post) => ({
        url: `${BASE_URL}/blog/${post.slug}`,
        lastModified: new Date(post.updated_at || post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      }))
    }
  } catch (err) {
    console.error('[Sitemap] Error fetching blog posts:', err)
  }

  // pSEO pages from Supabase
  let pseoUrls: MetadataRoute.Sitemap = []
  try {
    const supabase = createAdminClient()
    const { data: pseoPages } = await supabase
      .from('pseo_pages')
      .select('type, slug, updated_at')
      .eq('published', true)

    if (pseoPages?.length) {
      pseoUrls = pseoPages.map((p) => {
        const path =
          p.type === 'integration'
            ? `/integrations/${p.slug}`
            : p.type === 'compare'
              ? `/compare/${p.slug}`
              : p.type === 'usecase'
                ? `/for/${p.slug}`
                : `/blog/${p.slug}`
        return {
          url: `${BASE_URL}${path}`,
          lastModified: new Date(p.updated_at ?? ''),
          changeFrequency: 'monthly' as const,
          priority: 0.8,
        }
      })
    }
  } catch (err) {
    console.error('[Sitemap] Error fetching pSEO pages:', err)
  }

  return [...staticPages, ...blogPages, ...pseoUrls]
}
