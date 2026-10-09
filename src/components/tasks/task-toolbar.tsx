"use client";

import * as React from "react";
import { Search, Plus, Filter, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { TaskViewSwitcher, TaskViewMode } from "./task-view-switcher";
import { cn } from "@/lib/utils";

export interface TaskToolbarFilters {
  search: string;
  subjectId: string;
  deadlineFilter: "ALL" | "UPCOMING" | "DUE_SOON" | "PAST_DEADLINE" | "NO_DEADLINE";
}

export interface TaskToolbarProps {
  filters: TaskToolbarFilters;
  onFilterChange: (filters: Partial<TaskToolbarFilters>) => void;
  subjects: { id: string; code: string; name: string }[];
  currentView: TaskViewMode;
  onViewChange?: (view: TaskViewMode) => void;
  onNewTask?: () => void;
  isHistory?: boolean;
  className?: string;
}

export function TaskToolbar({
  filters,
  onFilterChange,
  subjects,
  currentView,
  onViewChange,
  onNewTask,
  isHistory = false,
  className,
}: TaskToolbarProps) {
  const [showFilters, setShowFilters] = React.useState(false);

  const hasActiveFilters =
    filters.subjectId !== "ALL" ||
    filters.deadlineFilter !== "ALL" ||
    filters.search !== "";

  const clearFilters = () => {
    onFilterChange({
      search: "",
      subjectId: "ALL",
      deadlineFilter: "ALL",
    });
  };

  return (
    <div
      className={cn(
        "p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] space-y-3 mb-6",
        className
      )}
    >
      {/* Top Row: Search, View Switcher, New Task CTA */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="flex-1 max-w-md">
          <Input
            placeholder="Cari tugas berdasarkan judul, mata kuliah, deskripsi..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            leftIcon={<Search className="w-4 h-4" />}
            rightIcon={
              filters.search ? (
                <button
                  type="button"
                  onClick={() => onFilterChange({ search: "" })}
                  className="p-1 hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : undefined
            }
          />
        </div>

        <div className="flex items-center gap-2.5 justify-between md:justify-end flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "md:hidden",
              hasActiveFilters && "border-cyan-400 text-cyan-300"
            )}
            leftIcon={<Filter className="w-3.5 h-3.5" />}
          >
            Filter {hasActiveFilters && "•"}
          </Button>

          <TaskViewSwitcher
            currentView={currentView}
            onViewChange={onViewChange}
          />

          {onNewTask && (
            <Button
              variant="primary"
              size="sm"
              onClick={onNewTask}
              className="rounded-xl shadow-[0_0_15px_rgba(6,182,212,0.3)] font-semibold"
              leftIcon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              <span className="hidden sm:inline">Tambah Tugas</span>
              <span className="sm:hidden">Tugas Baru</span>
            </Button>
          )}
        </div>
      </div>

      {/* Filter Row: Subject & Deadline Filter */}
      <div
        className={cn(
          "grid gap-2.5 pt-3 border-t border-[var(--border-color)]/70",
          isHistory ? "grid-cols-1 sm:grid-cols-2" : "grid-cols-1 sm:grid-cols-2",
          !showFilters && "hidden md:grid"
        )}
      >
        {/* Subject Filter */}
        <div className="flex items-center gap-2">
          <Select
            value={filters.subjectId}
            onChange={(e) => onFilterChange({ subjectId: e.target.value })}
            className="flex-1"
          >
            <option value="ALL">Semua Mata Kuliah</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.code}>
                {s.code} - {s.name}
              </option>
            ))}
          </Select>

          {isHistory && hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              title="Reset Filter"
              className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/40 transition-colors shrink-0 light:bg-slate-100 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Deadline Filter (Only for Upcoming Tasks) */}
        {!isHistory && (
          <div className="flex items-center gap-2">
            <Select
              value={filters.deadlineFilter}
              onChange={(e) =>
                onFilterChange({
                  deadlineFilter: e.target.value as TaskToolbarFilters["deadlineFilter"],
                })
              }
              className="flex-1"
            >
              <option value="ALL">Semua Tenggat Mendatang</option>
              <option value="DUE_SOON">Hari Ini / Besok (Mendesak)</option>
              <option value="UPCOMING">Mendatang Lainnya</option>
              <option value="NO_DEADLINE">Tanpa Tenggat / Fleksibel</option>
            </Select>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearFilters}
                title="Reset Filter"
                className="p-2.5 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-[var(--text-muted)] hover:text-red-400 hover:border-red-500/40 transition-colors shrink-0 light:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
