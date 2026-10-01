"use client";

import * as React from "react";
import { Search, X, Filter, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

export interface FilterOption {
  label: string;
  value: string;
}

export interface FilterGroup {
  id: string;
  label: string;
  value: string;
  options: FilterOption[];
  onChange: (value: string) => void;
}

export interface ActiveChip {
  id: string;
  label: string;
  valueLabel: string;
  onRemove: () => void;
}

export interface FilterBarProps {
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  searchPlaceholder?: string;
  filters?: FilterGroup[];
  activeChips?: ActiveChip[];
  onClearAll?: () => void;
  primaryAction?: React.ReactNode;
  className?: string;
}

export function FilterBar({
  searchQuery = "",
  onSearchChange,
  searchPlaceholder = "Search records...",
  filters = [],
  activeChips = [],
  onClearAll,
  primaryAction,
  className,
}: FilterBarProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Top Controls Row */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search & Select Group */}
        <div className="flex flex-1 items-center gap-2.5 flex-wrap">
          {/* Search Box */}
          {onSearchChange && (
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <Search
                size={14}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] pointer-events-none"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-8 py-2 rounded-xl bg-[var(--surface-primary)] light:bg-white border border-[var(--border-color)] light:border-slate-300 text-xs sm:text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:border-cyan-400 light:focus:border-blue-500 focus:ring-2 focus:ring-cyan-500/20 transition-all shadow-xs"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded cursor-pointer"
                  title="Clear search"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          )}

          {/* Filter Dropdowns */}
          {filters.map((group) => (
            <div key={group.id} className="relative shrink-0">
              <select
                value={group.value}
                onChange={(e) => group.onChange(e.target.value)}
                className="appearance-none px-3.5 py-2 pr-8 rounded-xl bg-[var(--surface-primary)] light:bg-white border border-[var(--border-color)] light:border-slate-300 text-xs text-[var(--text-primary)] focus:outline-none focus:border-cyan-400 light:focus:border-blue-500 cursor-pointer shadow-xs"
              >
                {group.options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {group.label}: {opt.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--text-muted)]">
                ▾
              </div>
            </div>
          ))}
        </div>

        {/* Primary Action Button */}
        {primaryAction && (
          <div className="shrink-0 flex items-center">{primaryAction}</div>
        )}
      </div>

      {/* Active Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap pt-1 text-xs">
          <span className="text-[var(--text-muted)] text-[11px] font-medium flex items-center gap-1">
            <Filter size={11} />
            <span>Active filters:</span>
          </span>

          {activeChips.map((chip) => (
            <span
              key={chip.id}
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 light:bg-blue-50 light:border-blue-200 light:text-blue-700 font-medium"
            >
              <span>
                {chip.label}: <strong>{chip.valueLabel}</strong>
              </span>
              <button
                type="button"
                onClick={chip.onRemove}
                className="hover:text-white light:hover:text-blue-900 rounded-full cursor-pointer"
                title={`Remove ${chip.label}`}
              >
                <X size={11} />
              </button>
            </span>
          ))}

          {onClearAll && (
            <button
              type="button"
              onClick={onClearAll}
              className="inline-flex items-center gap-1 text-[11px] text-[var(--text-muted)] hover:text-cyan-400 light:hover:text-blue-600 font-medium ml-1 transition-colors cursor-pointer"
            >
              <RotateCcw size={10} />
              <span>Clear all</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
