"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string;
  helperText?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, error, helperText, disabled, ...props }, ref) => {
    return (
      <div className="w-full">
        <textarea
          ref={ref}
          disabled={disabled}
          className={cn(
            "flex min-h-[90px] w-full rounded-xl border bg-[var(--surface-primary)] px-3.5 py-2.5 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-200",
            "border-[var(--border-color)] hover:border-cyan-400/40 focus:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400/20",
            "light:bg-white light:border-slate-300 light:hover:border-blue-400 light:focus:border-blue-500 light:focus:ring-blue-500/20",
            "disabled:cursor-not-allowed disabled:opacity-50 resize-y",
            error &&
              "border-red-500/60 focus:border-red-500 focus:ring-red-500/20 text-red-300",
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-xs text-red-400 font-medium">{error}</p>
        )}
        {!error && helperText && (
          <p className="mt-1 text-xs text-[var(--text-muted)]">{helperText}</p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";
