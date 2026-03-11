import type { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/admin'

const BASE_URL = 'https://track.itshassanahmed.com'

export async function getTrackHiveSitemap(): Promise<MetadataRoute.Sitemap> {
  const supabaseAdmin = createAdminClient()

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

  // Blog posts from Supabase
  const { data: blogPosts } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, updated_at, created_at')
    .eq('published', true)

  const blogUrls: MetadataRoute.Sitemap = (blogPosts || []).map((post) => ({
    url: `${BASE_URL}/blog/${post.slug}`,
    lastModified: new Date(post.updated_at || post.created_at),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  // pSEO pages from Supabase
  const { data: pseoPages } = await supabaseAdmin
    .from('pseo_pages')
    .select('slug, type, updated_at, created_at')
    .eq('published', true)

  const pseoUrls: MetadataRoute.Sitemap = (pseoPages || []).map((page) => {
    const basePath =
      page.type === 'integration' ? 'integrations' :
      page.type === 'compare' ? 'compare' :
      'for'

    return {
      url: `${BASE_URL}/${basePath}/${page.slug}`,
      lastModified: new Date(page.updated_at || page.created_at),
      changeFrequency: 'monthly' as const,
      priority: page.type === 'compare' ? 0.7 : 0.6,
    }
  })

  return [...staticPages, ...blogUrls, ...pseoUrls]
}
