"use client";

import * as React from "react";
import { TaskStatus } from "@prisma/client";
import { TaskCard, TaskCardData } from "./task-card";
import { cn } from "@/lib/utils";

export interface TaskKanbanColumnProps {
  status: TaskStatus;
  label: string;
  badgeColor?: string;
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  onDropTask?: (taskId: string, targetStatus: TaskStatus) => void;
  className?: string;
}

export function TaskKanbanColumn({
  status,
  label,
  badgeColor = "border-cyan-400 text-cyan-300",
  tasks,
  onTaskClick,
  onDropTask,
  className,
}: TaskKanbanColumnProps) {
  const [isOver, setIsOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(true);
  };

  const handleDragLeave = () => {
    setIsOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsOver(false);
    const taskId = e.dataTransfer.getData("text/plain");
    if (taskId && onDropTask) {
      onDropTask(taskId, status);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "flex flex-col min-w-[280px] w-full rounded-2xl border bg-[var(--surface-primary)]/70 backdrop-blur-md p-3.5 transition-all duration-200 select-none shadow-sm",
        "border-[var(--border-color)] light:bg-slate-50/80 light:border-slate-200",
        isOver &&
          "ring-2 ring-cyan-400/60 border-cyan-400/80 bg-cyan-500/[0.06] light:bg-blue-50/80",
        className
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between pb-3 mb-2 border-b border-[var(--border-color)]/70">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
          <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
            {label}
          </h3>
        </div>
        <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-[var(--surface-card)] border border-[var(--border-color)] text-[var(--text-secondary)]">
          {tasks.length}
        </span>
      </div>

      {/* Task List / Drop Zone */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[70vh] min-h-[140px] pr-1 scrollbar-thin">
        {tasks.length === 0 ? (
          <div
            className={cn(
              "h-28 rounded-xl border border-dashed flex flex-col items-center justify-center p-3 text-center transition-colors",
              isOver
                ? "border-cyan-400/80 bg-cyan-500/10 text-cyan-300"
                : "border-[var(--border-color)]/60 text-[var(--text-muted)]"
            )}
          >
            <p className="text-xs">
              {isOver ? "Lepaskan untuk memindahkan" : "Tidak ada tugas"}
            </p>
          </div>
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", task.id);
                e.dataTransfer.effectAllowed = "move";
              }}
              className="cursor-grab active:cursor-grabbing"
            >
              <TaskCard
                task={task}
                variant="kanban"
                onClick={() => onTaskClick?.(task)}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
