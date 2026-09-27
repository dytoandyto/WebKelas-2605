"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Copy,
  ExternalLink,
  CheckCircle2,
  Clock,
  Search,
  CheckSquare,
  AlertCircle,
  Loader2,
  Users,
  User,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/lib/actions/tasks";
import { TaskStatus, TaskPriority, TaskType } from "@prisma/client";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";

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

const STATUS_BADGE: Record<TaskStatus, { label: string; className: string }> = {
  TODO: { label: "To Do", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20" },
  IN_PROGRESS: { label: "In Progress", className: "bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20" },
  UPCOMING: { label: "Upcoming", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
  DUE_SOON: { label: "Due Soon", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
  OVERDUE: { label: "Overdue", className: "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20" },
  SUBMITTED: { label: "Submitted", className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" },
  COMPLETED: { label: "Completed", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20" },
};

const PRIORITY_BADGE: Record<TaskPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20" },
  MEDIUM: { label: "Medium", className: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20" },
  HIGH: { label: "High", className: "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20" },
  URGENT: { label: "Urgent", className: "bg-rose-500/15 text-rose-600 dark:text-rose-400 font-bold border border-rose-500/30" },
};

const TYPE_BADGE: Record<TaskType, { label: string; icon: any; className: string }> = {
  INDIVIDUAL: { label: "Individual", icon: User, className: "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20" },
  GROUP: { label: "Group", icon: Users, className: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20" },
  ADDITIONAL: { label: "Additional", icon: Sparkles, className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" },
};

export function TasksManager({ initialTasks, subjects }: TasksManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [typeFilter, setTypeFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState<{
    subjectId: string;
    title: string;
    description: string;
    taskType: TaskType;
    deadline: string;
    estimatedTime: string;
    priority: TaskPriority;
    status: TaskStatus;
    groupName: string;
    groupMembers: string;
    submissionUrl: string;
    referenceUrl: string;
    notes: string;
  }>({
    subjectId: subjects[0]?.id || "",
    title: "",
    description: "",
    taskType: TaskType.INDIVIDUAL,
    deadline: "",
    estimatedTime: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.UPCOMING,
    groupName: "",
    groupMembers: "",
    submissionUrl: "",
    referenceUrl: "",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  function openCreateModal() {
    setEditingTask(null);
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 0, 0);

    setFormData({
      subjectId: subjects[0]?.id || "",
      title: "",
      description: "",
      taskType: TaskType.INDIVIDUAL,
      deadline: targetDate.toISOString().slice(0, 16),
      estimatedTime: "2-3 hours",
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.UPCOMING,
      groupName: "",
      groupMembers: "",
      submissionUrl: "",
      referenceUrl: "",
      notes: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(task: TaskItem) {
    setEditingTask(task);
    const d = new Date(task.deadline);
    const deadlineString = !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : "";

    setFormData({
      subjectId: task.subjectId || "",
      title: task.title,
      description: task.description || "",
      taskType: task.taskType || TaskType.INDIVIDUAL,
      deadline: deadlineString,
      estimatedTime: task.estimatedTime || "",
      priority: task.priority || TaskPriority.MEDIUM,
      status: task.status || TaskStatus.UPCOMING,
      groupName: task.groupName || "",
      groupMembers: task.groupMembers || "",
      submissionUrl: task.submissionUrl || "",
      referenceUrl: task.referenceUrl || "",
      notes: task.notes || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function handleDuplicate(task: TaskItem) {
    setEditingTask(null);
    const d = new Date(task.deadline);
    const deadlineString = !isNaN(d.getTime()) ? d.toISOString().slice(0, 16) : "";

    setFormData({
      subjectId: task.subjectId || "",
      title: `${task.title} (Copy)`,
      description: task.description || "",
      taskType: task.taskType || TaskType.INDIVIDUAL,
      deadline: deadlineString,
      estimatedTime: task.estimatedTime || "",
      priority: task.priority || TaskPriority.MEDIUM,
      status: TaskStatus.UPCOMING,
      groupName: task.groupName || "",
      groupMembers: task.groupMembers || "",
      submissionUrl: task.submissionUrl || "",
      referenceUrl: task.referenceUrl || "",
      notes: task.notes || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(task: TaskItem) {
    setDeletingTask(task);
    setDeleteDialogOpen(true);
  }

  async function handleToggleComplete(task: TaskItem) {
    const newStatus =
      task.status === TaskStatus.COMPLETED
        ? TaskStatus.UPCOMING
        : TaskStatus.COMPLETED;

    startTransition(async () => {
      const res = await updateTaskAction(task.id, {
        subjectId: task.subjectId || null,
        title: task.title,
        description: task.description,
        taskType: task.taskType || TaskType.INDIVIDUAL,
        deadline: new Date(task.deadline).toISOString(),
        priority: task.priority,
        status: newStatus,
        groupName: task.groupName,
        groupMembers: task.groupMembers,
        submissionUrl: task.submissionUrl,
        referenceUrl: task.referenceUrl,
        notes: task.notes,
      });

      if (res.success) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === task.id
              ? { ...t, status: newStatus, computedStatus: newStatus }
              : t
          )
        );
      }
    });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (formData.taskType !== TaskType.ADDITIONAL && !formData.subjectId) {
      setFormError("Please select a subject for individual and group assignments.");
      return;
    }
    if (!formData.title.trim()) {
      setFormError("Task title is required.");
      return;
    }
    if (!formData.deadline) {
      setFormError("Deadline is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        subjectId: formData.subjectId || null,
        deadline: new Date(formData.deadline).toISOString(),
      };

      if (editingTask) {
        const res = await updateTaskAction(editingTask.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update task.");
        } else {
          const selectedSub = subjects.find((s) => s.id === formData.subjectId) || null;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === editingTask.id
                ? {
                    ...t,
                    ...formData,
                    deadline: new Date(formData.deadline),
                    subject: selectedSub,
                  }
                : t
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createTaskAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create task.");
        } else {
          const selectedSub = subjects.find((s) => s.id === formData.subjectId) || null;
          const newTask: TaskItem = {
            id: (res.data as any)?.id || `temp-${Date.now()}`,
            ...formData,
            deadline: new Date(formData.deadline),
            subject: selectedSub,
          };
          setTasks((prev) => [newTask, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingTask) return;
    const res = await deleteTaskAction(deletingTask.id);
    if (res.success) {
      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
    }
  }

  const filteredTasks = tasks.filter((t) => {
    const currentStatus = t.computedStatus || t.status;
    if (statusFilter !== "ALL" && currentStatus !== statusFilter) return false;
    if (typeFilter !== "ALL" && (t.taskType || TaskType.INDIVIDUAL) !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = t.subject?.name.toLowerCase().includes(q) || t.subject?.code.toLowerCase().includes(q);
      const matchGroup = t.groupName?.toLowerCase().includes(q) || t.groupMembers?.toLowerCase().includes(q);
      return matchTitle || matchSubject || matchGroup;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Status Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              type="button"
              onClick={() => setStatusFilter("ALL")}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                statusFilter === "ALL"
                  ? "bg-brand-600 text-white shadow-xs"
                  : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
              )}
            >
              All Statuses ({tasks.length})
            </button>
            {Object.entries(STATUS_BADGE).map(([statusKey, badge]) => {
              const count = tasks.filter(
                (t) => (t.computedStatus || t.status) === statusKey
              ).length;
              return (
                <button
                  key={statusKey}
                  type="button"
                  onClick={() => setStatusFilter(statusKey)}
                  className={cn(
                    "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                    statusFilter === statusKey
                      ? "bg-brand-600 text-white shadow-xs"
                      : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
                  )}
                >
                  {badge.label} {count > 0 && `(${count})`}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* Search Box */}
            <div className="relative flex-1 sm:w-64">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted"
              />
              <input
                type="text"
                placeholder="Search tasks, subjects, groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="form-input text-xs pl-8 pr-3 py-1.5 w-full bg-surface border-border text-text-primary placeholder:text-text-muted"
              />
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm whitespace-nowrap"
            >
              <Plus size={16} />
              <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* Task Type Filters */}
        <div className="flex items-center gap-1.5 text-xs text-text-muted">
          <span className="font-medium mr-1">Type:</span>
          <button
            type="button"
            onClick={() => setTypeFilter("ALL")}
            className={cn(
              "px-2.5 py-1 rounded-md transition-colors",
              typeFilter === "ALL"
                ? "bg-brand-500/15 text-brand-600 dark:text-brand-400 font-semibold border border-brand-500/30"
                : "text-text-secondary hover:text-text-primary"
            )}
          >
            All Types
          </button>
          {Object.entries(TYPE_BADGE).map(([typeKey, badge]) => {
            const Icon = badge.icon;
            return (
              <button
                key={typeKey}
                type="button"
                onClick={() => setTypeFilter(typeKey)}
                className={cn(
                  "px-2.5 py-1 rounded-md flex items-center gap-1.5 transition-colors",
                  typeFilter === typeKey
                    ? `${badge.className} font-semibold`
                    : "text-text-secondary hover:text-text-primary"
                )}
              >
                <Icon size={12} />
                <span>{badge.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tasks Table */}
      <div className="card border border-border shadow-xs overflow-hidden bg-card">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-text-primary">No tasks found</p>
            <p className="text-xs text-text-muted mt-1">
              Try adjusting your filter or create a new assignment task.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Task Title & Details</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredTasks.map((task) => {
                  const displayStatus = task.computedStatus || task.status;
                  const st = STATUS_BADGE[displayStatus] || STATUS_BADGE.UPCOMING;
                  const pr = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.MEDIUM;
                  const tp = TYPE_BADGE[task.taskType || TaskType.INDIVIDUAL] || TYPE_BADGE.INDIVIDUAL;
                  const TypeIcon = tp.icon;
                  const isCompleted = task.status === TaskStatus.COMPLETED;

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "hover:bg-surface/50 transition-colors",
                        isCompleted && "opacity-60 bg-surface/20"
                      )}
                    >
                      <td className="py-4 px-6">
                        <button
                          type="button"
                          onClick={() => handleToggleComplete(task)}
                          className="flex items-center gap-2 group text-left"
                          title="Click to toggle completed status"
                        >
                          <CheckCircle2
                            size={18}
                            className={cn(
                              "transition-colors shrink-0",
                              isCompleted
                                ? "text-emerald-500 fill-emerald-500/20"
                                : "text-text-muted/40 group-hover:text-emerald-400"
                            )}
                          />
                          <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium whitespace-nowrap", st.className)}>
                            {st.label}
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className={cn("px-2 py-0.5 rounded text-[10px] font-semibold flex items-center gap-1", tp.className)}>
                            <TypeIcon size={10} />
                            {tp.label}
                          </span>
                          {task.groupName && (
                            <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded">
                              {task.groupName}
                            </span>
                          )}
                        </div>
                        <div
                          className={cn(
                            "font-semibold text-text-primary leading-snug",
                            isCompleted && "line-through text-text-muted"
                          )}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-text-muted line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                        {task.groupMembers && (
                          <p className="text-[11px] text-text-muted mt-1 flex items-center gap-1">
                            <Users size={11} className="shrink-0" />
                            <span>Anggota: {task.groupMembers}</span>
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        {task.subject ? (
                          <>
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                              {task.subject.code}
                            </span>
                            <p className="text-xs text-text-secondary mt-1 truncate max-w-xs font-medium">
                              {task.subject.name}
                            </p>
                          </>
                        ) : (
                          <span className="text-xs text-text-muted italic">Non-course / General</span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-text-primary text-xs">
                          {formatDate(task.deadline)}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-text-muted mt-0.5">
                          <Clock size={11} />
                          <span>{getRelativeDeadline(task.deadline).text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("px-2 py-0.5 rounded text-[11px] font-medium", pr.className)}>
                          {pr.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link
                            href={`/tasks/${task.id}`}
                            target="_blank"
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                            title="View public task page"
                          >
                            <ExternalLink size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDuplicate(task)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                            title="Duplicate Task"
                          >
                            <Copy size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(task)}
                            className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-surface transition-colors"
                            title="Delete"
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

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTask ? "Edit Assignment Task" : "Create Assignment Task"}
        description="Set assignment requirements, course relation, group specifications, and submission deadlines."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
                Task Type *
              </label>
              <select
                value={formData.taskType}
                onChange={(e) =>
                  setFormData({ ...formData, taskType: e.target.value as TaskType })
                }
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
                required
              >
                <option value={TaskType.INDIVIDUAL}>Individual Assignment</option>
                <option value={TaskType.GROUP}>Group Project / Assignment</option>
                <option value={TaskType.ADDITIONAL}>Additional / Class Activity</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
                Subject {formData.taskType === TaskType.ADDITIONAL ? "(Optional)" : "*"}
              </label>
              <select
                value={formData.subjectId}
                onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
                required={formData.taskType !== TaskType.ADDITIONAL}
              >
                {formData.taskType === TaskType.ADDITIONAL && (
                  <option value="">(None / General Activity)</option>
                )}
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
              Task Title *
            </label>
            <input
              type="text"
              placeholder="e.g. Tugas Praktikum 03: Algoritma Sorting & Complexity"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
              required
            />
          </div>

          {/* Group Specific Fields */}
          {formData.taskType === TaskType.GROUP && (
            <div className="p-3.5 rounded-xl bg-purple-500/5 border border-purple-500/20 space-y-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400">
                <Users size={14} />
                <span>Group Assignment Configuration</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
                    Group Name / Number
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kelompok 03 - Team Cyber"
                    value={formData.groupName}
                    onChange={(e) => setFormData({ ...formData, groupName: e.target.value })}
                    className="form-input text-xs w-full bg-surface border-border text-text-primary"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
                    Members Roster
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ahmad (Ketua), Bella, Dito, Rina"
                    value={formData.groupMembers}
                    onChange={(e) => setFormData({ ...formData, groupMembers: e.target.value })}
                    className="form-input text-xs w-full bg-surface border-border text-text-primary"
                  />
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
              Description & Instructions
            </label>
            <textarea
              placeholder="Provide detailed submission requirements, rubric, or instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea text-sm w-full bg-surface border-border text-text-primary"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
                Deadline *
              </label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
                required
              />
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
                Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
                <option value={TaskPriority.URGENT}>Urgent</option>
              </select>
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
              >
                <option value={TaskStatus.UPCOMING}>Upcoming</option>
                <option value={TaskStatus.DUE_SOON}>Due Soon</option>
                <option value={TaskStatus.OVERDUE}>Overdue</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <div>
              <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
                Submission URL (LMS / Drive / GitHub)
              </label>
              <input
                type="url"
                placeholder="https://lms.telkomuniversity.ac.id/..."
                value={formData.submissionUrl}
                onChange={(e) => setFormData({ ...formData, submissionUrl: e.target.value })}
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-text-secondary mb-1 block">
                Reference / Guide URL
              </label>
              <input
                type="url"
                placeholder="https://docs.google.com/..."
                value={formData.referenceUrl}
                onChange={(e) => setFormData({ ...formData, referenceUrl: e.target.value })}
                className="form-input text-xs w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary text-sm"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              {editingTask ? "Save Changes" : "Create Task"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Task"
        description="Are you sure you want to delete this task? All student deadline tracking will be removed."
        itemTitle={deletingTask?.title}
      />
    </div>
  );
}

