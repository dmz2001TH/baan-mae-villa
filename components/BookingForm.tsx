"use client";

import { useState } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

type Props = {
  villaId?: string;
  villaName?: string;
};

export function BookingForm({ villaId, villaName }: Props) {
  const { locale } = useLocale();
  const [name, setName] = useState("");
  const [tel, setTel] = useState("");
  const [lineId, setLineId] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          tel,
          lineId: lineId || null,
          visitDate: visitDate || null,
          message: message || null,
          villaId: villaId || null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to submit request.");
      }
      setSuccess(t(locale, "booking_success"));
      setName("");
      setTel("");
      setLineId("");
      setVisitDate("");
      setMessage("");
    } catch (err: any) {
      setError(err.message || "Failed to submit request.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="mt-4 rounded-2xl border border-white/10 bg-black/60 p-5 shadow-lg">
      <h2 className="text-lg font-semibold text-white">
        {t(locale, "booking_title")} {villaName ? `– ${villaName}` : ""}
      </h2>
      <p className="mt-1 text-xs text-neutral-400">
        {t(locale, "booking_sub")}
      </p>

      <form onSubmit={handleSubmit} className="mt-4 space-y-3">
        {error && (
          <p className="rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs text-red-200">
            {error}
          </p>
        )}
        {success && (
          <p className="rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-200">
            {success}
          </p>
        )}

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-200">
            {t(locale, "booking_name")}
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
            placeholder={t(locale, "booking_name_placeholder")}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-200">
            {t(locale, "booking_phone")}
          </label>
          <input
            type="tel"
            required
            value={tel}
            onChange={(e) => setTel(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
            placeholder={t(locale, "booking_phone_placeholder")}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-200">
            {t(locale, "booking_line")}
          </label>
          <input
            type="text"
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
            placeholder={t(locale, "booking_line_placeholder")}
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-200">
            {t(locale, "booking_date")}
          </label>
          <input
            type="date"
            value={visitDate}
            onChange={(e) => setVisitDate(e.target.value)}
            className="w-full rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
          />
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-medium text-neutral-200">
            {t(locale, "booking_message")}
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            className="w-full resize-none rounded-lg border border-neutral-700 bg-neutral-900 px-3 py-2 text-sm text-white outline-none ring-amber-500/40 focus:border-amber-400 focus:ring-2"
            placeholder={t(locale, "booking_message_placeholder")}
          />
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="mt-2 inline-flex w-full items-center justify-center rounded-lg bg-amber-400 px-4 py-2.5 text-sm font-semibold text-neutral-950 transition-colors hover:bg-amber-300 disabled:opacity-60"
        >
          {submitting ? t(locale, "booking_submitting") : t(locale, "booking_submit")}
        </button>
      </form>
    </section>
  );
}

