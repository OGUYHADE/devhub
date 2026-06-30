import type { MetadataRoute } from 'next'

const SITE_URL = 'https://devhub-three-rho.vercel.app'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // ログイン必須・個人情報を含むページはクロール対象外
      disallow: ['/settings', '/notifications', '/bookmarks', '/reset-password'],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
