"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide transition-colors whitespace-nowrap select-none",
  {
    variants: {
      variant: {
        default:
          "bg-slate-800/80 text-slate-200 border border-slate-700/60 light:bg-slate-100 light:text-slate-800 light:border-slate-300",
        blue:
          "bg-blue-500/15 text-blue-300 border border-blue-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200",
        cyan:
          "bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 light:bg-sky-50 light:text-sky-700 light:border-sky-200",
        green:
          "bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200",
        yellow:
          "bg-amber-500/15 text-amber-300 border border-amber-500/30 light:bg-amber-50 light:text-amber-800 light:border-amber-200",
        red:
          "bg-red-500/15 text-red-300 border border-red-500/30 light:bg-red-50 light:text-red-700 light:border-red-200",
        purple:
          "bg-purple-500/15 text-purple-300 border border-purple-500/30 light:bg-purple-50 light:text-purple-700 light:border-purple-200",
        outline:
          "bg-transparent text-[var(--text-secondary)] border border-[var(--border-color)] light:text-slate-600 light:border-slate-300",
      },
      size: {
        sm: "px-2 py-0.2 text-[10px]",
        md: "px-2.5 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm font-medium",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "md",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, dot, children, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {dot && (
          <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 opacity-80" />
        )}
        {children}
      </span>
    );
  }
);
Badge.displayName = "Badge";

/* --------------------------------------------------
   Feature-Specific Composed Badges (using Badge internally)
-------------------------------------------------- */

export function TaskTypeBadge({
  type,
  className,
}: {
  type?: string | null;
  className?: string;
}) {
  const norm = (type || "INDIVIDUAL").toUpperCase();
  if (norm === "GROUP") {
    return (
      <Badge variant="purple" className={className}>
        Kelompok
      </Badge>
    );
  }
  if (norm === "ADDITIONAL") {
    return (
      <Badge variant="cyan" className={className}>
        Tambahan
      </Badge>
    );
  }
  return (
    <Badge variant="blue" className={className}>
      Individu
    </Badge>
  );
}

export function TaskPriorityBadge({
  priority,
  className,
}: {
  priority?: string | null;
  className?: string;
}) {
  const norm = (priority || "MEDIUM").toUpperCase();
  switch (norm) {
    case "URGENT":
      return (
        <Badge variant="red" dot className={className}>
          Urgent
        </Badge>
      );
    case "HIGH":
      return (
        <Badge variant="red" className={className}>
          Tinggi
        </Badge>
      );
    case "MEDIUM":
      return (
        <Badge variant="yellow" className={className}>
          Sedang
        </Badge>
      );
    case "LOW":
    default:
      return (
        <Badge variant="cyan" className={className}>
          Rendah
        </Badge>
      );
  }
}

export function TaskStatusBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const norm = (status || "TODO").toUpperCase();
  switch (norm) {
    case "COMPLETED":
      return (
        <Badge variant="green" dot className={className}>
          Selesai
        </Badge>
      );
    case "SUBMITTED":
      return (
        <Badge variant="blue" dot className={className}>
          Dikumpulkan
        </Badge>
      );
    case "IN_PROGRESS":
      return (
        <Badge variant="yellow" dot className={className}>
          Dikerjakan
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge variant="red" dot className={className}>
          Terlambat
        </Badge>
      );
    case "TODO":
    default:
      return (
        <Badge variant="default" dot className={className}>
          Belum Dimulai
        </Badge>
      );
  }
}

export function DeadlineBadge({
  deadline,
  className,
}: {
  deadline: Date | string;
  className?: string;
}) {
  const d = typeof deadline === "string" ? new Date(deadline) : deadline;
  const now = new Date();
  const diffMs = d.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    return (
      <Badge
        variant="outline"
        className={cn(
          "font-medium opacity-80 border-slate-600/60 text-[var(--text-muted)] light:text-slate-600 light:border-slate-300",
          className
        )}
      >
        Lewat Tenggat
      </Badge>
    );
  }

  if (diffHours <= 24 && diffHours >= 0) {
    return (
      <Badge variant="yellow" dot className={cn("font-medium", className)}>
        Hari ini
      </Badge>
    );
  }

  if (diffDays === 1) {
    return (
      <Badge variant="blue" dot className={cn("font-medium", className)}>
        Besok
      </Badge>
    );
  }

  return (
    <Badge variant="outline" className={cn("font-medium", className)}>
      Mendatang
    </Badge>
  );
}
