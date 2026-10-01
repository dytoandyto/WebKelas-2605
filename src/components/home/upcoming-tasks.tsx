"use client";

import * as React from "react";
import Link from "next/link";
import { CheckSquare, ArrowRight } from "lucide-react";
import { TaskCard, TaskCardData } from "@/components/tasks/task-card";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface UpcomingTasksProps {
  tasks: TaskCardData[];
  className?: string;
}

export function UpcomingTasks({ tasks, className }: UpcomingTasksProps) {
  const activeTasks = tasks.slice(0, 4);

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Prioritas Akademik
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Tugas & Deadline Mendatang
          </h2>
        </div>

        <Link href="/tasks">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Buka Task Planner
          </Button>
        </Link>
      </div>

      {activeTasks.length === 0 ? (
        <Card
          variant="default"
          padding="lg"
          className="text-center border-dashed space-y-2 p-8"
        >
          <CheckSquare className="w-8 h-8 text-emerald-400 mx-auto opacity-70" />
          <h4 className="text-base font-bold text-[var(--text-primary)]">
            Semua Tugas Terselesaikan!
          </h4>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
            Tidak ada deadline tugas akademik yang mendesak saat ini. Pertahankan
            progress belajar yang luar biasa!
          </p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {activeTasks.map((task) => (
            <TaskCard key={task.id} task={task} variant="default" />
          ))}
        </div>
      )}
    </section>
  );
}
