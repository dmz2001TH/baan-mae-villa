"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Bed, Bath, ArrowLeft, Eye } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { recordVillaView, formatViewLabel } from "@/lib/villa-view";
import { useWishlist } from "@/hooks/useWishlist";
import { WishlistButton } from "@/components/WishlistButton";

type Villa = {
  id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  status: string;
  views?: number;
  nameTh?: string | null;
  nameEn?: string | null;
  nameCn?: string | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811";

function getVillaName(v: Villa, locale: "th" | "en" | "cn"): string {
  if (locale === "th" && v.nameTh) return v.nameTh;
  if (locale === "en" && v.nameEn) return v.nameEn;
  if (locale === "cn" && v.nameCn) return v.nameCn;
  return v.name;
}

export default function SavedVillasPage() {
  const router = useRouter();
  const { locale } = useLocale();
  const { ids } = useWishlist();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);

  const hasAny = ids.length > 0;

  useEffect(() => {
    if (!hasAny) {
      setVillas([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    fetch("/api/villas/public")
      .then((res) => res.json())
      .then((data) => {
        const all = Array.isArray(data) ? data : [];
        const filtered = all.filter((v: any) => ids.includes(v.id));
        setVillas(filtered);
      })
      .catch(() => setVillas([]))
      .finally(() => setLoading(false));
  }, [hasAny, ids]);

  const title = useMemo(
    () => (locale === "th" ? "วิลล่าที่คุณถูกใจ" : "Saved villas"),
    [locale]
  );

  return (
    <div className="min-h-screen bg-neutral-950">
      <header className="sticky top-0 z-50 border-b border-amber-500/20 bg-neutral-950/95 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-4 sm:px-8">
          <Link
            href="/"
            className="font-playfair text-xl font-semibold tracking-wide text-amber-400 hover:text-amber-300"
          >
            BAAN MAE
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-white/90 hover:text-amber-400"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(locale, "nav_home")}
          </Link>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-16 sm:px-8">
        <div className="mb-16 text-center">
          <h1 className="font-playfair text-4xl font-light text-white sm:text-5xl md:text-6xl">
            {title}
          </h1>
          <p className="mt-4 text-neutral-400">
            {loading
              ? t(locale, "collection_loading")
              : !hasAny
                ? "คุณยังไม่ได้กดหัวใจวิลล่าหลังไหนเลย"
                : villas.length === 0
                  ? "ไม่พบวิลล่าที่คุณเคยบันทึกไว้"
                  : `คุณบันทึกไว้ทั้งหมด ${villas.length} หลัง`}
          </p>
        </div>

        {!loading && (!hasAny || villas.length === 0) && (
          <div className="mx-auto max-w-md rounded-xl border border-amber-500/20 bg-neutral-900/80 p-8 text-center text-neutral-300">
            <p>
              ยังไม่มีรายการโปรด ลองกลับไปที่หน้ารวมและกดหัวใจที่วิลล่าที่คุณชอบดูนะครับ
            </p>
            <Link
              href="/villas"
              className="mt-6 inline-flex items-center gap-2 text-amber-400 hover:underline"
            >
              ดูวิลล่าทั้งหมด
            </Link>
          </div>
        )}

        {villas.length > 0 && (
          <div className="mt-10 grid grid-cols-1 gap-16 sm:gap-20 md:grid-cols-2 lg:grid-cols-3">
            {villas.map((villa, i) => (
              <motion.div
                key={villa.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <div
                  role="link"
                  tabIndex={0}
                  className="group block cursor-pointer overflow-hidden rounded-xl border border-amber-500/20 bg-neutral-900 transition-all hover:border-amber-400/50 hover:shadow-xl hover:shadow-amber-500/10"
                  onClick={async () => {
                    await recordVillaView(villa.id);
                    router.push(`/villas/${villa.slug}`);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      recordVillaView(villa.id).then(() =>
                        router.push(`/villas/${villa.slug}`)
                      );
                    }
                  }}
                >
                  <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-800">
                    <Image
                      src={villa.images?.[0] ?? FALLBACK_IMAGE}
                      alt={villa.name}
                      fill
                      className="object-cover transition-transform duration-700 group-hover:scale-105"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {villa.status === "SOLD_OUT" && (
                      <span className="absolute right-4 top-4 rounded-lg bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
                        Sold Out
                      </span>
                    )}
                    <div className="absolute right-3 top-3 z-10">
                      <WishlistButton villaId={villa.id} size="sm" />
                    </div>
                    <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/95 shadow-lg backdrop-blur-md border border-white/20">
                      <Eye className="h-3.5 w-3.5 text-amber-300/90" />
                      {formatViewLabel(villa.views)}
                    </span>
                  </div>
                  <div className="p-6 space-y-3">
                    <h2 className="font-playfair text-2xl font-light text-white group-hover:text-amber-400 transition-colors">
                      {getVillaName(villa, locale)}
                    </h2>
                    <p className="flex items-center gap-2 text-sm text-neutral-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-amber-400/60" />
                      {villa.location}
                    </p>
                    <div className="flex items-center gap-4 pt-2 text-xs text-neutral-500">
                      <span className="flex items-center gap-1">
                        <Bed className="h-4 w-4 text-amber-400/60" />
                        {villa.bedrooms} {t(locale, "bed")}
                      </span>
                      <span className="flex items-center gap-1">
                        <Bath className="h-4 w-4 text-amber-400/60" />
                        {villa.bathrooms} {t(locale, "bath")}
                      </span>
                    </div>
                    <p className="pt-4 text-right text-2xl font-light text-white">
                      <span className="text-amber-400">
                        {formatPrice(villa.price, locale)}
                      </span>
                      <span className="ml-2 text-sm font-normal text-neutral-500">
                        {t(locale, "from")}
                      </span>
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

