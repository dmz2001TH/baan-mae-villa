"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { signOut } from "next-auth/react";
import { Home, Users, Settings, LogOut, Wand2 } from "lucide-react";
import { FACILITY_KEYS, FACILITY_LABELS } from "@/lib/i18n";

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
  latitude?: number | null;
  longitude?: number | null;
  nearbyPlaces?: { name: string; distance: string; type: string }[] | null;
};

const navItems = [
  { label: "Manage Villas", href: "/admin/villas", icon: Home },
  { label: "View Customers", href: "/admin/customers", icon: Users },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function EditVillaPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [villa, setVilla] = useState<Villa | null>(null);
  const [loading, setLoading] = useState(true);
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
    mapEmbedUrl: "",
    latitude: "",
    longitude: "",
    nearbyPlaces: [] as { name: string; distance: string; type: string }[],
  });

  useEffect(() => {
    fetch(`/api/villas/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setVilla(data);
        setForm({
          name: data.name ?? "",
          slug: data.slug ?? "",
          location: data.location ?? "",
          price: String(data.price ?? ""),
          bedrooms: String(data.bedrooms ?? 0),
          bathrooms: String(data.bathrooms ?? 0),
          description: data.description ?? "",
          images: Array.isArray(data.images) ? data.images : [],
          isFeatured: Boolean(data.isFeatured),
          status: data.status === "SOLD_OUT" ? "SOLD_OUT" : "AVAILABLE",
          discountPercentage: String(data.discountPercentage ?? 0),
          nameTh: data.nameTh ?? "",
          nameEn: data.nameEn ?? "",
          nameCn: data.nameCn ?? "",
          descriptionTh: data.descriptionTh ?? "",
          descriptionEn: data.descriptionEn ?? "",
          descriptionCn: data.descriptionCn ?? "",
          locationEn: data.locationEn ?? "",
          locationCn: data.locationCn ?? "",
          featuresEn: data.featuresEn ?? "",
          featuresCn: data.featuresCn ?? "",
          facilities: Array.isArray(data.facilities) ? data.facilities : [],
          mapEmbedUrl: data.mapEmbedUrl ?? "",
          latitude: data.latitude ? String(data.latitude) : "",
          longitude: data.longitude ? String(data.longitude) : "",
          nearbyPlaces: Array.isArray(data.nearbyPlaces) ? data.nearbyPlaces : [],
        });
      })
      .catch(() => setVilla(null))
      .finally(() => setLoading(false));
  }, [id]);

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
    // Source fields: use Thai-specific fields if available, else fall back to default
    const sourceName = form.nameTh || form.name;
    const sourceDesc = form.descriptionTh || form.description;
    const sourceLoc = form.location;
    const sourceFeat = form.featuresEn; // features has no Thai field in DB, skip if empty

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
      const res = await fetch(`/api/villas/${id}`, {
        method: "PATCH",
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
      if (res.ok) router.push("/admin/villas");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-neutral-950 text-neutral-400">
        Loading...
      </div>
    );
  }
  if (!villa) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-neutral-950 text-neutral-400">
        <p>Villa not found.</p>
        <Link href="/admin/villas" className="text-yellow-500 hover:underline">
          Back to Manage Villas
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      <aside className="flex w-64 flex-shrink-0 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 p-6">
          <Link href="/" className="text-xl font-semibold tracking-wide text-yellow-500">
            BAAN MAE
          </Link>
          <p className="mt-1 text-xs text-neutral-500">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t border-neutral-800 p-4">
          <button
            onClick={() => signOut({ callbackUrl: "/admin/login" })}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            <LogOut className="h-5 w-5" />
            Sign out
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto p-6 sm:p-8">
        <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Name</label>
              <input
                required
                value={form.name}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    name: e.target.value,
                    slug: f.slug || e.target.value.replace(/\s+/g, "-").toLowerCase(),
                  }))
                }
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Slug</label>
              <input
                required
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Location</label>
              <input
                required
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Price (THB)</label>
              <input
                type="number"
                required
                min={0}
                value={form.price}
                onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Discount Percentage (%)</label>
              <input
                type="number"
                min={0}
                max={100}
                value={form.discountPercentage}
                onChange={(e) => setForm((f) => ({ ...f, discountPercentage: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
              <p className="mt-1 text-xs text-neutral-500">
                Enter 0 for no discount, or 1-100 for discount percentage
              </p>
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Bedrooms</label>
              <input
                type="number"
                min={0}
                value={form.bedrooms}
                onChange={(e) => setForm((f) => ({ ...f, bedrooms: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Bathrooms</label>
              <input
                type="number"
                min={0}
                value={form.bathrooms}
                onChange={(e) => setForm((f) => ({ ...f, bathrooms: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Latitude (Optional)</label>
              <input
                type="number"
                step="any"
                value={form.latitude}
                onChange={(e) => setForm((f) => ({ ...f, latitude: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
                placeholder="e.g. 12.9236"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm text-neutral-400">Longitude (Optional)</label>
              <input
                type="number"
                step="any"
                value={form.longitude}
                onChange={(e) => setForm((f) => ({ ...f, longitude: e.target.value }))}
                className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
                placeholder="e.g. 100.8825"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Description (default)</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-white"
            />
          </div>
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
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Name English</label>
                <input
                  value={form.nameEn}
                  onChange={(e) => setForm((f) => ({ ...f, nameEn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Name 中文</label>
                <input
                  value={form.nameCn}
                  onChange={(e) => setForm((f) => ({ ...f, nameCn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description ไทย</label>
                <textarea
                  value={form.descriptionTh}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionTh: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description EN</label>
                <textarea
                  value={form.descriptionEn}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionEn: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Description 中文</label>
                <textarea
                  value={form.descriptionCn}
                  onChange={(e) => setForm((f) => ({ ...f, descriptionCn: e.target.value }))}
                  rows={2}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                />
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Location English</label>
                <input
                  value={form.locationEn}
                  onChange={(e) => setForm((f) => ({ ...f, locationEn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                  placeholder="e.g. Pattaya, Chonburi"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Location 中文</label>
                <input
                  value={form.locationCn}
                  onChange={(e) => setForm((f) => ({ ...f, locationCn: e.target.value }))}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
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
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                  placeholder="e.g. Private pool, Sea view, Smart home system"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-neutral-500">Features 中文</label>
                <textarea
                  value={form.featuresCn}
                  onChange={(e) => setForm((f) => ({ ...f, featuresCn: e.target.value }))}
                  rows={3}
                  className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
                  placeholder="例如：私人泳池、海景、智能家居系统"
                />
              </div>
            </div>
          </div>
          <div className="border-t border-neutral-700 pt-4">
            <label className="mb-2 block text-sm text-neutral-400">Property facilities</label>
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
          <div>
            <label className="mb-1 block text-sm text-neutral-400">Google Maps embed URL</label>
            <p className="mb-2 text-xs text-neutral-500">
              Paste the iframe src from Google Maps (Share → Embed a map). Example: https://www.google.com/maps/embed?pb=...
            </p>
            <input
              type="url"
              value={form.mapEmbedUrl}
              onChange={(e) => setForm((f) => ({ ...f, mapEmbedUrl: e.target.value }))}
              placeholder="https://www.google.com/maps/embed?pb=..."
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-2 text-sm text-white placeholder-neutral-500"
            />
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
                    className="flex-1 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
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
                    className="w-28 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white placeholder-neutral-500"
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
                    className="w-32 rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-2 text-sm text-white"
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
            <label className="mb-1 block text-sm text-neutral-400">Images (Gallery)</label>
            {uploadError && (
              <p className="mb-2 rounded bg-red-500/10 px-2 py-1 text-sm text-red-400">{uploadError}</p>
            )}
            <div className="flex flex-wrap gap-2">
              {form.images.map((url) => (
                <div key={url} className="relative h-20 w-20 overflow-hidden rounded-lg border border-neutral-600">
                  <Image src={url} alt="" fill className="object-cover" />
                  <button
                    type="button"
                    onClick={() => removeImage(url)}
                    className="absolute right-1 top-1 rounded bg-red-500/80 px-1.5 py-0.5 text-xs text-white"
                  >
                    ×
                  </button>
                </div>
              ))}
              <label className="flex h-20 w-20 cursor-pointer items-center justify-center rounded-lg border border-dashed border-neutral-600 bg-neutral-800 text-neutral-500 hover:border-yellow-500 hover:text-yellow-500">
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
                onChange={(e) => setForm((f) => ({ ...f, isFeatured: e.target.checked }))}
                className="rounded border-neutral-600 bg-neutral-800 text-yellow-500 focus:ring-yellow-500"
              />
              <span className="text-sm text-neutral-300">Featured on home</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <span className="text-sm text-neutral-400">Status</span>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))}
                className="rounded-lg border border-neutral-600 bg-neutral-800 px-3 py-1.5 text-sm text-white"
              >
                <option value="AVAILABLE">Available</option>
                <option value="SOLD_OUT">Sold out</option>
              </select>
            </label>
          </div>
          <div className="flex gap-3 pt-4">
            <Link
              href="/admin/villas"
              className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-yellow-500 px-4 py-2 text-sm font-medium text-neutral-900 hover:bg-yellow-400 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save changes"}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
