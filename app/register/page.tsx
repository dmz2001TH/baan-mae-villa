"use client";

import { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Lock, Mail, Sparkles, UserPlus } from "lucide-react";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data.error || "สมัครสมาชิกไม่สำเร็จ");
        setLoading(false);
        return;
      }

      setSuccess(true);
      setEmail("");
      setPassword("");
    } catch {
      setError("เกิดข้อผิดพลาด กรุณาลองใหม่");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-black px-4">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(202,138,4,0.12),transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_0%,rgba(0,0,0,0.4)_100%)]" />
      <div className="absolute left-1/2 top-1/4 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-amber-500/5 blur-[120px]" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="relative w-full max-w-[420px]"
      >
        <div className="rounded-2xl border border-amber-500/20 bg-neutral-950/90 p-8 shadow-2xl shadow-amber-500/5 backdrop-blur-xl ring-1 ring-white/5 sm:p-10">
          <div className="mb-10 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-2xl font-semibold tracking-[0.2em] text-amber-400"
            >
              <Sparkles className="h-6 w-6 text-amber-500/80" strokeWidth={1.5} />
              BAAN MAE VILLA
            </Link>
            <p className="mt-3 text-sm font-medium uppercase tracking-widest text-neutral-500">
              สมัครสมาชิก
            </p>
            <div className="mx-auto mt-4 h-px w-16 bg-gradient-to-r from-transparent via-amber-500/50 to-transparent" />
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6 text-center"
            >
              <div className="rounded-xl border border-green-500/20 bg-green-500/10 px-4 py-4 text-green-300">
                สมัครสมาชิกสำเร็จ
              </div>
              <Link
                href="/login"
                className="inline-block w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 font-semibold text-black transition-all hover:from-amber-400 hover:to-amber-500"
              >
                ไปหน้าเข้าสู่ระบบ
              </Link>
            </motion.div>
          ) : (
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
                  placeholder="your@email.com"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="mb-2 flex items-center gap-2 text-sm font-medium text-neutral-400"
                >
                  <Lock className="h-4 w-4 text-amber-500/70" strokeWidth={1.5} />
                  รหัสผ่าน (อย่างน้อย 6 ตัวอักษร)
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3.5 text-white placeholder-neutral-600 transition-colors focus:border-amber-500/50 focus:outline-none focus:ring-2 focus:ring-amber-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 py-3.5 font-semibold text-black shadow-lg shadow-amber-500/25 transition-all hover:from-amber-400 hover:to-amber-500 hover:shadow-amber-500/30 disabled:opacity-50 disabled:shadow-none"
              >
                <UserPlus className="h-5 w-5" strokeWidth={1.5} />
                {loading ? "กำลังสมัคร…" : "สมัครสมาชิก"}
              </button>
            </form>
          )}

          <p className="mt-8 text-center text-sm text-neutral-500">
            มีบัญชีอยู่แล้ว?{" "}
            <Link href="/login" className="text-amber-500 hover:underline">
              เข้าสู่ระบบ
            </Link>
          </p>
          <p className="mt-2 text-center">
            <Link
              href="/"
              className="text-sm text-neutral-500 transition-colors hover:text-amber-500/90"
            >
              ← กลับหน้าแรก
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
