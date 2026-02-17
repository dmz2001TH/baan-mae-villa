"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";

type Article = {
  id: string;
  title: string;
  slug: string;
  coverImage: string | null;
  excerpt: string | null;
  isPublished: boolean;
  createdAt: string;
};

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/articles")
      .then((res) => res.json())
      .then((data) => setArticles(Array.isArray(data) ? data : []))
      .catch(() => setArticles([]))
      .finally(() => setLoading(false));
  }, []);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`ลบบทความ "${title}" ?`)) return;
    const res = await fetch(`/api/articles/${id}`, { method: "DELETE" });
    if (res.ok) setArticles((prev) => prev.filter((a) => a.id !== id));
  }

  async function togglePublish(id: string, current: boolean) {
    const res = await fetch(`/api/articles/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isPublished: !current }),
    });
    if (res.ok) {
      setArticles((prev) =>
        prev.map((a) => (a.id === id ? { ...a, isPublished: !current } : a))
      );
    }
  }

  return (
    <div className="p-6 lg:p-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Articles</h1>
          <p className="mt-1 text-sm text-neutral-400">
            Manage blog articles for SEO
          </p>
        </div>
        <Link
          href="/admin/articles/new"
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-semibold text-neutral-900 hover:bg-yellow-400"
        >
          <Plus className="h-4 w-4" />
          New Article
        </Link>
      </div>

      {loading ? (
        <p className="text-neutral-500">Loading...</p>
      ) : articles.length === 0 ? (
        <div className="rounded-xl border border-dashed border-neutral-700 py-16 text-center">
          <p className="text-neutral-500">No articles yet.</p>
          <Link
            href="/admin/articles/new"
            className="mt-3 inline-block text-sm font-medium text-yellow-500 hover:underline"
          >
            Create your first article →
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-neutral-800">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-800 bg-neutral-900/50">
              <tr>
                <th className="px-4 py-3 font-medium text-neutral-400">Cover</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Title</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Status</th>
                <th className="px-4 py-3 font-medium text-neutral-400">Date</th>
                <th className="px-4 py-3 text-right font-medium text-neutral-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800">
              {articles.map((article) => (
                <tr key={article.id} className="hover:bg-neutral-900/40">
                  <td className="px-4 py-3">
                    {article.coverImage ? (
                      <div className="relative h-12 w-20 overflow-hidden rounded-lg border border-neutral-700">
                        <Image
                          src={article.coverImage}
                          alt=""
                          fill
                          className="object-cover"
                          sizes="80px"
                        />
                      </div>
                    ) : (
                      <div className="flex h-12 w-20 items-center justify-center rounded-lg border border-neutral-700 bg-neutral-800 text-xs text-neutral-500">
                        No image
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-medium text-white">{article.title}</p>
                    <p className="mt-0.5 text-xs text-neutral-500">/blog/{article.slug}</p>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => togglePublish(article.id, article.isPublished)}
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                        article.isPublished
                          ? "bg-green-500/10 text-green-400"
                          : "bg-neutral-700/50 text-neutral-400"
                      }`}
                    >
                      {article.isPublished ? (
                        <><Eye className="h-3 w-3" /> Published</>
                      ) : (
                        <><EyeOff className="h-3 w-3" /> Draft</>
                      )}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-neutral-400">
                    {new Date(article.createdAt).toLocaleDateString("th-TH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/articles/${article.id}/edit`}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-neutral-800 hover:text-white"
                        title="Edit"
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(article.id, article.title)}
                        className="rounded-lg p-2 text-neutral-400 hover:bg-red-500/10 hover:text-red-400"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
