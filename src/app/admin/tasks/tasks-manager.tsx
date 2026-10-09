"use client";

import React, { useState, useTransition, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  Clock,
  CheckSquare,
  AlertCircle,
  Loader2,
  BookOpen,
  Calendar,
  Link2,
  RotateCcw,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createTaskAction,
  updateTaskAction,
  updateTaskDeadlineAction,
  deleteTaskAction,
  duplicateTaskAction,
} from "@/lib/actions/tasks";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import { formatDate, getRelativeDeadline, cn, isTaskFlexibleOrNoDeadline } from "@/lib/utils";
import { DeadlineBadge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import { SearchInput } from "@/components/ui/search-input";
import { useToast } from "@/components/ui/toast";
import { EmptyState } from "@/components/ui/empty-state";

interface TaskItem {
  id: string;
  subjectId?: string | null;
  title: string;
  description?: string | null;
  taskType?: TaskType;
  deadline: Date | string;
  estimatedTime?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  groupName?: string | null;
  groupMembers?: string | null;
  attachmentUrl?: string | null;
  submissionUrl?: string | null;
  referenceUrl?: string | null;
  notes?: string | null;
  computedStatus?: TaskStatus;
  subject?: {
    id: string;
    code: string;
    name: string;
  } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface TasksManagerProps {
  initialTasks: TaskItem[];
  subjects: SubjectItem[];
}

type DeadlineFilter = "ALL" | "UPCOMING" | "DUE_SOON" | "PAST_DEADLINE" | "NO_DEADLINE";

export function TasksManager({ initialTasks, subjects }: TasksManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [deadlineFilter, setDeadlineFilter] = useState<DeadlineFilter>("ALL");
  const [subjectFilter, setSubjectFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [isNoDeadlineMode, setIsNoDeadlineMode] = useState(false);

  // Form Data (Streamlined for academic assignment tracking)
  const [formData, setFormData] = useState<{
    subjectId: string;
    title: string;
    description: string;
    deadline: string;
    submissionUrl: string;
    referenceUrl: string;
  }>({
    subjectId: subjects[0]?.id || "",
    title: "",
    description: "",
    deadline: "",
    submissionUrl: "",
    referenceUrl: "",
  });

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  // Quick Deadline Modal State
  const [quickDeadlineModalOpen, setQuickDeadlineModalOpen] = useState(false);
  const [quickDeadlineTask, setQuickDeadlineTask] = useState<TaskItem | null>(null);
  const [quickDeadlineValue, setQuickDeadlineValue] = useState("");
  const [quickDeadlineError, setQuickDeadlineError] = useState<string | null>(null);

  // Helper to format Date to local YYYY-MM-DDTHH:mm string without timezone shift
  function toLocalDatetimeString(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, "0");
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  }

  // Calculate preset extensions (+1d, +3d, +7d, +30d, tomorrow night)
  function calculatePresetDate(type: "+1d" | "+3d" | "+7d" | "+30d" | "tomorrow_night", base?: string | Date): string {
    const now = new Date();
    let target: Date;

    if (type === "tomorrow_night") {
      target = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 23, 59, 0, 0);
    } else {
      const days = type === "+1d" ? 1 : type === "+3d" ? 3 : type === "+7d" ? 7 : 30;
      const baseDate = base ? new Date(base) : now;
      const startMs = !isNaN(baseDate.getTime()) && baseDate.getTime() > now.getTime()
        ? baseDate.getTime()
        : now.getTime();
      target = new Date(startMs + days * 24 * 60 * 60 * 1000);
    }

    return toLocalDatetimeString(target);
  }

  // Helper to open create modal
  function openCreateModal() {
    setEditingTask(null);
    setFormError(null);
    setIsNoDeadlineMode(false);

    // Default deadline: 3 days ahead at 23:59
    const defaultDate = new Date();
    defaultDate.setDate(defaultDate.getDate() + 3);
    defaultDate.setHours(23, 59, 0, 0);

    setFormData({
      subjectId: subjects[0]?.id || "",
      title: "",
      description: "",
      deadline: toLocalDatetimeString(defaultDate),
      submissionUrl: "",
      referenceUrl: "",
    });
    setModalOpen(true);
  }

  // Helper to open edit modal
  function openEditModal(task: TaskItem) {
    setEditingTask(task);
    setFormError(null);
    setIsNoDeadlineMode(isTaskFlexibleOrNoDeadline(task));

    const d = new Date(task.deadline);
    const formattedDeadline = !isNaN(d.getTime())
      ? toLocalDatetimeString(d)
      : "";

    setFormData({
      subjectId: task.subjectId || subjects[0]?.id || "",
      title: task.title,
      description: task.description || "",
      deadline: formattedDeadline,
      submissionUrl: task.submissionUrl || "",
      referenceUrl: task.referenceUrl || "",
    });
    setModalOpen(true);
  }

  // Helper to open quick deadline modal
  function openQuickDeadlineModal(task: TaskItem) {
    setQuickDeadlineTask(task);
    const d = new Date(task.deadline);
    setQuickDeadlineValue(!isNaN(d.getTime()) ? toLocalDatetimeString(d) : "");
    setQuickDeadlineError(null);
    setQuickDeadlineModalOpen(true);
  }

  // Handle Quick Deadline Submit
  async function handleQuickDeadlineSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!quickDeadlineTask || !quickDeadlineValue) {
      setQuickDeadlineError("Silakan pilih tanggal dan waktu tenggat baru.");
      return;
    }

    startTransition(async () => {
      try {
        const res = await updateTaskDeadlineAction(quickDeadlineTask.id, quickDeadlineValue);
        if (!res.success) {
          setQuickDeadlineError(res.error || "Gagal memperbarui tenggat waktu.");
          return;
        }

        const isPast = new Date(quickDeadlineValue).getTime() < Date.now();
        const newStatus = quickDeadlineTask.status === TaskStatus.COMPLETED
          ? TaskStatus.COMPLETED
          : isPast
          ? TaskStatus.OVERDUE
          : TaskStatus.UPCOMING;

        setTasks((prev) =>
          prev.map((t) =>
            t.id === quickDeadlineTask.id
              ? {
                  ...t,
                  deadline: new Date(quickDeadlineValue),
                  status: newStatus,
                  computedStatus: newStatus,
                }
              : t
          )
        );

        toast({
          title: isPast ? "Tenggat Waktu Diperbarui" : "Tenggat Waktu Diperpanjang",
          description: isPast
            ? `Tenggat tugas "${quickDeadlineTask.title}" diperbarui (status: sudah lewat).`
            : `Tenggat tugas "${quickDeadlineTask.title}" berhasil diperpanjang.`,
          type: "success",
        });

        setQuickDeadlineModalOpen(false);
        setQuickDeadlineTask(null);
        router.refresh();
      } catch (err: any) {
        setQuickDeadlineError(err.message || "Terjadi kesalahan internal.");
      }
    });
  }

  // Handle Form Submit
  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Judul tugas wajib diisi.");
      return;
    }

    // Auto-fallback if deadline is empty: langsung kasih udah ada gitu aja deh
    const resolvedDeadline = formData.deadline || calculatePresetDate("+7d");

    startTransition(async () => {
      try {
        const isPast = new Date(resolvedDeadline).getTime() < Date.now();
        let resolvedStatus: TaskStatus = TaskStatus.UPCOMING;
        if (editingTask) {
          resolvedStatus = editingTask.status === TaskStatus.COMPLETED
            ? TaskStatus.COMPLETED
            : isPast
            ? TaskStatus.OVERDUE
            : TaskStatus.UPCOMING;
        } else {
          resolvedStatus = isPast ? TaskStatus.OVERDUE : TaskStatus.UPCOMING;
        }

        let notesPayload = editingTask?.notes || null;
        if (isNoDeadlineMode && !notesPayload?.includes("[Tanpa Deadline]")) {
          notesPayload = notesPayload ? `${notesPayload} [Tanpa Deadline]` : "[Tanpa Deadline] Tugas mandiri fleksibel.";
        }

        const payload: any = {
          title: formData.title.trim(),
          subjectId: formData.subjectId || null,
          deadline: resolvedDeadline,
          description: formData.description.trim() || null,
          submissionUrl: formData.submissionUrl.trim() || null,
          referenceUrl: formData.referenceUrl.trim() || null,
          notes: notesPayload,
          taskType: editingTask?.taskType || TaskType.INDIVIDUAL,
          priority: editingTask?.priority || TaskPriority.MEDIUM,
          status: resolvedStatus,
        };

        if (editingTask) {
          const res = await updateTaskAction(editingTask.id, payload);
          if (!res.success) {
            setFormError(res.error || "Gagal memperbarui tugas.");
            return;
          }
          setTasks((prev) =>
            prev.map((t) =>
              t.id === editingTask.id
                ? {
                    ...t,
                    ...payload,
                    computedStatus: resolvedStatus,
                    subject: subjects.find((s) => s.id === payload.subjectId),
                  }
                : t
            )
          );
          toast({
            title: "Tugas Diperbarui",
            description: `Tugas "${formData.title}" berhasil disimpan.`,
            type: "success",
          });
        } else {
          const res = await createTaskAction(payload);
          if (!res.success) {
            setFormError(res.error || "Gagal membuat tugas.");
            return;
          }
          if (res.data) {
            setTasks((prev) => [res.data, ...prev]);
          }
          toast({
            title: "Tugas Berhasil Dibuat",
            description: `Tugas "${formData.title}" telah ditambahkan ke sistem.`,
            type: "success",
          });
        }

        setModalOpen(false);
        router.refresh();
      } catch (err: any) {
        setFormError(err.message || "Terjadi kesalahan internal.");
      }
    });
  }

  // Handle Duplicate Task
  async function handleDuplicate(task: TaskItem) {
    startTransition(async () => {
      try {
        const res = await duplicateTaskAction(task.id);
        if (!res.success) {
          toast({
            title: "Gagal Menduplikat",
            description: res.error || "Tidak dapat menduplikat tugas.",
            type: "error",
          });
          return;
        }
        if (res.data) {
          setTasks((prev) => [res.data, ...prev]);
        }
        toast({
          title: "Tugas Diduplikat",
          description: `Salinan tugas "${task.title}" telah ditambahkan.`,
          type: "success",
        });
        router.refresh();
      } catch (err: any) {
        toast({
          title: "Gagal Menduplikat",
          description: err.message,
          type: "error",
        });
      }
    });
  }

  // Handle Delete Confirmation
  async function handleDeleteConfirm() {
    if (!deletingTask) return;
    const targetId = deletingTask.id;

    startTransition(async () => {
      try {
        const res = await deleteTaskAction(targetId);
        if (!res.success) {
          toast({
            title: "Gagal Menghapus",
            description: res.error || "Tidak dapat menghapus tugas.",
            type: "error",
          });
          return;
        }
        setTasks((prev) => prev.filter((t) => t.id !== targetId));
        toast({
          title: "Tugas Dihapus",
          description: `Tugas "${deletingTask.title}" telah dihapus.`,
          type: "success",
        });
        setDeleteDialogOpen(false);
        setDeletingTask(null);
        router.refresh();
      } catch (err: any) {
        toast({
          title: "Gagal Menghapus",
          description: err.message,
          type: "error",
        });
      }
    });
  }

  // Filter tasks based on deadline, subject, and search query
  const filteredTasks = useMemo(() => {
    const now = new Date().getTime();

    return tasks.filter((t) => {
      const isFlexible = isTaskFlexibleOrNoDeadline(t);
      const taskDeadline = new Date(t.deadline).getTime();
      const diffMs = taskDeadline - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      // 1. Deadline Filter
      if (deadlineFilter === "NO_DEADLINE") return isFlexible;
      if (deadlineFilter === "DUE_SOON" && (diffMs < 0 || diffHours > 48 || isFlexible)) return false;
      if (deadlineFilter === "UPCOMING" && (diffHours <= 48 || isFlexible)) return false;
      if (deadlineFilter === "PAST_DEADLINE" && (diffMs >= 0 || isFlexible)) return false;

      // 2. Subject Filter
      if (subjectFilter !== "ALL" && t.subjectId !== subjectFilter) {
        return false;
      }

      // 3. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(q);
        const matchDesc = t.description?.toLowerCase().includes(q);
        const matchSubject =
          t.subject?.name.toLowerCase().includes(q) ||
          t.subject?.code.toLowerCase().includes(q);
        return Boolean(matchTitle || matchDesc || matchSubject);
      }

      return true;
    });
  }, [tasks, deadlineFilter, subjectFilter, searchQuery]);

  // Counts for deadline chips
  const counts = useMemo(() => {
    const now = new Date().getTime();
    let upcoming = 0;
    let dueSoon = 0;
    let past = 0;
    let noDeadline = 0;

    tasks.forEach((t) => {
      const isFlexible = isTaskFlexibleOrNoDeadline(t);
      if (isFlexible) {
        noDeadline++;
        return;
      }

      const taskDeadline = new Date(t.deadline).getTime();
      const diffMs = taskDeadline - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffMs < 0) {
        past++;
      } else if (diffHours <= 48) {
        dueSoon++;
      } else {
        upcoming++;
      }
    });

    return { all: tasks.length, upcoming, dueSoon, past, noDeadline };
  }, [tasks]);

  // Subject options for Combobox
  const subjectOptions = useMemo(() => {
    return subjects.map((s) => ({
      value: s.id,
      label: s.name,
      subLabel: s.code,
    }));
  }, [subjects]);

  const activeSubject = subjects.find((s) => s.id === subjectFilter);
  const hasActiveFilters =
    deadlineFilter !== "ALL" || subjectFilter !== "ALL" || Boolean(searchQuery);

  return (
    <div className="space-y-5">
      {/* 1. Header Toolbar Controls */}
      <div className="flex flex-col gap-4">
        {/* Top Row: Search + Subject Selector + Create Task Button */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="flex flex-1 items-center gap-2.5 flex-wrap">
            {/* Search Input */}
            <div className="flex-1 min-w-[220px] max-w-md">
              <SearchInput
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search tasks, course code, instructions..."
              />
            </div>

            {/* Course Filter Dropdown */}
            <div className="w-full sm:w-60">
              <select
                value={subjectFilter}
                onChange={(e) => setSubjectFilter(e.target.value)}
                className="w-full h-10 px-3.5 py-2 rounded-lg text-xs sm:text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 cursor-pointer shadow-2xs"
              >
                <option value="ALL">Semua Mata Kuliah</option>
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="h-10 px-4 rounded-lg font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Create Task</span>
          </button>
        </div>

        {/* Bottom Row: Quick Deadline Filter Tabs */}
        <div className="flex items-center justify-between gap-3 flex-wrap border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setDeadlineFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer",
                deadlineFilter === "ALL"
                  ? "bg-slate-900 text-white dark:bg-blue-600 dark:text-white"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              Semua Tugas ({counts.all})
            </button>

            <button
              type="button"
              onClick={() => setDeadlineFilter("DUE_SOON")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer",
                deadlineFilter === "DUE_SOON"
                  ? "bg-amber-500 text-white dark:bg-amber-500/20 dark:text-amber-300 dark:border dark:border-amber-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              Hari Ini / Besok ({counts.dueSoon})
            </button>

            <button
              type="button"
              onClick={() => setDeadlineFilter("UPCOMING")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer",
                deadlineFilter === "UPCOMING"
                  ? "bg-blue-600 text-white dark:bg-blue-500/20 dark:text-blue-300 dark:border dark:border-blue-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              Mendatang ({counts.upcoming})
            </button>

            <button
              type="button"
              onClick={() => setDeadlineFilter("NO_DEADLINE")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer",
                deadlineFilter === "NO_DEADLINE"
                  ? "bg-cyan-600 text-white dark:bg-cyan-500/20 dark:text-cyan-300 dark:border dark:border-cyan-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              Tanpa Tenggat ({counts.noDeadline})
            </button>

            <button
              type="button"
              onClick={() => setDeadlineFilter("PAST_DEADLINE")}
              className={cn(
                "px-3 py-1.5 rounded-lg font-medium transition-all whitespace-nowrap cursor-pointer",
                deadlineFilter === "PAST_DEADLINE"
                  ? "bg-rose-500 text-white dark:bg-rose-500/20 dark:text-rose-300 dark:border dark:border-rose-500/30 font-semibold"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5"
              )}
            >
              Lewat Deadline ({counts.past})
            </button>
          </div>

          {/* Active Filter Clear Action */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={() => {
                setDeadlineFilter("ALL");
                setSubjectFilter("ALL");
                setSearchQuery("");
              }}
              className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
            >
              <RotateCcw size={12} />
              <span>Reset filter</span>
            </button>
          )}
        </div>
      </div>

      {/* 2. Tasks Table Container */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] shadow-xs overflow-hidden transition-colors">
        {tasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-7 h-7 stroke-[1.75]" />}
            title="No tasks yet"
            description="Add assignments and deadlines to keep the class organized."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="btn btn-primary btn-sm flex items-center gap-1.5"
              >
                <Plus size={14} />
                <span>+ Add Task</span>
              </button>
            }
          />
        ) : filteredTasks.length === 0 ? (
          <EmptyState
            icon={<CheckSquare className="w-7 h-7 stroke-[1.75]" />}
            title="No tasks found"
            description={
              hasActiveFilters
                ? "Try resetting your search query, subject, or deadline filter."
                : "No tasks found matching your filter."
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-slate-50/90 dark:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs font-semibold uppercase tracking-wider select-none">
                  <th className="py-3.5 px-5">Informasi Tugas & Instruksi</th>
                  <th className="py-3.5 px-5">Mata Kuliah</th>
                  <th className="py-3.5 px-5">Deadline</th>
                  <th className="py-3.5 px-5">LMS / Sumber</th>
                  <th className="py-3.5 px-5 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#0c1427]">
                {filteredTasks.map((task) => {
                  const relativeInfo = getRelativeDeadline(task.deadline);
                  const lmsUrl = task.submissionUrl;
                  const resourceUrl = task.referenceUrl || task.attachmentUrl;

                  return (
                    <tr
                      key={task.id}
                      className="hover:bg-slate-50/80 dark:hover:bg-white/[0.025] transition-colors"
                    >
                      {/* Column 1: Task Title & Instructions */}
                      <td className="py-4 px-5 max-w-md">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900 dark:text-white text-sm leading-snug">
                            {task.title}
                          </div>
                          {task.description && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}
                          {resourceUrl && (
                            <a
                              href={resourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-cyan-600 dark:text-cyan-400 hover:underline pt-0.5"
                            >
                              <Link2 size={11} />
                              <span>Lihat Materi Referensi</span>
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Column 2: Subject / Course */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {task.subject ? (
                          <div className="space-y-0.5">
                            <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/25">
                              {task.subject.code}
                            </span>
                            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 mt-1 max-w-[180px] truncate">
                              {task.subject.name}
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400 italic">
                            Umum / Non-MK
                          </span>
                        )}
                      </td>

                      {/* Column 3: Deadline & Visual Indicator */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5 font-medium text-slate-900 dark:text-slate-200 text-xs">
                            <Calendar size={13} className="text-slate-400" />
                            <span>{isTaskFlexibleOrNoDeadline(task) ? "Fleksibel (Tanpa Tenggat)" : formatDate(task.deadline)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <DeadlineBadge deadline={task.deadline} isNoDeadline={isTaskFlexibleOrNoDeadline(task)} />
                            <button
                              type="button"
                              onClick={() => openQuickDeadlineModal(task)}
                              className="inline-flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 dark:text-cyan-400 dark:hover:text-cyan-300 hover:underline cursor-pointer transition-colors"
                              title="Ubah atau perpanjang tenggat waktu tugas"
                            >
                              <Clock size={11} />
                              <span>Ubah Tenggat</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Column 4: LMS Link */}
                      <td className="py-4 px-5 whitespace-nowrap">
                        {lmsUrl ? (
                          <a
                            href={lmsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 dark:bg-cyan-500/15 dark:hover:bg-cyan-500/25 dark:text-cyan-300 dark:border-cyan-500/30 transition-colors shadow-2xs"
                          >
                            <span>Open LMS</span>
                            <ExternalLink size={12} />
                          </a>
                        ) : (
                          <span className="text-xs text-slate-400 dark:text-slate-500">
                            —
                          </span>
                        )}
                      </td>

                      {/* Column 5: Actions */}
                      <td className="py-4 px-5 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1">
                          {/* Public View link */}
                          <Link
                            href={`/tasks/${task.id}`}
                            target="_blank"
                            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                            title="Buka halaman mahasiswa"
                          >
                            <ExternalLink size={15} />
                          </Link>

                          {/* Quick Deadline button */}
                          <button
                            type="button"
                            onClick={() => openQuickDeadlineModal(task)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-blue-50 dark:hover:bg-cyan-500/10 transition-colors cursor-pointer"
                            title="Ubah / Perpanjang tenggat waktu"
                          >
                            <Clock size={15} />
                          </button>

                          {/* Duplicate button */}
                          <button
                            type="button"
                            onClick={() => handleDuplicate(task)}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Duplikat tugas"
                          >
                            <Copy size={15} />
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="p-2 rounded-lg text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
                            title="Edit tugas"
                          >
                            <Edit2 size={15} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              setDeletingTask(task);
                              setDeleteDialogOpen(true);
                            }}
                            className="p-2 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
                            title="Hapus tugas"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 3. Create & Edit Task Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Tugas Akademik" : "Tambah Tugas Baru"}
        description="Isi detail penugasan mahasiswa, mata kuliah, deadline, serta tautan LMS."
        maxWidth="lg"
        footer={
          <>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary text-sm font-medium px-4 py-2"
              disabled={isPending}
            >
              Batal
            </button>
            <button
              type="submit"
              form="task-form"
              disabled={isPending}
              className="btn btn-primary text-sm font-medium px-5 py-2 flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{editingTask ? "Simpan Perubahan" : "Buat Tugas"}</span>
            </button>
          </>
        }
      >
        <form id="task-form" onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* Task Title */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Judul Tugas <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Contoh: Membuat ERD Sistem Informasi Basis Data"
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          {/* Course Selector & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Mata Kuliah <span className="text-rose-500">*</span>
              </label>
              <Combobox
                options={subjectOptions}
                value={formData.subjectId}
                onChange={(val) => setFormData({ ...formData, subjectId: val })}
                placeholder="Pilih Mata Kuliah..."
                searchPlaceholder="Cari kode atau nama MK..."
                emptyText="Mata kuliah tidak ditemukan."
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                  Deadline & Waktu
                </label>
                {formData.deadline && new Date(formData.deadline).getTime() < Date.now() ? (
                  <span className="text-[11px] font-semibold text-rose-500 dark:text-rose-400 flex items-center gap-1">
                    <AlertCircle size={12} /> Sudah lewat
                  </span>
                ) : isNoDeadlineMode ? (
                  <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                    <Sparkles size={12} /> Fleksibel
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <Sparkles size={12} /> Aktif
                  </span>
                )}
              </div>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) =>
                  setFormData({ ...formData, deadline: e.target.value })
                }
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
              {/* Quick preset chips */}
              <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px]">
                <span className="text-slate-400 dark:text-slate-500 text-[10px] font-medium mr-1">Preset:</span>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, deadline: calculatePresetDate("+1d", prev.deadline) }));
                    setIsNoDeadlineMode(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer"
                >
                  +1 Hari
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, deadline: calculatePresetDate("+3d", prev.deadline) }));
                    setIsNoDeadlineMode(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, deadline: calculatePresetDate("+7d", prev.deadline) }));
                    setIsNoDeadlineMode(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer"
                >
                  +1 Minggu
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const futureDate = calculatePresetDate("+30d");
                    setFormData((prev) => ({
                      ...prev,
                      deadline: futureDate,
                      description: prev.description || "Tugas mandiri tanpa batasan tenggat waktu pengumpulan tertentu.",
                    }));
                    setIsNoDeadlineMode(true);
                  }}
                  className="px-2 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/40 hover:bg-cyan-100 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 font-semibold transition-colors cursor-pointer"
                >
                  Tanpa Deadline (Fleksibel)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, deadline: calculatePresetDate("tomorrow_night") }));
                    setIsNoDeadlineMode(false);
                  }}
                  className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-cyan-500/10 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-cyan-400 border border-slate-200 dark:border-slate-700 font-medium transition-colors cursor-pointer"
                >
                  Besok 23:59
                </button>
              </div>

              {/* Checkbox for Tanpa Tenggat Khusus */}
              <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isNoDeadlineMode}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setIsNoDeadlineMode(checked);
                    if (checked && !formData.deadline) {
                      setFormData((prev) => ({
                        ...prev,
                        deadline: calculatePresetDate("+30d"),
                      }));
                    }
                  }}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                />
                <span className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">
                  Tugas Tanpa Tenggat Khusus (Atur tanggal fleksibel otomatis)
                </span>
              </label>
            </div>
          </div>

          {/* Description & Instructions */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Instruksi / Catatan Tugas
            </label>
            <textarea
              rows={3}
              placeholder="Instruksi pengerjaan, format berkas, batasan materi, atau catatan penting..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          {/* LMS Link & Resource Link */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Tautan LMS (Telkom / Classroom)
              </label>
              <input
                type="url"
                placeholder="https://lms.telkomuniversity.ac.id/..."
                value={formData.submissionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, submissionUrl: e.target.value })
                }
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Materi Referensi (Opsional)
              </label>
              <input
                type="url"
                placeholder="https://drive.google.com/... atau tautan materi"
                value={formData.referenceUrl}
                onChange={(e) =>
                  setFormData({ ...formData, referenceUrl: e.target.value })
                }
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>
        </form>
      </Modal>

      {/* 4. Quick Deadline Update Modal */}
      <Modal
        isOpen={quickDeadlineModalOpen}
        onClose={() => {
          setQuickDeadlineModalOpen(false);
          setQuickDeadlineTask(null);
        }}
        title="Ubah Tenggat Waktu Tugas"
        description="Perpanjang batas waktu pengerjaan tugas atau atur ulang tenggat waktu."
        maxWidth="md"
        footer={
          <>
            <button
              type="button"
              onClick={() => {
                setQuickDeadlineModalOpen(false);
                setQuickDeadlineTask(null);
              }}
              className="btn btn-secondary text-sm font-medium px-4 py-2"
              disabled={isPending}
            >
              Batal
            </button>
            <button
              type="button"
              onClick={handleQuickDeadlineSubmit}
              disabled={isPending}
              className="btn btn-primary text-sm font-medium px-5 py-2 flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>Simpan Tenggat Waktu</span>
            </button>
          </>
        }
      >
        {quickDeadlineTask && (
          <div className="space-y-4">
            {quickDeadlineError && (
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle size={14} className="shrink-0" />
                <span>{quickDeadlineError}</span>
              </div>
            )}

            {/* Task Info summary */}
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                {quickDeadlineTask.subject ? (
                  <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/25">
                    {quickDeadlineTask.subject.code}
                  </span>
                ) : (
                  <span className="text-[10px] font-mono text-slate-500">UMUM</span>
                )}
                <span className="text-xs font-semibold text-slate-900 dark:text-white line-clamp-1">
                  {quickDeadlineTask.title}
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 pt-1 flex-wrap">
                <span>Tenggat saat ini:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  {formatDate(quickDeadlineTask.deadline)}
                </span>
                <DeadlineBadge deadline={quickDeadlineTask.deadline} />
              </div>
            </div>

            {/* Current overdue notice if deadline passed */}
            {new Date(quickDeadlineTask.deadline).getTime() < Date.now() && (
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <div>
                  <p className="font-semibold">Tugas Sudah Melewati Tenggat (Sudah Lewat)</p>
                  <p className="text-[11px] text-amber-700 dark:text-amber-400/90 mt-0.5">
                    Pilih tanggal di masa depan menggunakan tombol preset di bawah untuk mengaktifkan kembali tugas ini bagi mahasiswa.
                  </p>
                </div>
              </div>
            )}

            {/* Input Datetime */}
            <div>
              <label className="block text-xs font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Tenggat Waktu Baru <span className="text-rose-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={quickDeadlineValue}
                onChange={(e) => setQuickDeadlineValue(e.target.value)}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            {/* Quick Extension Presets */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                Pilihan Cepat Perpanjang Tenggat:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDeadlineValue(calculatePresetDate("+1d", quickDeadlineTask.deadline))}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-cyan-500/10 text-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  +1 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadlineValue(calculatePresetDate("+3d", quickDeadlineTask.deadline))}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-cyan-500/10 text-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  +3 Hari
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadlineValue(calculatePresetDate("+7d", quickDeadlineTask.deadline))}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-cyan-500/10 text-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  +1 Minggu
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadlineValue(calculatePresetDate("+30d", quickDeadlineTask.deadline))}
                  className="px-2.5 py-2 rounded-lg bg-cyan-50 hover:bg-cyan-100 dark:bg-cyan-950/40 dark:hover:bg-cyan-900/50 text-cyan-700 dark:text-cyan-300 border border-cyan-300 dark:border-cyan-800 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  +30 Hari (Fleksibel)
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDeadlineValue(calculatePresetDate("tomorrow_night"))}
                  className="px-2.5 py-2 rounded-lg bg-slate-100 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-cyan-500/10 text-slate-800 hover:text-blue-700 dark:text-slate-200 dark:hover:text-cyan-300 border border-slate-200 dark:border-slate-700 text-xs font-semibold transition-colors cursor-pointer text-center"
                >
                  Besok 23:59
                </button>
              </div>
            </div>

            {/* Status change indicator preview */}
            {quickDeadlineValue && (
              <div className="pt-1">
                {new Date(quickDeadlineValue).getTime() < Date.now() ? (
                  <div className="p-2.5 rounded-lg bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle size={14} className="shrink-0" />
                    <span>
                      Tenggat baru di masa lalu. Status tugas akan menjadi <strong>OVERDUE (Sudah Lewat)</strong>.
                    </span>
                  </div>
                ) : (
                  <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-xs text-emerald-700 dark:text-emerald-400 flex items-center gap-2">
                    <Sparkles size={14} className="shrink-0 text-emerald-600 dark:text-emerald-400" />
                    <span>
                      Tenggat baru di masa depan. Status tugas akan menjadi <strong>UPCOMING (Aktif Kembali)</strong>.
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* 5. Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeletingTask(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Hapus Tugas Akademik"
        message={`Apakah Anda yakin ingin menghapus tugas "${deletingTask?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        isDeleting={isPending}
      />
    </div>
  );
}
