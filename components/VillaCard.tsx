"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, Bed, Bath, Eye } from "lucide-react";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { recordVillaView, formatViewLabel } from "@/lib/villa-view";
import type { Locale } from "@/lib/i18n";
import { WishlistButton } from "@/components/WishlistButton";

export type VillaCardItem = {
  id: string;
  slug: string;
  name: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  images: string[];
  status: string;
  discountPercentage: number;
  views?: number;
  nameTh?: string | null;
  nameEn?: string | null;
  nameCn?: string | null;
  locationEn?: string | null;
  locationCn?: string | null;
};

function getVillaName(v: VillaCardItem, locale: Locale): string {
  if (locale === "th" && v.nameTh) return v.nameTh;
  if (locale === "en" && v.nameEn) return v.nameEn;
  if (locale === "cn" && v.nameCn) return v.nameCn;
  return v.name;
}

function getVillaLocation(v: VillaCardItem, locale: Locale): string {
  if (locale === "en" && v.locationEn) return v.locationEn;
  if (locale === "cn" && v.locationCn) return v.locationCn;
  return v.location;
}

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811";

type Props = {
  villa: VillaCardItem;
  locale: Locale;
};

export function VillaCard({ villa, locale }: Props) {
  const router = useRouter();

  const handleCardClick = async () => {
    const href = `/villas/${villa.slug}`;
    await recordVillaView(villa.id);
    router.push(href);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <div
      role="link"
      tabIndex={0}
      className="group relative overflow-hidden rounded-xl border border-white/10 transition-all hover:border-amber-400/40 hover:shadow-xl hover:shadow-amber-500/10 flex flex-col h-full"
      onClick={handleCardClick}
      onKeyDown={handleKeyDown}
    >
      {/* Ribbon Discount Badge - Top Left */}
      {villa.discountPercentage > 0 && (
        <div className="absolute top-6 -left-10 z-20 w-40 -rotate-45 transform bg-red-600 py-1 text-center text-xs font-semibold text-white shadow-md">
          SALE -{villa.discountPercentage}%
        </div>
      )}

      {/* Image Section with fixed height */}
      <div className="relative h-64 w-full overflow-hidden flex-shrink-0">
        <Image
          src={villa.images?.[0] ?? FALLBACK_IMAGE}
          alt={villa.name}
          fill
          className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 768px) 85vw, (max-width: 1024px) 50vw, 25vw"
        />
        
        {/* Status Badge */}
        {villa.status === "SOLD_OUT" && (
          <span className="absolute right-4 top-4 rounded-lg bg-neutral-900/90 px-3 py-1.5 text-xs font-medium text-neutral-300 backdrop-blur-sm">
            {t(locale, "sold_out")}
          </span>
        )}
        
        {/* Wishlist Button */}
        <div className="absolute right-3 top-3 z-10">
          <WishlistButton villaId={villa.id} size="sm" />
        </div>
        
        {/* View Count */}
        <span className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded-xl bg-white/10 px-2.5 py-1.5 text-xs font-medium text-white/95 shadow-lg backdrop-blur-md border border-white/20">
          <Eye className="h-3.5 w-3.5 text-amber-300/90" />
          {formatViewLabel(villa.views)}
        </span>
      </div>

      {/* Content Section */}
      <div className="bg-neutral-900 p-4 space-y-3 rounded-b-xl flex flex-col flex-1">
        {/* Villa Name - 1 line truncation */}
        <h3 className="font-playfair text-2xl font-light text-white group-hover:text-amber-400 transition-colors truncate">
          {getVillaName(villa, locale)}
        </h3>
        
        {/* Location - 1 line truncation */}
        <p className="flex items-center gap-2 text-sm text-neutral-400 truncate">
          <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-amber-400/60" />
          {getVillaLocation(villa, locale)}
        </p>
        
        {/* Beds & Baths */}
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
        
        {/* Price Section - Pushed to bottom with fixed height */}
        <div className="mt-auto h-[4.5rem] flex flex-col justify-end pt-4 text-right text-2xl font-light text-white">
          {villa.discountPercentage > 0 && (
            <div className="mb-1">
              <span className="text-sm text-neutral-400 line-through">
                {formatPrice(villa.price, locale)}
              </span>
              <span className="ml-2 text-xs font-normal text-neutral-500">
                {t(locale, "from")}
              </span>
            </div>
          )}
          <div className="flex items-center justify-end gap-2">
            <span className="text-amber-400">
              {formatPrice(
                villa.discountPercentage > 0
                  ? villa.price * (1 - villa.discountPercentage / 100)
                  : villa.price,
                locale
              )}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
