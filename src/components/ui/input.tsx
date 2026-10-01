"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  isLoading?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type,
      error,
      leftIcon,
      rightIcon,
      isLoading = false,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <div className="relative w-full">
        {leftIcon && (
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none flex items-center justify-center shrink-0">
            {leftIcon}
          </div>
        )}
        <input
          type={type}
          ref={ref}
          disabled={disabled || isLoading}
          className={cn(
            "flex h-10 w-full rounded-xl border bg-[var(--surface-primary)] px-3.5 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200",
            "border-[var(--border-color)] hover:border-cyan-400/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20",
            "light:bg-white light:border-slate-300 light:hover:border-blue-400 light:focus:border-blue-500 light:focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50",
            leftIcon && "pl-10",
            (rightIcon || isLoading) && "pr-10",
            error &&
              "border-red-500/60 focus:border-red-500 focus:ring-red-500/20 text-red-300",
            className
          )}
          {...props}
        />
        {(rightIcon || isLoading) && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] flex items-center justify-center shrink-0">
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-cyan-400" />
            ) : (
              rightIcon
            )}
          </div>
        )}
        {error && (
          <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";
