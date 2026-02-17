"use client";

import { useEffect, useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { Plus, Pencil, Trash2 } from "lucide-react";

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

const emptySlide: Omit<HeroSlide, "id" | "order"> = {
  imageUrl: "",
  titleTh: null,
  titleEn: null,
  titleCn: null,
  subtitleTh: null,
  subtitleEn: null,
  subtitleCn: null,
  linkUrl: null,
};

export default function AdminHeroPage() {
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<HeroSlide | null>(null);
  const [uploading, setUploading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const imageUrlEmpty = !form?.imageUrl?.trim();

  function fetchSlides() {
    setLoading(true);
    fetch("/api/hero")
      .then((res) => res.json())
      .then((data) => setSlides(Array.isArray(data) ? data : []))
      .catch(() => setSlides([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchSlides();
  }, []);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.set("file", file);
    fd.set("watermark", "false");
    try {
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url && form) {
        setForm({ ...form, imageUrl: data.url });
      }
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function startAdd() {
    const maxOrder = slides.length ? Math.max(...slides.map((s) => s.order), 0) : 0;
    setForm({
      id: "",
      ...emptySlide,
      imageUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811",
      order: maxOrder + 1,
    } as HeroSlide);
    setEditingId("new");
  }

  function startEdit(slide: HeroSlide) {
    setForm({ ...slide });
    setEditingId(slide.id);
  }

  async function saveSlide() {
    if (!form) return;
    if (!form.imageUrl?.trim()) {
      setSaveError("Image URL is required. Please add or upload an image.");
      return;
    }
    setSaveError(null);
    if (editingId === "new") {
      const res = await fetch("/api/hero", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: form.imageUrl.trim(),
          titleTh: form.titleTh?.trim() || null,
          titleEn: form.titleEn?.trim() || null,
          titleCn: form.titleCn?.trim() || null,
          subtitleTh: form.subtitleTh?.trim() || null,
          subtitleEn: form.subtitleEn?.trim() || null,
          subtitleCn: form.subtitleCn?.trim() || null,
          linkUrl: form.linkUrl?.trim() || null,
          order: form.order,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm(null);
        setEditingId(null);
        fetchSlides();
      } else {
        setSaveError(data.error || "Failed to save.");
      }
    } else {
      const res = await fetch(`/api/hero/${form.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageUrl: form.imageUrl.trim(),
          titleTh: form.titleTh?.trim() || null,
          titleEn: form.titleEn?.trim() || null,
          titleCn: form.titleCn?.trim() || null,
          subtitleTh: form.subtitleTh?.trim() || null,
          subtitleEn: form.subtitleEn?.trim() || null,
          subtitleCn: form.subtitleCn?.trim() || null,
          linkUrl: form.linkUrl?.trim() || null,
          order: form.order,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        setForm(null);
        setEditingId(null);
        fetchSlides();
      } else {
        setSaveError(data.error || "Failed to save.");
      }
    }
  }

  async function deleteSlide(id: string) {
    if (!confirm("Delete this slide?")) return;
    const res = await fetch(`/api/hero/${id}`, { method: "DELETE" });
    if (res.ok) {
      setEditingId(null);
      setForm(null);
      fetchSlides();
    }
  }

  return (
    <div className="p-6 sm:p-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-white">Hero Slides</h1>
        <button
          type="button"
          onClick={startAdd}
          className="flex items-center gap-2 rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400"
        >
          <Plus className="h-4 w-4" />
          Add Slide
        </button>
      </div>
      <p className="mb-6 text-sm text-neutral-400">
        Manage the carousel on the home page. Upload any image and set title/subtitle in TH, EN, CN. Optional link URL for the CTA button.
      </p>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : (
        <div className="space-y-6">
          {slides.map((slide) => (
            <div
              key={slide.id}
              className="flex flex-col gap-4 rounded-xl border border-neutral-700 bg-neutral-900/80 p-4 sm:flex-row sm:items-start"
            >
              <div className="relative h-32 w-full flex-shrink-0 overflow-hidden rounded-lg bg-neutral-800 sm:h-24 sm:w-40">
                <Image
                  src={slide.imageUrl}
                  alt={slide.titleEn || slide.titleTh || "Slide"}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-white">
                  {slide.titleEn || slide.titleTh || "(No title)"}
                </p>
                <p className="text-sm text-neutral-400">
                  {slide.subtitleEn || slide.subtitleTh || "(No subtitle)"}
                </p>
                {slide.linkUrl && (
                  <p className="mt-1 text-xs text-amber-400/80">Link: {slide.linkUrl}</p>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => startEdit(slide)}
                  className="rounded-lg border border-neutral-600 px-3 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => deleteSlide(slide.id)}
                  className="rounded-lg border border-red-500/50 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {slides.length === 0 && !form && (
            <p className="rounded-xl border border-dashed border-neutral-700 py-12 text-center text-neutral-500">
              No slides yet. Click &quot;Add Slide&quot; to create one.
            </p>
          )}
        </div>
      )}

      {/* Edit / Add Modal */}
      {form && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
          onClick={() => setEditingId(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl border border-neutral-700 bg-neutral-900 p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="mb-4 text-lg font-semibold text-white">
              {editingId === "new" ? "New Slide" : "Edit Slide"}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-sm text-neutral-400">Image URL (required)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={form.imageUrl}
                    onChange={(e) => {
                      setForm({ ...form, imageUrl: e.target.value });
                      setSaveError(null);
                    }}
                    className={`flex-1 rounded-lg border bg-neutral-800 px-3 py-2 text-white ${
                      imageUrlEmpty ? "border-red-500/60" : "border-neutral-600"
                    }`}
                  />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleUpload}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="rounded-lg bg-neutral-700 px-3 py-2 text-sm text-white hover:bg-neutral-600 disabled:opacity-50"
                  >
                    {uploading ? "Uploading..." : "Upload"}
                  </button>
                </div>
                {imageUrlEmpty && (
                  <p className="mt-1 text-sm text-red-400">Please add or upload an image to save.</p>
                )}
                {saveError && !imageUrlEmpty && (
                  <p className="mt-1 text-sm text-red-400">{saveError}</p>
                )}
              </div>
              {["Th", "En", "Cn"].map((lang) => (
                <div key={lang}>
                  <label className="mb-1 block text-sm text-neutral-400">Title ({lang}) (optional)</label>
                  <input
                    type="text"
                    value={(form as any)[`title${lang}`] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [`title${lang}`]: e.target.value } as HeroSlide)
                    }
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  />
                </div>
              ))}
              {["Th", "En", "Cn"].map((lang) => (
                <div key={lang}>
                  <label className="mb-1 block text-sm text-neutral-400">Subtitle ({lang}) (optional)</label>
                  <input
                    type="text"
                    value={(form as any)[`subtitle${lang}`] ?? ""}
                    onChange={(e) =>
                      setForm({ ...form, [`subtitle${lang}`]: e.target.value } as HeroSlide)
                    }
                    className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  />
                </div>
              ))}
              <div>
                <label className="mb-1 block text-sm text-neutral-400">
                  Link URL (optional, e.g. /villas/slug or https://...)
                </label>
                <input
                  type="text"
                  value={form.linkUrl ?? ""}
                  onChange={(e) => setForm({ ...form, linkUrl: e.target.value || null })}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                  placeholder="/villas/my-villa"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm text-neutral-400">Order (lower = first)</label>
                <input
                  type="number"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: Number(e.target.value) || 0 })}
                  className="w-24 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-white"
                />
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <button
                type="button"
                onClick={saveSlide}
                disabled={imageUrlEmpty}
                className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setForm(null)}
                className="rounded-lg border border-neutral-600 px-4 py-2 text-sm text-neutral-400 hover:bg-neutral-800"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
