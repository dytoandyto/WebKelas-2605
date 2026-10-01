"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const cardVariants = cva(
  "rounded-2xl transition-all duration-200 text-[var(--text-primary)] relative overflow-hidden",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs",
        glass:
          "bg-[var(--surface-card)]/80 backdrop-blur-xl border border-cyan-500/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] light:shadow-[0_8px_30px_rgba(18,32,44,0.06)] light:border-slate-200/80",
        elevated:
          "bg-[var(--surface-card)] border border-[var(--border-color)] shadow-md light:shadow-[0_12px_28px_-6px_rgba(18,32,44,0.08)]",
        outline:
          "bg-transparent border border-[var(--border-color)] hover:border-cyan-400/40 light:border-slate-300",
        interactive:
          "bg-[var(--surface-card)] border border-[var(--border-color)] shadow-xs hover:-translate-y-0.5 hover:border-cyan-400/40 hover:shadow-sm light:hover:border-blue-400/50 cursor-pointer group",
        featured:
          "bg-gradient-to-b from-[var(--surface-card)] to-[var(--surface-secondary)] border border-cyan-400/30 shadow-sm light:border-blue-300 light:shadow-sm",
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
      "font-bold text-base sm:text-lg text-[var(--text-primary)] tracking-tight",
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
    className={cn("text-xs text-[var(--text-secondary)] leading-relaxed", className)}
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
    className={cn("flex items-center pt-3 mt-auto border-t border-[var(--border-color)]/60", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

/* --------------------------------------------------
   Dedicated SaaS Metric / Stat Card Component
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
        "flex flex-col justify-between rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] hover:border-cyan-400/30 light:hover:border-blue-400/40 transition-colors shadow-xs",
        className
      )}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        {icon && (
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 light:bg-blue-50 light:text-blue-600 shrink-0">
            {icon}
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {value}
        </div>

        {(description || trend) && (
          <div className="flex items-center gap-2 text-xs text-[var(--text-secondary)]">
            {trend && (
              <span
                className={cn(
                  "font-semibold font-mono",
                  trend.isPositive
                    ? "text-emerald-400 light:text-emerald-600"
                    : "text-rose-400 light:text-rose-600"
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
