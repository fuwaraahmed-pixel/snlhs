import type { MetadataRoute } from 'next';

/**
 * Next.js robots.txt — controls how search engine crawlers access the site.
 * Allows all public pages, disallows admin panel from being indexed.
 */
export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://snlhs.edu.bd';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
