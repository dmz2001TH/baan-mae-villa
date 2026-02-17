"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, Sparkles } from "lucide-react";

export default function LoginPage() {
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
        setError("Invalid email or password. Please try again.");
        setLoading(false);
        return;
      }
      window.location.href = "/admin/dashboard";
    } catch {
      setError("Something went wrong. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      {/* Premium background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(202,138,4,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative w-full max-w-[420px]"
      >
        {/* Card */}
        <div className="rounded-2xl border border-amber-500/20 bg-neutral-950/90 p-8 shadow-2xl shadow-amber-500/5 backdrop-blur-xl ring-1 ring-white/5 sm:p-10">
          {/* Brand */}
          <div className="mb-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[0.2em] text-amber-400"
            >
              <Sparkles className="h-6 w-6 text-amber-500/80" strokeWidth={1.5} />
              BAAN MAE VILLA
            </Link>
            <p className="mt-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
              Admin Portal
            </p>
            <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <motion.p
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-lg border border-amber-500/10 bg-amber-500/5 px-4 py-3 text-sm text-amber-200"
              >
                {error}
              </motion.p>
            )}

            <div>
              <label
                htmlFor="email"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-400"
              >
                <Mail className="h-4 w-4 text-amber-500/70" strokeWidth={1.5} />
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-400"
              >
                <Lock className="h-4 w-4 text-amber-500/70" strokeWidth={1.5} />
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 font-semibold text-black shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 disabled:opacity-50 disabled:shadow-none"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-500 transition-colors hover:text-amber-500/90"
            >
              ← Back to site
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
