import type { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''

export default function sitemap(): MetadataRoute.Sitemap {
  if (!baseUrl) return []
  const root = baseUrl.replace(/\/$/, '')
  return [
    {
      url: root,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
  ]
}
