import type { MetadataRoute } from 'next'
import { headers } from 'next/headers'
import { getAllSlugs } from '@/data/caseStudies'
import { getTrackHiveSitemap } from '@/lib/sitemaps/trackhive'
import { isTrackHiveHost } from '@/lib/domain-brand'

// Ensure sitemap is generated on each request so blog posts are always included
export const dynamic = 'force-dynamic'
export const revalidate = 0

const BASE_URL = 'https://itshassanahmed.com'

function portfolioSitemap(): MetadataRoute.Sitemap {
  const caseStudySlugs = getAllSlugs()
  const caseStudyUrls: MetadataRoute.Sitemap = caseStudySlugs.map((slug) => ({
    url: `${BASE_URL}/project/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1.0,
    },
    {
      url: `${BASE_URL}/my-process`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/project`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/resume`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${BASE_URL}/my-process/tools/utm-builder`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/my-process/tools/ab-test-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/my-process/tools/budget-reverse-calculator`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${BASE_URL}/my-process/tools/custom-audience-builder`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    ...caseStudyUrls,
  ]
}

const TRACK_BASE = 'https://track.itshassanahmed.com'

function minimalTrackSitemap(): MetadataRoute.Sitemap {
  return [
    { url: TRACK_BASE, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${TRACK_BASE}/trackhive`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${TRACK_BASE}/pricing`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.9 },
    { url: `${TRACK_BASE}/blog`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.8 },
  ]
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const headersList = await headers()
  const host = headersList.get('host') || headersList.get('x-forwarded-host') || ''

  if (isTrackHiveHost(host)) {
    try {
      return await getTrackHiveSitemap()
    } catch (err) {
      console.error('[sitemap] TrackHive sitemap failed, returning minimal sitemap:', err)
      return minimalTrackSitemap()
    }
  }
  return portfolioSitemap()
}
