"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Download } from "lucide-react";

type Lead = {
  id: string;
  name: string;
  tel: string;
  lineId: string | null;
  visitDate: string | null;
  message: string | null;
  status: "PENDING" | "CONTACTED" | "CLOSED";
  createdAt: string;
  villa?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

const STATUS_LABELS: Record<Lead["status"], string> = {
  PENDING: "Pending",
  CONTACTED: "Contacted",
  CLOSED: "Closed",
};

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function fetchLeads() {
    setLoading(true);
    setError(null);
    fetch("/api/leads", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        setLeads(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setError("Failed to load leads.");
        setLeads([]);
      })
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchLeads();
  }, []);

  async function handleStatusChange(id: string, next: Lead["status"]) {
    setUpdatingId(id);
    try {
      const res = await fetch(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status: next }),
      });
      if (res.ok) {
        fetchLeads();
      }
    } finally {
      setUpdatingId(null);
    }
  }

  function formatDate(value: string | null) {
    if (!value) return "—";
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) return "—";
      return d.toLocaleString();
    } catch {
      return "—";
    }
  }

  return (
    <>
      <div className="border-b border-neutral-800 bg-neutral-900/50 px-4 py-6 sm:px-8">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">Leads</h1>
            <p className="text-sm text-neutral-400">
              รายชื่อผู้สนใจนัดเยี่ยมชม Baan Mae Villa
            </p>
          </div>
          <a
            href="/api/leads/export"
            className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-500"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </div>

      <div className="p-4 sm:p-8">
        {error && (
          <p className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">
            {error}
          </p>
        )}

        <div className="overflow-hidden rounded-xl border border-neutral-800 bg-neutral-900/50">
          {loading ? (
            <div className="p-10 text-center text-neutral-500">Loading...</div>
          ) : leads.length === 0 ? (
            <div className="p-10 text-center text-neutral-500">
              ยังไม่มี Leads เข้ามา
            </div>
          ) : (
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase text-neutral-400">
                <tr>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Contact</th>
                  <th className="px-4 py-3">Villa</th>
                  <th className="px-4 py-3">Visit date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Created</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="border-b border-neutral-800/60 last:border-0"
                  >
                    <td className="px-4 py-3 align-top text-white">
                      <div className="font-medium">{lead.name}</div>
                      {lead.message && (
                        <div className="mt-1 text-xs text-neutral-400 line-clamp-2">
                          {lead.message}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-200">
                      <div>{lead.tel}</div>
                      {lead.lineId && (
                        <div className="text-xs text-neutral-400">
                          LINE: {lead.lineId}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-200">
                      {lead.villa ? (
                        <Link
                          href={`/admin/villas/${lead.villa.id}/edit`}
                          className="text-amber-400 hover:underline"
                        >
                          {lead.villa.name}
                        </Link>
                      ) : (
                        <span className="text-neutral-500">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-200">
                      {formatDate(lead.visitDate)}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) =>
                          handleStatusChange(
                            lead.id,
                            e.target.value as Lead["status"]
                          )
                        }
                        className="rounded-lg border border-neutral-700 bg-neutral-900 px-2 py-1 text-xs text-neutral-100"
                      >
                        {(["PENDING", "CONTACTED", "CLOSED"] as Lead["status"][]).map(
                          (s) => (
                            <option key={s} value={s}>
                              {STATUS_LABELS[s]}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-3 align-top text-neutral-400">
                      {formatDate(lead.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}

