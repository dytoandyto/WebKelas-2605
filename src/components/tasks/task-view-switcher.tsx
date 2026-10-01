"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Columns3, Table2, CalendarDays, List as ListIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type TaskViewMode = "board" | "table" | "calendar" | "list";

export interface TaskViewSwitcherProps {
  currentView: TaskViewMode;
  onViewChange?: (view: TaskViewMode) => void;
  className?: string;
}

export function TaskViewSwitcher({
  currentView,
  onViewChange,
  className,
}: TaskViewSwitcherProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleSelect = (view: TaskViewMode) => {
    if (onViewChange) {
      onViewChange(view);
    }
    // Sync with URL query parameter ?view=...
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("view", view);
    router.replace(`?${params.toString()}`, { scroll: false });
  };

  const views: { id: TaskViewMode; label: string; icon: React.ReactNode }[] = [
    { id: "list", label: "List", icon: <ListIcon className="w-3.5 h-3.5" /> },
    {
      id: "calendar",
      label: "Kalender",
      icon: <CalendarDays className="w-3.5 h-3.5" />,
    },
    { id: "table", label: "Tabel", icon: <Table2 className="w-3.5 h-3.5" /> },
    { id: "board", label: "Board", icon: <Columns3 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div
      role="tablist"
      aria-label="Pilihan Tampilan Tugas"
      className={cn(
        "inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100 light:border-slate-200 select-none shrink-0",
        className
      )}
    >
      {views.map((v) => {
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => handleSelect(v.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-medium rounded-lg transition-all duration-150 cursor-pointer",
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
