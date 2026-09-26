"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BookOpen, Eye, EyeOff, LogIn, AlertCircle } from "lucide-react";
import { loginAction } from "@/lib/actions/auth";

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
    <div className="min-h-screen cosmic-canvas cyber-grid flex items-center justify-center px-4 py-12 relative overflow-hidden text-slate-100">
      {/* Background ambient glows */}
      <div
        className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #06b6d4, transparent)" }}
      />
      <div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, #2563eb, transparent)" }}
      />

      <div className="w-full max-w-md relative z-10">
        {/* Card */}
        <div className="cyber-card rounded-3xl bg-[#081326]/90 backdrop-blur-2xl p-8 sm:p-10 border border-cyan-500/30 shadow-cyan-glow">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-cyan-glow mb-4 border border-cyan-300/40">
              <BookOpen className="text-white" size={26} />
            </div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-[11px] font-semibold text-cyan-300 mb-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              <span>Information Systems 26</span>
            </div>
            <h1
              className="text-2xl font-black text-white tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              Control Terminal
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">Authenticate credentials to access admin node</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error */}
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2" role="alert">
                <AlertCircle size={16} className="flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="space-y-1.5">
              <label htmlFor="email" className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Operator Email
              </label>
              <input
                id="email"
                type="email"
                className="w-full bg-[#061021]/90 border border-cyan-500/25 rounded-xl px-4 py-2.5 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                placeholder="admin@classhub.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label htmlFor="password" className="block text-xs font-semibold text-cyan-300 uppercase tracking-wider">
                Access Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="w-full bg-[#061021]/90 border border-cyan-500/25 rounded-xl px-4 py-2.5 pr-10 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-cyan-300 transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full py-3 mt-4 rounded-xl font-extrabold text-sm text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:brightness-110 shadow-cyan-glow flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
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
                  <span>Authenticating…</span>
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  <span>Authenticate Session</span>
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-[#061021]/80 rounded-2xl border border-cyan-500/20">
            <p className="text-[11px] font-semibold text-cyan-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Demo Credentials
            </p>
            <div className="space-y-1 text-xs text-slate-300 font-mono">
              <p className="truncate">admin@classhub.edu / AdminClassHub2026!</p>
              <p className="truncate">classadmin@classhub.edu / ClassAdmin2026!</p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-5">
            <Link href="/" className="text-cyan-400 hover:text-white font-semibold transition-colors">
              &larr; Return to Public Portal
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
