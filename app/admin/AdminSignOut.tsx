"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function AdminSignOut() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-neutral-400 transition-colors hover:bg-neutral-800 hover:text-white"
    >
      <LogOut className="h-5 w-5" />
      Sign out
    </button>
  );
}
