"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });
      if (res?.error) {
        setError("Invalid email or password, or you do not have admin access.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong.");
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-neutral-950 px-4">
      <div className="w-full max-w-md rounded-2xl border border-yellow-500/20 bg-neutral-900 p-8 shadow-xl">
        <div className="mb-8 text-center">
          <Link href="/" className="text-2xl font-semibold tracking-wide text-yellow-500">
            BAAN MAE
          </Link>
          <p className="mt-2 text-sm text-neutral-400">Admin sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <p className="rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</p>
          )}
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium text-neutral-300">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="admin@example.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-neutral-300">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border border-neutral-600 bg-neutral-800 px-4 py-3 text-white placeholder-neutral-500 focus:border-yellow-500 focus:outline-none focus:ring-1 focus:ring-yellow-500"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-yellow-500 py-3 font-medium text-neutral-900 transition-colors hover:bg-yellow-400 disabled:opacity-50"
          >
            {loading ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="mt-6 text-center text-xs text-neutral-500">
          <Link href="/" className="text-yellow-500/80 hover:text-yellow-500">
            ← Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
