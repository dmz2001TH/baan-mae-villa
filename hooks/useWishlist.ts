"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

type WishlistState = {
  ids: string[];
  toggle: (id: string) => void;
  isFavorite: (id: string) => boolean;
  clear: () => void;
};

export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (id: string) => {
        const current = get().ids;
        if (current.includes(id)) {
          set({ ids: current.filter((x) => x !== id) });
        } else {
          set({ ids: [...current, id] });
        }
      },
      isFavorite: (id: string) => get().ids.includes(id),
      clear: () => set({ ids: [] }),
    }),
    {
      name: "wishlist-villa-ids",
    }
  )
);

