"use client";

import * as React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface StatItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
}

export interface PageHeaderProps {
  title: React.ReactNode;
  description?: React.ReactNode;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  stats?: StatItem[];
  badge?: React.ReactNode;
  density?: "default" | "compact" | "dashboard";
  className?: string;
}

export function PageHeader({
  title,
  description,
  breadcrumbs = [],
  actions,
  stats,
  badge,
  density = "default",
  className,
}: PageHeaderProps) {
  const isCompact = density === "compact";
  const isDashboard = density === "dashboard";

  return (
    <div
      className={cn(
        "w-full transition-all duration-200",
        isCompact ? "mb-5" : isDashboard ? "mb-8" : "mb-8",
        className
      )}
    >
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <nav
          aria-label="Breadcrumb"
          className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3 overflow-x-auto whitespace-nowrap py-0.5"
        >
          <Link
            href="/"
            className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors"
          >
            Beranda
          </Link>
          {breadcrumbs.map((b, idx) => {
            const isLast = idx === breadcrumbs.length - 1;
            return (
              <React.Fragment key={idx}>
                <ChevronRight className="w-3.5 h-3.5 opacity-50 shrink-0" />
                {b.href && !isLast ? (
                  <Link
                    href={b.href}
                    className="hover:text-cyan-400 light:hover:text-blue-600 transition-colors"
                  >
                    {b.label}
                  </Link>
                ) : (
                  <span
                    className={cn(
                      isLast
                        ? "text-[var(--text-primary)] font-medium"
                        : "hover:text-[var(--text-primary)]"
                    )}
                  >
                    {b.label}
                  </span>
                )}
              </React.Fragment>
            );
          })}
        </nav>
      )}

      {/* Main Header Row */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-2 mb-1.5">
              {typeof badge === "string" ? (
                <span className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 light:bg-blue-50 light:border-blue-200 light:text-blue-700">
                  {badge}
                </span>
              ) : (
                badge
              )}
            </div>
          )}

          <h1
            className={cn(
              "font-bold text-[var(--text-primary)] tracking-tight leading-tight",
              isCompact
                ? "text-xl sm:text-2xl"
                : isDashboard
                ? "text-2xl sm:text-3xl lg:text-4xl"
                : "text-2xl sm:text-3xl lg:text-4xl"
            )}
          >
            {title}
          </h1>

          {description && (
            <p
              className={cn(
                "text-[var(--text-secondary)] leading-relaxed",
                isCompact ? "text-xs sm:text-sm" : "text-sm sm:text-base"
              )}
            >
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 mt-2 md:mt-0">
            {actions}
          </div>
        )}
      </div>

      {/* Optional Statistics Strip */}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 mt-6 pt-5 border-t border-[var(--border-color)]">
          {stats.map((s, idx) => (
            <div
              key={idx}
              className="flex items-center gap-3 p-3 sm:p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-card)]"
            >
              {s.icon && (
                <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/20 text-cyan-400 flex items-center justify-center shrink-0 light:bg-blue-50 light:border-blue-200 light:text-blue-600">
                  {s.icon}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-xs text-[var(--text-secondary)] truncate">
                  {s.label}
                </div>
                <div className="text-lg sm:text-xl font-bold text-[var(--text-primary)] tracking-tight">
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
