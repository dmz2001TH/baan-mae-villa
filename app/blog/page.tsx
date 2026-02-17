"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Calendar } from "lucide-react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";

type Article = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  excerpt: string | null;
  createdAt: string;
};

const FALLBACK_COVER = "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80";

export default function BlogIndexPage() {
  const { locale } = useLocale();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles/public")
      .then((res) => res.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
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
              {t(locale, "nav_home")}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        {/* Title */}
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {t(locale, "blog_title")}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-neutral-400">
            {t(locale, "blog_subtitle")}
          </p>
        </div>

        {/* Articles Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <p className="text-neutral-500">{t(locale, "loading_text")}</p>
          </div>
        ) : articles.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-neutral-500">{t(locale, "blog_empty")}</p>
          </div>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((article) => (
              <Link
                key={article.id}
                href={`/blog/${article.slug}`}
                className="group overflow-hidden rounded-2xl border border-white/10 bg-neutral-900/60 transition-all hover:border-amber-400/30 hover:shadow-xl hover:shadow-amber-400/5"
              >
                {/* Cover Image */}
                <div className="relative aspect-[16/10] w-full overflow-hidden">
                  <Image
                    src={article.coverImage || FALLBACK_COVER}
                    alt={article.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="mb-3 flex items-center gap-2 text-xs text-neutral-500">
                    <Calendar className="h-3.5 w-3.5" />
                    {new Date(article.createdAt).toLocaleDateString(
                      locale === "th" ? "th-TH" : locale === "cn" ? "zh-CN" : "en-US",
                      { year: "numeric", month: "long", day: "numeric" }
                    )}
                  </div>
                  <h2 className="mb-2 text-lg font-semibold leading-snug text-white transition-colors group-hover:text-amber-400">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
                      {article.excerpt}
                    </p>
                  )}
                  <span className="mt-4 inline-block text-sm font-medium text-amber-400 transition-colors group-hover:text-amber-300">
                    {t(locale, "blog_read_more")} →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
