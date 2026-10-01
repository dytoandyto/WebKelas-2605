"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from "lucide-react";
import { TaskCardData, TaskCard } from "./task-card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TaskCalendarProps {
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  className?: string;
}

export function TaskCalendar({
  tasks,
  onTaskClick,
  className,
}: TaskCalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(new Date());
  const [calendarMode, setCalendarMode] = React.useState<"month" | "week">("month");

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

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

  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

  const handlePrev = () => {
    if (calendarMode === "month") {
      setCurrentDate(new Date(year, month - 1, 1));
    } else {
      const nextD = new Date(currentDate);
      nextD.setDate(nextD.getDate() - 7);
      setCurrentDate(nextD);
    }
  };

  const handleNext = () => {
    if (calendarMode === "month") {
      setCurrentDate(new Date(year, month + 1, 1));
    } else {
      const nextD = new Date(currentDate);
      nextD.setDate(nextD.getDate() + 7);
      setCurrentDate(nextD);
    }
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Generate calendar days for month view
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const calendarDays = React.useMemo(() => {
    const days: { date: Date; isCurrentMonth: boolean }[] = [];

    // Prev month padding
    const prevMonthDays = new Date(year, month, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        date: new Date(year, month - 1, prevMonthDays - i),
        isCurrentMonth: false,
      });
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        date: new Date(year, month, i),
        isCurrentMonth: true,
      });
    }

    // Next month padding to fill complete grid of 35 or 42
    const totalSlots = Math.ceil(days.length / 7) * 7;
    const remaining = totalSlots - days.length;
    for (let i = 1; i <= remaining; i++) {
      days.push({
        date: new Date(year, month + 1, i),
        isCurrentMonth: false,
      });
    }

    return days;
  }, [year, month, firstDayIndex, daysInMonth]);

  // Map tasks to dates (YYYY-MM-DD)
  const tasksByDate = React.useMemo(() => {
    const map = new Map<string, TaskCardData[]>();
    tasks.forEach((task) => {
      const d = new Date(task.deadline);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(task);
    });
    return map;
  }, [tasks]);

  const todayStr = React.useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  }, []);

  return (
    <div
      className={cn(
        "rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] p-4 sm:p-6 shadow-[var(--shadow-sm)] space-y-4",
        className
      )}
    >
      {/* Calendar Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
            {monthNames[month]} {year}
          </h3>
          <Button
            variant="outline"
            size="sm"
            onClick={handleToday}
            className="text-xs h-7 px-2.5 rounded-lg ml-2"
          >
            Hari Ini
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-between sm:justify-end">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={handlePrev}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-cyan-400/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] light:border-slate-300 transition-colors"
              aria-label="Sebelumnya"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNext}
              className="p-1.5 rounded-lg border border-[var(--border-color)] hover:border-cyan-400/40 text-[var(--text-secondary)] hover:text-[var(--text-primary)] light:border-slate-300 transition-colors"
              aria-label="Berikutnya"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Weekday Labels */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-xs font-semibold uppercase text-[var(--text-muted)] font-mono">
        {dayNames.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      {/* Day Cells Grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {calendarDays.map((item, idx) => {
          const dateStr = `${item.date.getFullYear()}-${String(item.date.getMonth() + 1).padStart(2, "0")}-${String(item.date.getDate()).padStart(2, "0")}`;
          const isToday = dateStr === todayStr;
          const dayTasks = tasksByDate.get(dateStr) || [];

          return (
            <div
              key={idx}
              className={cn(
                "min-h-[90px] sm:min-h-[110px] p-1.5 sm:p-2 rounded-xl border flex flex-col transition-colors",
                item.isCurrentMonth
                  ? "bg-[var(--surface-primary)] border-[var(--border-color)]/70 light:bg-slate-50/70"
                  : "bg-[var(--surface-primary)]/30 border-[var(--border-color)]/30 opacity-40 light:bg-slate-100/40",
                isToday &&
                  "ring-2 ring-cyan-400/60 border-cyan-400 light:ring-blue-500/60"
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={cn(
                    "text-xs font-mono font-semibold",
                    isToday
                      ? "w-6 h-6 rounded-full bg-cyan-400 text-slate-950 font-bold flex items-center justify-center light:bg-blue-600 light:text-white"
                      : "text-[var(--text-secondary)]"
                  )}
                >
                  {item.date.getDate()}
                </span>
                {dayTasks.length > 0 && (
                  <span className="text-[10px] font-mono text-cyan-400 light:text-blue-600 font-bold">
                    {dayTasks.length}
                  </span>
                )}
              </div>

              {/* Tasks Pills inside day */}
              <div className="flex-1 space-y-1 overflow-y-auto max-h-[70px] scrollbar-none">
                {dayTasks.slice(0, 3).map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    variant="calendar"
                    onClick={() => onTaskClick?.(task)}
                  />
                ))}
                {dayTasks.length > 3 && (
                  <div
                    onClick={() => onTaskClick?.(dayTasks[0])}
                    className="text-[10px] text-cyan-400 font-medium text-center cursor-pointer hover:underline"
                  >
                    +{dayTasks.length - 3} lainnya
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
