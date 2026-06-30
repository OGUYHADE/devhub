import type { MetadataRoute } from 'next'

const SITE_URL = 'https://devhub-three-rho.vercel.app'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  // 誰でも見られる公開ページのみ掲載（ログイン必須ページは除外）
  const routes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '/', priority: 1.0, changeFrequency: 'daily' },
    { path: '/news', priority: 0.9, changeFrequency: 'hourly' },
    { path: '/board', priority: 0.8, changeFrequency: 'daily' },
    { path: '/ranking', priority: 0.7, changeFrequency: 'daily' },
    { path: '/plaza', priority: 0.6, changeFrequency: 'weekly' },
    { path: '/login', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/signup', priority: 0.5, changeFrequency: 'monthly' },
    { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
    { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  ]

  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }))
}
