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
          "bg-slate-100 text-slate-800 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700",
        blue:
          "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-900/60",
        cyan:
          "bg-sky-50 text-sky-700 border border-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:border-sky-900/60",
        green:
          "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-900/60",
        yellow:
          "bg-amber-50 text-amber-800 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-900/60",
        red:
          "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-900/60",
        purple:
          "bg-purple-50 text-purple-700 border border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-900/60",
        outline:
          "bg-transparent text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700",
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
        <Badge
          variant="default"
          dot
          className={cn("text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 font-medium", className)}
        >
          Sudah Lewat
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
  isNoDeadline = false,
  className,
}: {
  deadline: Date | string;
  isNoDeadline?: boolean;
  className?: string;
}) {
  if (isNoDeadline) {
    return (
      <Badge
        variant="cyan"
        dot
        className={cn("font-medium", className)}
      >
        Tanpa Tenggat
      </Badge>
    );
  }

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
          "font-medium opacity-80 border-slate-300 dark:border-slate-600/60 text-[var(--text-muted)]",
          className
        )}
      >
        Sudah Lewat
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
