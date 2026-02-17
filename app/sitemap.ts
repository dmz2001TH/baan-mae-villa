import { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://www.baanmaevilla.com' // ⚠️ อย่าลืมเปลี่ยนเป็นโดเมนจริงเมื่อมีแล้ว

  // 1. ดึงข้อมูล Villa
  const villas = await prisma.villa.findMany({
    select: {
      slug: true,
      updatedAt: true,
    },
  })

  // 2. สร้าง URL (ผมเพิ่ม Type : any เพื่อแก้ Error ให้ผ่านก่อนครับ)
  const villaUrls = villas.map((villa: { slug: string; updatedAt: Date }) => ({
    url: `${baseUrl}/villas/${villa.slug}`,
    lastModified: villa.updatedAt,
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  // 3. รวมลิงก์ทั้งหมด
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/villas`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...villaUrls,
  ]
}