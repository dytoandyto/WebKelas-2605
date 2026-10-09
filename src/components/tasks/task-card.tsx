"use client";

import { Clock, Paperclip, ChevronRight, ExternalLink } from "lucide-react";
import { cn, formatDate, getRelativeDeadline, isTaskFlexibleOrNoDeadline } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { DeadlineBadge } from "@/components/ui/badge";

export interface TaskCardData {
  id: string;
  title: string;
  description?: string | null;
  subject?: {
    code: string;
    name: string;
  } | null;
  taskType?: string | null;
  deadline: Date | string;
  priority?: string;
  status?: string;
  groupName?: string | null;
  groupMembers?: string | null;
  attachmentUrl?: string | null;
  submissionUrl?: string | null;
  referenceUrl?: string | null;
  lmsUrl?: string | null;
  notes?: string | null;
  isNoDeadline?: boolean;
}

export interface TaskCardProps {
  task: TaskCardData;
  variant?: "default" | "compact" | "kanban" | "list" | "calendar" | "featured";
  onClick?: () => void;
  className?: string;
  isDragging?: boolean;
}

export function TaskCard({
  task,
  variant = "default",
  onClick,
  className,
  isDragging = false,
}: TaskCardProps) {
  const isNoDeadline = Boolean(task.isNoDeadline || isTaskFlexibleOrNoDeadline(task));
  const deadlineInfo = getRelativeDeadline(task.deadline, { isNoDeadline });
  const lmsUrl = task.submissionUrl || task.lmsUrl || task.referenceUrl;

  // Calendar variant: ultra-compact for calendar cell pills
  if (variant === "calendar") {
    const isPast = deadlineInfo.isOverdue;
    return (
      <div
        onClick={onClick}
        className={cn(
          "w-full text-left px-2 py-1 rounded-md text-[11px] font-medium truncate cursor-pointer transition-all duration-150 border",
          isPast
            ? "bg-red-500/15 text-red-200 border-red-500/30 light:bg-red-50 light:text-red-700 light:border-red-200"
            : "bg-cyan-500/15 text-cyan-200 border-cyan-500/30 hover:bg-cyan-500/25 light:bg-blue-50 light:text-blue-700 light:border-blue-200",
          className
        )}
        title={`${task.subject?.code ? `[${task.subject.code}] ` : ""}${task.title}`}
      >
        <span className="font-bold opacity-80 mr-1 font-mono">
          {task.subject?.code || "TUGAS"}
        </span>
        <span>{task.title}</span>
      </div>
    );
  }

  // Compact variant: ideal for small sidebars, widgets, or related tasks
  if (variant === "compact") {
    return (
      <Card
        variant="interactive"
        padding="sm"
        onClick={onClick}
        className={cn("text-left transition-all", className)}
      >
        <div className="flex items-center justify-between gap-2 mb-1">
          <span className="font-mono text-[10px] font-bold text-cyan-400 light:text-blue-600 truncate">
            {task.subject?.code || "AKADEMIK"}
          </span>
          <DeadlineBadge deadline={task.deadline} isNoDeadline={isNoDeadline} />
        </div>
        <h4 className="text-xs sm:text-sm font-semibold text-[var(--text-primary)] truncate">
          {task.title}
        </h4>
        <div className="flex items-center justify-between mt-2 pt-1.5 border-t border-[var(--border-color)]/60 text-[10px] text-[var(--text-muted)]">
          <span>{isNoDeadline ? "Fleksibel (Tanpa Tenggat)" : formatDate(task.deadline)}</span>
          {lmsUrl && (
            <a
              href={lmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="font-semibold text-cyan-400 light:text-blue-600 hover:underline"
            >
              Open LMS
            </a>
          )}
        </div>
      </Card>
    );
  }

  // List variant: horizontal row layout for student-focused reading
  if (variant === "list") {
    return (
      <Card
        variant="interactive"
        padding="sm"
        onClick={onClick}
        className={cn(
          "flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left p-4 sm:p-5",
          className
        )}
      >
        <div className="min-w-0 space-y-1 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/25">
              {task.subject?.code || "UMUM"}
            </span>
            {task.subject?.name && (
              <span className="text-xs text-[var(--text-muted)] truncate font-medium">
                {task.subject.name}
              </span>
            )}
            {task.attachmentUrl && (
              <span className="text-[var(--text-muted)]" title="Ada Lampiran">
                <Paperclip className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
            {task.title}
          </h4>

          {task.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
              {task.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)] justify-between sm:justify-end">
          {lmsUrl && (
            <a
              href={lmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 dark:text-cyan-300 dark:border-cyan-500/30 transition-colors shadow-2xs"
            >
              <span>Open LMS</span>
              <ExternalLink size={12} />
            </a>
          )}

          <div className="text-right">
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              {isNoDeadline ? "Fleksibel (Tanpa Tenggat)" : formatDate(task.deadline)}
            </div>
            <div className="mt-0.5">
              <DeadlineBadge deadline={task.deadline} isNoDeadline={isNoDeadline} />
            </div>
          </div>

          <ChevronRight className="w-4 h-4 text-[var(--text-muted)] hidden sm:block" />
        </div>
      </Card>
    );
  }

  // Default / Featured Card Variant
  const isFeatured = variant === "featured";

  return (
    <Card
      variant={isFeatured ? "featured" : "interactive"}
      padding="sm"
      onClick={onClick}
      className={cn(
        "text-left select-none transition-all duration-200 p-4 space-y-3",
        isDragging && "opacity-50 scale-95 shadow-2xl",
        className
      )}
    >
      {/* 1. Header: Subject Code & Deadline Badge */}
      <div className="flex items-start justify-between gap-2">
        <span className="font-mono text-xs font-bold text-cyan-400 light:text-blue-600 tracking-wider truncate">
          {task.subject?.code || "AKADEMIK"}
        </span>
        <DeadlineBadge deadline={task.deadline} isNoDeadline={isNoDeadline} />
      </div>

      {/* 2. Title & Course Name */}
      <div className="space-y-1">
        <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] leading-snug tracking-tight line-clamp-2">
          {task.title}
        </h4>
        {task.subject?.name && (
          <p className="text-[11px] text-[var(--text-muted)] truncate font-medium">
            {task.subject.name}
          </p>
        )}
      </div>

      {/* 3. Short description if available */}
      {task.description && (
        <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {task.description}
        </p>
      )}

      {/* 4. Footer: Deadline & Open LMS button */}
      <div className="pt-2.5 border-t border-[var(--border-color)]/70 flex items-center justify-between text-xs">
        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] font-medium">
          <Clock className="w-3.5 h-3.5 opacity-70" />
          <span>{isNoDeadline ? "Fleksibel (Tanpa Tenggat)" : formatDate(task.deadline)}</span>
        </div>

        {lmsUrl && (
          <a
            href={lmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs font-semibold text-cyan-400 hover:text-cyan-300 light:text-blue-600 light:hover:text-blue-700"
          >
            <span>Open LMS</span>
            <ExternalLink size={11} />
          </a>
        )}
      </div>
    </Card>
  );
}
