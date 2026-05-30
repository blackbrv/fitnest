import type { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: [
          '/',
          '/about',
          '/blog',
          '/blog/',
          '/changelog',
          '/contact',
          '/privacy',
          '/terms',
        ],
        disallow: [
          '/dashboard',
          '/activity',
          '/family-management',
          '/notifications',
          '/profile',
          '/settings',
          '/statistics',
          '/workout-plans',
          '/login',
          '/register',
          '/forgot-password',
          '/reset-password',
          '/verify-email',
          '/add-account',
          '/api/',
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  }
}
