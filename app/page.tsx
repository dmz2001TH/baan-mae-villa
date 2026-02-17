"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Waves, TrendingUp, Search, Bed, Bath, ArrowRight, Pencil, ChevronLeft, ChevronRight, Heart, Menu, Gem, Sofa, ShieldCheck } from "lucide-react";
import { useSession } from "next-auth/react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { formatPrice } from "@/lib/currency";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { MaxPriceSlider, PRICE_MAX } from "@/components/MaxPriceSlider";
import { EditableText } from "@/components/EditableText";
import { EditableSection } from "@/components/EditableSection";
import { VillaCarousel } from "@/components/VillaCarousel";
import { Testimonials } from "@/components/Testimonials";
import { useWishlist } from "@/hooks/useWishlist";
import { WHY_CHOOSE_US_TITLE, WHY_CHOOSE_US_ITEMS, d } from "@/lib/dictionary";

type HeroSlide = {
  id: string;
  imageUrl: string;
  titleTh: string | null;
  titleEn: string | null;
  titleCn: string | null;
  subtitleTh: string | null;
  subtitleEn: string | null;
  subtitleCn: string | null;
  linkUrl: string | null;
  order: number;
};

const HERO_AUTOPLAY_MS = 6000;
const HERO_FALLBACK_IMAGE = "https://images.unsplash.com/photo-1613490493576-7fde63acd811";

const fadeInUp = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
};

const fadeIn = {
  initial: { opacity: 0 },
  whileInView: { opacity: 1 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] as const },
};

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
  facilities?: string[];
};

function getVillaName(v: Villa, locale: "th" | "en" | "cn"): string {
  if (locale === "th" && v.nameTh) return v.nameTh;
  if (locale === "en" && v.nameEn) return v.nameEn;
  if (locale === "cn" && v.nameCn) return v.nameCn;
  return v.name;
}

