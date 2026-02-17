"use client";

import { useSession } from "next-auth/react";
import { Eye, EyeOff } from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";
import type { ReactNode } from "react";

type EditableSectionProps = {
  contentKey: string;
  children: ReactNode;
  className?: string;
};

export function EditableSection({
  contentKey,
  children,
  className = "",
}: EditableSectionProps) {
  const { data: session, status } = useSession();
  const isAdmin =
    status === "authenticated" &&
    session?.user &&
    (session.user as { role?: string }).role === "ADMIN";

  const { content, setContentKey, refetch } = useSiteContent();
  const row = content[contentKey];
  const visible = row?.visible ?? true;

  const toggle = async () => {
    const next = !visible;
    setContentKey(contentKey, { visible: next });
    try {
      const res = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: contentKey, visible: next }),
      });
      if (!res.ok) await refetch();
    } catch {
      await refetch();
    }
  };

  if (!visible) {
    return (
      <section className={className}>
        {isAdmin && (
          <div className="mx-auto max-w-7xl px-6 py-8 sm:px-8">
            <button
              type="button"
              onClick={toggle}
              className="flex items-center gap-2 rounded border border-amber-500/30 bg-neutral-900/80 px-4 py-2 text-sm text-amber-400 hover:bg-amber-500/10"
            >
              <Eye className="h-4 w-4" />
              Show section
            </button>
          </div>
        )}
      </section>
    );
  }

  return (
    <section className={`relative ${className}`}>
      {isAdmin && (
        <button
          type="button"
          onClick={toggle}
          className="absolute right-4 top-4 z-10 rounded bg-neutral-900/90 p-2 text-amber-400 hover:bg-neutral-800"
          title="Hide section"
        >
          <EyeOff className="h-4 w-4" />
        </button>
      )}
      {children}
    </section>
  );
}
