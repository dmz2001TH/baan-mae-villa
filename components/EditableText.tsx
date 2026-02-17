"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Pencil, Check, X } from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import type { Locale } from "@/lib/i18n";

type ContentKey = string;
type LocaleField = "contentTh" | "contentEn" | "contentCn";

const LOCALE_FIELD: Record<Locale, LocaleField> = {
  th: "contentTh",
  en: "contentEn",
  cn: "contentCn",
};

type EditableTextProps = {
  contentKey: ContentKey;
  defaultText: string;
  locale: Locale;
  className?: string;
  as?: "span" | "p" | "h1" | "h2" | "h3";
  multiline?: boolean;
};

export function EditableText({
  contentKey,
  defaultText,
  locale,
  className = "",
  as: Tag = "span",
  multiline = false,
}: EditableTextProps) {
  const { data: session, status } = useSession();
  const isAdmin =
    status === "authenticated" &&
    session?.user &&
    (session.user as { role?: string }).role === "ADMIN";

  const { content, setContentKey, refetch } = useSiteContent();
  const row = content[contentKey];
  const field = LOCALE_FIELD[locale];
  const displayText = (row?.[field] ?? defaultText) || defaultText;
  const isEmpty = !displayText || String(displayText).trim() === "";

  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(displayText);
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  useEffect(() => {
    const stored = (row?.[field] ?? defaultText) || defaultText;
    setValue(stored);
  }, [row, field, defaultText]);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const save = async () => {
    if (value === ((row?.[field] ?? defaultText) || defaultText)) {
      setEditing(false);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: contentKey, [field]: value }),
      });
      if (res.ok) {
        const data = await res.json();
        setContentKey(contentKey, {
          contentTh: data.contentTh ?? null,
          contentEn: data.contentEn ?? null,
          contentCn: data.contentCn ?? null,
          imageUrl: data.imageUrl ?? null,
          visible: data.visible ?? true,
        });
        setEditing(false);
      } else {
        await refetch();
      }
    } catch {
      await refetch();
    } finally {
      setSaving(false);
    }
  };

  const cancel = () => {
    setValue(displayText);
    setEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !multiline) {
      e.preventDefault();
      save();
    }
    if (e.key === "Escape") {
      cancel();
    }
  };

  if (!isAdmin) {
    return <Tag className={className}>{displayText}</Tag>;
  }

  const PLACEHOLDER = "Click to edit title";

  if (editing) {
    const inputClassName = `w-full rounded border border-amber-500/50 bg-neutral-900/90 px-2 py-1 text-inherit focus:border-amber-400 focus:outline-none focus:ring-1 focus:ring-amber-400 ${className}`;
    const Wrapper = multiline ? "div" : Tag;
    return (
      <Wrapper className={className}>
        {multiline ? (
          <textarea
            ref={inputRef as React.RefObject<HTMLTextAreaElement>}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClassName}
            rows={3}
          />
        ) : (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className={inputClassName}
          />
        )}
        <span className="mt-2 flex items-center gap-2">
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="flex items-center gap-1 rounded bg-amber-500/80 px-2 py-1 text-xs font-medium text-neutral-900 hover:bg-amber-400 disabled:opacity-70"
          >
            {saving ? (
              <>
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-neutral-900 border-t-transparent" />
                Saving...
              </>
            ) : (
              <>
                <Check className="h-3.5 w-3.5" />
                Save
              </>
            )}
          </button>
          <button
            type="button"
            onClick={cancel}
            disabled={saving}
            className="flex items-center gap-1 rounded border border-neutral-500 px-2 py-1 text-xs text-neutral-400 hover:bg-neutral-800 hover:text-white disabled:opacity-70"
          >
            <X className="h-3.5 w-3.5" />
            Cancel
          </button>
        </span>
      </Wrapper>
    );
  }

  return (
    <Tag
      className={`group relative cursor-pointer rounded px-1 -mx-1 hover:bg-amber-500/10 ${className} ${isEmpty ? "inline-block min-h-[1.5em] min-w-[10rem]" : ""}`}
      onClick={() => setEditing(true)}
    >
      {isEmpty ? (
        <span className="text-neutral-500 select-none" aria-hidden>
          [ {PLACEHOLDER} ]
        </span>
      ) : (
        displayText
      )}
      <span
        className="absolute -right-6 top-1/2 -translate-y-1/2 rounded bg-neutral-800 p-1 opacity-0 transition-opacity group-hover:opacity-100"
        title="Edit"
      >
        <Pencil className="h-3.5 w-3.5 text-amber-400" />
      </span>
    </Tag>
  );
}