export default function Home() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const { locale } = useLocale();
  const [heroSlides, setHeroSlides] = useState<HeroSlide[]>([]);
  const [villas, setVillas] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [maxPrice, setMaxPrice] = useState(0); // 0 = no limit (slider at left)
  const [bedrooms, setBedrooms] = useState("");
  const [navbarScrolled, setNavbarScrolled] = useState(false);
  const [heroIndex, setHeroIndex] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [contactName, setContactName] = useState("");
  const [contactTel, setContactTel] = useState("");
  const [contactInterest, setContactInterest] = useState("");
  const [contactSubmitting, setContactSubmitting] = useState(false);
  const [contactSuccess, setContactSuccess] = useState<string | null>(null);
  const [contactError, setContactError] = useState<string | null>(null);
  const { ids: wishlistIds } = useWishlist();
  const wishlistCount = wishlistIds.length;
  const [latestArticles, setLatestArticles] = useState<{
    id: string;
    title: string;
    slug: string;
    coverImage: string | null;
    excerpt: string | null;
    createdAt: string;
  }[]>([]);

  const isAdmin =
    sessionStatus === "authenticated" &&
    session?.user &&
    (session.user as { role?: string }).role === "ADMIN";

  useEffect(() => {
    const handleScroll = () => {
      setNavbarScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Hero slides from CMS (custom banners)
  useEffect(() => {
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => setHeroSlides(Array.isArray(data) ? data : []))
      .catch(() => setHeroSlides([]));
  }, []);

  // Auto-play hero carousel
  useEffect(() => {
    if (heroSlides.length <= 1) return;
    const id = setInterval(() => {
      setHeroIndex((i) => (i + 1) % heroSlides.length);
    }, HERO_AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [heroSlides.length]);

  // Latest articles for blog section
  useEffect(() => {
    fetch("/api/articles/public")
      .then((res) => res.json())
      .then((data) => setLatestArticles(Array.isArray(data) ? data.slice(0, 3) : []))
      .catch(() => setLatestArticles([]));
  }, []);

  // Collection: all villas, limit 8 for home (orderBy createdAt desc)
  const COLLECTION_HOME_LIMIT = 8;
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(COLLECTION_HOME_LIMIT));
    fetch(`/api/villas/public?${params}`)
      .then((res) => res.json())
      .then((data) => setVillas(Array.isArray(data) ? data : []))
      .catch(() => setVillas([]))
      .finally(() => setLoading(false));
  }, []);

  const handleSearchSubmit = useCallback(() => {
    const q = searchQuery.trim();
    const params = new URLSearchParams();
    if (q) {
      params.set("q", q);
      // Log search query (fire-and-forget)
      fetch("/api/search-log", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q }),
      }).catch(() => {});
    }
    if (maxPrice > 0 && maxPrice < PRICE_MAX) params.set("maxPrice", String(maxPrice));
    if (bedrooms.trim()) params.set("bedrooms", bedrooms.trim());
    router.push(`/villas?${params}`);
  }, [searchQuery, maxPrice, bedrooms, router]);

  const handleContactSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setContactSubmitting(true);
      setContactSuccess(null);
      setContactError(null);
      try {
        const interestLabel = contactInterest
          ? t(locale, `interest_${contactInterest}`)
          : "";
        const message = interestLabel ? `${t(locale, "contact_interest")} ${interestLabel}` : null;

        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: contactName,
            tel: contactTel,
            message,
            lineId: null,
            visitDate: null,
            villaId: null,
          }),
        });

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          throw new Error(data.error || "Failed to submit request.");
        }

        setContactSuccess(t(locale, "contact_success"));
        setContactName("");
        setContactTel("");
        setContactInterest("");
      } catch (err: any) {
        setContactError(err?.message || "Failed to submit request.");
      } finally {
        setContactSubmitting(false);
      }
    },
    [contactInterest, contactName, contactTel, locale]
  );

  const slidesForHero =
    heroSlides.length > 0
      ? heroSlides
      : ([
          {
            id: "fallback",
            imageUrl: HERO_FALLBACK_IMAGE,
            titleTh: "The Crown Jewel of Pattaya",
            titleEn: "The Crown Jewel of Pattaya",
            titleCn: null,
            subtitleTh: "ประสบการณ์ความหรูระดับ Nordic",
            subtitleEn: "Experience the award-winning Nordic luxury.",
            subtitleCn: null,
            linkUrl: null,
            order: 0,
          },
        ] as HeroSlide[]);
  const currentSlide = slidesForHero[heroIndex];
  const heroImageUrl = currentSlide?.imageUrl ?? HERO_FALLBACK_IMAGE;
  const hasMultipleSlides = slidesForHero.length > 1;

  return (
    <div className="min-h-screen bg-neutral-950">
      {/* ——— NAVBAR (Transparent → Dark Solid on scroll) ——— */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed left-0 right-0 top-0 z-50 transition-all duration-300 ${
          navbarScrolled
            ? "border-b border-amber-500/20 bg-neutral-950/95 backdrop-blur-md shadow-lg shadow-black/50"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-5 sm:px-8">
          <Link
            href="#hero"
            className="font-playfair text-xl font-semibold tracking-wide text-amber-400 transition-colors hover:text-amber-300"
          >
            BAAN MAE
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <ul className="hidden items-center gap-8 sm:flex">
              {[
                { key: "nav_home", href: "#hero" },
                { key: "nav_villas", href: "#villas" },
                { key: "nav_why_us", href: "#features" },
                { key: "nav_contact", href: "#contact" },
              ].map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm font-medium text-white/90 transition-colors hover:text-amber-400"
                  >
                    {t(locale, item.key)}
                  </Link>
                </li>
              ))}
            </ul>
            {/* Desktop wishlist icon */}
            <button
              type="button"
              onClick={() => router.push("/saved")}
              className="relative hidden rounded-full border border-amber-500/40 bg-black/20 p-2.5 text-amber-300 transition-colors transition-transform hover:bg-amber-400/10 hover:text-amber-200 hover:scale-110 sm:inline-flex"
              aria-label="Saved villas"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-black" />
              )}
            </button>
            <LanguageSwitcher variant="dark" />
            {/* Mobile menu toggle */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-black/40 p-2 text-white sm:hidden"
              onClick={() => setMobileMenuOpen((open) => !open)}
              aria-label="Toggle navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </nav>
        {/* Mobile dropdown menu */}
        {mobileMenuOpen && (
          <div className="border-t border-amber-500/20 bg-neutral-950/98 py-3 sm:hidden">
            <div className="mx-auto max-w-7xl px-6 space-y-2 text-sm">
              {[
                { key: "nav_home", href: "#hero" },
                { key: "nav_villas", href: "#villas" },
                { key: "nav_why_us", href: "#features" },
                { key: "nav_contact", href: "#contact" },
              ].map((item) => (
                <button
                  key={item.href}
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    const target = document.querySelector(item.href);
                    if (target) {
                      target.scrollIntoView({ behavior: "smooth" });
                    } else {
                      router.push(`/${item.href}`);
                    }
                  }}
                  className="block w-full rounded-lg px-2 py-2 text-left font-medium text-white/90 hover:bg-neutral-800"
                >
                  {t(locale, item.key)}
                </button>
              ))}
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  router.push("/saved");
                }}
                className="block w-full rounded-lg px-2 py-2 text-left font-medium text-amber-400 hover:bg-neutral-800"
              >
                {t(locale, "saved_villas")}{wishlistCount > 0 ? ` (${wishlistCount})` : ""}
              </button>
            </div>
          </div>
        )}
      </motion.header>

      {/* ——— HERO CAROUSEL (Fade + Ken Burns) ——— */}
      <section id="hero" className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Slide images: stacked layers, fade transition, Ken Burns zoom */}
        <div className="absolute inset-0">
          <AnimatePresence initial={false}>
            <motion.div
              key={currentSlide?.id ?? heroIndex}
              className="absolute inset-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              <motion.div
                className="absolute inset-0"
                initial={{ scale: 1 }}
                animate={{ scale: 1.06 }}
                transition={{ duration: 8, ease: "linear" }}
              >
                <Image
                  src={currentSlide?.imageUrl ?? HERO_FALLBACK_IMAGE}
                  alt="Baan Mae Villa"
                  fill
                  className="object-cover"
                  priority={heroIndex === 0}
                  sizes="100vw"
                />
              </motion.div>
            </motion.div>
          </AnimatePresence>
          <div
            className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20 pointer-events-none"
            aria-hidden
          />
        </div>

        {/* Prev/Next (when multiple slides) */}
        {hasMultipleSlides && (
          <>
            <button
              type="button"
              onClick={() => setHeroIndex((i) => (i === 0 ? slidesForHero.length - 1 : i - 1))}
              className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => setHeroIndex((i) => (i === slidesForHero.length - 1 ? 0 : i + 1))}
              className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}

        {/* Admin edit on slide */}
        {isAdmin && (
          <Link
            href="/admin/hero"
            className="absolute right-4 top-24 z-20 flex items-center gap-2 rounded-lg bg-amber-400/20 px-3 py-2 text-sm font-medium text-amber-400 backdrop-blur-sm hover:bg-amber-400/30"
          >
            <Pencil className="h-4 w-4" />
            {t(locale, "edit")}
          </Link>
        )}

        {/* Global hero text overlay (one for all slides, i18n via EditableText) */}
        <div className="relative z-10 mx-auto max-w-5xl px-6 text-center text-white sm:px-8">
          <h1 className="font-playfair text-5xl font-light tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
            <EditableText
              contentKey="home_hero_title"
              defaultText="The Crown Jewel of Pattaya"
              locale={locale}
            />
          </h1>
          <p className="mt-6 text-lg font-light text-white/90 sm:text-xl md:text-2xl">
            <EditableText
              contentKey="home_hero_subtitle"
              defaultText="Experience the award-winning Nordic luxury."
              locale={locale}
            />
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            {currentSlide?.linkUrl ? (
              <Link
                href={currentSlide.linkUrl}
                className="inline-flex items-center gap-2 border border-amber-400/50 bg-amber-400/10 px-8 py-3 text-sm font-medium text-amber-400 backdrop-blur-sm transition-all hover:bg-amber-400 hover:text-neutral-950"
                onClick={() => currentSlide?.id && fetch(`/api/hero/${currentSlide.id}/click`).catch(() => {})}
              >
                {t(locale, "view_residence")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            ) : (
              <Link
                href="#villas"
                className="inline-flex items-center gap-2 border border-amber-400/50 bg-amber-400/10 px-8 py-3 text-sm font-medium text-amber-400 backdrop-blur-sm transition-all hover:bg-amber-400 hover:text-neutral-950"
                onClick={() => currentSlide?.id && fetch(`/api/hero/${currentSlide.id}/click`).catch(() => {})}
              >
                {t(locale, "nav_villas")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Dots */}
        {hasMultipleSlides && (
          <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
            {slidesForHero.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setHeroIndex(i)}
                className={`h-2 rounded-full transition-all ${
                  i === heroIndex ? "w-8 bg-amber-400" : "w-2 bg-white/50 hover:bg-white/70"
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </section>

      {/* ——— FLOATING SEARCH BAR (Glassmorphism) ——— */}
      <section className="relative -mt-24 z-40 px-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="rounded-xl border border-amber-500/20 bg-black/50 p-6 backdrop-blur-md shadow-2xl shadow-black/50"
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-12">
              <div className="lg:col-span-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-amber-400/80">
                  {t(locale, "search_label")}
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-amber-400/60" />
                  <input
                    type="text"
                    placeholder={t(locale, "search_placeholder")}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearchSubmit()}
                    className="w-full rounded-lg border border-amber-500/30 bg-neutral-900/80 py-2.5 pl-10 pr-3 text-white placeholder-neutral-500 backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                  />
                </div>
              </div>
              <div className="lg:col-span-4">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-amber-400/80">
                  {t(locale, "price_max_budget")}
                </label>
                <MaxPriceSlider
                  value={maxPrice}
                  onChange={setMaxPrice}
                  label={t(locale, "price_max_budget")}
                />
              </div>
              <div className="lg:col-span-3">
                <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-amber-400/80">
                  {t(locale, "bedrooms_min")}
                </label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  className="w-full rounded-lg border border-amber-500/30 bg-neutral-900/80 py-2.5 px-3 text-white backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
                >
                  <option value="">{t(locale, "bedrooms_all")}</option>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n} {t(locale, "bedrooms_suffix")}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end lg:col-span-1">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-300"
                >
                  {t(locale, "search_button")}
                </button>
              </div>
            </div>
            {loading && (
              <p className="mt-4 text-center text-sm text-amber-400/70">
                {t(locale, "loading")}
              </p>
            )}
          </motion.div>
        </div>
      </section>

      {/* ——— VILLA COLLECTION (Embla Carousel) ——— */}
      <VillaCarousel
        villas={villas}
        locale={locale}
        loading={loading}
        showViewAll={villas.length >= COLLECTION_HOME_LIMIT}
        viewAllHref="/villas"
      />

      {/* ——— FEATURES (Editable section + content) ——— */}
      <EditableSection
        contentKey="section_why_us"
        className="border-t border-amber-500/10 bg-neutral-900/50 py-32"
      >
        <div id="features" className="mx-auto max-w-7xl px-6 sm:px-8">
          <motion.h2
            className="mb-24 text-center font-playfair text-4xl font-light text-white sm:text-5xl md:text-6xl"
            {...fadeInUp}
          >
            <EditableText
              contentKey="why_choose_us_title"
              defaultText={d(WHY_CHOOSE_US_TITLE, locale)}
              locale={locale}
            />
          </motion.h2>
          <div className="grid gap-16 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Gem, ...WHY_CHOOSE_US_ITEMS[0] },
              { icon: Sofa, ...WHY_CHOOSE_US_ITEMS[1] },
              { icon: ShieldCheck, ...WHY_CHOOSE_US_ITEMS[2] },
            ].map((item, i) => (
              <motion.div
                key={item.titleKey}
                className="text-center"
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <item.icon className="mx-auto h-10 w-10 text-amber-400" strokeWidth={1.5} />
                <h3 className="mt-6 font-playfair text-xl font-light text-white">
                  <EditableText
                    contentKey={item.titleKey}
                    defaultText={d(item.titleDefault, locale)}
                    locale={locale}
                  />
                </h3>
                <div className="mt-4 text-neutral-400">
                  <EditableText
                    contentKey={item.descKey}
                    defaultText={d(item.descDefault, locale)}
                    locale={locale}
                    as="span"
                    multiline
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </EditableSection>

      {/* ——— TESTIMONIALS ——— */}
      <Testimonials />

      {/* ——— LATEST NEWS (Blog) ——— */}
      {latestArticles.length > 0 && (
        <section className="border-t border-amber-500/10 bg-neutral-950 py-24">
          <div className="mx-auto max-w-7xl px-6 sm:px-8">
            <motion.div className="mb-12 text-center" {...fadeInUp}>
              <h2 className="font-playfair text-4xl font-light text-white sm:text-5xl">
                {t(locale, "latest_news")}
              </h2>
              <p className="mt-4 text-neutral-400">
                {t(locale, "latest_news_sub")}
              </p>
            </motion.div>

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {latestArticles.map((article, i) => (
                <motion.div
                  key={article.id}
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                >
                  <Link
                    href={`/blog/${article.slug}`}
                    className="group block overflow-hidden rounded-2xl border border-amber-500/10 bg-neutral-900/50 transition-all hover:border-amber-400/30 hover:shadow-xl hover:shadow-amber-400/5"
                  >
                    <div className="relative aspect-[16/10] w-full overflow-hidden">
                      <Image
                        src={article.coverImage || "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80"}
                        alt={article.title}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    </div>
                    <div className="p-5">
                      <p className="mb-2 text-xs text-neutral-500">
                        {new Date(article.createdAt).toLocaleDateString(
                          locale === "th" ? "th-TH" : locale === "cn" ? "zh-CN" : "en-US",
                          { year: "numeric", month: "long", day: "numeric" }
                        )}
                      </p>
                      <h3 className="mb-2 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-amber-400">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="line-clamp-2 text-sm text-neutral-400">
                          {article.excerpt}
                        </p>
                      )}
                      <span className="mt-3 inline-block text-sm font-medium text-amber-400">
                        {t(locale, "blog_read_more")} →
                      </span>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>

            <motion.div className="mt-10 text-center" {...fadeIn}>
              <Link
                href="/blog"
                className="inline-flex items-center gap-2 border border-amber-400/40 bg-amber-400/10 px-6 py-3 text-sm font-medium text-amber-400 transition-all hover:bg-amber-400 hover:text-neutral-950"
              >
                {t(locale, "view_all_articles")}
                <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
          </div>
        </section>
      )}

      {/* ——— CONTACT ——— */}
      <section id="contact" className="border-t border-amber-500/10 bg-neutral-950 py-32">
        <div className="mx-auto max-w-2xl px-6 sm:px-8">
          <motion.h2
            className="mb-6 text-center font-playfair text-4xl font-light text-white sm:text-5xl md:text-6xl"
            {...fadeInUp}
          >
            {t(locale, "contact_title")}
          </motion.h2>
          <motion.p
            className="mb-16 text-center text-neutral-400"
            {...fadeIn}
          >
            {t(locale, "contact_sub")}
          </motion.p>
          <motion.form
            className="space-y-6"
            {...fadeInUp}
            onSubmit={handleContactSubmit}
          >
            {contactError && (
              <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                {contactError}
              </p>
            )}
            {contactSuccess && (
              <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200">
                {contactSuccess}
              </p>
            )}
            <div>
              <label htmlFor="name" className="mb-2 block text-sm font-medium text-neutral-300">
                {t(locale, "contact_name")}
              </label>
              <input
                id="name"
                type="text"
                required
                placeholder="Your name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
                className="w-full rounded-lg border border-amber-500/30 bg-neutral-900/80 px-4 py-3 text-white placeholder-neutral-500 backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-2 block text-sm font-medium text-neutral-300">
                {t(locale, "contact_phone")}
              </label>
              <input
                id="phone"
                type="tel"
                required
                placeholder="+66 ..."
                value={contactTel}
                onChange={(e) => setContactTel(e.target.value)}
                className="w-full rounded-lg border border-amber-500/30 bg-neutral-900/80 px-4 py-3 text-white placeholder-neutral-500 backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              />
            </div>
            <div>
              <label htmlFor="interest" className="mb-2 block text-sm font-medium text-neutral-300">
                {t(locale, "contact_interest")}
              </label>
              <select
                id="interest"
                value={contactInterest}
                onChange={(e) => setContactInterest(e.target.value)}
                className="w-full rounded-lg border border-amber-500/30 bg-neutral-900/80 px-4 py-3 text-white backdrop-blur-sm focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="">{t(locale, "select_option")}</option>
                <option value="viewing">{t(locale, "interest_viewing")}</option>
                <option value="fully_furnished">{t(locale, "interest_fully_furnished")}</option>
                <option value="private_jacuzzi">{t(locale, "interest_private_jacuzzi")}</option>
                <option value="high_roi">{t(locale, "interest_high_roi")}</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={contactSubmitting}
              className="mt-6 w-full rounded-lg border border-amber-400 bg-amber-400 px-6 py-4 text-sm font-medium text-neutral-950 transition-colors hover:bg-amber-300"
            >
              {contactSubmitting ? t(locale, "submitting") : t(locale, "submit")}
            </button>
          </motion.form>
        </div>
      </section>

      {/* ——— FOOTER ——— */}
      <footer className="border-t border-amber-500/10 bg-neutral-950 py-12">
        <div className="mx-auto max-w-7xl px-6 text-center text-sm text-neutral-500 sm:px-8">
          © {new Date().getFullYear()}{" "}
          <EditableText
            contentKey="footer_copyright"
            defaultText="Baan Mae Villa. All rights reserved."
            locale={locale}
            as="span"
          />
        </div>
      </footer>
    </div>
  );
}
