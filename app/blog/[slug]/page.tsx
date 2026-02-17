"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
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
  content: string;
  coverImage: string | null;
  excerpt: string | null;
  createdAt: string;
};

export default function BlogDetailPage() {
  const { locale } = useLocale();
  const params = useParams();
  const slug = params.slug as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/articles/public/slug/${encodeURIComponent(slug)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => setArticle(data))
      .catch(() => setArticle(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <p className="font-medium text-amber-200/80">{t(locale, "loading_text")}</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-black px-4 py-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-neutral-400">{t(locale, "blog_not_found")}</p>
          <Link
            href="/blog"
            className="mt-4 inline-flex items-center gap-2 font-medium text-amber-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(locale, "blog_back")}
          </Link>
        </div>
      </div>
    );
  }

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
              href="/blog"
              className="flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
              {t(locale, "blog_back")}
            </Link>
            <LanguageSwitcher />
          </div>
        </nav>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
        {/* Cover Image */}
        {article.coverImage && (
          <div className="relative mb-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="800px"
              priority
            />
          </div>
        )}

        {/* Meta */}
        <div className="mb-4 flex items-center gap-3 text-sm text-neutral-500">
          <Calendar className="h-4 w-4" />
          {new Date(article.createdAt).toLocaleDateString(
            locale === "th" ? "th-TH" : locale === "cn" ? "zh-CN" : "en-US",
            { year: "numeric", month: "long", day: "numeric" }
          )}
        </div>

        {/* Title */}
        <h1 className="mb-6 text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl">
          {article.title}
        </h1>

        {/* Excerpt */}
        {article.excerpt && (
          <p className="mb-8 border-l-4 border-amber-400/50 pl-4 text-lg leading-relaxed text-neutral-300">
            {article.excerpt}
          </p>
        )}

        {/* Article Content */}
        <article
          className="prose prose-invert prose-lg max-w-none
            prose-headings:font-bold prose-headings:tracking-tight prose-headings:text-white
            prose-h2:mt-10 prose-h2:text-2xl
            prose-h3:mt-8 prose-h3:text-xl
            prose-p:leading-relaxed prose-p:text-neutral-300
            prose-a:text-amber-400 prose-a:no-underline hover:prose-a:underline
            prose-strong:text-white
            prose-blockquote:border-amber-400/50 prose-blockquote:text-neutral-400
            prose-img:rounded-xl prose-img:border prose-img:border-white/10
            prose-li:text-neutral-300
            prose-hr:border-white/10"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />

        {/* Back link */}
        <div className="mt-12 border-t border-white/10 pt-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-medium text-amber-400 hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            {t(locale, "blog_back")}
          </Link>
        </div>
      </main>
    </div>
  );
}
