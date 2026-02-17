"use client";

import { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  MapPin,
  Bed,
  Bath,
  ArrowLeft,
  Waves,
  Car,
  Wifi,
  Dumbbell,
  Eye,
  Sun,
  Pencil,
  Camera,
  X,
  Play,
  LayoutGrid,
  Droplets,
  ArrowUpFromDot,
  Sofa,
  Flame,
  CookingPot,
  Palmtree,
  ShoppingBag,
  Cross,
  GraduationCap,
  UtensilsCrossed,
  Plane,
  Store,
  Landmark,
  TreePine,
  CircleDot,
  Navigation,
} from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { recordVillaView } from "@/lib/villa-view";
import { FACILITY_KEYS, FACILITY_LABELS, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { BookingForm } from "@/components/BookingForm";
import { WishlistButton } from "@/components/WishlistButton";
import { VillaCarousel, type VillaCarouselItem } from "@/components/VillaCarousel";
import { VillaGallery } from "@/components/VillaGallery";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";

type Villa = {
  id: string;
  name: string;
  slug: string;
  location: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  description: string | null;
  images: string[];
  isFeatured: boolean;
  status: string;
  discountPercentage: number;
  nameTh?: string | null;
  nameEn?: string | null;
  nameCn?: string | null;
  descriptionTh?: string | null;
  descriptionEn?: string | null;
  descriptionCn?: string | null;
  locationEn?: string | null;
  locationCn?: string | null;
  featuresEn?: string | null;
  featuresCn?: string | null;
  facilities?: string[];
  mapEmbedUrl?: string | null;
  threeDTourUrl?: string | null;
  floorPlanUrl?: string | null;
  videoTourUrl?: string | null;
  nearbyPlaces?: { name: string; distance: string; type: string }[] | null;
};

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811";

const FACILITY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pool: Waves,
  parking: Car,
  near_beach: Sun,
  wifi: Wifi,
  gym: Dumbbell,
  sea_view: Eye,
  jacuzzi: Droplets,
  double_volume: ArrowUpFromDot,
  fully_furnished: Sofa,
  infrared_sauna: Flame,
  european_kitchen: CookingPot,
};

const NEARBY_PLACE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Beach: Palmtree,
  Mall: ShoppingBag,
  Hospital: Cross,
  School: GraduationCap,
  Restaurant: UtensilsCrossed,
  Airport: Plane,
  Market: Store,
  Temple: Landmark,
  Park: TreePine,
  Other: CircleDot,
};

function getVillaName(v: Villa, locale: Locale): string {
  if (locale === "th" && v.nameTh) return v.nameTh;
  if (locale === "en" && v.nameEn) return v.nameEn;
  if (locale === "cn" && v.nameCn) return v.nameCn;
  return v.name;
}

function getVillaDescription(v: Villa, locale: Locale): string | null {
  if (locale === "th" && v.descriptionTh) return v.descriptionTh;
  if (locale === "en" && v.descriptionEn) return v.descriptionEn;
  if (locale === "cn" && v.descriptionCn) return v.descriptionCn;
  return v.description;
}

function getVillaLocation(v: Villa, locale: Locale): string {
  if (locale === "en" && v.locationEn) return v.locationEn;
  if (locale === "cn" && v.locationCn) return v.locationCn;
  return v.location;
}

function getVillaFeatures(v: Villa, locale: Locale): string | null {
  if (locale === "en" && v.featuresEn) return v.featuresEn;
  if (locale === "cn" && v.featuresCn) return v.featuresCn;
  return null;
}

