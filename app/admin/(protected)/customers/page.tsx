"use client";

import { useEffect, useState, useCallback } from "react";

type Villa = { id: string; name: string; slug: string };

type Lead = {
  id: string;
  name: string;
  tel: string;
  lineId: string | null;
  visitDate: string | null;
  message: string | null;
  villaId: string | null;
  villa: Villa | null;
  status: "PENDING" | "CONTACTED" | "CLOSED";
  createdAt: string;
};

const STATUS_OPTIONS: Lead["status"][] = ["PENDING", "CONTACTED", "CLOSED"];

const STATUS_STYLES: Record<Lead["status"], string> = {
  PENDING: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  CONTACTED: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  CLOSED: "bg-green-500/20 text-green-400 border-green-500/30",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
}

export default function AdminCustomersPage() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchLeads = useCallback(() => {
    setLoading(true);
    fetch("/api/leads")
      .then((res) => {
        if (!res.ok) throw new Error("Unauthorized");
        return res.json();
      })
      .then((data) => setLeads(Array.isArray(data) ? data : []))
      .catch(() => setLeads([]))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleStatusChange = async (leadId: string, newStatus: Lead["status"]) => {
    setUpdatingId(leadId);
    try {
      const res = await fetch(`/api/leads/${leadId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch {
      // silent
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      <aside className="flex w-64 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 p-6">
          <a href="/" className="text-xl font-semibold tracking-wide text-yellow-500">
            BAAN MAE
          </a>
          <p className="mt-1 text-xs text-neutral-500">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <a
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Manage Villas
          </a>
          <span className="flex items-center gap-3 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-500">
            View Customers
          </span>
          <a
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Settings
          </a>
        </nav>
      </aside>

      <main className="flex-1 overflow-auto p-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-white">
              รายการลูกค้าที่สนใจ (Leads)
            </h1>
            <p className="mt-1 text-sm text-neutral-500">
              {loading ? "กำลังโหลด..." : `ทั้งหมด ${leads.length} รายการ`}
            </p>
          </div>
          <button
            onClick={fetchLeads}
            disabled={loading}
            className="rounded-lg border border-yellow-500/30 bg-yellow-500/10 px-4 py-2 text-sm font-medium text-yellow-400 transition hover:bg-yellow-500/20 disabled:opacity-50"
          >
            {loading ? "กำลังโหลด..." : "🔄 Refresh"}
          </button>
        </div>

        {!loading && leads.length === 0 && (
          <div className="rounded-xl border border-neutral-800 bg-neutral-900 p-12 text-center">
            <p className="text-lg text-neutral-400">ยังไม่มีรายการลูกค้า</p>
          </div>
        )}

        {leads.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-neutral-800">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-neutral-800 bg-neutral-900/80 text-xs uppercase text-neutral-500">
                <tr>
                  <th className="whitespace-nowrap px-4 py-3">Date</th>
                  <th className="whitespace-nowrap px-4 py-3">Name</th>
                  <th className="whitespace-nowrap px-4 py-3">Contact</th>
                  <th className="whitespace-nowrap px-4 py-3">Villa</th>
                  <th className="whitespace-nowrap px-4 py-3">Message</th>
                  <th className="whitespace-nowrap px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-800/60">
                {leads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="bg-neutral-950 transition hover:bg-neutral-900/60"
                  >
                    {/* Date */}
                    <td className="whitespace-nowrap px-4 py-3 text-neutral-400">
                      {formatDate(lead.createdAt)}
                    </td>

                    {/* Name */}
                    <td className="whitespace-nowrap px-4 py-3 font-medium text-white">
                      {lead.name}
                    </td>

                    {/* Contact */}
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <a
                          href={`tel:${lead.tel}`}
                          className="text-amber-400 hover:underline"
                        >
                          {lead.tel}
                        </a>
                        {lead.lineId && (
                          <span className="text-xs text-neutral-500">
                            LINE: {lead.lineId}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Villa */}
                    <td className="whitespace-nowrap px-4 py-3">
                      {lead.villa ? (
                        <a
                          href={`/villas/${lead.villa.slug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-amber-400 hover:underline"
                        >
                          {lead.villa.name}
                        </a>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    {/* Message */}
                    <td className="max-w-[200px] px-4 py-3">
                      {lead.message ? (
                        <span
                          className="block truncate text-neutral-400"
                          title={lead.message}
                        >
                          {lead.message}
                        </span>
                      ) : (
                        <span className="text-neutral-600">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        disabled={updatingId === lead.id}
                        onChange={(e) =>
                          handleStatusChange(
                            lead.id,
                            e.target.value as Lead["status"]
                          )
                        }
                        className={`cursor-pointer rounded-lg border px-3 py-1.5 text-xs font-semibold outline-none transition ${STATUS_STYLES[lead.status]} bg-transparent disabled:opacity-50`}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s} className="bg-neutral-900 text-white">
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
