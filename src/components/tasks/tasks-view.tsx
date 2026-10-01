"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import {
  TaskToolbar,
  TaskToolbarFilters,
} from "./task-toolbar";
import { TaskViewMode } from "./task-view-switcher";
import { TaskCardData } from "./task-card";
import { TaskKanban } from "./task-kanban";
import { TaskTable } from "./task-table";
import { TaskCalendar } from "./task-calendar";
import { TaskList } from "./task-list";
import { TaskDrawer } from "./task-drawer";
import { useToast } from "@/components/ui/toast";
import {
  updateTaskStatusAction,
  duplicateTaskAction,
} from "@/lib/actions/tasks";

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
  isAdmin?: boolean;
}

export function TasksView({
  tasks: initialTasks,
  subjects,
  isAdmin = false,
}: TasksViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  // Local task list state
  const [taskList, setTaskList] = useState<TaskItem[]>(initialTasks);

  // Sync with initialTasks
  useEffect(() => {
    setTaskList(initialTasks);
  }, [initialTasks]);

  // Selected view: list | calendar | table | board (persisted in URL ?view=...)
  const urlView = searchParams.get("view") as TaskViewMode | null;
  const [currentView, setCurrentView] = useState<TaskViewMode>(
    urlView && ["list", "calendar", "table", "board"].includes(urlView)
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

  // Filter tasks
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

      // 3. Deadline Filter
      if (filters.deadlineFilter !== "ALL") {
        const taskDeadline = new Date(task.deadline).getTime();
        const diffMs = taskDeadline - now;
        const diffHours = diffMs / (1000 * 60 * 60);

        if (filters.deadlineFilter === "UPCOMING" && diffHours <= 48) return false;
        if (filters.deadlineFilter === "DUE_SOON" && (diffMs < 0 || diffHours > 48)) return false;
        if (filters.deadlineFilter === "PAST_DEADLINE" && diffMs >= 0) return false;
      }

      return true;
    });
  }, [taskList, filters]);

  // Open Drawer handler
  const handleTaskClick = (task: TaskCardData) => {
    const fullTask = taskList.find((t) => t.id === task.id) || (task as TaskItem);
    setSelectedTask(fullTask);
    setDrawerOpen(true);
  };

  // Status Change handler
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const previous = [...taskList];
    // Optimistic
    setTaskList((prev) =>
      prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedTask?.id === taskId) {
      setSelectedTask((prev) => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (!res.success) throw new Error(res.error || "Gagal memperbarui status");
      toast({
        title: "Status Berhasil Diperbarui",
        description: `Tugas sekarang berstatus ${newStatus}`,
        type: "success",
      });
      startTransition(() => {
        router.refresh();
      });
    } catch (err: any) {
      setTaskList(previous);
      toast({
        title: "Pembaruan Gagal",
        description: err.message,
        type: "error",
      });
    }
  };

  // Duplicate task
  const handleDuplicateTask = async (task: TaskCardData) => {
    try {
      const res = await duplicateTaskAction(task.id);
      if (!res.success) throw new Error(res.error || "Gagal menduplikat tugas");
      toast({
        title: "Tugas Berhasil Diduplikat",
        description: "Salinan tugas telah ditambahkan ke sistem.",
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
      {/* 1. Task Toolbar */}
      <TaskToolbar
        filters={filters}
        onFilterChange={(newFilters) =>
          setFilters((prev) => ({ ...prev, ...newFilters }))
        }
        subjects={subjects}
        currentView={currentView}
        onViewChange={setCurrentView}
        onNewTask={
          isAdmin ? () => router.push("/admin/tasks/new") : undefined
        }
      />

      {/* 2. Unified Views Operating on same filteredTasks */}
      {currentView === "board" && (
        <TaskKanban
          tasks={filteredTasks}
          onTaskClick={handleTaskClick}
          onTasksChange={(updated) => setTaskList(updated as TaskItem[])}
        />
      )}

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
        />
      )}

      {/* 3. Task Drawer (shared across all views) */}
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
