"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Phone, MessageCircle } from "lucide-react";
import type { SiteSettings } from "@/lib/site-settings";
import { fetchSiteSettings } from "@/lib/site-settings";
import { useLocale } from "@/contexts/LocaleContext";
import { t } from "@/lib/i18n";

export function StickyContactBar() {
  const pathname = usePathname();
  const { locale } = useLocale();
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const isHiddenRoute = pathname.startsWith("/admin") || pathname.startsWith("/studio");

  useEffect(() => {
    if (isHiddenRoute) return;
    let mounted = true;
    fetchSiteSettings().then((data) => {
      if (mounted) setSettings(data);
    });
    return () => {
      mounted = false;
    };
  }, [isHiddenRoute]);

  const phoneHref =
    settings?.phoneNumber && settings.phoneNumber.trim()
      ? `tel:${settings.phoneNumber.replace(/\s+/g, "")}`
      : null;

  const lineHref =
    settings?.lineUrl && settings.lineUrl.trim()
      ? settings.lineUrl.trim()
      : settings?.lineId && settings.lineId.trim()
        ? `https://line.me/ti/p/${encodeURIComponent(settings.lineId.trim())}`
        : null;

  // If neither phone nor LINE is configured, hide the bar
  if (isHiddenRoute || (!phoneHref && !lineHref)) {
    return null;
  }

  return (
    <>
      {/* Mobile: full-width sticky bar at bottom */}
      <div className="fixed inset-x-0 bottom-0 z-50 border-t border-neutral-800 bg-black/90 px-3 py-2.5 text-sm text-white backdrop-blur-md md:hidden">
        <div className="mx-auto flex max-w-3xl gap-3">
          {phoneHref && (
            <a
              href={phoneHref}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 px-3 py-2.5 font-semibold text-neutral-950 shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.02]"
            >
              <Phone className="h-4 w-4" />
              <span>{t(locale, "call_now")}</span>
            </a>
          )}
          {lineHref && (
            <a
              href={lineHref}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-[#06C755] px-3 py-2.5 font-semibold text-white shadow-lg shadow-emerald-500/30 transition-transform hover:scale-[1.02]"
            >
              <MessageCircle className="h-4 w-4" />
              <span>{t(locale, "add_line")}</span>
            </a>
          )}
        </div>
      </div>

      {/* Desktop: floating action buttons bottom-right */}
      <div className="fixed bottom-28 right-6 z-[999] hidden flex-col-reverse items-center gap-4 md:flex">
        {phoneHref && (
          <a
            href={phoneHref}
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-neutral-900 p-4 text-amber-300 shadow-xl shadow-black/40 ring-1 ring-amber-500/40 transition-transform hover:scale-110"
            aria-label={t(locale, "call_now")}
            title={t(locale, "call_now")}
          >
            <Phone className="h-6 w-6" />
          </a>
        )}
        {lineHref && (
          <a
            href={lineHref}
            target="_blank"
            rel="noopener noreferrer"
            className="pointer-events-auto inline-flex items-center justify-center rounded-full bg-[#06C755] p-4 text-white shadow-xl shadow-emerald-500/40 transition-transform hover:scale-110"
            aria-label={t(locale, "add_line")}
            title={t(locale, "add_line")}
          >
            <MessageCircle className="h-6 w-6" />
          </a>
        )}
      </div>
    </>
  );
}

