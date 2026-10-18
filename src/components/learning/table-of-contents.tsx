"use client";

import * as React from "react";
import { List, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { extractHeadingsFromMarkdown } from "./article-content-renderer";

export interface TocItem {
  id: string;
  text: string;
  level: number;
}

export interface TableOfContentsProps {
  headings?: TocItem[];
  content?: string;
  className?: string;
}

export function TableOfContents({ headings: rawHeadings, content, className }: TableOfContentsProps) {
  const headings = React.useMemo(() => {
    if (rawHeadings && rawHeadings.length > 0) return rawHeadings;
    if (content) return extractHeadingsFromMarkdown(content);
    return [];
  }, [rawHeadings, content]);

  const [activeId, setActiveId] = React.useState<string>("");
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);

  React.useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
            break;
          }
        }
      },
      {
        rootMargin: "-80px 0px -60% 0px",
        threshold: 0.1,
      }
    );

    headings.forEach((heading) => {
      const el = document.getElementById(heading.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <div className={cn("rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-[#070d19]/80 backdrop-blur-xl p-4 sm:p-5 shadow-xs", className)}>
      {/* Mobile Accordion Header */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="w-full flex items-center justify-between text-left lg:pointer-events-none cursor-pointer"
        aria-expanded={isMobileOpen}
      >
        <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-wider text-cyan-500 uppercase">
          <List size={14} />
          <span>Daftar Isi Materi</span>
        </div>
        <ChevronDown
          size={16}
          className={cn(
            "lg:hidden text-slate-400 transition-transform duration-200",
            isMobileOpen ? "rotate-180" : ""
          )}
        />
      </button>

      {/* Navigation List */}
      <nav
        className={cn(
          "mt-3 space-y-1 text-sm font-medium transition-all duration-200",
          isMobileOpen ? "block" : "hidden lg:block"
        )}
      >
        {headings.map((heading) => {
          const isActive = activeId === heading.id;
          return (
            <a
              key={heading.id}
              href={`#${heading.id}`}
              onClick={() => setIsMobileOpen(false)}
              className={cn(
                "block py-1.5 transition-colors rounded-md text-xs sm:text-sm",
                heading.level === 3 ? "pl-5 text-[13px]" : "pl-2 font-medium",
                isActive
                  ? "text-cyan-600 dark:text-cyan-400 font-semibold bg-cyan-500/10 -ml-1 border-l-2 border-cyan-500 pl-2.5"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              )}
            >
              {heading.text}
            </a>
          );
        })}
      </nav>
    </div>
  );
}