export default function VillaDetailPage() {
  const { data: session, status: sessionStatus } = useSession();
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
  const [editSection, setEditSection] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [show3DModal, setShow3DModal] = useState(false);
  const [showFloorPlanModal, setShowFloorPlanModal] = useState(false);
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [relatedVillas, setRelatedVillas] = useState<VillaCarouselItem[]>([]);

  const isAdmin =
    sessionStatus === "authenticated" &&
    session?.user &&
    (session.user as { role?: string }).role === "ADMIN";

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/villas/public/slug/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setVilla(data))
      .catch(() => setVilla(null))
      .finally(() => setLoading(false));
  }, [slug]);

  // Record view when user lands on this page (same 1h dedup as card click)
  useEffect(() => {
    if (villa?.id) recordVillaView(villa.id);
  }, [villa?.id]);

  // Load related villas (same bedrooms and/or similar price) for recommendation section
  useEffect(() => {
    if (!villa) return;
    const params = new URLSearchParams();
    if (villa.price != null) {
      const minPrice = Math.max(0, Math.floor(villa.price * 0.8));
      const maxPrice = Math.floor(villa.price * 1.2);
      params.set("minPrice", String(minPrice));
      params.set("maxPrice", String(maxPrice));
    }
    params.set("bedrooms", String(villa.bedrooms));
    params.set("limit", "12");
    fetch(`/api/villas/public?${params.toString()}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const filtered = list
          .filter((v: any) => v.id !== villa.id)
          .slice(0, 8) as VillaCarouselItem[];
        setRelatedVillas(filtered);
      })
      .catch(() => setRelatedVillas([]));
  }, [villa]);

  async function patchVilla(data: Partial<Villa>) {
    if (!villa?.id) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/villas/${villa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        const updated = await res.json();
        setVilla(updated);
        setEditSection(null);
      }
    } finally {
      setSaving(false);
    }
  }

  function handleSaveTitle() {
    const name = editForm.name?.trim();
    const location = editForm.location?.trim();
    const payload: Partial<Villa> = {};
    if (name) payload.name = name;
    if (location !== undefined) payload.location = location;
    if (Object.keys(payload).length) patchVilla(payload);
    setEditSection(null);
  }

  function handleSavePrice() {
    const p = Number(editForm.price);
    if (!Number.isNaN(p) && p >= 0) patchVilla({ price: p });
    setEditSection(null);
  }

  function handleSaveDescription() {
    const d = editForm.description ?? "";
    patchVilla({ description: d || null });
    setEditSection(null);
  }

  function handleSaveMap() {
    const url = editForm.mapEmbedUrl?.trim() || "";
    patchVilla({ mapEmbedUrl: url || null });
    setEditSection(null);
  }

  function toggleFacility(key: string) {
    if (!villa) return;
    const current = villa.facilities ?? [];
    const next = current.includes(key)
      ? current.filter((x) => x !== key)
      : [...current, key];
    patchVilla({ facilities: next });
  }

  async function handleGalleryUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !villa) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        const newImages = [...(villa.images ?? []), data.url];
        await patchVilla({ images: newImages });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="font-medium text-amber-200/80">Loading...</p>
      </div>
    );
  }

  if (!villa) {
    return (
      <div className="min-h-screen bg-black px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-neutral-400">Villa not found.</p>
          <Link
            href="/"
            className="mt-4 inline-flex items-center gap-2 font-medium text-amber-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(locale, "view_villas")}
          </Link>
        </div>
      </div>
    );
  }

  const images = villa.images?.length ? villa.images : [FALLBACK_IMAGE];
  const displayName = getVillaName(villa, locale);
  const displayDesc = getVillaDescription(villa, locale);
  const facilities = villa.facilities ?? [];

  /** Multimedia buttons (3D, Floor plan, Video) — only on the main hero image */
  const multimediaButtons = (
    <div className="absolute bottom-3 left-3 right-3 flex flex-wrap gap-2">
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShow3DModal(true); }}
        className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/85"
      >
        <Play className="h-4 w-4" />
        {t(locale, "tour_3d")}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowFloorPlanModal(true); }}
        className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/85"
      >
        <LayoutGrid className="h-4 w-4" />
        {t(locale, "floor_plan")}
      </button>
      <button
        type="button"
        onClick={(e) => { e.stopPropagation(); setShowVideoModal(true); }}
        className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-sm font-medium text-white backdrop-blur-sm hover:bg-black/85"
      >
        <Play className="h-4 w-4" />
        {t(locale, "video_tour")}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white">
      {/* ——— Header ——— */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-black/90 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="text-xl font-semibold tracking-wide text-amber-400"
          >
            BAAN MAE VILLA
          </Link>
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(locale, "view_villas")}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {/* Grid 70:30 */}
        <div className="grid gap-8 lg:grid-cols-10">
          {/* ——— LEFT COLUMN 70% ——— */}
          <div className="space-y-8 lg:col-span-7">
            {/* New synchronized gallery with thumbnails + lightbox */}
            <section className="relative">
              <VillaGallery
                images={images}
                alt={displayName}
                overlay={multimediaButtons}
              />
              {isAdmin && (
                <>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="absolute right-3 top-3 z-10 flex items-center gap-2 rounded-lg bg-amber-400 px-3 py-2 text-sm font-medium text-black shadow-lg hover:bg-amber-300 disabled:opacity-50"
                    title={t(locale, "upload_photo")}
                  >
                    <Camera className="h-4 w-4" />
                    {t(locale, "upload_photo")}
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleGalleryUpload}
                  />
                </>
              )}
            </section>

            {/* Section: Title & Location */}
            <section className="relative border-t border-white/10 pt-6">
              {isAdmin && editSection !== "title" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditSection("title");
                    setEditForm({ name: villa.name, location: villa.location });
                  }}
                  className="absolute right-0 top-6 flex items-center gap-1 rounded bg-amber-400/20 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-400/30"
                >
                  <Pencil className="h-3.5 w-3.5" /> {t(locale, "edit")}
                </button>
              )}
              {editSection === "title" ? (
                <div className="space-y-2 rounded-xl border border-amber-400/30 bg-neutral-900/80 p-4">
                  <input
                    value={editForm.name ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, name: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                    placeholder="Name"
                  />
                  <input
                    value={editForm.location ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, location: e.target.value }))}
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                    placeholder="Location"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveTitle}
                      disabled={saving}
                      className="rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-black"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSection(null)}
                      className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between gap-3">
                    <h1 className="text-3xl font-bold tracking-tight text-white md:text-4xl">
                      {displayName}
                    </h1>
                    <div className="mt-1 hidden md:block">
                      <WishlistButton villaId={villa.id} />
                    </div>
                  </div>
                  <div className="mt-4 flex flex-wrap items-center gap-4 text-neutral-400">
                    <span className="flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 text-amber-400/80" />
                      {getVillaLocation(villa, locale)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bed className="h-5 w-5 text-amber-400/80" />
                      {villa.bedrooms} {t(locale, "bed")}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Bath className="h-5 w-5 text-amber-400/80" />
                      {villa.bathrooms} {t(locale, "bath")}
                    </span>
                  </div>
                  <div className="mt-3 md:hidden">
                    <WishlistButton villaId={villa.id} />
                  </div>
                </>
              )}
            </section>

            {/* Section: Facilities */}
            <section className="border-t border-white/10 pt-6">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                {t(locale, "facilities_title")}
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                {FACILITY_KEYS.map((key) => {
                  const Icon = FACILITY_ICONS[key];
                  const label = FACILITY_LABELS[key]?.[locale] ?? key;
                  const active = facilities.includes(key);
                  const canToggle = isAdmin;
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => canToggle && toggleFacility(key)}
                      className={`flex flex-col items-center gap-2 rounded-xl border p-4 text-sm transition-colors ${
                        active
                          ? "border-amber-400/40 bg-amber-400/10 text-amber-400"
                          : "border-white/10 bg-white/5 text-neutral-500"
                      } ${canToggle ? "cursor-pointer hover:border-amber-400/30" : "cursor-default"}`}
                      title={canToggle ? (active ? "Click to remove" : "Click to add") : label}
                    >
                      <Icon className="h-6 w-6" />
                      <span className="font-medium">{label}</span>
                    </button>
                  );
                })}
              </div>
              {/* Localized features text (from DB) */}
              {getVillaFeatures(villa, locale) && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                    {t(locale, "features_title")}
                  </h3>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-neutral-300">
                    {getVillaFeatures(villa, locale)}
                  </p>
                </div>
              )}
            </section>

            {/* Section: Description */}
            <section className="relative border-t border-white/10 pt-6">
              {isAdmin && editSection !== "description" && (
                <button
                  type="button"
                  onClick={() => {
                    setEditSection("description");
                    setEditForm({
                      description: (displayDesc ?? villa.description) ?? "",
                    });
                  }}
                  className="absolute right-0 top-6 flex items-center gap-1 rounded bg-amber-400/20 px-2.5 py-1.5 text-xs font-medium text-amber-400 hover:bg-amber-400/30"
                >
                  <Pencil className="h-3.5 w-3.5" /> {t(locale, "edit")}
                </button>
              )}
              {editSection === "description" ? (
                <div className="space-y-2 rounded-xl border border-amber-400/30 bg-neutral-900/80 p-4">
                  <textarea
                    value={editForm.description ?? ""}
                    onChange={(e) =>
                      setEditForm((f) => ({ ...f, description: e.target.value }))
                    }
                    rows={6}
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={handleSaveDescription}
                      disabled={saving}
                      className="rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-black"
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditSection(null)}
                      className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-400"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="text-lg font-semibold text-white">{t(locale, "description")}</h2>
                  <p className="mt-3 whitespace-pre-wrap leading-relaxed text-neutral-300">
                    {displayDesc ?? villa.description ?? "—"}
                  </p>
                </>
              )}
            </section>

            {/* Section: Location & Nearby Places */}
            {villa.nearbyPlaces && Array.isArray(villa.nearbyPlaces) && villa.nearbyPlaces.length > 0 && (
              <section className="border-t border-white/10 pt-6">
                <div className="flex items-center gap-2">
                  <Navigation className="h-5 w-5 text-amber-400" />
                  <h2 className="text-lg font-semibold text-white">{t(locale, "nearby_title")}</h2>
                </div>
                <p className="mt-2 text-sm text-neutral-400">
                  {t(locale, "nearby_subtitle")}
                </p>
                <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {villa.nearbyPlaces.map((place: { name: string; distance: string; type: string }, idx: number) => {
                    const Icon = NEARBY_PLACE_ICONS[place.type] || CircleDot;
                    const typeLabel = t(locale, `nearby_${place.type.toLowerCase()}`);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-4 rounded-xl border border-white/10 bg-neutral-900/60 p-4 transition-colors hover:border-amber-400/30 hover:bg-neutral-900/80"
                      >
                        <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg bg-amber-400/10">
                          <Icon className="h-5 w-5 text-amber-400" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-white">{place.name}</p>
                          <p className="text-sm text-neutral-400">{place.distance}</p>
                        </div>
                        <span className="flex-shrink-0 rounded-full bg-white/5 px-2.5 py-1 text-xs font-medium text-neutral-400">
                          {typeLabel}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* ——— RIGHT COLUMN 30% ——— Sticky Sidebar (Price + Mini Map) */}
          <div className="lg:col-span-3">
            <div className="sticky top-24 space-y-6 rounded-2xl border border-white/10 bg-neutral-900/90 p-6 shadow-xl backdrop-blur-sm">
              {/* Price */}
              <div className="relative">
                {isAdmin && editSection !== "price" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditSection("price");
                      setEditForm({ price: String(villa.price) });
                    }}
                    className="absolute right-0 top-0 flex items-center gap-1 rounded bg-amber-400/20 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-400/30"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {t(locale, "edit")}
                  </button>
                )}
                {editSection === "price" ? (
                  <div className="space-y-2">
                    <input
                      type="number"
                      min={0}
                      value={editForm.price ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, price: e.target.value }))
                      }
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSavePrice}
                        disabled={saving}
                        className="rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-black"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSection(null)}
                        className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-400"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Discount Price Display */}
                    {villa.discountPercentage > 0 ? (
                      <div className="space-y-2">
                        {/* Original price (strikethrough) */}
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-neutral-400">{t(locale, "from")}</p>
                          <span className="text-neutral-400 line-through text-lg">
                            {formatPrice(villa.price, locale)}
                          </span>
                        </div>
                        {/* Discounted price with badge */}
                        <div className="flex items-center justify-between gap-4">
                          <div className="flex items-center gap-2">
                            <span className="text-amber-400 text-4xl font-bold">
                              {formatPrice(villa.price * (1 - villa.discountPercentage / 100), locale)}
                            </span>
                            <span className="rounded bg-red-600 px-2 py-1 text-sm font-semibold text-white">
                              -{villa.discountPercentage}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      /* Regular price (no discount) */
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-neutral-400">{t(locale, "from")}</p>
                        <p className="text-3xl font-bold text-amber-400">
                          {formatPrice(villa.price, locale)}
                        </p>
                      </div>
                    )}
                    <p className="text-sm text-neutral-500">{t(locale, "per_unit")}</p>
                  </>
                )}
              </div>

              {/* Mortgage Calculator - Use discounted price if available */}
              <MortgageCalculator 
                price={villa.discountPercentage > 0 
                  ? villa.price * (1 - villa.discountPercentage / 100) 
                  : villa.price} 
                locale={locale} 
              />

              {/* Availability Calendar */}
              <AvailabilityCalendar 
                villaId={villa.id}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />

              <Link
                href="/#contact"
                className="flex w-full items-center justify-center rounded-xl bg-amber-400 px-6 py-4 font-semibold text-black transition-colors hover:bg-amber-300"
              >
                {t(locale, "book_now")}
              </Link>

              {/* Booking form (Lead generation) */}
              <BookingForm villaId={villa.id} villaName={getVillaName(villa, locale)} />

              {/* Beds / Baths */}
              <div className="flex items-center justify-between border-t border-white/10 pt-4 text-sm">
                <span className="flex items-center gap-2 text-neutral-300">
                  <Bed className="h-5 w-5 text-amber-400/80" />
                  {villa.bedrooms} {t(locale, "bed")}
                </span>
                <span className="flex items-center gap-2 text-neutral-300">
                  <Bath className="h-5 w-5 text-amber-400/80" />
                  {villa.bathrooms} {t(locale, "bath")}
                </span>
              </div>

              {/* Mini Map (in sidebar) */}
              <div className="border-t border-white/10 pt-4">
                {isAdmin && editSection !== "map" && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditSection("map");
                      setEditForm({ mapEmbedUrl: villa.mapEmbedUrl ?? "" });
                    }}
                    className="mb-2 flex items-center gap-1 rounded bg-amber-400/20 px-2 py-1 text-xs font-medium text-amber-400 hover:bg-amber-400/30"
                  >
                    <Pencil className="h-3.5 w-3.5" /> {t(locale, "edit")} Map
                  </button>
                )}
                {editSection === "map" ? (
                  <div className="space-y-2">
                    <input
                      value={editForm.mapEmbedUrl ?? ""}
                      onChange={(e) =>
                        setEditForm((f) => ({ ...f, mapEmbedUrl: e.target.value }))
                      }
                      className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-xs text-white"
                      placeholder="Google Maps embed URL"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={handleSaveMap}
                        disabled={saving}
                        className="rounded bg-amber-400 px-3 py-1.5 text-sm font-medium text-black"
                      >
                        Save
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditSection(null)}
                        className="rounded border border-neutral-600 px-3 py-1.5 text-sm text-neutral-400"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {villa.mapEmbedUrl ? (
                      <>
                        <div className="aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-neutral-800">
                          <iframe
                            src={villa.mapEmbedUrl}
                            width="100%"
                            height="100%"
                            style={{ border: 0 }}
                            allowFullScreen
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Map"
                            className="h-full min-h-[180px] w-full"
                          />
                        </div>
                        <a
                          href={villa.mapEmbedUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 inline-block text-sm font-medium text-amber-400 hover:underline"
                        >
                          {t(locale, "view_on_map")}
                        </a>
                      </>
                    ) : (
                      <p className="rounded-xl border border-white/10 bg-neutral-800/50 py-8 text-center text-sm text-neutral-500">
                        No map linked.
                      </p>
                    )}
                  </>
                )}
              </div>

              <p className="text-center text-xs text-neutral-500">
                Contact us for viewing & investment details
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* 3D Tour Modal */}
      {show3DModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShow3DModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShow3DModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full">
              {villa?.threeDTourUrl ? (
                <iframe
                  src={villa.threeDTourUrl}
                  title="3D Tour"
                  className="h-full w-full"
                  allowFullScreen
                />
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-500">
                  {t(locale, "no_tour") || "No 3D tour available"}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Floor Plan Modal */}
      {showFloorPlanModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowFloorPlanModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowFloorPlanModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="relative aspect-video w-full">
              {villa?.floorPlanUrl ? (
                villa.floorPlanUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                  <Image src={villa.floorPlanUrl} alt="Floor plan" fill className="object-contain" sizes="800px" />
                ) : (
                  <iframe src={villa.floorPlanUrl} title="Floor plan" className="absolute inset-0 h-full w-full" />
                )
              ) : (
                <div className="flex h-full min-h-[200px] items-center justify-center text-neutral-500">
                  No floor plan linked.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Video Tour Modal */}
      {showVideoModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setShowVideoModal(false)}
        >
          <div
            className="relative max-h-[90vh] w-full max-w-4xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowVideoModal(false)}
              className="absolute right-4 top-4 z-10 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="aspect-video w-full">
              {villa?.videoTourUrl ? (
                <iframe
                  src={villa.videoTourUrl}
                  title="Video tour"
                  className="h-full w-full"
                  allowFullScreen
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-neutral-500">
                  No video tour linked.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
