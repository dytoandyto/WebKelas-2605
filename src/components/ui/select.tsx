"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: string;
  icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, error, icon, disabled, ...props }, ref) => {
    return (
      <div className="relative w-full">
        {icon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center justify-center shrink-0">
            {icon}
          </div>
        )}
        <select
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex h-10 w-full appearance-none rounded-xl border bg-[var(--surface-primary)] px-3.5 py-2 pr-9 text-sm text-[var(--text-primary)] transition-all duration-200 cursor-pointer",
            "border-[var(--border-color)] hover:border-cyan-400/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20",
            "light:bg-white light:border-slate-300 light:hover:border-blue-400 light:focus:border-blue-500 light:focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            icon && "pl-10",
            error && "border-red-500/60 focus:border-red-500 text-red-300",
            className
          )}
          {...props}
        >
          {children}
        </select>
        <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center justify-center">
          <ChevronDown className="w-4 h-4 opacity-70" />
        </div>
        {error && (
          <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";
