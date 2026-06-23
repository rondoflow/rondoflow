import type { MetadataRoute } from 'next'
import { SITE } from '@/lib/site'

// Emitted as /sitemap.xml at build time (works with output: 'export').
export const dynamic = 'force-static'

export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date()
  return [
    { url: `${SITE.url}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE.url}/catalog/`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE.url}/compare/`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
  ]
}
