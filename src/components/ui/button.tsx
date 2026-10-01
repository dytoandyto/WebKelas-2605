"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 light:focus-visible:ring-blue-500/40 focus-visible:ring-offset-1 focus-visible:ring-offset-background active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-sm hover:shadow border border-cyan-400/30 font-semibold",
        secondary:
          "bg-[var(--surface-primary)] hover:bg-[var(--surface-card-hover)] text-[var(--text-primary)] border border-cyan-500/20 hover:border-cyan-400/40 shadow-xs light:bg-slate-100 light:text-slate-800 light:border-slate-200 light:hover:bg-slate-200",
        outline:
          "bg-transparent text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/10 hover:border-cyan-400/50 light:text-blue-700 light:border-slate-300 light:hover:bg-slate-100",
        ghost:
          "bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-100",
        destructive:
          "bg-rose-600 hover:bg-rose-700 text-white shadow-sm border border-rose-600/40 font-medium",
        danger:
          "bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/30 hover:border-rose-400/50 shadow-xs light:bg-rose-50 light:text-rose-700 light:border-rose-200 light:hover:bg-rose-100",
        success:
          "bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 hover:border-emerald-400/50 shadow-xs light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200 light:hover:bg-emerald-100",
        link:
          "bg-transparent text-cyan-400 hover:underline p-0 h-auto font-normal light:text-blue-600 active:scale-100",
      },
      size: {
        sm: "h-8 px-2.5 text-xs rounded-lg gap-1.5",
        md: "h-9.5 px-3.5 py-2 text-sm rounded-xl gap-2",
        lg: "h-11 px-5 text-base rounded-xl gap-2.5",
        icon: "h-9 w-9 p-0 rounded-xl flex items-center justify-center shrink-0",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      isLoading = false,
      leftIcon,
      rightIcon,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size }), className)}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="w-4 h-4 animate-spin text-current shrink-0" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {!isLoading && rightIcon ? (
          <span className="shrink-0">{rightIcon}</span>
        ) : null}
      </button>
    );
  }
);

Button.displayName = "Button";
