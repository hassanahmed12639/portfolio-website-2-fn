import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/dashboard/',
          '/admin/',
          '/auth/',
          '/onboarding',
          '/invite',
        ],
      },
    ],
    sitemap: [
      'https://itshassanahmed.com/sitemap.xml',
      'https://track.itshassanahmed.com/sitemap.xml',
    ],
  }
}
