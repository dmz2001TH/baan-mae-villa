"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  ToggleLeft,
} from "lucide-react";

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
  createdAt: string;
};

export default function AdminVillasPage() {
  const [villas, setVillas] = useState<Villa[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [togglingId, setTogglingId] = useState<string | null>(null);

  function fetchVillas() {
    setLoading(true);
    fetch(`/api/villas?q=${encodeURIComponent(search)}`)
      .then((res) => res.json())
      .then((data) => setVillas(Array.isArray(data) ? data : []))
      .catch(() => setVillas([]))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchVillas();
  }, [search]);

  async function handleStatusToggle(villa: Villa) {
    const nextStatus = villa.status === "AVAILABLE" ? "SOLD_OUT" : "AVAILABLE";
    setTogglingId(villa.id);
    try {
      const res = await fetch(`/api/villas/${villa.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) fetchVillas();
    } finally {
      setTogglingId(null);
    }
  }

  async function handleDelete(id: string, deleteFiles: boolean) {
    try {
      const res = await fetch(`/api/villas/${id}?deleteFiles=${deleteFiles}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setDeleteConfirm(null);
        fetchVillas();
      }
    } catch {
      setDeleteConfirm(null);
    }
  }

  return (
    <>
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-semibold text-white">Manage Villas</h1>
          <Link
            href="/admin/villas/new"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-yellow-500 px-5 py-2.5 font-medium text-neutral-900 transition-colors hover:bg-yellow-400"
          >
            <Plus className="h-5 w-5" />
            Add New Villa
          </Link>
        </div>
      </div>

      <div className="p-4 sm:p-8">
          {/* Search */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
              <input
                type="text"
                placeholder="Search by name..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-neutral-700 bg-neutral-800 py-2.5 pl-10 pr-4 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              />
            </div>
          </div>

          {/* Table - responsive card on small screens */}
          <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
            {loading ? (
              <div className="p-12 text-center text-neutral-500">Loading...</div>
            ) : villas.length === 0 ? (
              <div className="p-12 text-center text-neutral-500">
                No villas found.{" "}
                <Link href="/admin/villas/new" className="text-yellow-500 hover:underline">
                  Add one
                </Link>
              </div>
            ) : (
              <>
                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-neutral-800 bg-neutral-800/50">
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Villa
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Location
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Price
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Status
                        </th>
                        <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Featured
                        </th>
                        <th className="px-4 py-3 text-right text-xs font-medium uppercase tracking-wider text-neutral-400">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {villas.map((v) => (
                        <tr
                          key={v.id}
                          className="border-b border-neutral-800/50 hover:bg-neutral-800/30"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              <div className="relative h-12 w-16 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
                                {v.images[0] ? (
                                  <Image
                                    src={v.images[0]}
                                    alt=""
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                  />
                                ) : (
                                  <span className="flex h-full items-center justify-center text-xs text-neutral-500">
                                    No image
                                  </span>
                                )}
                              </div>
                              <span className="font-medium text-white">{v.name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-neutral-300">{v.location}</td>
                          <td className="px-4 py-3 text-yellow-500">
                            ฿{Number(v.price).toLocaleString()}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                v.status === "AVAILABLE"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-neutral-600 text-neutral-300"
                              }`}
                            >
                              {v.status === "AVAILABLE" ? "Available" : "Sold Out"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-neutral-300">
                            {v.isFeatured ? "Yes" : "No"}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleStatusToggle(v)}
                                disabled={togglingId === v.id}
                                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-yellow-500 disabled:opacity-50"
                                title="Toggle status"
                              >
                                <ToggleLeft className="h-5 w-5" />
                              </button>
                              <Link
                                href={`/admin/villas/${v.id}/edit`}
                                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-yellow-500"
                                title="Edit"
                              >
                                <Pencil className="h-5 w-5" />
                              </Link>
                              <button
                                onClick={() => setDeleteConfirm(v.id)}
                                className="rounded p-1.5 text-neutral-400 hover:bg-neutral-700 hover:text-red-400"
                                title="Delete"
                              >
                                <Trash2 className="h-5 w-5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Mobile cards */}
                <div className="md:hidden divide-y divide-neutral-800">
                  {villas.map((v) => (
                    <div key={v.id} className="p-4">
                      <div className="flex gap-3">
                        <div className="relative h-20 w-24 flex-shrink-0 overflow-hidden rounded bg-neutral-800">
                          {v.images[0] ? (
                            <Image
                              src={v.images[0]}
                              alt=""
                              fill
                              className="object-cover"
                              sizes="96px"
                            />
                          ) : (
                            <span className="flex h-full items-center justify-center text-xs text-neutral-500">
                              No image
                            </span>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-white">{v.name}</p>
                          <p className="text-sm text-neutral-400">{v.location}</p>
                          <p className="mt-1 text-yellow-500">
                            ฿{Number(v.price).toLocaleString()}
                          </p>
                          <div className="mt-2 flex flex-wrap gap-2">
                            <span
                              className={`inline-flex rounded-full px-2 py-0.5 text-xs ${
                                v.status === "AVAILABLE"
                                  ? "bg-green-500/20 text-green-400"
                                  : "bg-neutral-600 text-neutral-300"
                              }`}
                            >
                              {v.status === "AVAILABLE" ? "Available" : "Sold Out"}
                            </span>
                            {v.isFeatured && (
                              <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-500">
                                Featured
                              </span>
                            )}
                          </div>
                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleStatusToggle(v)}
                              disabled={togglingId === v.id}
                              className="rounded bg-neutral-700 px-2 py-1 text-xs text-neutral-300 hover:text-yellow-500 disabled:opacity-50"
                            >
                              Toggle
                            </button>
                            <Link
                              href={`/admin/villas/${v.id}/edit`}
                              className="rounded bg-neutral-700 px-2 py-1 text-xs text-yellow-500 hover:bg-neutral-600"
                            >
                              Edit
                            </Link>
                            <button
                              onClick={() => setDeleteConfirm(v.id)}
                              className="rounded bg-neutral-700 px-2 py-1 text-xs text-red-400 hover:bg-neutral-600"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      {/* Delete confirmation modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-sm rounded-xl border border-neutral-700 bg-neutral-900 p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white">Delete villa?</h3>
            <p className="mt-2 text-sm text-neutral-400">
              This will remove the villa from the database. You can also delete the uploaded image files from the server.
            </p>
            <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 hover:bg-neutral-800"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm, false)}
                className="rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-600"
              >
                Delete villa only
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm, true)}
                className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-500"
              >
                Delete villa & files
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
