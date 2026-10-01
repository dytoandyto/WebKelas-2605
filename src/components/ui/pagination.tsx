"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
  siblingCount?: number;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  className,
  siblingCount = 1,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const getPageNumbers = () => {
    const totalNumbers = siblingCount * 2 + 3;
    const totalBlocks = totalNumbers + 2;

    if (totalPages <= totalBlocks) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 2;

    const firstPageIndex = 1;
    const lastPageIndex = totalPages;

    if (!shouldShowLeftDots && shouldShowRightDots) {
      const leftItemCount = 3 + 2 * siblingCount;
      const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1);
      return [...leftRange, "dots", totalPages];
    }

    if (shouldShowLeftDots && !shouldShowRightDots) {
      const rightItemCount = 3 + 2 * siblingCount;
      const rightRange = Array.from(
        { length: rightItemCount },
        (_, i) => totalPages - rightItemCount + i + 1
      );
      return [firstPageIndex, "dots", ...rightRange];
    }

    if (shouldShowLeftDots && shouldShowRightDots) {
      const middleRange = Array.from(
        { length: rightSiblingIndex - leftSiblingIndex + 1 },
        (_, i) => leftSiblingIndex + i
      );
      return [firstPageIndex, "dots", ...middleRange, "dots", lastPageIndex];
    }

    return [];
  };

  const pages = getPageNumbers();

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className={cn("flex items-center justify-center gap-1.5", className)}
    >
      <button
        type="button"
        disabled={currentPage <= 1}
        onClick={() => onPageChange(currentPage - 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-400/40 disabled:opacity-40 disabled:pointer-events-none transition-colors light:bg-white light:border-slate-300"
        aria-label="Halaman Sebelumnya"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, idx) => {
        if (p === "dots") {
          return (
            <span
              key={`dots-${idx}`}
              className="w-9 h-9 flex items-center justify-center text-[var(--text-muted)]"
            >
              <MoreHorizontal className="w-4 h-4" />
            </span>
          );
        }

        const isCurrent = p === currentPage;
        return (
          <button
            key={`page-${p}`}
            type="button"
            onClick={() => onPageChange(p as number)}
            className={cn(
              "w-9 h-9 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 select-none",
              isCurrent
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] border border-cyan-400/40"
                : "bg-[var(--surface-primary)] text-[var(--text-secondary)] border border-[var(--border-color)] hover:border-cyan-400/40 hover:text-[var(--text-primary)] light:bg-white light:border-slate-300"
            )}
            aria-current={isCurrent ? "page" : undefined}
          >
            {p}
          </button>
        );
      })}

      <button
        type="button"
        disabled={currentPage >= totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        className="inline-flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-cyan-400/40 disabled:opacity-40 disabled:pointer-events-none transition-colors light:bg-white light:border-slate-300"
        aria-label="Halaman Berikutnya"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </nav>
  );
}
