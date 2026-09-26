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
    <div className="min-h-screen hero-gradient flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background blobs */}
      <div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #818cf8, transparent)" }}
      />
      <div
        className="absolute bottom-0 right-1/4 w-72 h-72 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, #a78bfa, transparent)" }}
      />

      <div className="w-full max-w-sm relative z-10">
        {/* Card */}
        <div className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 border border-white/60">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-14 h-14 rounded-2xl gradient-brand flex items-center justify-center shadow-brand mb-4">
              <BookOpen className="text-white" size={26} />
            </div>
            <h1
              className="text-2xl font-extrabold text-slate-900 tracking-tight"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ClassHub
            </h1>
            <p className="text-slate-500 text-sm mt-1">Sign in to the admin panel</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Error */}
            {error && (
              <div className="alert alert-error" role="alert">
                <AlertCircle size={16} className="flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Email */}
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Email address
              </label>
              <input
                id="email"
                type="email"
                className="form-input"
                placeholder="admin@classhub.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                autoFocus
              />
            </div>

            {/* Password */}
            <div className="form-group">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  className="form-input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
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
              className="btn btn-primary w-full btn-lg mt-2"
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
                  Signing in…
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Demo credentials */}
          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-xs font-semibold text-slate-600 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-slate-500 font-mono">
              <p>admin@classhub.edu / AdminClassHub2026!</p>
              <p>classadmin@classhub.edu / ClassAdmin2026!</p>
            </div>
          </div>

          <p className="text-center text-sm text-slate-400 mt-4">
            <Link href="/" className="text-brand-600 hover:text-brand-700 font-medium">
              ← Back to ClassHub
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
