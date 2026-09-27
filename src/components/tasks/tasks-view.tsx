"use client";

import React, { useState, useMemo, useEffect, useTransition } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  CheckSquare,
  Clock,
  AlertCircle,
  CheckCircle2,
  Circle,
  Search,
  Users,
  Calendar as CalendarIcon,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  ArrowUpDown,
  BookOpen,
  Paperclip,
  Plus,
  Copy,
  Trash2,
  X,
  FileText,
  AlertTriangle,
  Flame,
  CheckCheck,
  Eye,
  Filter,
} from "lucide-react";
import { cn, formatDate, getRelativeDeadline } from "@/lib/utils";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import {
  ViewSwitcher,
  ViewMode,
  Toolbar,
  StatCard,
  EmptyState,
  ConfirmDialog,
} from "@/components/shared";
import {
  updateTaskStatusAction,
  duplicateTaskAction,
  bulkUpdateTasksStatusAction,
  bulkDeleteTasksAction,
} from "@/lib/actions/tasks";

export interface TaskItem {
  id: string;
  title: string;
  description?: string | null;
  subjectId?: string | null;
  taskType?: TaskType;
  deadline: string | Date;
  estimatedTime?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  computedStatus?: TaskStatus;
  groupName?: string | null;
  groupMembers?: string | null;
  attachmentUrl?: string | null;
  submissionUrl?: string | null;
  referenceUrl?: string | null;
  notes?: string | null;
  createdAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
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

const PRIORITY_BADGES: Record<TaskPriority, { text: string; bg: string; border: string }> = {
  URGENT: { text: "text-red-400 dark:text-red-300", bg: "bg-red-500/15", border: "border-red-500/30" },
  HIGH: { text: "text-rose-400 dark:text-rose-300", bg: "bg-rose-500/15", border: "border-rose-500/30" },
  MEDIUM: { text: "text-amber-500 dark:text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/30" },
  LOW: { text: "text-blue-500 dark:text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/30" },
};

export function TasksView({ tasks: initialTasks, subjects, isAdmin = false }: TasksViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Local state for optimistic drag & update
  const [taskList, setTaskList] = useState<TaskItem[]>(initialTasks);
  const [isPending, startTransition] = useTransition();

  // Active view from URL or default to board
  const urlView = searchParams.get("view") as ViewMode | null;
  const [currentView, setCurrentView] = useState<ViewMode>(
    urlView && ["table", "board", "calendar", "list"].includes(urlView) ? urlView : "board"
  );

  // Filters & Sorting
  const [search, setSearch] = useState("");
  const [selectedSubject, setSelectedSubject] = useState<string>("ALL");
  const [selectedType, setSelectedType] = useState<string>("ALL");
  const [selectedStatus, setSelectedStatus] = useState<string>(searchParams.get("status") || "ALL");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"deadline_asc" | "deadline_desc" | "created_desc" | "priority">("deadline_asc");

  // Selection for bulk actions
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([]);
  const [showBulkDeleteConfirm, setShowBulkDeleteConfirm] = useState(false);

  // Drawer state
  const [selectedDrawerTask, setSelectedDrawerTask] = useState<TaskItem | null>(null);

  // Calendar month state
  const [calendarDate, setCalendarDate] = useState<Date>(new Date(2026, 8, 1)); // Default Sep 2026

  // Keep state in sync with props
  useEffect(() => {
    setTaskList(initialTasks);
  }, [initialTasks]);

  // Sync view change to URL
  const handleViewChange = (newView: ViewMode) => {
    setCurrentView(newView);
    const params = new URLSearchParams(window.location.search);
    params.set("view", newView);
    window.history.replaceState(null, "", `?${params.toString()}`);
  };

  // Status mapping & dynamic overdue check
  const now = new Date();

  const getComputedStatus = (task: TaskItem): "TODO" | "IN_PROGRESS" | "SUBMITTED" | "COMPLETED" | "OVERDUE" => {
    if (task.status === "COMPLETED") return "COMPLETED";
    if (task.status === "SUBMITTED") return "SUBMITTED";
    const d = new Date(task.deadline);
    if (d < now) return "OVERDUE";
    if (task.status === "IN_PROGRESS") return "IN_PROGRESS";
    return "TODO";
  };

  // Filtered and sorted tasks
  const filteredTasks = useMemo(() => {
    return taskList
      .filter((task) => {
        // Search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = task.title.toLowerCase().includes(q);
          const matchDesc = task.description?.toLowerCase().includes(q);
          const matchSubject =
            task.subject?.name.toLowerCase().includes(q) ||
            task.subject?.code.toLowerCase().includes(q);
          const matchGroup = task.groupName?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchSubject && !matchGroup) return false;
        }

        // Subject
        if (selectedSubject !== "ALL" && task.subjectId !== selectedSubject) return false;

        // Type
        if (selectedType !== "ALL" && task.taskType !== selectedType) return false;

        // Priority
        if (selectedPriority !== "ALL" && task.priority !== selectedPriority) return false;

        // Status
        if (selectedStatus !== "ALL") {
          const cStatus = getComputedStatus(task);
          if (selectedStatus === "OVERDUE" && cStatus !== "OVERDUE") return false;
          if (selectedStatus === "TODO" && cStatus !== "TODO") return false;
          if (selectedStatus === "IN_PROGRESS" && cStatus !== "IN_PROGRESS") return false;
          if (selectedStatus === "SUBMITTED" && cStatus !== "SUBMITTED") return false;
          if (selectedStatus === "COMPLETED" && cStatus !== "COMPLETED") return false;
          if (selectedStatus === "DUE_TODAY") {
            const d = new Date(task.deadline);
            const isToday =
              d.getDate() === now.getDate() &&
              d.getMonth() === now.getMonth() &&
              d.getFullYear() === now.getFullYear();
            if (!isToday || cStatus === "COMPLETED") return false;
          }
          if (selectedStatus === "THIS_WEEK") {
            const d = new Date(task.deadline);
            const diffDays = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
            if (diffDays < 0 || diffDays > 7 || cStatus === "COMPLETED") return false;
          }
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "deadline_asc") {
          return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
        }
        if (sortBy === "deadline_desc") {
          return new Date(b.deadline).getTime() - new Date(a.deadline).getTime();
        }
        if (sortBy === "created_desc") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "priority") {
          const order = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
          return order[a.priority] - order[b.priority];
        }
        return 0;
      });
  }, [taskList, search, selectedSubject, selectedType, selectedPriority, selectedStatus, sortBy]);

  // Statistics calculation for clickable Stat Cards
  const stats = useMemo(() => {
    let dueToday = 0;
    let thisWeek = 0;
    let inProgress = 0;
    let completed = 0;
    let overdue = 0;

    taskList.forEach((t) => {
      const cStatus = getComputedStatus(t);
      if (cStatus === "COMPLETED") {
        completed++;
      } else if (cStatus === "OVERDUE") {
        overdue++;
      } else {
        if (cStatus === "IN_PROGRESS") inProgress++;
        const d = new Date(t.deadline);
        const isToday =
          d.getDate() === now.getDate() &&
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear();
        if (isToday) dueToday++;

        const diffDays = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
        if (diffDays >= 0 && diffDays <= 7) thisWeek++;
      }
    });

    return {
      total: taskList.length,
      dueToday,
      thisWeek,
      inProgress,
      completed,
      overdue,
    };
  }, [taskList]);

  // Handle Stat Card click to toggle filter
  const handleStatClick = (statusKey: string) => {
    if (selectedStatus === statusKey) {
      setSelectedStatus("ALL");
    } else {
      setSelectedStatus(statusKey);
    }
  };

  // Status update handler with optimistic update
  const handleStatusChange = async (taskId: string, newStatus: TaskStatus) => {
    const prev = [...taskList];
    // Optimistic
    setTaskList((curr) =>
      curr.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t))
    );
    if (selectedDrawerTask?.id === taskId) {
      setSelectedDrawerTask((prevD) => prevD ? { ...prevD, status: newStatus } : null);
    }

    startTransition(async () => {
      const res = await updateTaskStatusAction(taskId, newStatus);
      if (!res.success) {
        setTaskList(prev);
        alert(`Gagal memperbarui status: ${res.error}`);
      } else {
        router.refresh();
      }
    });
  };

  // Duplicate task handler
  const handleDuplicate = async (taskId: string) => {
    startTransition(async () => {
      const res = await duplicateTaskAction(taskId);
      if (!res.success) {
        alert(`Gagal menduplikasi tugas: ${res.error}`);
      } else {
        router.refresh();
      }
    });
  };

  // Drag and drop for Kanban
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("text/plain", taskId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, targetColumnStatus: TaskStatus) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    handleStatusChange(taskId, targetColumnStatus);
  };

  // Bulk actions
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedTaskIds(filteredTasks.map((t) => t.id));
    } else {
      setSelectedTaskIds([]);
    }
  };

  const handleToggleSelect = (taskId: string) => {
    setSelectedTaskIds((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const handleBulkStatus = async (status: TaskStatus) => {
    if (selectedTaskIds.length === 0) return;
    startTransition(async () => {
      const res = await bulkUpdateTasksStatusAction(selectedTaskIds, status);
      if (res.success) {
        setSelectedTaskIds([]);
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  const handleBulkDelete = async () => {
    if (selectedTaskIds.length === 0) return;
    startTransition(async () => {
      const res = await bulkDeleteTasksAction(selectedTaskIds);
      setShowBulkDeleteConfirm(false);
      if (res.success) {
        setSelectedTaskIds([]);
        router.refresh();
      } else {
        alert(res.error);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. Dynamic Interactive Stat Cards (Click-to-Filter) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard
          label="Total Tugas"
          value={stats.total}
          icon={<CheckSquare size={16} />}
          active={selectedStatus === "ALL"}
          onClick={() => setSelectedStatus("ALL")}
          hint="Semua tugas"
        />
        <StatCard
          label="Hari Ini"
          value={stats.dueToday}
          icon={<Clock size={16} />}
          color="amber"
          active={selectedStatus === "DUE_TODAY"}
          onClick={() => handleStatClick("DUE_TODAY")}
          hint="Deadline hari ini"
        />
        <StatCard
          label="Minggu Ini"
          value={stats.thisWeek}
          icon={<CalendarIcon size={16} />}
          color="blue"
          active={selectedStatus === "THIS_WEEK"}
          onClick={() => handleStatClick("THIS_WEEK")}
          hint="7 hari ke depan"
        />
        <StatCard
          label="In Progress"
          value={stats.inProgress}
          icon={<Circle size={16} className="text-cyan-400" />}
          color="cyan"
          active={selectedStatus === "IN_PROGRESS"}
          onClick={() => handleStatClick("IN_PROGRESS")}
          hint="Sedang dikerjakan"
        />
        <StatCard
          label="Selesai"
          value={stats.completed}
          icon={<CheckCircle2 size={16} />}
          color="emerald"
          active={selectedStatus === "COMPLETED"}
          onClick={() => handleStatClick("COMPLETED")}
          hint="Sudah tuntas"
        />
        <StatCard
          label="Overdue"
          value={stats.overdue}
          icon={<Flame size={16} />}
          color="rose"
          active={selectedStatus === "OVERDUE"}
          onClick={() => handleStatClick("OVERDUE")}
          hint="Melewati deadline"
        />
      </div>

      {/* 2. Unified Toolbar (Search, Filter, View Switcher) */}
      <Toolbar
        searchQuery={search}
        onSearchChange={setSearch}
        searchPlaceholder="Cari tugas, mata kuliah, deskripsi..."
        filters={
          <>
            {/* Subject Filter */}
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              aria-label="Filter Mata Kuliah"
              className="input text-xs py-2 px-3 rounded-xl max-w-[170px]"
            >
              <option value="ALL">Semua Mata Kuliah</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>

            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              aria-label="Filter Jenis Tugas"
              className="input text-xs py-2 px-3 rounded-xl"
            >
              <option value="ALL">Semua Tipe</option>
              <option value="INDIVIDUAL">Individu</option>
              <option value="GROUP">Kelompok</option>
              <option value="ADDITIONAL">Tambahan</option>
            </select>

            {/* Priority Filter */}
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              aria-label="Filter Prioritas"
              className="input text-xs py-2 px-3 rounded-xl"
            >
              <option value="ALL">Semua Prioritas</option>
              <option value="URGENT">Urgent</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              aria-label="Urutkan Tugas"
              className="input text-xs py-2 px-3 rounded-xl"
            >
              <option value="deadline_asc">Deadline Terdekat</option>
              <option value="deadline_desc">Deadline Terjauh</option>
              <option value="priority">Prioritas Tertinggi</option>
              <option value="created_desc">Terbaru Ditambahkan</option>
            </select>

            {/* Reset Filters if active */}
            {(selectedSubject !== "ALL" ||
              selectedType !== "ALL" ||
              selectedPriority !== "ALL" ||
              selectedStatus !== "ALL" ||
              search) && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedType("ALL");
                  setSelectedPriority("ALL");
                  setSelectedStatus("ALL");
                  setSearch("");
                }}
                className="btn btn-ghost text-xs px-2.5 py-1.5 text-[var(--text-muted)] hover:text-rose-400"
              >
                Reset
              </button>
            )}
          </>
        }
        viewSwitcher={
          <ViewSwitcher currentView={currentView} onViewChange={handleViewChange} />
        }
        actions={
          isAdmin && (
            <Link
              href="/admin/tasks"
              className="btn btn-primary text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Tambah Tugas</span>
            </Link>
          )
        }
      />

      {/* 3. Empty State if no match */}
      {filteredTasks.length === 0 && (
        <EmptyState
          icon={<CheckSquare size={28} className="text-[var(--primary)] dark:text-cyan-400" />}
          title="Tidak ada tugas ditemukan"
          description={
            search || selectedSubject !== "ALL" || selectedStatus !== "ALL"
              ? "Tidak ada tugas yang cocok dengan filter aktif. Coba ubah pencarian atau reset filter."
              : "Semua tugas telah terselesaikan atau belum ada tugas yang dijadwalkan."
          }
          action={
            (search || selectedSubject !== "ALL" || selectedStatus !== "ALL") && (
              <button
                onClick={() => {
                  setSelectedSubject("ALL");
                  setSelectedType("ALL");
                  setSelectedPriority("ALL");
                  setSelectedStatus("ALL");
                  setSearch("");
                }}
                className="btn btn-secondary text-xs px-4 py-2"
              >
                Reset Filter
              </button>
            )
          }
        />
      )}

      {/* 4. VIEW RENDERER */}
      {filteredTasks.length > 0 && (
        <>
          {/* VIEW A: KANBAN BOARD */}
          {currentView === "board" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
              {[
                { status: "TODO" as TaskStatus, label: "To-Do", color: "blue", border: "border-blue-500/30" },
                { status: "IN_PROGRESS" as TaskStatus, label: "In Progress", color: "cyan", border: "border-cyan-500/30" },
                { status: "SUBMITTED" as TaskStatus, label: "Submitted", color: "purple", border: "border-purple-500/30" },
                { status: "COMPLETED" as TaskStatus, label: "Completed", color: "emerald", border: "border-emerald-500/30" },
                { status: "OVERDUE" as TaskStatus, label: "Overdue", color: "rose", border: "border-rose-500/30" },
              ].map((col) => {
                const colTasks = filteredTasks.filter((t) => {
                  const cs = getComputedStatus(t);
                  return cs === col.status;
                });

                return (
                  <div
                    key={col.status}
                    onDragOver={handleDragOver}
                    onDrop={(e) => handleDrop(e, col.status)}
                    className="flex flex-col rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] p-3 space-y-3 min-h-[380px]"
                  >
                    {/* Column Header */}
                    <div className="flex items-center justify-between pb-2.5 border-b border-[var(--border-color)]/70 px-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            col.color === "cyan"
                              ? "bg-cyan-400"
                              : col.color === "emerald"
                              ? "bg-emerald-500"
                              : col.color === "rose"
                              ? "bg-rose-500"
                              : col.color === "purple"
                              ? "bg-purple-500"
                              : "bg-blue-500"
                          }`}
                        />
                        <span className="text-xs font-bold font-display uppercase tracking-wider text-[var(--text-primary)]">
                          {col.label}
                        </span>
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-color)]/40">
                        {colTasks.length}
                      </span>
                    </div>

                    {/* Column Cards */}
                    <div className="space-y-2.5 flex-1">
                      {colTasks.map((task) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => handleDragStart(e, task.id)}
                          onClick={() => setSelectedDrawerTask(task)}
                          className="card p-3.5 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all cursor-pointer space-y-2.5 shadow-sm hover:shadow-md select-none group"
                        >
                          {/* Subject & Priority */}
                          <div className="flex items-center justify-between gap-1 text-[11px]">
                            {task.subject ? (
                              <span className="font-mono font-bold text-[var(--primary)] dark:text-cyan-400 truncate max-w-[140px]">
                                {task.subject.code}
                              </span>
                            ) : (
                              <span className="font-mono text-[var(--text-muted)]">Umum</span>
                            )}
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                PRIORITY_BADGES[task.priority]?.bg || "bg-slate-500/20"
                              } ${PRIORITY_BADGES[task.priority]?.text || "text-slate-300"}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {/* Task Title */}
                          <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors line-clamp-2">
                            {task.title}
                          </h4>

                          {/* Group info if any */}
                          {task.taskType === "GROUP" && (
                            <div className="flex items-center gap-1 text-[11px] text-cyan-400 font-medium">
                              <Users size={12} />
                              <span className="truncate">{task.groupName || "Tugas Kelompok"}</span>
                            </div>
                          )}

                          {/* Footer with deadline and type */}
                          <div className="pt-2 border-t border-[var(--border-color)]/50 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                            <span className="flex items-center gap-1 font-mono">
                              <Clock size={11} />
                              <span>{formatDate(task.deadline, { month: "short", day: "numeric" })}</span>
                            </span>

                            <span className="px-1.5 py-0.5 rounded bg-[var(--bg-muted)] text-[10px] font-mono">
                              {task.taskType === "GROUP"
                                ? "GRP"
                                : task.taskType === "ADDITIONAL"
                                ? "ADD"
                                : "IND"}
                            </span>
                          </div>
                        </div>
                      ))}

                      {colTasks.length === 0 && (
                        <div className="h-28 border border-dashed border-[var(--border-color)]/50 rounded-xl flex items-center justify-center text-[11px] text-[var(--text-muted)] text-center p-2">
                          Tarik tugas ke sini
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW B: LIST VIEW (Horizon Grouped) */}
          {currentView === "list" && (
            <div className="space-y-6">
              {[
                {
                  key: "OVERDUE",
                  title: "Overdue",
                  badgeColor: "bg-rose-500/20 text-rose-400 border-rose-500/30",
                  filterFn: (t: TaskItem) => getComputedStatus(t) === "OVERDUE",
                },
                {
                  key: "TODAY",
                  title: "Hari Ini",
                  badgeColor: "bg-amber-500/20 text-amber-400 border-amber-500/30",
                  filterFn: (t: TaskItem) => {
                    const d = new Date(t.deadline);
                    return (
                      getComputedStatus(t) !== "OVERDUE" &&
                      getComputedStatus(t) !== "COMPLETED" &&
                      d.getDate() === now.getDate() &&
                      d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear()
                    );
                  },
                },
                {
                  key: "THIS_WEEK",
                  title: "Minggu Ini",
                  badgeColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
                  filterFn: (t: TaskItem) => {
                    const d = new Date(t.deadline);
                    const diffDays = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
                    const isToday =
                      d.getDate() === now.getDate() &&
                      d.getMonth() === now.getMonth() &&
                      d.getFullYear() === now.getFullYear();
                    return (
                      getComputedStatus(t) !== "OVERDUE" &&
                      getComputedStatus(t) !== "COMPLETED" &&
                      !isToday &&
                      diffDays >= 0 &&
                      diffDays <= 7
                    );
                  },
                },
                {
                  key: "UPCOMING",
                  title: "Mendatang",
                  badgeColor: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
                  filterFn: (t: TaskItem) => {
                    const d = new Date(t.deadline);
                    const diffDays = (d.getTime() - now.getTime()) / (1000 * 3600 * 24);
                    return (
                      getComputedStatus(t) !== "OVERDUE" &&
                      getComputedStatus(t) !== "COMPLETED" &&
                      diffDays > 7
                    );
                  },
                },
                {
                  key: "COMPLETED",
                  title: "Selesai",
                  badgeColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
                  filterFn: (t: TaskItem) => getComputedStatus(t) === "COMPLETED",
                },
              ].map((section) => {
                const sectionTasks = filteredTasks.filter(section.filterFn);
                if (sectionTasks.length === 0) return null;

                return (
                  <div key={section.key} className="space-y-3">
                    <div className="flex items-center gap-2.5 pb-2 border-b border-[var(--border-color)]">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold font-mono border ${section.badgeColor}`}>
                        {section.title}
                      </span>
                      <span className="text-xs text-[var(--text-muted)] font-mono">
                        ({sectionTasks.length} tugas)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
                      {sectionTasks.map((task) => (
                        <div
                          key={task.id}
                          onClick={() => setSelectedDrawerTask(task)}
                          className="card p-4 bg-[var(--bg-surface)] hover:border-[var(--primary)] transition-all cursor-pointer space-y-3 group"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="space-y-0.5">
                              {task.subject ? (
                                <span className="text-xs font-mono font-bold text-[var(--primary)] dark:text-cyan-400">
                                  {task.subject.code} &bull; {task.subject.name}
                                </span>
                              ) : (
                                <span className="text-xs font-mono text-[var(--text-muted)]">Tugas Umum</span>
                              )}
                              <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary)] transition-colors">
                                {task.title}
                              </h4>
                            </div>

                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                                PRIORITY_BADGES[task.priority]?.bg || "bg-slate-500/20"
                              } ${PRIORITY_BADGES[task.priority]?.text || "text-slate-300"}`}
                            >
                              {task.priority}
                            </span>
                          </div>

                          {task.description && (
                            <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          <div className="pt-2.5 border-t border-[var(--border-color)]/50 flex items-center justify-between text-xs text-[var(--text-muted)]">
                            <span className="flex items-center gap-1 font-mono text-[11px]">
                              <Clock size={12} className="text-[var(--primary)]" />
                              <span>{getRelativeDeadline(task.deadline).text}</span>
                            </span>

                            <div className="flex items-center gap-1.5">
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-[var(--bg-muted)]">
                                {task.taskType || "INDIVIDUAL"}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* VIEW C: CALENDAR VIEW */}
          {currentView === "calendar" && (
            <div className="card p-5 space-y-4">
              {/* Month Navigation */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border-color)]">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-bold font-display text-[var(--text-primary)]">
                    {calendarDate.toLocaleDateString("id-ID", { month: "long", year: "numeric" })}
                  </h3>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() =>
                      setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() - 1, 1))
                    }
                    aria-label="Bulan Sebelumnya"
                    className="btn btn-secondary p-2 rounded-lg"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={() =>
                      setCalendarDate(new Date(calendarDate.getFullYear(), calendarDate.getMonth() + 1, 1))
                    }
                    aria-label="Bulan Selanjutnya"
                    className="btn btn-secondary p-2 rounded-lg"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>

              {/* Day Headers */}
              <div className="grid grid-cols-7 gap-1 text-center text-xs font-mono font-bold text-[var(--text-muted)] pb-2">
                <span>MIN</span>
                <span>SEN</span>
                <span>SEL</span>
                <span>RAB</span>
                <span>KAM</span>
                <span>JUM</span>
                <span>SAB</span>
              </div>

              {/* Month Grid Cells */}
              <div className="grid grid-cols-7 gap-1 sm:gap-2">
                {(() => {
                  const year = calendarDate.getFullYear();
                  const month = calendarDate.getMonth();
                  const firstDay = new Date(year, month, 1).getDay();
                  const totalDays = new Date(year, month + 1, 0).getDate();

                  const cells = [];
                  // Blanks before day 1
                  for (let i = 0; i < firstDay; i++) {
                    cells.push(
                      <div key={`blank-${i}`} className="min-h-[90px] rounded-xl bg-[var(--bg-muted)]/20 p-2 border border-transparent" />
                    );
                  }

                  // Days in month
                  for (let day = 1; day <= totalDays; day++) {
                    const thisDate = new Date(year, month, day);
                    const dayTasks = filteredTasks.filter((t) => {
                      const td = new Date(t.deadline);
                      return (
                        td.getDate() === day &&
                        td.getMonth() === month &&
                        td.getFullYear() === year
                      );
                    });

                    const isToday =
                      thisDate.getDate() === now.getDate() &&
                      thisDate.getMonth() === now.getMonth() &&
                      thisDate.getFullYear() === now.getFullYear();

                    cells.push(
                      <div
                        key={`day-${day}`}
                        className={`min-h-[95px] rounded-xl p-2 border transition-colors flex flex-col justify-between ${
                          isToday
                            ? "bg-[var(--primary)]/10 border-[var(--primary)] ring-1 ring-[var(--primary)]/30"
                            : "bg-[var(--bg-card)] border-[var(--border-color)]/70 hover:border-[var(--border-color-hover)]"
                        }`}
                      >
                        <div className="flex items-center justify-between text-xs font-mono font-bold mb-1">
                          <span
                            className={`w-6 h-6 flex items-center justify-center rounded-full ${
                              isToday
                                ? "bg-[var(--primary)] text-white"
                                : "text-[var(--text-secondary)]"
                            }`}
                          >
                            {day}
                          </span>
                          {dayTasks.length > 0 && (
                            <span className="text-[10px] text-cyan-400 font-semibold">
                              {dayTasks.length} tugas
                            </span>
                          )}
                        </div>

                        {/* Task badges */}
                        <div className="space-y-1 overflow-y-auto max-h-[70px]">
                          {dayTasks.map((t) => (
                            <button
                              key={t.id}
                              onClick={() => setSelectedDrawerTask(t)}
                              className="w-full text-left truncate px-1.5 py-0.5 rounded text-[10px] font-medium bg-[var(--bg-surface)] hover:bg-[var(--primary)] hover:text-white border border-[var(--border-color)]/60 transition-colors block"
                            >
                              {t.title}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  }

                  return cells;
                })()}
              </div>
            </div>
          )}

          {/* VIEW D: TABLE VIEW */}
          {currentView === "table" && (
            <div className="card overflow-hidden">
              {/* Bulk Actions Floating Bar */}
              {selectedTaskIds.length > 0 && (
                <div className="bg-[var(--primary)] text-white p-3 px-4 flex items-center justify-between text-xs font-medium animate-in fade-in duration-150">
                  <div className="flex items-center gap-2">
                    <CheckSquare size={16} />
                    <span>{selectedTaskIds.length} tugas dipilih</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleBulkStatus("IN_PROGRESS")}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      Tandai In Progress
                    </button>
                    <button
                      onClick={() => handleBulkStatus("COMPLETED")}
                      className="px-2.5 py-1 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
                    >
                      Tandai Selesai
                    </button>
                    {isAdmin && (
                      <button
                        onClick={() => setShowBulkDeleteConfirm(true)}
                        className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-700 transition-colors flex items-center gap-1"
                      >
                        <Trash2 size={13} />
                        <span>Hapus</span>
                      </button>
                    )}
                    <button
                      onClick={() => setSelectedTaskIds([])}
                      className="p-1 hover:bg-white/20 rounded"
                    >
                      <X size={15} />
                    </button>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto">
                <table className="table w-full text-left text-xs">
                  <thead className="bg-[var(--bg-muted)] text-[var(--text-muted)] font-mono border-b border-[var(--border-color)]">
                    <tr>
                      <th className="p-3.5 w-10 text-center">
                        <input
                          type="checkbox"
                          checked={
                            filteredTasks.length > 0 &&
                            selectedTaskIds.length === filteredTasks.length
                          }
                          onChange={(e) => handleSelectAll(e.target.checked)}
                          aria-label="Pilih Semua Tugas"
                          className="rounded border-[var(--border-color)]"
                        />
                      </th>
                      <th className="p-3.5">TUGAS & MATA KULIAH</th>
                      <th className="p-3.5">TIPE</th>
                      <th className="p-3.5">DEADLINE</th>
                      <th className="p-3.5">PRIORITAS</th>
                      <th className="p-3.5">STATUS</th>
                      <th className="p-3.5 text-right">AKSI</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border-color)]/60">
                    {filteredTasks.map((task) => {
                      const cStatus = getComputedStatus(task);
                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-[var(--bg-muted)]/50 transition-colors cursor-pointer"
                          onClick={(e) => {
                            // Don't open drawer if clicked checkbox or link
                            if (
                              (e.target as HTMLElement).tagName === "INPUT" ||
                              (e.target as HTMLElement).closest("a") ||
                              (e.target as HTMLElement).closest("button")
                            ) {
                              return;
                            }
                            setSelectedDrawerTask(task);
                          }}
                        >
                          <td className="p-3.5 text-center">
                            <input
                              type="checkbox"
                              checked={selectedTaskIds.includes(task.id)}
                              onChange={() => handleToggleSelect(task.id)}
                              aria-label={`Pilih tugas ${task.title}`}
                              className="rounded border-[var(--border-color)]"
                            />
                          </td>

                          <td className="p-3.5 max-w-xs">
                            <div className="font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-1">
                              {task.title}
                            </div>
                            <div className="text-[11px] font-mono text-[var(--text-muted)] mt-0.5">
                              {task.subject ? `${task.subject.code} - ${task.subject.name}` : "Tugas Umum"}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--bg-muted)] border border-[var(--border-color)]/50">
                              {task.taskType || "INDIVIDUAL"}
                            </span>
                          </td>

                          <td className="p-3.5 font-mono text-[11px]">
                            <div className="text-[var(--text-primary)]">
                              {formatDate(task.deadline, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                            </div>
                            <div className="text-[10px] text-[var(--text-muted)]">
                              {getRelativeDeadline(task.deadline).text}
                            </div>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                PRIORITY_BADGES[task.priority]?.bg || "bg-slate-500/20"
                              } ${PRIORITY_BADGES[task.priority]?.text || "text-slate-300"}`}
                            >
                              {task.priority}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                cStatus === "COMPLETED"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : cStatus === "OVERDUE"
                                  ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                                  : cStatus === "IN_PROGRESS"
                                  ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30"
                                  : "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {cStatus}
                            </span>
                          </td>

                          <td className="p-3.5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedDrawerTask(task)}
                                aria-label="Lihat Detail Tugas"
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface)]"
                              >
                                <Eye size={15} />
                              </button>
                              <button
                                onClick={() => handleDuplicate(task.id)}
                                aria-label="Duplikat Tugas"
                                title="Duplikat Tugas"
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--bg-surface)]"
                              >
                                <Copy size={15} />
                              </button>
                              <Link
                                href={`/tasks/${task.id}`}
                                aria-label="Buka Halaman Penuh"
                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-cyan-400 hover:bg-[var(--bg-surface)]"
                              >
                                <ExternalLink size={15} />
                              </Link>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      {/* 5. SLIDE-OVER TASK DETAIL DRAWER */}
      {selectedDrawerTask && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedDrawerTask(null)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-lg bg-[var(--bg-surface)] border-l border-[var(--border-color)] h-full overflow-y-auto p-6 space-y-6 shadow-2xl z-10 animate-in slide-in-from-right duration-200">
            {/* Top Close & Breadcrumb */}
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border-color)]">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold text-[var(--primary)] dark:text-cyan-400">
                  {selectedDrawerTask.subject ? selectedDrawerTask.subject.code : "UMUM"}
                </span>
                <span className="text-xs text-[var(--text-muted)]">&bull;</span>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-[var(--bg-muted)] text-[var(--text-secondary)]">
                  {selectedDrawerTask.taskType || "INDIVIDUAL"}
                </span>
              </div>

              <button
                onClick={() => setSelectedDrawerTask(null)}
                aria-label="Tutup Panel"
                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
              >
                <X size={18} />
              </button>
            </div>

            {/* Title & Priority */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    PRIORITY_BADGES[selectedDrawerTask.priority]?.bg
                  } ${PRIORITY_BADGES[selectedDrawerTask.priority]?.text}`}
                >
                  {selectedDrawerTask.priority}
                </span>
                <span className="text-xs font-mono text-[var(--text-muted)]">
                  Deadline: {formatDate(selectedDrawerTask.deadline)}
                </span>
              </div>
              <h2 className="text-xl font-bold font-display text-[var(--text-primary)] leading-snug">
                {selectedDrawerTask.title}
              </h2>
            </div>

            {/* Quick Status Selector */}
            <div className="p-3.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] space-y-2">
              <span className="text-xs font-mono uppercase text-[var(--text-muted)] font-semibold block">
                Ubah Status Tugas:
              </span>
              <div className="grid grid-cols-4 gap-1.5 text-xs">
                {(["TODO", "IN_PROGRESS", "SUBMITTED", "COMPLETED"] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    onClick={() => handleStatusChange(selectedDrawerTask.id, st)}
                    className={`py-1.5 px-2 rounded-lg font-mono text-[11px] font-bold transition-all ${
                      selectedDrawerTask.status === st
                        ? "bg-[var(--primary)] text-white shadow-sm"
                        : "bg-[var(--bg-surface)] text-[var(--text-secondary)] hover:bg-[var(--bg-muted)]"
                    }`}
                  >
                    {st === "IN_PROGRESS" ? "Progress" : st}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono uppercase text-[var(--text-muted)] font-bold">
                Deskripsi & Instruksi:
              </h4>
              <div className="p-4 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)]/70 text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                {selectedDrawerTask.description || "Tidak ada deskripsi rinci untuk tugas ini."}
              </div>
            </div>

            {/* Group members if group task */}
            {selectedDrawerTask.taskType === "GROUP" && (
              <div className="space-y-1.5">
                <h4 className="text-xs font-mono uppercase text-cyan-400 font-bold flex items-center gap-1.5">
                  <Users size={14} />
                  <span>Roster Kelompok: {selectedDrawerTask.groupName || "Tim"}</span>
                </h4>
                <div className="p-3.5 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {selectedDrawerTask.groupMembers || "Anggota belum ditentukan"}
                </div>
              </div>
            )}

            {/* Attachments & Links */}
            {(selectedDrawerTask.attachmentUrl ||
              selectedDrawerTask.submissionUrl ||
              selectedDrawerTask.referenceUrl) && (
              <div className="space-y-2">
                <h4 className="text-xs font-mono uppercase text-[var(--text-muted)] font-bold">
                  Lampiran & Tautan:
                </h4>
                <div className="space-y-1.5">
                  {selectedDrawerTask.attachmentUrl && (
                    <a
                      href={selectedDrawerTask.attachmentUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-cyan-400 hover:border-cyan-400 transition-colors"
                    >
                      <Paperclip size={14} />
                      <span className="truncate">Unduh / Buka Lampiran Tugas</span>
                    </a>
                  )}
                  {selectedDrawerTask.submissionUrl && (
                    <a
                      href={selectedDrawerTask.submissionUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-emerald-400 hover:border-emerald-400 transition-colors"
                    >
                      <ExternalLink size={14} />
                      <span className="truncate">Tautan Pengumpulan (LMS/Drive)</span>
                    </a>
                  )}
                  {selectedDrawerTask.referenceUrl && (
                    <a
                      href={selectedDrawerTask.referenceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--bg-card)] border border-[var(--border-color)] text-xs text-blue-400 hover:border-blue-400 transition-colors"
                    >
                      <BookOpen size={14} />
                      <span className="truncate">Materi Referensi Tambahan</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Action Bar at bottom */}
            <div className="pt-4 border-t border-[var(--border-color)] flex items-center justify-between gap-2">
              <button
                onClick={() => handleDuplicate(selectedDrawerTask.id)}
                className="btn btn-secondary text-xs px-3.5 py-2 flex items-center gap-1.5"
              >
                <Copy size={14} />
                <span>Duplikat</span>
              </button>

              <Link
                href={`/tasks/${selectedDrawerTask.id}`}
                className="btn btn-primary text-xs px-4 py-2 flex items-center gap-1.5"
              >
                <span>Halaman Penuh</span>
                <ChevronRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={showBulkDeleteConfirm}
        onClose={() => setShowBulkDeleteConfirm(false)}
        onConfirm={handleBulkDelete}
        title="Hapus Tugas Terpilih?"
        description={`Anda akan menghapus ${selectedTaskIds.length} tugas secara permanen. Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus Semua"
        variant="danger"
        isLoading={isPending}
      />
    </div>
  );
}
