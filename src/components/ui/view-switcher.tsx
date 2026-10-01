"use client";

import * as React from "react";
import { Table2, Columns3, CalendarDays, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type ViewMode = "table" | "board" | "calendar" | "list";

export interface ViewOption<T = string> {
  id: T;
  label: string;
  icon?: React.ReactNode;
}

export interface ViewSwitcherProps<T = ViewMode> {
  currentView: T;
  onViewChange: (view: T) => void;
  views?: ViewOption<T>[];
  className?: string;
  size?: "sm" | "md";
}

export function ViewSwitcher<T extends string = ViewMode>({
  currentView,
  onViewChange,
  views,
  className,
  size = "md",
}: ViewSwitcherProps<T>) {
  const defaultViews: ViewOption<any>[] = [
    { id: "board", label: "Board", icon: <Columns3 className="w-3.5 h-3.5" /> },
    { id: "table", label: "Tabel", icon: <Table2 className="w-3.5 h-3.5" /> },
    {
      id: "calendar",
      label: "Kalender",
      icon: <CalendarDays className="w-3.5 h-3.5" />,
    },
    { id: "list", label: "List", icon: <ListIcon className="w-3.5 h-3.5" /> },
  ];

  const activeViews = views || (defaultViews as ViewOption<T>[]);

  return (
    <div
      role="tablist"
      aria-label="Pilihan Tampilan"
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100 light:border-slate-200 select-none",
        className
      )}
    >
      {activeViews.map((v) => {
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(v.id)}
            className={cn(
              "flex items-center gap-1.5 font-medium transition-all duration-150 cursor-pointer rounded-lg",
              size === "sm"
                ? "px-2.5 py-1 text-xs"
                : "px-3 py-1.5 text-xs sm:text-sm",
              isActive
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.35)] font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 light:text-slate-600 light:hover:text-slate-900 light:hover:bg-slate-200/60"
            )}
          >
            {v.icon}
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}
