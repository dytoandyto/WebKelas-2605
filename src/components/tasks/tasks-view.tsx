"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Clock, Archive, Sparkles } from "lucide-react";
import { TaskStatus } from "@prisma/client";
import {
  TaskToolbar,
  TaskToolbarFilters,
} from "./task-toolbar";
import { TaskViewMode } from "./task-view-switcher";
import { TaskCardData } from "./task-card";
import { TaskTable } from "./task-table";
import { TaskCalendar } from "./task-calendar";
import { TaskList } from "./task-list";
import { TaskDrawer } from "./task-drawer";
import { useToast } from "@/components/ui/toast";
import { duplicateTaskAction } from "@/lib/actions/tasks";
import { cn, isTaskFlexibleOrNoDeadline } from "@/lib/utils";

export interface TaskItem extends TaskCardData {
  createdAt: string | Date;
  computedStatus?: string;
  notes?: string | null;
}

export interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface TasksViewProps {
  tasks: TaskItem[];
  subjects: SubjectItem[];
  currentTab?: "upcoming" | "history";
  upcomingCount?: number;
  historyCount?: number;
  isAdmin?: boolean;
}

export function TasksView({
  tasks: initialTasks,
  subjects,
  currentTab = "upcoming",
  upcomingCount = 0,
  historyCount = 0,
  isAdmin = false,
}: TasksViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const isHistory = currentTab === "history";

  // Local task list state
  const [taskList, setTaskList] = useState<TaskItem[]>(initialTasks);

  // Sync with initialTasks
  useEffect(() => {
    setTaskList(initialTasks);
  }, [initialTasks]);

  // Selected view: list | calendar | table (persisted in URL ?view=...)
  const urlView = searchParams.get("view") as TaskViewMode | null;
  const [currentView, setCurrentView] = useState<TaskViewMode>(
    urlView && ["list", "calendar", "table"].includes(urlView)
      ? urlView
      : "list"
  );

  // Filters
  const [filters, setFilters] = useState<TaskToolbarFilters>({
    search: "",
    subjectId: "ALL",
    deadlineFilter: "ALL",
  });

  // Selected task for drawer
  const [selectedTask, setSelectedTask] = useState<TaskItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Filter tasks in memory within the current scope (upcoming or history)
  const filteredTasks = useMemo(() => {
    const q = filters.search.toLowerCase().trim();
    const now = new Date().getTime();

    return taskList.filter((task) => {
      // 1. Search query
      if (q) {
        const matchesTitle = task.title.toLowerCase().includes(q);
        const matchesDesc = task.description?.toLowerCase().includes(q);
        const matchesSubject =
          task.subject?.name?.toLowerCase().includes(q) ||
          task.subject?.code?.toLowerCase().includes(q);

        if (!matchesTitle && !matchesDesc && !matchesSubject) {
          return false;
        }
      }

      // 2. Subject Filter
      if (filters.subjectId !== "ALL") {
        if (
          task.subject?.code !== filters.subjectId &&
          (task as any).subjectId !== filters.subjectId
        ) {
          return false;
        }
      }

      // 3. Deadline Filter (applicable for upcoming scope)
      if (!isHistory && filters.deadlineFilter !== "ALL") {
        const isFlexible = isTaskFlexibleOrNoDeadline(task);
        if (filters.deadlineFilter === "NO_DEADLINE") return isFlexible;
        if (isFlexible && filters.deadlineFilter === "DUE_SOON") return false;

        const taskDeadline = new Date(task.deadline).getTime();
        const diffMs = taskDeadline - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (filters.deadlineFilter === "UPCOMING" && (diffHours <= 48 || isFlexible)) return false;
        if (filters.deadlineFilter === "DUE_SOON" && (diffMs < 0 || diffHours > 48)) return false;
      }

      return true;
    });
  }, [taskList, filters, isHistory]);

  // Handle Tab Switch (Upcoming vs History)
  const handleTabChange = (newTab: "upcoming" | "history") => {
    if (newTab === currentTab) return;
    const params = new URLSearchParams(searchParams?.toString() || "");
    params.set("tab", newTab);
    // Reset deadline filter when switching tabs
    setFilters((prev) => ({ ...prev, deadlineFilter: "ALL" }));
    startTransition(() => {
      router.push(`?${params.toString()}`);
    });
  };

  // Open Drawer handler
  const handleTaskClick = (task: TaskCardData) => {
    const fullTask = taskList.find((t) => t.id === task.id) || (task as TaskItem);
    setSelectedTask(fullTask);
    setDrawerOpen(true);
  };

  // Duplicate task
  const handleDuplicateTask = async (task: TaskCardData) => {
    try {
      const res = await duplicateTaskAction(task.id);
      if (!res.success) throw new Error(res.error || "Gagal menduplikat tugas");
      toast({
        title: "Tugas Berhasil Diduplikat",
        description: "Salinan pengingat tugas telah ditambahkan ke sistem.",
        type: "success",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      toast({
        title: "Duplikasi Gagal",
        description: err.message,
        type: "error",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* ── 1. Scope Navigation Tabs (Upcoming vs History) ─────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border-color)]/70 pb-3">
        <div
          role="tablist"
          aria-label="Pilihan Kategori Tugas"
          className="inline-flex items-center p-1 rounded-2xl bg-[var(--surface-primary)] border border-[var(--border-color)] light:bg-slate-100 light:border-slate-200 select-none shrink-0"
        >
          <button
            type="button"
            role="tab"
            aria-selected={!isHistory}
            onClick={() => handleTabChange("upcoming")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer",
              !isHistory
                ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 light:text-slate-600 light:hover:text-slate-900"
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Tugas Mendatang</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-mono font-bold border",
                !isHistory
                  ? "bg-white/20 text-white border-white/30"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border-color)]"
              )}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={isHistory}
            onClick={() => handleTabChange("history")}
            className={cn(
              "flex items-center gap-2 px-3.5 sm:px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl transition-all duration-150 cursor-pointer",
              isHistory
                ? "bg-slate-700 text-white shadow-sm light:bg-slate-200 light:text-slate-900"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 light:text-slate-600 light:hover:text-slate-900"
            )}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Riwayat Tugas</span>
            <span
              className={cn(
                "px-2 py-0.5 rounded-full text-xs font-mono font-bold border",
                isHistory
                  ? "bg-white/20 text-white border-white/30 light:bg-slate-300 light:text-slate-800"
                  : "bg-[var(--surface-card)] text-[var(--text-muted)] border-[var(--border-color)]"
              )}
            >
              {historyCount}
            </span>
          </button>
        </div>

        <div className="text-xs text-[var(--text-muted)] font-mono flex items-center gap-1.5 self-start sm:self-center">
          <span>Status:</span>
          <span className="font-bold text-[var(--text-primary)]">
            {isHistory ? "Arsip Tugas" : "Tugas yang Perlu Diingat"}
          </span>
        </div>
      </div>

      {/* ── 2. Task Toolbar ───────────────────────────────────────────── */}
      <TaskToolbar
        filters={filters}
        onFilterChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
        subjects={subjects}
        currentView={currentView}
        onViewChange={setCurrentView}
        isHistory={isHistory}
        onNewTask={
          isAdmin ? () => router.push("/admin/tasks") : undefined
        }
      />

      {/* ── 3. Views (List, Table, Calendar) ──────────────────────────── */}
      {currentView === "table" && (
        <TaskTable
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onDuplicateTask={isAdmin ? handleDuplicateTask : undefined}
        />
      )}

      {currentView === "calendar" && (
        <TaskCalendar
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
        />
      )}

      {currentView === "list" && (
        <TaskList
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          isHistory={isHistory}
        />
      )}

      {/* ── 4. Task Drawer Detail Sheet ───────────────────────────────── */}
      <TaskDrawer
        task={selectedTask}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onDuplicate={isAdmin ? handleDuplicateTask : undefined}
        isAdmin={isAdmin}
      />
    </div>
  );
}
