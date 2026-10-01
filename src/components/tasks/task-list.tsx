"use client";

import * as React from "react";
import { CheckSquare } from "lucide-react";
import { TaskCardData, TaskCard } from "./task-card";
import { EmptyState } from "@/components/ui/empty-state";
import { cn } from "@/lib/utils";

export interface TaskListProps {
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  className?: string;
}

export function TaskList({ tasks, onTaskClick, className }: TaskListProps) {
  const groups = React.useMemo(() => {
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
      overdue: [] as TaskCardData[],
      today: [] as TaskCardData[],
      thisWeek: [] as TaskCardData[],
      nextWeek: [] as TaskCardData[],
      later: [] as TaskCardData[],
      completed: [] as TaskCardData[],
    };

    tasks.forEach((task) => {
      if (task.status === "COMPLETED") {
        result.completed.push(task);
        return;
      }

      const d = new Date(task.deadline);
      if (d < startOfToday) {
        result.overdue.push(task);
      } else if (d < endOfToday) {
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
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<CheckSquare className="w-6 h-6 text-cyan-400" />}
        title="Tidak Ada Tugas Akademik"
        description="Tidak ada penugasan atau tugas yang cocok dengan filter yang dipilih."
        className={className}
      />
    );
  }

  const sections: { key: keyof typeof groups; title: string; badgeColor: string }[] = [
    { key: "overdue", title: "Terlambat (Overdue)", badgeColor: "bg-red-500/15 text-red-300 border-red-500/30 light:bg-red-50 light:text-red-700 light:border-red-200" },
    { key: "today", title: "Hari Ini (Today)", badgeColor: "bg-cyan-500/15 text-cyan-300 border-cyan-500/30 light:bg-blue-50 light:text-blue-700 light:border-blue-200" },
    { key: "thisWeek", title: "Minggu Ini (This Week)", badgeColor: "bg-blue-500/15 text-blue-300 border-blue-500/30 light:bg-sky-50 light:text-sky-700 light:border-sky-200" },
    { key: "nextWeek", title: "Minggu Depan (Next Week)", badgeColor: "bg-indigo-500/15 text-indigo-300 border-indigo-500/30 light:bg-indigo-50 light:text-indigo-700 light:border-indigo-200" },
    { key: "later", title: "Mendatang / Nanti (Later)", badgeColor: "bg-slate-700/40 text-slate-300 border-slate-700/60 light:bg-slate-100 light:text-slate-700 light:border-slate-200" },
    { key: "completed", title: "Selesai (Completed)", badgeColor: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30 light:bg-emerald-50 light:text-emerald-700 light:border-emerald-200" },
  ];

  return (
    <div className={cn("space-y-6", className)}>
      {sections.map((sec) => {
        const items = groups[sec.key];
        if (items.length === 0) return null;

        return (
          <div key={sec.key} className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
              <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                {sec.title}
              </h3>
              <span className={cn("px-2 py-0.5 rounded-full text-xs font-mono font-bold border", sec.badgeColor)}>
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
