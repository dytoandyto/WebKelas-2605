"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const cardVariants = cva(
  "rounded-xl transition-all duration-150 text-[var(--text-primary)] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs",
        glass:
          "bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-sm",
        elevated:
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md",
        outline:
          "bg-transparent border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700",
        interactive:
          "bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-sm cursor-pointer group",
        featured:
          "bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-900/50 shadow-sm",
      },
      padding: {
        none: "p-0",
        sm: "p-3 sm:p-4",
        md: "p-4 sm:p-5",
        lg: "p-6 sm:p-7",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(cardVariants({ variant, padding }), className)}
        {...props}
      />
    );
  }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1 pb-3", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-bold text-base sm:text-lg text-slate-900 dark:text-white tracking-tight",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-3 mt-auto border-t border-slate-100 dark:border-slate-800", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* --------------------------------------------------
   Dedicated Metric / Stat Card Component
-------------------------------------------------- */

export interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: string;
    isPositive?: boolean;
  };
  icon?: React.ReactNode;
  className?: string;
}

export function StatCard({
  title,
  value,
  description,
  trend,
  icon,
  className,
}: StatCardProps) {
  return (
    <Card
      padding="md"
      className={cn(
        "flex flex-col justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
          {value}
        </div>

        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
            {trend && (
              <span
                className={cn(
                  "font-semibold font-mono",
                  trend.isPositive
                    ? "text-emerald-600 dark:text-emerald-400"
                    : "text-rose-600 dark:text-rose-400"
                )}
              >
                {trend.value}
              </span>
            )}
            {description && <span className="truncate">{description}</span>}
          </div>
        )}
      </div>
    </Card>
  );
}
