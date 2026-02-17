import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://www.baanmaevilla.com' // ⚠️ แก้เป็นโดเมนจริง

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/studio/'], // ห้าม Google เข้าหลังบ้าน
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}