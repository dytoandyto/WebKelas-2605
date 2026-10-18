"use client";

import * as React from "react";
import {
  BookOpen,
  ChevronDown,
  Link2,
  Check,
  ArrowUp,
  ListOrdered,
  Sparkles,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { extractHeadings } from "@/lib/editor/content-converter";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  headings?: TocItem[];
  content?: string;
  className?: string;
  variant?: "desktop" | "mobile" | "auto";
}

export function TableOfContents({
  headings: rawHeadings,
  content,
  className,
  variant = "auto",
}: TableOfContentsProps) {
  const headings = React.useMemo(() => {
    if (rawHeadings && rawHeadings.length > 0) return rawHeadings;
    if (content) return extractHeadings(content);
    return [];
  }, [rawHeadings, content]);

  const [activeId, setActiveId] = React.useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  // Persentase membaca disembunyikan (di-comment sesuai instruksi)
  // const [readingProgress, setReadingProgress] = React.useState<number>(0);
  const [copiedId, setCopiedId] = React.useState<string | null>(null);

  // Scrollspy to track active heading
  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Find visible entry closest to top
        const visibleEntries = entries.filter((e) => e.isIntersecting);
        if (visibleEntries.length > 0) {
          setActiveId(visibleEntries[0].target.id);
        }
      },
      {
        rootMargin: "-90px 0px -65% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  // Track overall page reading progress percentage (di-comment sesuai permintaan)
  /*
  React.useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          if (totalHeight > 0) {
            const current = window.pageYOffset;
            const pct = Math.min(100, Math.max(0, Math.round((current / totalHeight) * 100)));
            setReadingProgress(pct);
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
  */

  if (headings.length === 0) return null;

  const scrollToHeading = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -95;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setActiveId("");
  };

  const handleCopySectionLink = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}${window.location.pathname}#${id}`;
      navigator.clipboard.writeText(url);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Find active heading title for compact preview
  const currentHeading = headings.find((h) => h.id === activeId) || headings[0];

  // Primary H1/H2 counter index
  let majorIndex = 0;

  // ----------------------------------------------------
  // MOBILE COLLAPSIBLE QUICK JUMP BAR
  // ----------------------------------------------------
  const renderMobile = () => (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-xs overflow-hidden transition-all",
        className
      )}
    >
      <button
        type="button"
        onClick={() => setIsMobileOpen((v) => !v)}
        className="w-full px-4 py-3.5 flex items-center justify-between text-left cursor-pointer transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50"
        aria-expanded={isMobileOpen}
        aria-label="Buka Daftar Isi Materi"
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-cyan-400 flex items-center justify-center shrink-0 border border-blue-200/50 dark:border-blue-900/50">
            <ListOrdered size={15} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-cyan-400">
                Daftar Isi Materi
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400">
                {headings.length} Bagian
              </span>
            </div>
            <div className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate mt-0.5">
              {currentHeading?.text || "Pilih bagian untuk membaca"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Persentase membaca di-hide / di-comment */}
          {/* <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
            {readingProgress}%
          </span> */}
          <ChevronDown
            size={18}
            className={cn(
              "text-slate-400 transition-transform duration-200",
              isMobileOpen && "rotate-180"
            )}
          />
        </div>
      </button>

      {/* Reading Progress Line - di-hide / di-comment */}
      {/* <div className="h-0.5 w-full bg-slate-100 dark:bg-slate-800">
        <div
          className="h-full bg-gradient-to-r from-blue-600 to-cyan-400 transition-all duration-150"
          style={{ width: `${readingProgress}%` }}
        />
      </div> */}

      {/* Mobile Expanded Navigation Menu */}
      {isMobileOpen && (
        <nav className="p-3 border-t border-slate-100 dark:border-slate-800/80 max-h-72 overflow-y-auto space-y-1">
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <a
                key={heading.id}
                href={`#${heading.id}`}
                onClick={(e) => scrollToHeading(heading.id, e)}
                className={cn(
                  "flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all",
                  heading.level === 3 ? "pl-6 text-slate-500 dark:text-slate-400" : "font-semibold",
                  isActive
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900/60 shadow-xs"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60"
                )}
              >
                <span className="truncate pr-2">{heading.text}</span>
                {isActive && (
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-cyan-400 shrink-0" />
                )}
              </a>
            );
          })}
        </nav>
      )}
    </div>
  );

  // ----------------------------------------------------
  // DESKTOP RICH STICKY CARD
  // ----------------------------------------------------
  const renderDesktop = () => (
    <div
      className={cn(
        "rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/90 dark:bg-[#070d19]/90 backdrop-blur-md p-5 shadow-xs transition-all space-y-4",
        className
      )}
    >
      {/* Header with Title */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-blue-600 dark:text-cyan-400 uppercase">
            <BookOpen size={15} />
            <span>Daftar Isi Materi</span>
          </div>
          <span className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200/50 dark:border-blue-900/40 text-[10px] font-mono font-semibold text-blue-700 dark:text-cyan-300">
            {headings.length} Bab
          </span>
        </div>

        {/* Persentase & Kemajuan Membaca Container - di-hide / di-comment */}
        {/* <div className="space-y-1">
          <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 dark:text-slate-500">
            <span>Kemajuan Membaca</span>
            <span className="font-semibold text-slate-600 dark:text-slate-300">
              {readingProgress}%
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 rounded-full transition-all duration-200"
              style={{ width: `${readingProgress}%` }}
            />
          </div>
        </div> */}
      </div>

      {/* Hierarchical Navigation Tree */}
      <nav
        className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1 space-y-1 relative border-l border-slate-200/80 dark:border-slate-800 ml-1.5"
        aria-label="Daftar Isi Materi"
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          const isMajor = heading.level <= 2;
          if (isMajor) majorIndex++;

          return (
            <div
              key={heading.id}
              className={cn(
                "group relative flex items-center justify-between rounded-lg transition-all",
                heading.level === 3 ? "ml-4" : "ml-0"
              )}
            >
              {/* Active Guide Indicator on Left Border */}
              {isActive && (
                <span className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-blue-600 dark:bg-cyan-400 ring-4 ring-white dark:ring-slate-900" />
              )}

              <a
                href={`#${heading.id}`}
                onClick={(e) => scrollToHeading(heading.id, e)}
                title={heading.text}
                className={cn(
                  "flex-1 py-1.5 pl-3 pr-2 text-xs rounded-md transition-all truncate flex items-center gap-2",
                  isMajor
                    ? "font-semibold"
                    : "text-[11px] font-normal text-slate-500 dark:text-slate-400",
                  isActive
                    ? "bg-blue-50 dark:bg-cyan-950/40 text-blue-700 dark:text-cyan-300 font-bold shadow-2xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/40"
                )}
              >
                {/* Numbering badge for major chapters */}
                {isMajor && (
                  <span
                    className={cn(
                      "text-[10px] font-mono shrink-0",
                      isActive
                        ? "text-blue-600 dark:text-cyan-400 font-bold"
                        : "text-slate-400 dark:text-slate-500"
                    )}
                  >
                    {String(majorIndex).padStart(2, "0")}
                  </span>
                )}
                {heading.level === 3 && (
                  <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 shrink-0" />
                )}
                <span className="truncate">{heading.text}</span>
              </a>

              {/* Copy Direct Anchor Link Button on Hover */}
              <button
                type="button"
                onClick={(e) => handleCopySectionLink(heading.id, e)}
                title="Salin tautan langsung bagian ini"
                aria-label={`Salin tautan ${heading.text}`}
                className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 transition-opacity rounded shrink-0 mr-1"
              >
                {copiedId === heading.id ? (
                  <Check size={12} className="text-emerald-500" />
                ) : (
                  <Link2 size={12} />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Footer Actions */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs font-mono">
        <button
          type="button"
          onClick={scrollToTop}
          className="flex items-center gap-1.5 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors cursor-pointer py-1"
        >
          <ArrowUp size={12} />
          <span>Kembali ke Atas</span>
        </button>

        <span className="text-[10px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <Sparkles size={11} className="text-amber-500" />
          <span>Materi Terverifikasi</span>
        </span>
      </div>
    </div>
  );

  if (variant === "mobile") {
    return renderMobile();
  }

  if (variant === "desktop") {
    return renderDesktop();
  }

  // "auto": renders mobile on small screens, desktop on large screens
  return (
    <>
      <div className="lg:hidden">{renderMobile()}</div>
      <div className="hidden lg:block">{renderDesktop()}</div>
    </>
  );
}
