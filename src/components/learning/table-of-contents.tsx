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

  const desktopNavRef = React.useRef<HTMLElement>(null);
  const mobileNavRef = React.useRef<HTMLElement>(null);

  // Scrollspy to accurately track active heading as user scrolls
  React.useEffect(() => {
    if (headings.length === 0) return;

    let ticking = false;

    const updateActiveHeading = () => {
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;

      // 1. If at or near the very bottom of the page, activate the last heading
      if (scrollY + clientHeight >= scrollHeight - 90) {
        setActiveId(headings[headings.length - 1].id);
        return;
      }

      // 2. Find the last heading whose top position is at or above the reading line (140px below top)
      const offset = 140;
      let currentActive = headings[0].id;

      for (let i = 0; i < headings.length; i++) {
        const el = document.getElementById(headings[i].id);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= offset) {
            currentActive = headings[i].id;
          } else {
            break;
          }
        }
      }

      setActiveId(currentActive);
    };

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          updateActiveHeading();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll, { passive: true });
    // Initial check on mount
    updateActiveHeading();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
    };
  }, [headings]);

  // Auto-scroll the Table of Contents container so that active heading stays visible in sidebar
  React.useEffect(() => {
    if (!activeId) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Desktop TOC auto-scroll
    if (desktopNavRef.current) {
      const activeEl = desktopNavRef.current.querySelector(
        `[data-toc-id="${activeId}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        const navRect = desktopNavRef.current.getBoundingClientRect();
        const itemRect = activeEl.getBoundingClientRect();

        // If the active item is near or outside the edges of the TOC nav container, scroll it smoothly into view
        if (itemRect.top < navRect.top + 36 || itemRect.bottom > navRect.bottom - 36) {
          activeEl.scrollIntoView({
            block: "nearest",
            inline: "nearest",
            behavior: prefersReducedMotion ? "auto" : "smooth",
          });
        }
      }
    }

    // Mobile TOC auto-scroll (if menu is open)
    if (isMobileOpen && mobileNavRef.current) {
      const activeEl = mobileNavRef.current.querySelector(
        `[data-toc-id="${activeId}"]`
      ) as HTMLElement | null;
      if (activeEl) {
        activeEl.scrollIntoView({
          block: "nearest",
          inline: "nearest",
          behavior: prefersReducedMotion ? "auto" : "smooth",
        });
      }
    }
  }, [activeId, isMobileOpen]);

  if (headings.length === 0) {
    return (
      <div
        className={cn(
          "rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md p-5 text-center shadow-xs",
          className
        )}
      >
        <div className="flex items-center justify-center gap-2 text-xs font-mono text-slate-400 dark:text-slate-500">
          <BookOpen size={14} />
          <span>Belum ada daftar isi untuk artikel ini.</span>
        </div>
      </div>
    );
  }

  const scrollToHeading = (id: string, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -95;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      window.scrollTo({ top: y, behavior: prefersReducedMotion ? "auto" : "smooth" });
      window.history.pushState(null, "", `#${id}`);
      setActiveId(id);
      setIsMobileOpen(false);
    }
  };

  const scrollToTop = () => {
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? "auto" : "smooth" });
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
        <nav
          ref={mobileNavRef}
          className="p-3 border-t border-slate-100 dark:border-slate-800/80 max-h-72 overflow-y-auto space-y-1 scroll-smooth"
        >
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            return (
              <a
                key={heading.id}
                data-toc-id={heading.id}
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
  const renderDesktop = () => {
    let majorIndex = 0;
    return (
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
        </div>

        {/* Hierarchical Navigation Tree */}
        <nav
          ref={desktopNavRef}
          className="max-h-[calc(100vh-280px)] overflow-y-auto pr-1 space-y-1 relative border-l border-slate-200/80 dark:border-slate-800 ml-1.5 scroll-smooth"
          aria-label="Daftar Isi Materi"
        >
          {headings.map((heading) => {
            const isActive = activeId === heading.id;
            const isMajor = heading.level <= 2;
            if (isMajor) majorIndex++;

            return (
              <div
                key={heading.id}
                data-toc-id={heading.id}
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
      </div>
    </div>
  );
};

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
