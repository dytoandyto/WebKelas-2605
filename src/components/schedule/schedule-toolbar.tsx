"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar, Grid, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScheduleToolbarProps {
  viewMode: "grid" | "list";
  onViewModeChange: (mode: "grid" | "list") => void;
  selectedDay?: string;
  onSelectDay?: (day: string) => void;
  onTodayClick?: () => void;
  classCode?: string;
  academicYear?: string;
  className?: string;
}

export const DAYS_LIST = [
  { key: "ALL", label: "Semua", short: "ALL" },
  { key: "MONDAY", label: "Senin", short: "MON" },
  { key: "TUESDAY", label: "Selasa", short: "TUE" },
  { key: "WEDNESDAY", label: "Rabu", short: "WED" },
  { key: "THURSDAY", label: "Kamis", short: "THU" },
  { key: "FRIDAY", label: "Jum'at", short: "FRI" },
  { key: "SATURDAY", label: "Sabtu", short: "SAT" },
];

export function ScheduleToolbar({
  viewMode,
  onViewModeChange,
  selectedDay = "ALL",
  onSelectDay,
  onTodayClick,
  classCode = "JS1SI-26-REG-05",
  academicYear = "Semester Ganjil 2026/2027",
  className,
}: ScheduleToolbarProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 sm:p-4 rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] shadow-[var(--shadow-sm)] mb-6",
        className
      )}
    >
      {/* Left: Class Identity & Quick Today action */}
      <div className="flex items-center gap-2.5 flex-wrap">
        <span className="px-3 py-1 rounded-xl text-xs font-mono font-bold bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 light:bg-blue-50 light:border-blue-200 light:text-blue-700">
          {classCode}
        </span>
        <span className="text-xs text-[var(--text-secondary)] hidden md:inline">
          {academicYear}
        </span>
        {onTodayClick && (
          <Button
            variant="outline"
            size="sm"
            onClick={onTodayClick}
            className="rounded-lg text-xs"
            leftIcon={<Calendar className="w-3.5 h-3.5" />}
          >
            Hari Ini
          </Button>
        )}
      </div>

      {/* Center / Right: Day selector & View Switcher */}
      <div className="flex items-center gap-2 justify-between sm:justify-end flex-wrap">
        {onSelectDay && (
          <div className="flex items-center gap-1 overflow-x-auto py-0.5">
            {DAYS_LIST.map((d) => (
              <button
                key={d.key}
                type="button"
                onClick={() => onSelectDay(d.key)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer",
                  selectedDay === d.key
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 font-semibold light:bg-blue-100 light:text-blue-700"
                    : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-white/5 light:hover:bg-slate-100"
                )}
              >
                <span className="sm:hidden">{d.short}</span>
                <span className="hidden sm:inline">{d.label}</span>
              </button>
            ))}
          </div>
        )}

        {/* View Toggle */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100 shrink-0">
          <button
            type="button"
            onClick={() => onViewModeChange("grid")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] light:text-slate-600"
            )}
          >
            <Grid className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Timetable</span>
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1 text-xs font-medium rounded-lg transition-all cursor-pointer",
              viewMode === "list"
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] light:text-slate-600"
            )}
          >
            <List className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Daftar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
