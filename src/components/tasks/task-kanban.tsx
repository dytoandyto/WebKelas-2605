"use client";

import * as React from "react";
import { TaskStatus } from "@prisma/client";
import { TaskCardData } from "./task-card";
import { TaskKanbanColumn } from "./task-kanban-column";
import { useToast } from "@/components/ui/toast";
import { updateTaskStatusAction } from "@/lib/actions/tasks";
import { cn } from "@/lib/utils";

export interface TaskKanbanProps {
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  onTasksChange?: (updatedTasks: TaskCardData[]) => void;
  className?: string;
}

const KANBAN_COLUMNS: {
  status: TaskStatus;
  label: string;
}[] = [
  { status: TaskStatus.TODO, label: "Belum Dimulai" },
  { status: TaskStatus.IN_PROGRESS, label: "Sedang Dikerjakan" },
  { status: TaskStatus.SUBMITTED, label: "Sudah Dikumpulkan" },
  { status: TaskStatus.COMPLETED, label: "Selesai" },
  { status: TaskStatus.OVERDUE, label: "Terlambat" },
];

export function TaskKanban({
  tasks,
  onTaskClick,
  onTasksChange,
  className,
}: TaskKanbanProps) {
  const { toast } = useToast();

  const handleDropTask = async (
    taskId: string,
    targetStatus: TaskStatus
  ) => {
    const taskIndex = tasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const previousTask = tasks[taskIndex];
    if (previousTask.status === targetStatus) return;

    // Optimistic Update
    const optimisticTasks = tasks.map((t) =>
      t.id === taskId ? { ...t, status: targetStatus } : t
    );
    onTasksChange?.(optimisticTasks);

    try {
      const res = await updateTaskStatusAction(taskId, targetStatus);
      if (!res.success) {
        throw new Error(res.error || "Gagal memperbarui status tugas");
      }
      toast({
        title: "Status Diperbarui",
        description: `Tugas dipindahkan ke kolom ${targetStatus.replace("_", " ")}`,
        type: "success",
      });
    } catch (err: any) {
      // Rollback on error
      onTasksChange?.(tasks);
      toast({
        title: "Pembaruan Gagal",
        description: err.message || "Gagal memindahkan tugas, status dikembalikan.",
        type: "error",
      });
    }
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto pb-6 scrollbar-thin select-none",
        className
      )}
    >
      <div className="flex items-start gap-4 min-w-[1280px]">
        {KANBAN_COLUMNS.map((col) => {
          const colTasks = tasks.filter((t) => t.status === col.status);
          return (
            <div key={col.status} className="flex-1 min-w-[250px]">
              <TaskKanbanColumn
                status={col.status}
                label={col.label}
                tasks={colTasks}
                onTaskClick={onTaskClick}
                onDropTask={handleDropTask}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
