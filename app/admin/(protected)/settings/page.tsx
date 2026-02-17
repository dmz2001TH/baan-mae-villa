"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type SettingsForm = {
  lineNotifyToken: string;
  lineChannelAccessToken: string;
  lineAdminUserId: string;
  facebookPageId: string;
  facebookAppId: string;
  adminPhoneNumber: string;
  lineOfficialUrl: string;
};

const DEFAULT_FORM: SettingsForm = {
  lineNotifyToken: "",
  lineChannelAccessToken: "",
  lineAdminUserId: "",
  facebookPageId: "",
  facebookAppId: "",
  adminPhoneNumber: "",
  lineOfficialUrl: "",
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<SettingsForm>(DEFAULT_FORM);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch("/api/settings", { cache: "no-store", credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return;
        setForm({
          lineNotifyToken: data.lineNotifyToken ?? "",
          lineChannelAccessToken: data.lineChannelAccessToken ?? "",
          lineAdminUserId: data.lineAdminUserId ?? "",
          facebookPageId: data.facebookPageId ?? "",
          facebookAppId: data.facebookAppId ?? "",
          adminPhoneNumber: data.adminPhoneNumber ?? "",
          lineOfficialUrl: data.lineOfficialUrl ?? "",
        });
      })
      .catch(() => {
        setError("Failed to load settings.");
      })
      .finally(() => setLoading(false));
  }, []);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save settings.");
      }
      setMessage("Settings saved successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save settings.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex min-h-screen bg-neutral-950 text-neutral-200">
      <aside className="flex w-64 flex-col border-r border-neutral-800 bg-neutral-900">
        <div className="border-b border-neutral-800 p-6">
          <Link href="/" className="text-xl font-semibold tracking-wide text-yellow-500">
            BAAN MAE
          </Link>
          <p className="mt-1 text-xs text-neutral-500">Admin</p>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            Manage Villas
          </Link>
          <Link
            href="/admin/customers"
            className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 hover:bg-neutral-800 hover:text-white"
          >
            View Customers
          </Link>
          <span className="flex items-center gap-3 rounded-lg bg-yellow-500/10 px-4 py-3 text-sm font-medium text-yellow-500">
            Settings
          </span>
        </nav>
      </aside>
      <main className="flex-1 p-8">
        <h1 className="text-2xl font-semibold text-white">System Settings</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Configure dynamic integrations and business contact info (stored in database with .env fallback).
        </p>

        {loading ? (
          <p className="mt-6 text-neutral-400">Loading settings…</p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 max-w-2xl space-y-8 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6"
          >
            {error && (
              <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
                {error}
              </p>
            )}
            {message && (
              <p className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
                {message}
              </p>
            )}

            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-500">LINE Settings</h2>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">LINE Notify Token</label>
                <input
                  type="password"
                  name="lineNotifyToken"
                  value={form.lineNotifyToken}
                  onChange={handleChange}
                  placeholder="Paste LINE Notify token"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
                <p className="text-xs text-neutral-500">
                  Used for lead notifications. If empty, system falls back to LINE_NOTIFY_TOKEN in .env.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">LINE Channel Access Token</label>
                <input
                  type="password"
                  name="lineChannelAccessToken"
                  value={form.lineChannelAccessToken}
                  onChange={handleChange}
                  placeholder="Paste LINE Channel Access Token"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
                <p className="text-xs text-neutral-500">
                  Used for LINE Messaging API (sends to Admin User ID). If empty, system falls back to Notify.
                </p>
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">LINE Admin User ID</label>
                <input
                  type="text"
                  name="lineAdminUserId"
                  value={form.lineAdminUserId}
                  onChange={handleChange}
                  placeholder="Uxxxxxxxxxxxxxx..."
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
                <p className="text-xs text-neutral-500">
                  Target user ID for LINE Messaging API. If empty, system falls back to LINE_NOTIFY_TOKEN.
                </p>
              </div>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={async () => {
                    if (!form.lineChannelAccessToken.trim() || !form.lineAdminUserId.trim()) {
                      alert("กรุณากรอก LINE Channel Access Token และ Admin User ID และกดบันทึกตั้งค่าก่อนทดสอบ");
                      return;
                    }
                    try {
                      const res = await fetch("/api/settings/test-line", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        credentials: "include",
                      });
                      if (!res.ok) {
                        const data = await res.json().catch(() => ({}));
                        throw new Error(data.error || "Test failed.");
                      }
                      alert("LINE test message sent successfully!");
                    } catch (err: any) {
                      alert(err.message || "Failed to send test message.");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-green-600 bg-green-600 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-500"
                >
                  ทดสอบส่งข้อความ LINE
                </button>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-500">Facebook Chat Settings</h2>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">Facebook Page ID</label>
                <input
                  type="text"
                  name="facebookPageId"
                  value={form.facebookPageId}
                  onChange={handleChange}
                  placeholder="e.g. 123456789012345"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">Facebook App ID</label>
                <input
                  type="text"
                  name="facebookAppId"
                  value={form.facebookAppId}
                  onChange={handleChange}
                  placeholder="e.g. 987654321098765"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
                <p className="text-xs text-neutral-500">
                  Customer Chat will show only when Page ID is configured (DB first, then .env fallback).
                </p>
              </div>
            </section>

            <section className="space-y-4 rounded-lg border border-neutral-800 bg-neutral-950/50 p-4">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-yellow-500">Business Info</h2>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">Admin Phone Number</label>
                <input
                  type="tel"
                  name="adminPhoneNumber"
                  value={form.adminPhoneNumber}
                  onChange={handleChange}
                  placeholder="+66 8X XXX XXXX"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
              </div>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-neutral-200">LINE Official Link</label>
                <input
                  type="url"
                  name="lineOfficialUrl"
                  value={form.lineOfficialUrl}
                  onChange={handleChange}
                  placeholder="https://line.me/ti/p/xxxxxx"
                  className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
                />
              </div>
            </section>

            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2.5 text-sm font-medium text-neutral-900 transition-colors hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving ? "Saving..." : "บันทึกการตั้งค่า"}
              </button>
            </div>
          </form>
        )}
      </main>
    </div>
  );
}

