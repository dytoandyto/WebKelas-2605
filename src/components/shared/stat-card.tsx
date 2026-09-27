import React from "react";

export interface StatCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  hint?: string;
  active?: boolean;
  color?: "cyan" | "blue" | "amber" | "rose" | "emerald" | "purple" | "default";
  onClick?: () => void;
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  active = false,
  color = "default",
  onClick,
  className = "",
}: StatCardProps) {
  const colorStyles = {
    default: {
      border: "border-[var(--border-color)]",
      activeBorder: "border-[var(--primary)] ring-2 ring-[var(--primary)]/20",
      iconBg: "bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-400",
      valueColor: "text-[var(--text-primary)]",
    },
    cyan: {
      border: "border-cyan-500/20",
      activeBorder: "border-cyan-500 ring-2 ring-cyan-500/20 bg-cyan-500/5",
      iconBg: "bg-cyan-500/10 text-cyan-400",
      valueColor: "text-cyan-400 dark:text-cyan-300",
    },
    blue: {
      border: "border-blue-500/20",
      activeBorder: "border-blue-500 ring-2 ring-blue-500/20 bg-blue-500/5",
      iconBg: "bg-blue-500/10 text-blue-500 dark:text-blue-400",
      valueColor: "text-blue-600 dark:text-blue-400",
    },
    amber: {
      border: "border-amber-500/20",
      activeBorder: "border-amber-500 ring-2 ring-amber-500/20 bg-amber-500/5",
      iconBg: "bg-amber-500/10 text-amber-500 dark:text-amber-400",
      valueColor: "text-amber-600 dark:text-amber-400",
    },
    rose: {
      border: "border-rose-500/20",
      activeBorder: "border-rose-500 ring-2 ring-rose-500/20 bg-rose-500/5",
      iconBg: "bg-rose-500/10 text-rose-500 dark:text-rose-400",
      valueColor: "text-rose-600 dark:text-rose-400",
    },
    emerald: {
      border: "border-emerald-500/20",
      activeBorder: "border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-500/5",
      iconBg: "bg-emerald-500/10 text-emerald-500 dark:text-emerald-400",
      valueColor: "text-emerald-600 dark:text-emerald-400",
    },
    purple: {
      border: "border-purple-500/20",
      activeBorder: "border-purple-500 ring-2 ring-purple-500/20 bg-purple-500/5",
      iconBg: "bg-purple-500/10 text-purple-500 dark:text-purple-400",
      valueColor: "text-purple-600 dark:text-purple-400",
    },
  }[color];

  const clickableClasses = onClick
    ? "cursor-pointer hover:border-[var(--primary)] hover:-translate-y-0.5 transition-all select-none"
    : "";

  return (
    <div
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={(e) => {
        if (onClick && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onClick();
        }
      }}
      className={`card p-4 sm:p-5 flex items-start justify-between gap-3 ${
        active ? colorStyles.activeBorder : colorStyles.border
      } ${clickableClasses} ${className}`}
    >
      <div className="space-y-1">
        <p className="text-xs font-mono uppercase tracking-wider text-[var(--text-muted)] font-medium">
          {label}
        </p>
        <div className={`text-2xl sm:text-3xl font-black font-display tracking-tight ${colorStyles.valueColor}`}>
          {value}
        </div>
        {hint && <p className="text-[11px] text-[var(--text-secondary)]">{hint}</p>}
      </div>

      {icon && (
        <div className={`p-2.5 rounded-xl shrink-0 ${colorStyles.iconBg}`}>
          {icon}
        </div>
      )}
    </div>
  );
}
