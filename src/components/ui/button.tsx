"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-150 select-none cursor-pointer disabled:pointer-events-none disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600/30 dark:focus-visible:ring-blue-500/40 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-slate-900 active:scale-[0.99]",
  {
    variants: {
      variant: {
        primary:
          "bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-xs border border-blue-600/20 active:scale-[0.98]",
        secondary:
          "bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-200/80 shadow-xs dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 dark:border-slate-700",
        outline:
          "bg-transparent text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/60 shadow-xs",
        ghost:
          "bg-transparent text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70",
        destructive:
          "bg-rose-600 hover:bg-rose-700 text-white shadow-xs font-medium",
        danger:
          "bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60 dark:hover:bg-rose-950/70 shadow-xs",
        success:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60 dark:hover:bg-emerald-950/70 shadow-xs",
        link:
          "bg-transparent text-blue-600 dark:text-blue-400 hover:underline p-0 h-auto font-normal active:scale-100",
      },
      size: {
        sm: "h-8 px-2.5 text-xs rounded-md gap-1.5",
        md: "h-9 px-3.5 py-2 text-sm rounded-lg gap-2",
        lg: "h-10.5 px-4.5 text-sm sm:text-base rounded-lg gap-2.5",
        icon: "h-9 w-9 p-0 rounded-lg flex items-center justify-center shrink-0",
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
        {isLoading && <Loader2 className="w-4 h-4 animate-spin shrink-0" />}
        {!isLoading && leftIcon && (
          <span className="shrink-0 flex items-center justify-center">
            {leftIcon}
          </span>
        )}
        {children}
        {!isLoading && rightIcon && (
          <span className="shrink-0 flex items-center justify-center">
            {rightIcon}
          </span>
        )}
      </button>
    );
  }
);
Button.displayName = "Button";
