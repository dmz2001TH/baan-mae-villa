"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Wand2 } from "lucide-react";
import { FACILITY_KEYS, FACILITY_LABELS } from "@/lib/i18n";

export default function NewVillaPage() {
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    location: "",
    price: "",
    bedrooms: "0",
    bathrooms: "0",
    description: "",
    images: [] as string[],
    isFeatured: false,
    status: "AVAILABLE",
    discountPercentage: "0",
    nameTh: "",
    nameEn: "",
    nameCn: "",
    descriptionTh: "",
    descriptionEn: "",
    descriptionCn: "",
    locationEn: "",
    locationCn: "",
    featuresEn: "",
    featuresCn: "",
    facilities: [] as string[],
    latitude: "",
    longitude: "",
    nearbyPlaces: [] as { name: string; distance: string; type: string }[],
  });

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    setUploading(true);
    const formData = new FormData();
    formData.set("file", file);
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setUploadError(data.error || "Upload failed");
        return;
      }
      if (data.url) {
        setForm((f) => ({ ...f, images: [...f.images, data.url] }));
      }
    } catch {
      setUploadError("Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  }

  function removeImage(url: string) {
    setForm((f) => ({ ...f, images: f.images.filter((u) => u !== url) }));
  }

  const [translating, setTranslating] = useState(false);

  async function autoTranslate() {
    const sourceName = form.nameTh || form.name;
    const sourceDesc = form.descriptionTh || form.description;
    const sourceLoc = form.location;

    if (!sourceName && !sourceDesc && !sourceLoc) return;

    setTranslating(true);
    try {
      const callTranslate = async (text: string, target: string) => {
        if (!text.trim()) return "";
        const res = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target }),
        });
        if (!res.ok) return "";
        const data = await res.json();
        return data.translated || "";
      };

      const [nameEn, nameCn, descEn, descCn, locEn, locCn] = await Promise.all([
        callTranslate(sourceName, "en"),
        callTranslate(sourceName, "cn"),
        callTranslate(sourceDesc, "en"),
        callTranslate(sourceDesc, "cn"),
        callTranslate(sourceLoc, "en"),
        callTranslate(sourceLoc, "cn"),
      ]);

      setForm((f) => ({
        ...f,
        nameEn: f.nameEn || nameEn,
        nameCn: f.nameCn || nameCn,
        descriptionEn: f.descriptionEn || descEn,
        descriptionCn: f.descriptionCn || descCn,
        locationEn: f.locationEn || locEn,
        locationCn: f.locationCn || locCn,
      }));
    } catch (err) {
      console.error("Auto-translate failed:", err);
    } finally {
      setTranslating(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/villas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          price: form.price ? Number(form.price) : 0,
          bedrooms: Number(form.bedrooms) || 0,
          bathrooms: Number(form.bathrooms) || 0,
          discountPercentage: Number(form.discountPercentage) || 0,
          latitude: form.latitude ? Number(form.latitude) : null,
          longitude: form.longitude ? Number(form.longitude) : null,
        }),
      });
      if (res.ok) {
        window.location.href = "/admin/villas";
      } else {
        const data = await res.json().catch(() => ({}));
        setUploadError(data.error || "Failed to create villa");
      }
    } catch {
      setUploadError("Failed to create villa");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-6 sm:px-8">
        <Link
          href="/admin/villas"
          className="mb-3 inline-block text-sm text-yellow-500 hover:underline"
        >
          ← Back to Manage Villas
        </Link>
        <h1 className="text-2xl font-semibold text-white">Add New Villa</h1>
        <p className="mt-1 text-sm text-neutral-400">
          Create a new villa listing. Images are saved to /public/uploads.
        </p>
      </div>

      <div className="p-4 sm:p-8">
        <form
          onSubmit={handleSubmit}
          className="mx-auto max-w-2xl space-y-6 rounded-xl border border-neutral-800 bg-neutral-900/50 p-6 sm:p-8"
        >
          {uploadError && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
              {uploadError}
            </p>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Name
              </label>
              <input
                required
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug:
                      f.slug ||
                      e.target.value.replace(/\s+/g, "-").toLowerCase(),
                  }));
                }}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="Villa name"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Slug
              </label>
              <input
                required
                value={form.slug}
                onChange={(e) =>
                  setForm((f) => ({ ...f, slug: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="url-slug"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Location
              </label>
              <input
                required
                value={form.location}
                onChange={(e) =>
                  setForm((f) => ({ ...f, location: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="e.g. Pattaya"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Price (THB)
              </label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) =>
                  setForm((f) => ({ ...f, price: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="0"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Discount Percentage (%)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPercentage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, discountPercentage: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="0"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Enter 0 for no discount, or 1-100 for discount percentage
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Bedrooms
              </label>
              <input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bedrooms: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Bathrooms
              </label>
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) =>
                  setForm((f) => ({ ...f, bathrooms: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Latitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, latitude: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="e.g. 12.9236"
              />
              <p className="mt-1 text-xs text-neutral-500">
                GPS latitude for map display
              </p>
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-neutral-400">
                Longitude (Optional)
              </label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) =>
                  setForm((f) => ({ ...f, longitude: e.target.value }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                placeholder="e.g. 100.8825"
              />
              <p className="mt-1 text-xs text-neutral-500">
                GPS longitude for map display
              </p>
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-400">
              Description
            </label>
            <textarea
              value={form.description}
              onChange={(e) =>
                setForm((f) => ({ ...f, description: e.target.value }))
              }
              rows={4}
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2.5 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="Optional description"
            />
          </div>

          {/* Multi-language (optional) */}
          <div className="border-t border-neutral-700 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-300">Multi-language (optional)</h3>
              <button
                type="button"
                onClick={autoTranslate}
                disabled={translating}
                className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-violet-500 disabled:opacity-60"
              >
                <Wand2 className="h-3.5 w-3.5" />
                {translating ? "กำลังแปล..." : "✨ แปลอัตโนมัติ"}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Name ไทย</label>
                <input
                  value={form.nameTh}
                  onChange={(e) => setForm((f) => ({ ...f, nameTh: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="ชื่อภาษาไทย"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Name English</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="English name"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Name 中文</label>
                <input
                  value={form.nameCn}
                  onChange={(e) => setForm((f) => ({ ...f, nameCn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="中文名称"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description ไทย</label>
                <textarea
                  value={form.descriptionTh}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionTh: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="คำอธิบายภาษาไทย"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description EN</label>
                <textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="English description"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description 中文</label>
                <textarea
                  value={form.descriptionCn}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionCn: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="中文描述"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Location English</label>
                <input
                  value={form.locationEn}
                  onChange={(e) => setForm((f) => ({ ...f, locationEn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="e.g. Pattaya, Chonburi"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Location 中文</label>
                <input
                  value={form.locationCn}
                  onChange={(e) => setForm((f) => ({ ...f, locationCn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="例如：芭提雅"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Features English</label>
                <textarea
                  value={form.featuresEn}
                  onChange={(e) => setForm((f) => ({ ...f, featuresEn: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="e.g. Private pool, Sea view, Smart home system (one per line)"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Features 中文</label>
                <textarea
                  value={form.featuresCn}
                  onChange={(e) => setForm((f) => ({ ...f, featuresCn: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
                  placeholder="例如：私人泳池、海景、智能家居系统"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-neutral-700 pt-4">
            <label className="mb-2 block text-sm font-medium text-neutral-400">Property facilities</label>
            <div className="flex flex-wrap gap-3">
              {FACILITY_KEYS.map((key) => (
                <label key={key} className="flex cursor-pointer items-center gap-2">
                  <input
                    type="checkbox"
                    checked={form.facilities.includes(key)}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        facilities: e.target.checked
                          ? [...f.facilities, key]
                          : f.facilities.filter((x) => x !== key),
                      }))
                    }
                    className="rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500"
                  />
                  <span className="text-sm text-neutral-300">{FACILITY_LABELS[key].en}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Nearby Places */}
          <div className="border-t border-neutral-700 pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-medium text-neutral-300">Nearby Places</h3>
              <button
                type="button"
                onClick={() =>
                  setForm((f) => ({
                    ...f,
                    nearbyPlaces: [...f.nearbyPlaces, { name: "", distance: "", type: "Beach" }],
                  }))
                }
                className="rounded-lg bg-yellow-500/20 px-3 py-1.5 text-xs font-medium text-yellow-400 hover:bg-yellow-500/30"
              >
                + Add Place
              </button>
            </div>
            {form.nearbyPlaces.length === 0 && (
              <p className="text-xs text-neutral-500">No nearby places added yet.</p>
            )}
            <div className="space-y-3">
              {form.nearbyPlaces.map((place, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <input
                    value={place.name}
                    onChange={(e) =>
                      setForm((f) => {
                        const np = [...f.nearbyPlaces];
                        np[idx] = { ...np[idx], name: e.target.value };
                        return { ...f, nearbyPlaces: np };
                      })
                    }
                    placeholder="Place name"
                    className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <input
                    value={place.distance}
                    onChange={(e) =>
                      setForm((f) => {
                        const np = [...f.nearbyPlaces];
                        np[idx] = { ...np[idx], distance: e.target.value };
                        return { ...f, nearbyPlaces: np };
                      })
                    }
                    placeholder="e.g. 5 mins"
                    className="w-28 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
                  />
                  <select
                    value={place.type}
                    onChange={(e) =>
                      setForm((f) => {
                        const np = [...f.nearbyPlaces];
                        np[idx] = { ...np[idx], type: e.target.value };
                        return { ...f, nearbyPlaces: np };
                      })
                    }
                    className="w-32 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="Beach">Beach</option>
                    <option value="Mall">Mall</option>
                    <option value="Hospital">Hospital</option>
                    <option value="School">School</option>
                    <option value="Restaurant">Restaurant</option>
                    <option value="Airport">Airport</option>
                    <option value="Market">Market</option>
                    <option value="Temple">Temple</option>
                    <option value="Park">Park</option>
                    <option value="Other">Other</option>
                  </select>
                  <button
                    type="button"
                    onClick={() =>
                      setForm((f) => ({
                        ...f,
                        nearbyPlaces: f.nearbyPlaces.filter((_, i) => i !== idx),
                      }))
                    }
                    className="rounded-lg bg-red-500/20 px-2.5 py-2 text-xs text-red-400 hover:bg-red-500/30"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-neutral-400">
              Images
            </label>
            <p className="mb-2 text-xs text-neutral-500">
              JPG, PNG or WebP. Uploaded to /public/uploads.
            </p>
            <div className="flex flex-wrap gap-2">
              {form.images.map((url) => (
                <div
                  key={url}
                  className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-600"
                >
                  <Image
                    src={url}
                    alt=""
                    fill
                    className="object-cover"
                    sizes="80px"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 rounded bg-red-500/80 px-1.5 py-0.5 text-xs text-white hover:bg-red-500"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-600 bg-neutral-800 text-neutral-500 transition-colors hover:border-yellow-500 hover:text-yellow-500">
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploading}
                />
                {uploading ? "..." : "+"}
              </label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                checked={form.isFeatured}
                onChange={(e) =>
                  setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                }
                className="rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-neutral-300">
                Featured on home
              </span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-neutral-400">Status</span>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((f) => ({ ...f, status: e.target.value }))
                }
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD_OUT">Sold out</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Link
              href="/admin/villas"
              className="rounded-lg border border-neutral-600 px-4 py-2.5 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-medium text-neutral-900 hover:bg-yellow-400 disabled:opacity-50"
            >
              {submitting ? "Saving…" : "Save Villa"}
            </button>
          </div>
        </form>
      </div>
    </>
  );
}
