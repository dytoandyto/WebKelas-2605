import Link from "next/link";
import { ArrowLeft, Home, BookOpen, Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16 bg-[var(--bg-primary)] text-[var(--text-primary)]">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-900 shadow-sm">
          <span className="text-3xl font-extrabold font-mono">404</span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight font-display text-slate-900 dark:text-white">
            Halaman Tidak Ditemukan
          </h1>
          <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            Halaman yang Anda tuju mungkin telah dipindahkan, berstatus draft dan memerlukan akses masuk pengajar/admin, atau tautan yang Anda masukkan kurang tepat.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-colors shadow-sm cursor-pointer"
          >
            <Home size={16} />
            <span>Kembali ke Beranda</span>
          </Link>
          <Link
            href="/articles"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 font-semibold text-sm transition-colors cursor-pointer"
          >
            <BookOpen size={16} />
            <span>Daftar Artikel</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
