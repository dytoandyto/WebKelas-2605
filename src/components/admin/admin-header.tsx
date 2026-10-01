import React from "react";
import { cn } from "@/lib/utils";

interface AdminHeaderProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}

export function AdminHeader({
  title,
  description,
  children,
  className,
}: AdminHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-1 mb-6",
        className
      )}
    >
      <div className="space-y-1">
        <h1
          className="text-2xl sm:text-[28px] font-bold text-slate-900 dark:text-white tracking-tight"
          style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
        >
          {title}
        </h1>
        {description && (
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-normal max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {children && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {children}
        </div>
      )}
    </div>
  );
}
