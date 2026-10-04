"use client";

import * as React from "react";
import { CheckSquare, Archive, Calendar } from "lucide-react";
import { TaskCardData, TaskCard } from "./task-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface TaskListProps {
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  isHistory?: boolean;
  className?: string;
}

export function TaskList({
  tasks,
  onTaskClick,
  isHistory = false,
  className,
}: TaskListProps) {
  // ── 1. History View: Grouped chronologically by Month & Year ──────────
  const monthGroups = React.useMemo(() => {
    if (!isHistory) return null;

    const monthNames = [
      "Januari",
      "Februari",
      "Maret",
      "April",
      "Mei",
      "Juni",
      "Juli",
      "Agustus",
      "September",
      "Oktober",
      "November",
      "Desember",
    ];

    const map = new Map<string, TaskCardData[]>();
    tasks.forEach((task) => {
      const d = new Date(task.deadline);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear()}`;
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(task);
    });

    return Array.from(map.entries()).map(([label, items]) => ({
      label,
      items,
    }));
  }, [tasks, isHistory]);

  // ── 2. Upcoming View: Grouped by Proximity (Today, This Week, Next Week, Later) ──
  const upcomingGroups = React.useMemo(() => {
    if (isHistory) return null;

    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const endOfToday = new Date(startOfToday);
    endOfToday.setDate(endOfToday.getDate() + 1);

    const endOfWeek = new Date(startOfToday);
    const dayOfWeek = startOfToday.getDay(); // 0 is Sunday
    const daysUntilEndOfWeek = (7 - dayOfWeek) % 7;
    endOfWeek.setDate(endOfWeek.getDate() + daysUntilEndOfWeek + 1);

    const endOfNextWeek = new Date(endOfWeek);
    endOfNextWeek.setDate(endOfNextWeek.getDate() + 7);

    const result = {
      today: [] as TaskCardData[],
      thisWeek: [] as TaskCardData[],
      nextWeek: [] as TaskCardData[],
      later: [] as TaskCardData[],
    };

    tasks.forEach((task) => {
      const d = new Date(task.deadline);
      if (d < endOfToday) {
        result.today.push(task);
      } else if (d < endOfWeek) {
        result.thisWeek.push(task);
      } else if (d < endOfNextWeek) {
        result.nextWeek.push(task);
      } else {
        result.later.push(task);
      }
    });

    return result;
  }, [tasks, isHistory]);

  // ── 3. Empty States ──────────────────────────────────────────────────
  if (tasks.length === 0) {
    if (isHistory) {
      return (
        <EmptyState
          icon={<Archive className="w-6 h-6 text-slate-400" />}
          title="Belum Ada Riwayat Tugas"
          description="Tugas yang telah melewati tenggat waktu akan otomatis tersimpan dalam arsip akademik ini."
          className={className}
        />
      );
    }

    return (
      <EmptyState
        icon={<CheckSquare className="w-6 h-6 text-cyan-400" />}
        title="Tidak Ada Tugas Mendatang"
        description="Tidak ada penugasan atau tenggat waktu yang aktif saat ini."
        className={className}
      />
    );
  }

  // ── 4. Render History Section (Visually Secondary) ────────────────────
  if (isHistory && monthGroups) {
    return (
      <div className={cn("space-y-8", className)}>
        <div className="p-3.5 rounded-xl bg-slate-800/40 border border-slate-700/60 light:bg-slate-100 light:border-slate-200 text-xs text-[var(--text-secondary)] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <span>Arsip akademik tugas perkuliahan yang telah melewati batas tenggat pengumpulan.</span>
          <span className="font-mono font-bold text-xs text-[var(--text-muted)] shrink-0">
            {tasks.length} tugas terarsip
          </span>
        </div>

        {monthGroups.map((group) => (
          <div key={group.label} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-500" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] font-mono">
                {group.label}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-slate-800/60 text-slate-300 border border-slate-700 light:bg-slate-200 light:text-slate-700 light:border-slate-300">
                {group.items.length}
              </span>
            </div>

            <div className="space-y-2.5 opacity-90">
              {group.items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant="list"
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  // ── 5. Render Upcoming Section ────────────────────────────────────────
  const sections: {
    key: keyof NonNullable<typeof upcomingGroups>;
    title: string;
    badgeColor: string;
  }[] = [
    {
      key: "today",
      title: "Hari Ini (Due Today)",
      badgeColor:
        "bg-amber-500/15 text-amber-300 border-amber-500/30 light:bg-amber-50 light:text-amber-800 light:border-amber-200",
    },
    {
      key: "thisWeek",
      title: "Minggu Ini (This Week)",
      badgeColor:
        "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200",
    },
    {
      key: "nextWeek",
      title: "Minggu Depan (Next Week)",
      badgeColor:
        "bg-blue-500/15 text-blue-300 border-blue-500/30 light:bg-sky-50 light:text-sky-700 light:border-sky-200",
    },
    {
      key: "later",
      title: "Mendatang / Nanti (Later)",
      badgeColor:
        "bg-slate-700/40 text-slate-300 border-slate-700/60 light:bg-slate-100 light:text-slate-700 light:border-slate-200",
    },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {sections.map((sec) => {
        const items = upcomingGroups ? upcomingGroups[sec.key] : [];
        if (items.length === 0) return null;

        return (
          <div key={sec.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                {sec.title}
              </h3>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-mono font-bold border",
                  sec.badgeColor
                )}
              >
                {items.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {items.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  variant="list"
                  onClick={() => onTaskClick?.(task)}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
