"use client";

import * as React from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    // Log error to console for debugging
    console.error("ClassHub Application Error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900 shadow-sm">
          <AlertTriangle size={36} />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
            Terjadi Kendala Teknis
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Sistem mengalami kendala saat memproses halaman ini. Silakan coba muat ulang atau kembali ke halaman beranda.
          </p>
          {error?.digest && (
            <p className="text-xs font-mono text-slate-400 dark:text-slate-500 pt-1">
              Kode Pelacakan (Digest): {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            <RotateCcw size={16} />
            <span>Coba Lagi</span>
          </button>
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            <Home size={16} />
            <span>Ke Beranda</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
