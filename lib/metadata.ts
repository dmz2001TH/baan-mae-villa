import type { Metadata } from "next";

export function generateMetadata(locale: string = "en"): Metadata {
  const titles = {
    th: "บ้านแม่วิลล่า | วิลล่าหรูหราในพัทยา ใกล้ทะเล",
    en: "Baan Mae Villa | Luxury Villas in Pattaya Near Beach",
    cn: "班 Mae 别墅 | 芭提雅海滩附近豪华别墅",
  };

  const descriptions = {
    th: "วิลล่าพัทยาหรูหรา ใกล้ทะเล พร้อมสระว่ายน้ำส่วนตัว วิวทะเล และสิ่งอำนวยความสะดวกครบครัน เหมาะสำหรับพักผ่อนและลงทุน",
    en: "Luxury villas in Pattaya near beach with private pools, ocean views, and full amenities. Perfect for vacation and investment with high ROI.",
    cn: "芭提雅海滩附近豪华别墅，配备私人泳池、海景和全套设施。非常适合度假和投资，回报率高。",
  };

  const keywords = {
    th: "วิลล่าพัทยา, วิลล่าใกล้ทะเล, บ้านพักผ่อนพัทยา, ลงทุนอสังหาริมทรัพย์, วิลล่าสระว่ายน้ำ, พัทยาวิลล่า",
    en: "Pattaya villa, villas near beach, vacation homes Pattaya, real estate investment, pool villas, Pattaya luxury villas",
    cn: "芭提雅别墅, 海滩附近别墅, 芭提雅度假屋, 房地产投资, 泳池别墅, 芭提雅豪华别墅",
  };

  const title = titles[locale as keyof typeof titles] || titles.en;
  const description = descriptions[locale as keyof typeof descriptions] || descriptions.en;
  const keywordString = keywords[locale as keyof typeof keywords] || keywords.en;

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || "https://baanmaevilla.com"),
    title,
    description,
    keywords: keywordString,
    openGraph: {
      title,
      description,
      type: "website",
      locale: locale === "th" ? "th_TH" : locale === "cn" ? "zh_CN" : "en_US",
      url: "https://bannmeavilla.com",
      siteName: "Baan Mae Villa",
      images: [
        {
          url: "/og-image.jpg",
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.jpg"],
    },
    alternates: {
      canonical: "https://bannmeavilla.com",
      languages: {
        "th": "https://bannmeavilla.com/th",
        "en": "https://bannmeavilla.com",
        "zh-CN": "https://bannmeavilla.com/cn",
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}
