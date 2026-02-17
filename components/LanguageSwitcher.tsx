"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale } from "@/contexts/LocaleContext";
import { LOCALES, type Locale } from "@/lib/i18n";
import { Globe } from "lucide-react";

type Props = {
  variant?: "light" | "dark";
};

export function LanguageSwitcher({ variant = "dark" }: Props) {
  const { locale, setLocale } = useLocale();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const current = LOCALES.find((l) => l.value === locale) ?? LOCALES[1];

  const isLight = variant === "light";

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs font-medium transition-colors ${
          isLight
            ? "border-neutral-200 bg-white text-neutral-700 hover:border-neutral-300"
            : "border-white/20 bg-white/10 text-white/90 hover:border-white/30 hover:text-white"
        }`}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Select language"
      >
        <Globe className={`h-3.5 w-3.5 ${isLight ? "text-neutral-500" : "text-white/70"}`} />
        <span>{current.label}</span>
      </button>
      {open && (
        <ul
          role="listbox"
          className={`absolute right-0 top-full z-50 mt-1 min-w-[100px] rounded border py-1 shadow-xl ${
            isLight
              ? "border-neutral-200 bg-white"
              : "border-white/10 bg-neutral-900"
          }`}
        >
          {LOCALES.map((opt) => (
            <li key={opt.value} role="option" aria-selected={locale === opt.value}>
              <button
                type="button"
                onClick={() => {
                  setLocale(opt.value as Locale);
                  setOpen(false);
                }}
                className={`w-full px-3 py-1.5 text-left text-xs transition-colors ${
                  locale === opt.value
                    ? isLight
                      ? "bg-amber-50 text-amber-600"
                      : "bg-amber-500/20 text-amber-400"
                    : isLight
                      ? "text-neutral-700 hover:bg-neutral-50"
                      : "text-neutral-300 hover:bg-white/5 hover:text-white"
                }`}
              >
                {opt.label}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
