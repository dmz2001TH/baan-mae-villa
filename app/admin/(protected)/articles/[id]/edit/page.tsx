"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Upload, X } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  content: string;
  coverImage: string | null;
  excerpt: string | null;
  isPublished: boolean;
};

export default function EditArticlePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    coverImage: "",
    excerpt: "",
    isPublished: false,
  });

  useEffect(() => {
    fetch(`/api/articles/${id}`)
      .then((res) => res.json())
      .then((data: Article) => {
        setForm({
          title: data.title ?? "",
          slug: data.slug ?? "",
          content: data.content ?? "",
          coverImage: data.coverImage ?? "",
          excerpt: data.excerpt ?? "",
          isPublished: data.isPublished ?? false,
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  async function handleCoverUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    formData.set("watermark", "false");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setForm((f) => ({ ...f, coverImage: data.url }));
      } else {
        setUploadError(data.error || "Upload failed");
      }
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/articles/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) router.push("/admin/articles");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <p className="text-neutral-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6">
        <Link
          href="/admin/articles"
          className="mb-4 inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Articles
        </Link>
        <h1 className="text-2xl font-bold text-white">Edit Article</h1>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto max-w-3xl space-y-6">
        {/* Title */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-400">Title *</label>
          <input
            required
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="Article title"
            className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-400">Slug *</label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-neutral-500">/blog/</span>
            <input
              required
              value={form.slug}
              onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
              placeholder="article-slug"
              className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
            />
          </div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-400">Cover Image</label>
          {uploadError && (
            <p className="mb-2 text-sm text-red-400">{uploadError}</p>
          )}
          {form.coverImage ? (
            <div className="relative">
              <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-neutral-700">
                <Image
                  src={form.coverImage}
                  alt="Cover"
                  fill
                  className="object-cover"
                  sizes="700px"
                />
              </div>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, coverImage: "" }))}
                className="absolute right-2 top-2 rounded-full bg-black/70 p-1.5 text-white hover:bg-black"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-neutral-700 bg-neutral-800/50 py-12 text-neutral-400 hover:border-yellow-500/50 hover:text-yellow-400"
            >
              <Upload className="h-5 w-5" />
              {uploading ? "Uploading..." : "Click to upload cover image"}
            </button>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
            className="hidden"
            onChange={handleCoverUpload}
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-400">Excerpt</label>
          <p className="mb-1 text-xs text-neutral-500">Short summary shown on blog listing cards</p>
          <textarea
            value={form.excerpt}
            onChange={(e) => setForm((f) => ({ ...f, excerpt: e.target.value }))}
            rows={3}
            placeholder="Brief description of the article..."
            className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
          />
        </div>

        {/* Content (Rich Text / HTML) */}
        <div>
          <label className="mb-1 block text-sm font-medium text-neutral-400">Content *</label>
          <p className="mb-1 text-xs text-neutral-500">
            Supports HTML tags: &lt;h2&gt;, &lt;h3&gt;, &lt;p&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;ul&gt;, &lt;ol&gt;, &lt;li&gt;, &lt;a&gt;, &lt;img&gt;, &lt;blockquote&gt;
          </p>
          <div className="overflow-hidden rounded-lg border border-neutral-600 bg-neutral-800">
            {/* Simple toolbar */}
            <div className="flex flex-wrap gap-1 border-b border-neutral-700 bg-neutral-900/50 px-3 py-2">
              {[
                { label: "H2", tag: "<h2>", close: "</h2>" },
                { label: "H3", tag: "<h3>", close: "</h3>" },
                { label: "B", tag: "<strong>", close: "</strong>" },
                { label: "I", tag: "<em>", close: "</em>" },
                { label: "P", tag: "<p>", close: "</p>" },
                { label: "UL", tag: "<ul>\n<li>", close: "</li>\n</ul>" },
                { label: "OL", tag: "<ol>\n<li>", close: "</li>\n</ol>" },
                { label: "Link", tag: '<a href="">', close: "</a>" },
                { label: "IMG", tag: '<img src="" alt="" />', close: "" },
                { label: "Quote", tag: "<blockquote>", close: "</blockquote>" },
                { label: "HR", tag: "<hr />", close: "" },
              ].map((btn) => (
                <button
                  key={btn.label}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({
                      ...f,
                      content: f.content + btn.tag + btn.close,
                    }));
                  }}
                  className="rounded px-2.5 py-1 text-xs font-medium text-neutral-300 hover:bg-neutral-700 hover:text-white"
                >
                  {btn.label}
                </button>
              ))}
            </div>
            <textarea
              required
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              rows={20}
              placeholder="Write your article content here (HTML supported)..."
              className="w-full bg-transparent px-4 py-3 font-mono text-sm text-white placeholder-neutral-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Publish toggle */}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((f) => ({ ...f, isPublished: e.target.checked }))}
              className="rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500"
            />
            <span className="text-sm text-neutral-300">Published</span>
          </label>
        </div>

        {/* Actions */}
        <div className="flex gap-3 border-t border-neutral-800 pt-6">
          <Link
            href="/admin/articles"
            className="rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-yellow-400 disabled:opacity-50"
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
