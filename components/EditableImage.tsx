"use client";

import { useRef } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Camera } from "lucide-react";
import { useSiteContent } from "@/contexts/SiteContentContext";

type EditableImageProps = {
  contentKey: string;
  defaultSrc: string;
  alt: string;
  className?: string;
  fill?: boolean;
  sizes?: string;
  width?: number;
  height?: number;
  priority?: boolean;
};

export function EditableImage({
  contentKey,
  defaultSrc,
  alt,
  className = "",
  fill,
  sizes,
  width,
  height,
  priority,
}: EditableImageProps) {
  const { data: session, status } = useSession();
  const isAdmin =
    status === "authenticated" &&
    session?.user &&
    (session.user as { role?: string }).role === "ADMIN";

  const { content, setContentKey, refetch } = useSiteContent();
  const row = content[contentKey];
  const src = row?.imageUrl || defaultSrc;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";

    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert(err.error || "Upload failed");
        return;
      }
      const { url } = await res.json();
      const patchRes = await fetch("/api/site-content", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: contentKey, imageUrl: url }),
      });
      if (patchRes.ok) {
        const data = await patchRes.json();
        setContentKey(contentKey, {
          contentTh: data.contentTh ?? null,
          contentEn: data.contentEn ?? null,
          contentCn: data.contentCn ?? null,
          imageUrl: data.imageUrl ?? null,
          visible: data.visible ?? true,
        });
      } else {
        await refetch();
      }
    } catch {
      await refetch();
    }
  };

  const imageEl = (
    <Image
      src={src}
      alt={alt}
      className={className}
      fill={fill}
      sizes={sizes}
      width={width}
      height={height}
      priority={priority}
    />
  );

  if (!isAdmin) {
    return imageEl;
  }

  return (
    <div className="group relative inline-block">
      {imageEl}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="absolute right-2 top-2 rounded bg-neutral-900/90 p-2 text-white opacity-0 transition-opacity group-hover:opacity-100 focus:opacity-100"
        title="Upload new image"
      >
        <Camera className="h-5 w-5 text-amber-400" />
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleUpload}
      />
    </div>
  );
}
