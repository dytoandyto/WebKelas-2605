"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowUpRight, Globe } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface QuickLinkCardProps {
  title: string;
  description: string;
  href: string;
  external?: boolean;
  logoSrc?: string;
  icon?: React.ReactNode;
  badge?: string;
  className?: string;
}

export function QuickLinkCard({
  title,
  description,
  href,
  external,
  logoSrc,
  icon,
  badge,
  className,
}: QuickLinkCardProps) {
  const isExternal = external !== undefined ? external : href.startsWith("http://") || href.startsWith("https://");
  const [imgError, setImgError] = React.useState(false);

  const content = (
    <Card
      variant="interactive"
      padding="none"
      className={cn(
        "group relative flex items-center justify-between gap-3 px-3.5 py-3 text-left rounded-xl transition-all duration-150 hover:translate-y-0",
        "bg-[var(--surface-primary)] hover:bg-[var(--primary)]/5 border border-[var(--border-color)] hover:border-cyan-400/50 light:hover:border-blue-400/60",
        "shadow-2xs",
        "active:scale-[0.99]",
        className
      )}
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Logo / Icon Container (~36px) */}
        {logoSrc && !imgError ? (
          <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 flex items-center justify-center shrink-0 p-1 overflow-hidden shadow-2xs">
            <Image
              src={logoSrc}
              alt={title}
              width={32}
              height={22}
              sizes="36px"
              className="max-h-5 sm:max-h-5.5 max-w-full object-contain"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          </div>
        ) : icon ? (
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center text-cyan-400 light:text-blue-600 shrink-0">
            {icon}
          </div>
        ) : (
          <div className="w-9 h-9 rounded-lg bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center text-cyan-500 light:text-blue-600 shrink-0">
            <Globe size={18} />
          </div>
        )}

        {/* Text Information (Title ~13-14px, Description ~11-12px) */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors truncate">
              {title}
            </span>
            {badge && (
              <span className="text-[9px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-slate-300 border border-slate-200/70 dark:border-slate-700/70 shrink-0">
                {badge}
              </span>
            )}
          </div>
          <p className="text-[11px] sm:text-xs text-[var(--text-secondary)] truncate leading-tight mt-0.5">
            {description}
          </p>
        </div>
      </div>

      {/* External Action Indicator Arrow */}
      <div className="shrink-0 text-slate-400 dark:text-slate-500 group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors p-0.5">
        <ArrowUpRight size={15} />
      </div>
    </Card>
  );

  if (isExternal) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 light:focus-visible:ring-blue-500"
        aria-label={`${title} - ${description} (buka tautan resmi)`}
      >
        {content}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className="block group rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 light:focus-visible:ring-blue-500"
    >
      {content}
    </Link>
  );
}
