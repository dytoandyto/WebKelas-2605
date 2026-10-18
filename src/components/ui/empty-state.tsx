"use client";

import * as React from "react";
import { FolderOpen } from "lucide-react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-primary)]",
        className
      )}
    >
      <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400 flex items-center justify-center mb-4">
        {icon || <FolderOpen className="w-6 h-6 sm:w-7 sm:h-7 stroke-[1.75]" />}
      </div>
      <h4 className="text-base sm:text-lg font-semibold text-[var(--text-primary)]">
        {title}
      </h4>
      {description && (
        <p className="mt-1.5 text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}