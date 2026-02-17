"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, Search } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import dynamic from "next/dynamic";
import { VillaCard, type VillaCardItem } from "@/components/VillaCard";
import { Map, Grid } from "lucide-react";

const VillaMap = dynamic(() => import("@/components/VillaMap"), { ssr: false });

type Villa = VillaCardItem & {
  description: string | null;
  isFeatured: boolean;
  latitude: number | null;
  longitude: number | null;
};

function VillasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { locale } = useLocale();
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  const q = searchParams.get("q") ?? "";
  const maxPrice = searchParams.get("maxPrice") ?? "";
  const bedrooms = searchParams.get("bedrooms") ?? "";

  const fetchVillas = useCallback(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (q.trim()) params.set("q", q.trim());
    if (maxPrice.trim()) params.set("maxPrice", maxPrice.trim());
    if (bedrooms.trim()) params.set("bedrooms", bedrooms.trim());
    // If no filters, get all (no featured filter so we show full collection)
    fetch(`/api/villas/public?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => setVillas(Array.isArray(data) ? data : []))
      .catch(() => setVillas([]))
      .finally(() => setLoading(false));
  }, [q, maxPrice, bedrooms]);

  useEffect(() => {
    fetchVillas();
  }, [fetchVillas]);

  const hasFilters = q.trim() || maxPrice.trim() || bedrooms.trim();

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
            {t(locale, "collection_title")}
          </h1>
          {hasFilters && (
            <p className="mt-4 text-neutral-400">
              {t(locale, "search_label")}: {q || "—"} · Max ฿{maxPrice || "—"} · {bedrooms ? `${bedrooms}+ beds` : "—"}
            </p>
          )}
          <p className="mt-4 text-neutral-400">
            {loading
              ? t(locale, "collection_loading")
              : villas.length === 0
                ? t(locale, "collection_none")
                : t(locale, "collection_count", { count: String(villas.length) })}
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="mb-8 flex justify-center">
          <div className="inline-flex rounded-lg border border-amber-500/20 bg-neutral-900/80 p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "grid"
                  ? "bg-amber-500 text-neutral-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Grid className="h-4 w-4" />
              Grid View
            </button>
            <button
              onClick={() => setViewMode("map")}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                viewMode === "map"
                  ? "bg-amber-500 text-neutral-900"
                  : "text-white/70 hover:text-white"
              }`}
            >
              <Map className="h-4 w-4" />
              Map View
            </button>
          </div>
        </div>

        {!loading && villas.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-md rounded-xl border border-amber-500/20 bg-neutral-900/80 p-8 text-center"
          >
            <Search className="mx-auto h-12 w-12 text-amber-400/60" />
            <p className="mt-4 text-lg text-white">
              {t(locale, "collection_none")}
            </p>
            <p className="mt-2 text-sm text-neutral-400">
              {t(locale, "try_adjust_search")}
            </p>
            <Link
              href="/"
              className="mt-6 inline-flex items-center gap-2 text-amber-400 hover:underline"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(locale, "back_to_home")}
            </Link>
          </motion.div>
        )}

        {/* Conditional rendering based on view mode */}
        {viewMode === "grid" ? (
          <div className="grid grid-cols-1 gap-8 sm:gap-12 md:grid-cols-2 lg:grid-cols-3">
            {villas.map((villa, i) => (
              <motion.div
                key={villa.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
              >
                <VillaCard villa={villa} locale={locale} />
              </motion.div>
            ))}
          </div>
        ) : (
          <VillaMap villas={villas} />
        )}
      </main>
    </div>
  );
}

export default function VillasPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-neutral-950 text-white">Loading...</div>}>
      <VillasContent />
    </Suspense>
  );
}
