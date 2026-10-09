"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { ThemeSwitcher } from "@/components/theme-switcher";

export default function LoginPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    startTransition(async () => {
      const result = await loginAction({ email, password });
      if (result.success) {
        router.push("/admin");
        router.refresh();
      } else {
        setError(result.error || "Invalid email or password");
      }
    });
  }

  return (
    <div className="min-h-screen cosmic-canvas cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden text-[var(--text-primary)]">
      {/* Top right Theme Switcher */}
      <div className="absolute top-6 right-6 z-20">
        <ThemeSwitcher />
      </div>

      {/* Ambient background glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, var(--primary), transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none -z-10"
        style={{ background: "radial-gradient(circle, #2563eb, transparent)" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="card card-glass p-8 sm:p-10 shadow-2xl space-y-6">
          {/* Logo & Header */}
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center shadow-md mb-4 border border-cyan-300/40 text-white">
              <BookOpen size={26} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[11px] font-mono font-semibold text-[var(--primary)] dark:text-cyan-400 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dark:bg-cyan-400 animate-pulse" />
              <span>JS1SI-26-REG-05 &bull; Portal Pengurus</span>
            </div>
            <h1 className="text-2xl font-black font-display text-[var(--text-primary)] tracking-tight">
              Portal Pengurus
            </h1>
            <p className="text-[var(--text-secondary)] text-xs sm:text-sm mt-1">
              Masuk untuk mengelola informasi dan materi kelas
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error Message */}
            {error && (
              <div
                className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-500 dark:text-rose-300 text-xs flex items-center gap-2"
                role="alert"
              >
                <AlertCircle size={16} className="shrink-0 text-rose-500" />
                <span>{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Email
              </label>
              <input
                id="email"
                type="email"
                className="input w-full px-4 py-2.5 text-sm rounded-xl"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-[var(--text-secondary)] uppercase tracking-wider font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="input w-full px-4 py-2.5 pr-10 text-sm rounded-xl"
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-full py-3 mt-4 text-sm flex items-center justify-center gap-2 font-bold"
              disabled={isPending}
              aria-busy={isPending}
            >
              {isPending ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  <span>Memverifikasi...</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Masuk Portal Pengurus</span>
                </>
              )}
            </button>
          </form>
          <p className="text-center text-xs text-[var(--text-muted)]">
            <Link href="/" className="text-[var(--primary)] dark:text-cyan-400 hover:underline font-semibold transition-colors">
              &larr; Kembali ke Beranda Kelas
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
