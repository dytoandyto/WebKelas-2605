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
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Pengingat
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Tugas & Deadline
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            Jangan sampai kelewatan.
          </p>
        </div>

        <Link href="/tasks">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Semua Tugas
          </Button>
        </Link>
      </div>

      {activeTasks.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <Card
            variant="default"
            padding="lg"
            className="text-center border-dashed space-y-3 p-6 sm:p-8"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center mx-auto text-cyan-400 light:text-blue-600">
              <CheckSquare className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Belum ada tugas yang perlu diingat.
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Semua tugas sudah beres atau belum ada tugas baru yang aktif.
              </p>
            </div>
            <div className="pt-2">
              <Link href="/tasks?tab=history">
                <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                  Lihat Riwayat Tugas
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      ) : (
        <div className="space-y-3 sm:space-y-3.5">
          {activeTasks.map((task) => (
            <Link
              key={task.id}
              href={`/tasks/${task.id}`}
              className="block group cursor-pointer focus-visible:outline-none"
              aria-label={`Tugas ${task.title}. Tenggat ${task.deadline}`}
            >
              <TaskCard task={task} variant="list" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
