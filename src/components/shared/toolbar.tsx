import React from "react";
import { Table2, Columns3, CalendarDays, List as ListIcon, Search, X } from "lucide-react";

export type ViewMode = "table" | "board" | "calendar" | "list";

export interface ViewSwitcherProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  views?: {
    id: ViewMode;
    label: string;
    icon: React.ReactNode;
  }[];
  className?: string;
}

export function ViewSwitcher({
  currentView,
  onViewChange,
  views,
  className = "",
}: ViewSwitcherProps) {
  const defaultViews = [
    { id: "board" as ViewMode, label: "Board", icon: <Columns3 size={15} /> },
    { id: "list" as ViewMode, label: "List", icon: <ListIcon size={15} /> },
    { id: "calendar" as ViewMode, label: "Kalender", icon: <CalendarDays size={15} /> },
    { id: "table" as ViewMode, label: "Tabel", icon: <Table2 size={15} /> },
  ];

  const activeViews = views || defaultViews;

  return (
    <div
      role="tablist"
      aria-label="Pilihan Tampilan"
      className={`inline-flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)]/60 ${className}`}
    >
      {activeViews.map((v) => {
        const isActive = currentView === v.id;
        return (
          <button
            key={v.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onViewChange(v.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              isActive
                ? "bg-[var(--primary)] text-white shadow-sm font-semibold"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]/50"
            }`}
          >
            {v.icon}
            <span className="hidden sm:inline">{v.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export interface ToolbarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
  viewSwitcher?: React.ReactNode;
  className?: string;
}

export function Toolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder = "Cari...",
  filters,
  actions,
  viewSwitcher,
  className = "",
}: ToolbarProps) {
  return (
    <div
      className={`flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm ${className}`}
    >
      <div className="flex flex-1 flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {onSearchChange && (
          <div className="relative min-w-[220px] max-w-sm w-full">
            <Search
              size={15}
              className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
            />
            <input
              type="text"
              value={searchQuery || ""}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={searchPlaceholder}
              className="input w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl"
            />
            {searchQuery && (
              <button
                onClick={() => onSearchChange("")}
                aria-label="Bersihkan pencarian"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X size={13} />
              </button>
            )}
          </div>
        )}

        {filters && <div className="flex items-center gap-2 flex-wrap">{filters}</div>}
      </div>

      <div className="flex items-center gap-2.5 justify-between lg:justify-end shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-[var(--border-color)]/50">
        {viewSwitcher}
        {actions}
      </div>
    </div>
  );
}

export function FilterBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex items-center gap-2 flex-wrap py-2 ${className}`}>
      {children}
    </div>
  );
}
