"use client";

import { Heart } from "lucide-react";
import { useWishlist } from "@/hooks/useWishlist";

type Props = {
  villaId: string;
  size?: "sm" | "md";
};

export function WishlistButton({ villaId, size = "md" }: Props) {
  const { isFavorite, toggle } = useWishlist();
  const active = isFavorite(villaId);

  const baseClasses =
    "inline-flex items-center justify-center rounded-full border transition-colors transition-transform hover:scale-110";
  const spacing = size === "sm" ? "h-8 w-8 border-white/40 bg-black/40" : "h-9 w-9 border-white/50 bg-black/50";

  return (
    <button
      type="button"
      aria-label={active ? "Remove from favorites" : "Add to favorites"}
      onClick={(e) => {
        e.stopPropagation();
        toggle(villaId);
      }}
      className={`${baseClasses} ${spacing}`}
    >
      <Heart
        className={size === "sm" ? "h-4 w-4" : "h-5 w-5"}
        strokeWidth={active ? 0 : 1.8}
        fill={active ? "#f97373" : "transparent"}
        color={active ? "#fecaca" : "#ffffff"}
      />
    </button>
  );
}

