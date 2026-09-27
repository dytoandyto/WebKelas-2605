import React from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface PageHeaderProps {
  badge?: string;
  title: string;
  description?: string;
  breadcrumbs?: BreadcrumbItem[];
  actions?: React.ReactNode;
  stats?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  badge,
  title,
  description,
  breadcrumbs,
  actions,
  stats,
  children,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`relative mb-8 pb-6 border-b border-[var(--border-color)]/70 ${className}`}>
      {/* Ambient soft glow */}
      <div className="absolute -top-12 -left-12 w-72 h-72 bg-[var(--primary)]/10 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none -z-10" />

      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-3">
          <Link href="/" className="hover:text-[var(--text-primary)] transition-colors">
            Home
          </Link>
          {breadcrumbs.map((crumb, idx) => (
            <React.Fragment key={idx}>
              <ChevronRight size={12} className="opacity-40" />
              {crumb.href ? (
                <Link href={crumb.href} className="hover:text-[var(--text-primary)] transition-colors">
                  {crumb.label}
                </Link>
              ) : (
                <span className="text-[var(--text-secondary)] font-medium">{crumb.label}</span>
              )}
            </React.Fragment>
          ))}
        </nav>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5 max-w-3xl">
          {badge && (
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-mono font-semibold uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-400 border border-[var(--primary)]/25 mb-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] dark:bg-cyan-400 animate-pulse" />
              <span>{badge}</span>
            </div>
          )}
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display tracking-tight text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-sm sm:text-base text-[var(--text-secondary)] leading-relaxed font-sans max-w-2xl">
              {description}
            </p>
          )}
        </div>

        {actions && <div className="flex items-center gap-2.5 flex-wrap shrink-0">{actions}</div>}
      </div>

      {stats && <div className="mt-6 pt-5 border-t border-[var(--border-color)]/50">{stats}</div>}
      {children && <div className="mt-6">{children}</div>}
    </div>
  );
}

export function SectionHeader({
  badge,
  title,
  description,
  actions,
  className = "",
}: {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 ${className}`}>
      <div className="space-y-1">
        {badge && (
          <span className="text-[11px] font-mono uppercase tracking-widest text-[var(--primary)] dark:text-cyan-400 font-bold block">
            // {badge}
          </span>
        )}
        <h2 className="text-xl sm:text-2xl font-bold font-display text-[var(--text-primary)] tracking-tight">
          {title}
        </h2>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-xl">{description}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  );
}
