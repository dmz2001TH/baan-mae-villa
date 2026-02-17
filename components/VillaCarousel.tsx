"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { t } from "@/lib/i18n";
import { VillaCard, type VillaCardItem } from "@/components/VillaCard";
import type { Locale } from "@/lib/i18n";

export type VillaCarouselItem = VillaCardItem;

type Props = {
  villas: VillaCarouselItem[];
  locale: Locale;
  loading?: boolean;
  showViewAll?: boolean;
  viewAllHref?: string;
};

export function VillaCarousel({
  villas,
  locale,
  loading = false,
  showViewAll = false,
  viewAllHref = "/villas",
}: Props) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: false,
    align: "start",
    containScroll: "trimSnaps",
    duration: 25,
  });
  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const updateScrollButtons = useCallback(() => {
    if (!emblaApi) return;
    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    updateScrollButtons();
    emblaApi.on("select", updateScrollButtons);
    emblaApi.on("reInit", updateScrollButtons);
    return () => {
      emblaApi.off("select", updateScrollButtons);
      emblaApi.off("reInit", updateScrollButtons);
    };
  }, [emblaApi, updateScrollButtons]);

  return (
    <section id="villas" className="py-32">
      <div className="mx-auto max-w-7xl px-6 sm:px-8">
        <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="font-playfair text-4xl font-light text-white sm:text-5xl md:text-6xl">
              {t(locale, "collection_title")}
            </h2>
            <p className="mt-2 text-neutral-400">
              {loading
                ? t(locale, "collection_loading")
                : villas.length === 0
                  ? t(locale, "collection_none")
                  : t(locale, "collection_count", { count: String(villas.length) })}
            </p>
          </div>
          {villas.length > 0 && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                disabled={!canScrollPrev}
                className="rounded-full border border-amber-500/30 bg-neutral-900/80 p-2.5 text-amber-400 transition-colors hover:bg-amber-400/10 hover:border-amber-400/50 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Previous"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                disabled={!canScrollNext}
                className="rounded-full border border-amber-500/30 bg-neutral-900/80 p-2.5 text-amber-400 transition-colors hover:bg-amber-400/10 hover:border-amber-400/50 disabled:opacity-40 disabled:pointer-events-none"
                aria-label="Next"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            </div>
          )}
        </div>

        <div className="embla overflow-hidden px-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" ref={emblaRef}>
          <div className="embla__container flex">
            {villas.map((villa) => (
              <div
                key={villa.id}
                className="embla__slide min-w-0 flex-none basis-[85%] pl-4 md:basis-1/2 lg:basis-1/4"
              >
                <VillaCard villa={villa} locale={locale} />
              </div>
            ))}
          </div>
        </div>

        {showViewAll && (
          <div className="mt-12 text-center">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-400/50 bg-amber-400/10 px-8 py-3 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-400 hover:text-neutral-950"
            >
              {t(locale, "view_all_villas")}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
