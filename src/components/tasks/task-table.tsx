"use client";

import * as React from "react";
import { MoreVertical, Copy, Trash2, Eye, ExternalLink } from "lucide-react";
import { TaskCardData } from "./task-card";
import { DataTable, Column } from "@/components/ui/data-table";
import {
  TaskTypeBadge,
  DeadlineBadge,
} from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@/components/ui/dropdown";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";

export interface TaskTableProps {
  tasks: TaskCardData[];
  onTaskClick?: (task: TaskCardData) => void;
  onDuplicateTask?: (task: TaskCardData) => void;
  onDeleteTask?: (task: TaskCardData) => void;
  className?: string;
}

export function TaskTable({
  tasks,
  onTaskClick,
  onDuplicateTask,
  onDeleteTask,
  className,
}: TaskTableProps) {
  const [sortColumn, setSortColumn] = React.useState<string>("deadline");
  const [sortDirection, setSortDirection] = React.useState<"asc" | "desc">("asc");

  const handleSort = (colKey: string) => {
    if (sortColumn === colKey) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortColumn(colKey);
      setSortDirection("asc");
    }
  };

  const sortedTasks = React.useMemo(() => {
    return [...tasks].sort((a, b) => {
      let valA: any = (a as any)[sortColumn];
      let valB: any = (b as any)[sortColumn];

      if (sortColumn === "subject") {
        valA = a.subject?.code || "";
        valB = b.subject?.code || "";
      } else if (sortColumn === "deadline") {
        valA = new Date(a.deadline).getTime();
        valB = new Date(b.deadline).getTime();
      }

      if (valA < valB) return sortDirection === "asc" ? -1 : 1;
      if (valA > valB) return sortDirection === "asc" ? 1 : -1;
      return 0;
    });
  }, [tasks, sortColumn, sortDirection]);

  const columns: Column<TaskCardData>[] = [
    {
      key: "title",
      header: "Tugas",
      sortable: true,
      cell: (task) => (
        <div className="space-y-0.5">
          <div className="font-semibold text-[var(--text-primary)] hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
            {task.title}
          </div>
          {task.description && (
            <div className="text-xs text-[var(--text-muted)] line-clamp-1">
              {task.description}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "subject",
      header: "Mata Kuliah",
      sortable: true,
      cell: (task) => (
        <div className="space-y-0.5 font-mono text-xs">
          <span className="font-bold text-cyan-400 light:text-blue-700">
            {task.subject?.code || "UMUM"}
          </span>
          {task.subject?.name && (
            <div className="text-[11px] text-[var(--text-muted)] font-sans truncate max-w-[140px]">
              {task.subject.name}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "taskType",
      header: "Tipe",
      cell: (task) => <TaskTypeBadge type={task.taskType} />,
    },
    {
      key: "deadline",
      header: "Tenggat Waktu",
      sortable: true,
      cell: (task) => {
        return (
          <div className="space-y-1">
            <div className="text-xs font-semibold text-[var(--text-primary)]">
              {formatDate(task.deadline)}
            </div>
            <div>
              <DeadlineBadge deadline={task.deadline} />
            </div>
          </div>
        );
      },
    },
    {
      key: "lms",
      header: "LMS",
      cell: (task) => {
        const lmsUrl = task.submissionUrl || task.lmsUrl || task.referenceUrl;
        if (!lmsUrl) return <span className="text-xs text-[var(--text-muted)] font-mono">-</span>;
        return (
          <a
            href={lmsUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold bg-blue-600/15 text-cyan-300 hover:bg-blue-600/25 border border-cyan-500/30 light:bg-blue-50 light:text-blue-700 light:hover:bg-blue-100 light:border-blue-200 transition-colors"
          >
            <span>Open LMS</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        );
      },
    },
    {
      key: "actions",
      header: "",
      className: "w-10 text-right",
      cell: (task) => (
        <Dropdown>
          <DropdownTrigger
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
            className="p-1 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </DropdownTrigger>
          <DropdownMenu align="right">
            <DropdownItem onClick={() => onTaskClick?.(task)}>
              <Eye className="w-3.5 h-3.5" />
              <span>Lihat Detail</span>
            </DropdownItem>
            {onDuplicateTask && (
              <DropdownItem onClick={() => onDuplicateTask(task)}>
                <Copy className="w-3.5 h-3.5" />
                <span>Duplikat</span>
              </DropdownItem>
            )}
            {onDeleteTask && (
              <DropdownItem
                danger
                onClick={() => onDeleteTask(task)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Hapus</span>
              </DropdownItem>
            )}
          </DropdownMenu>
        </Dropdown>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={sortedTasks}
      keyExtractor={(t) => t.id}
      onRowClick={onTaskClick}
      sortColumn={sortColumn}
      sortDirection={sortDirection}
      onSort={handleSort}
      className={className}
    />
  );
}
