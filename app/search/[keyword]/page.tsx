import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, MapPin, Bed, Bath } from "lucide-react";

// ——— SEO keyword → Thai title mapping ———
const KEYWORD_MAP: Record<string, { titleTh: string; descTh: string }> = {
  party: {
    titleTh: "รวมวิลล่าพัทยาสำหรับสายปาร์ตี้ (Party)",
    descTh: "ค้นหาวิลล่าพัทยาที่เหมาะกับการจัดปาร์ตี้ พูลวิลล่าส่วนตัว พร้อมสระว่ายน้ำ ปาร์ตี้ได้สนุกสุดเหวี่ยง",
  },
  seaview: {
    titleTh: "วิลล่าพัทยาติดทะเล วิวสวย (Seaview)",
    descTh: "วิลล่าพัทยาวิวทะเล ตื่นมาเห็นทะเลทุกเช้า เหมาะกับการพักผ่อนสุดหรู",
  },
  pool: {
    titleTh: "พูลวิลล่าพัทยา มีสระว่ายน้ำส่วนตัว (Pool Villa)",
    descTh: "พูลวิลล่าพัทยาพร้อมสระว่ายน้ำส่วนตัว เหมาะกับครอบครัวและกลุ่มเพื่อน",
  },
  family: {
    titleTh: "วิลล่าพัทยาสำหรับครอบครัว (Family)",
    descTh: "วิลล่าพัทยาเหมาะสำหรับครอบครัว ปลอดภัย สะดวกสบาย มีสิ่งอำนวยความสะดวกครบครัน",
  },
  luxury: {
    titleTh: "วิลล่าหรูพัทยา ระดับพรีเมียม (Luxury)",
    descTh: "วิลล่าหรูพัทยาระดับพรีเมียม ดีไซน์สวยงาม สิ่งอำนวยความสะดวกครบครัน",
  },
  jomtien: {
    titleTh: "วิลล่าพัทยา โซนหาดจอมเทียน (Jomtien)",
    descTh: "วิลล่าพัทยาย่านหาดจอมเทียน ใกล้ทะเล บรรยากาศดี เงียบสงบ",
  },
  pattaya: {
    titleTh: "วิลล่าพัทยา ทำเลดี ราคาคุ้ม (Pattaya)",
    descTh: "รวมวิลล่าพัทยาทำเลดี ราคาคุ้มค่า เหมาะทั้งอยู่อาศัยและลงทุน",
  },
};

function getKeywordMeta(keyword: string) {
  const key = keyword.toLowerCase();
  if (KEYWORD_MAP[key]) return KEYWORD_MAP[key];
  // Fallback: auto-generate
  const display = decodeURIComponent(keyword);
  return {
    titleTh: `วิลล่าพัทยา "${display}" - ค้นหาบ้านในฝันของคุณ`,
    descTh: `รวมวิลล่าพัทยาที่ตรงกับ "${display}" พร้อมสระว่ายน้ำส่วนตัว ทำเลดี ราคาคุ้มค่า จาก Baan Mae Villa`,
  };
}

// ——— Dynamic SEO Metadata ———
type Props = { params: Promise<{ keyword: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { keyword } = await params;
  const meta = getKeywordMeta(keyword);
  return {
    title: `${meta.titleTh} - Baan Mae Villa`,
    description: meta.descTh,
    openGraph: {
      title: `${meta.titleTh} - Baan Mae Villa`,
      description: meta.descTh,
    },
  };
}

// ——— Page Component (Server Component) ———
export default async function SearchLandingPage({ params }: Props) {
  const { keyword } = await params;
  const display = decodeURIComponent(keyword);
  const meta = getKeywordMeta(keyword);
  const q = display.toLowerCase();

  // Search villas by name, location, description, facilities
  const matched = await prisma.villa.findMany({
    where: {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { location: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
        { descriptionTh: { contains: q, mode: "insensitive" } },
        { descriptionEn: { contains: q, mode: "insensitive" } },
        { facilities: { has: q } },
      ],
    },
    orderBy: { createdAt: "desc" },
  });

  // Fallback: show featured or all villas if no match
  let villas = matched;
  let isFallback = false;
  if (villas.length === 0) {
    isFallback = true;
    villas = await prisma.villa.findMany({
      where: { isFeatured: true },
      orderBy: { createdAt: "desc" },
      take: 6,
    });
    // If still empty, just show latest
    if (villas.length === 0) {
      villas = await prisma.villa.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
      });
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link href="/" className="text-xl font-semibold tracking-wide text-amber-400">
            BAAN MAE VILLA
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับหน้าแรก
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
            {meta.titleTh}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
            {meta.descTh}
          </p>
        </div>

        {/* Fallback notice */}
        {isFallback && (
          <div className="mb-8 rounded-xl border border-amber-400/30 bg-amber-400/5 px-6 py-4 text-center">
            <p className="text-amber-300">
              ไม่พบวิลล่าที่ตรงกับ &quot;{display}&quot; โดยตรง — แนะนำวิลล่ายอดนิยมให้แทนครับ
            </p>
          </div>
        )}

        {/* Villa Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {villas.map((villa) => (
            <Link
              key={villa.id}
              href={`/villas/${villa.slug}`}
              className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 transition-all hover:border-amber-400/30 hover:shadow-xl hover:shadow-amber-400/5"
            >
              {/* Image */}
              <div className="relative aspect-[16/10] w-full overflow-hidden">
                {villa.images?.[0] ? (
                  <Image
                    src={villa.images[0]}
                    alt={villa.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center bg-neutral-800 text-neutral-600">
                    No Image
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                {villa.discountPercentage > 0 && (
                  <span className="absolute right-3 top-3 rounded-full bg-red-500 px-2.5 py-1 text-xs font-bold text-white">
                    -{villa.discountPercentage}%
                  </span>
                )}
              </div>

              {/* Info */}
              <div className="p-5">
                <h2 className="mb-2 text-lg font-semibold text-white transition-colors group-hover:text-amber-400">
                  {villa.name}
                </h2>
                <div className="mb-3 flex items-center gap-2 text-sm text-neutral-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {villa.location}
                </div>
                <div className="flex items-center gap-4 text-sm text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Bed className="h-3.5 w-3.5" /> {villa.bedrooms} ห้องนอน
                  </span>
                  <span className="flex items-center gap-1">
                    <Bath className="h-3.5 w-3.5" /> {villa.bathrooms} ห้องน้ำ
                  </span>
                </div>
                <p className="mt-3 text-xl font-bold text-amber-400">
                  ฿{villa.price.toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link
            href="/villas"
            className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-8 py-3.5 text-base font-semibold text-neutral-950 transition-colors hover:bg-amber-300"
          >
            ดูวิลล่าทั้งหมด →
          </Link>
        </div>
      </main>
    </div>
  );
}
