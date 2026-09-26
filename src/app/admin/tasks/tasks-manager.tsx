"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  Clock,
  Search,
  CheckSquare,
  AlertCircle,
  Loader2,
  Calendar,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createTaskAction,
  updateTaskAction,
  deleteTaskAction,
} from "@/lib/actions/tasks";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { formatDate, getRelativeDeadline, cn } from "@/lib/utils";

interface TaskItem {
  id: string;
  subjectId: string;
  title: string;
  description?: string | null;
  deadline: Date | string;
  priority: TaskPriority;
  status: TaskStatus;
  computedStatus?: TaskStatus;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
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
  UPCOMING: { label: "Upcoming", className: "badge-blue" },
  DUE_SOON: { label: "Due Soon", className: "badge-amber" },
  OVERDUE: { label: "Overdue", className: "badge-red" },
  COMPLETED: { label: "Completed", className: "badge-green" },
};

const PRIORITY_BADGE: Record<TaskPriority, { label: string; className: string }> = {
  LOW: { label: "Low", className: "badge-gray" },
  MEDIUM: { label: "Medium", className: "badge-blue" },
  HIGH: { label: "High", className: "badge-red" },
};

export function TasksManager({ initialTasks, subjects }: TasksManagerProps) {
  const [tasks, setTasks] = useState<TaskItem[]>(initialTasks);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);
  const [formData, setFormData] = useState<{
    subjectId: string;
    title: string;
    description: string;
    deadline: string;
    priority: TaskPriority;
    status: TaskStatus;
  }>({
    subjectId: subjects[0]?.id || "",
    title: "",
    description: "",
    deadline: "",
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.UPCOMING,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<TaskItem | null>(null);

  function openCreateModal() {
    setEditingTask(null);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 3);
    tomorrow.setHours(23, 59, 0, 0);

    setFormData({
      subjectId: subjects[0]?.id || "",
      title: "",
      description: "",
      deadline: tomorrow.toISOString().slice(0, 16),
      priority: TaskPriority.MEDIUM,
      status: TaskStatus.UPCOMING,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(task: TaskItem) {
    setEditingTask(task);
    const d = new Date(task.deadline);
    const deadlineString = !isNaN(d.getTime())
      ? d.toISOString().slice(0, 16)
      : "";

    setFormData({
      subjectId: task.subjectId,
      title: task.title,
      description: task.description || "",
      deadline: deadlineString,
      priority: task.priority,
      status: task.status,
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
        subjectId: task.subjectId,
        title: task.title,
        description: task.description,
        deadline: new Date(task.deadline).toISOString(),
        priority: task.priority,
        status: newStatus,
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

    if (!formData.subjectId) {
      setFormError("Please select a subject.");
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
        deadline: new Date(formData.deadline).toISOString(),
      };

      if (editingTask) {
        const res = await updateTaskAction(editingTask.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update task.");
        } else {
          const selectedSub = subjects.find((s) => s.id === formData.subjectId);
          setTasks((prev) =>
            prev.map((t) =>
              t.id === editingTask.id
                ? {
                    ...t,
                    ...formData,
                    deadline: new Date(formData.deadline),
                    subject: selectedSub || t.subject,
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
          const selectedSub = subjects.find((s) => s.id === formData.subjectId);
          const newTask: TaskItem = {
            id: res.data?.id || `temp-${Date.now()}`,
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
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = t.title.toLowerCase().includes(q);
      const matchSubject = t.subject?.name.toLowerCase().includes(q) || t.subject?.code.toLowerCase().includes(q);
      return matchTitle || matchSubject;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setStatusFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              statusFilter === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            All Tasks ({tasks.length})
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
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {badge.label} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              placeholder="Search tasks or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs pl-8 pr-3 py-1.5 w-full"
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

      {/* Tasks Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center">
            <CheckSquare className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No tasks found</p>
            <p className="text-xs text-slate-400 mt-1">
              Try adjusting your filter or create a new assignment task.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Task Title & Details</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Deadline</th>
                  <th className="py-3.5 px-6">Priority</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredTasks.map((task) => {
                  const displayStatus = task.computedStatus || task.status;
                  const st = STATUS_BADGE[displayStatus] || STATUS_BADGE.UPCOMING;
                  const pr = PRIORITY_BADGE[task.priority] || PRIORITY_BADGE.MEDIUM;
                  const isCompleted = task.status === TaskStatus.COMPLETED;

                  return (
                    <tr
                      key={task.id}
                      className={cn(
                        "hover:bg-slate-50/70 transition-colors",
                        isCompleted && "bg-slate-50/40"
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
                              "transition-colors",
                              isCompleted
                                ? "text-emerald-500 fill-emerald-100"
                                : "text-slate-300 group-hover:text-emerald-400"
                            )}
                          />
                          <span className={cn("badge text-xs", st.className)}>
                            {st.label}
                          </span>
                        </button>
                      </td>
                      <td className="py-4 px-6 max-w-md">
                        <div
                          className={cn(
                            "font-semibold text-slate-900 leading-snug",
                            isCompleted && "line-through text-slate-400"
                          )}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                            {task.description}
                          </p>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span className="badge badge-blue text-[11px]">
                          {task.subject?.code}
                        </span>
                        <p className="text-xs text-slate-500 mt-0.5 truncate max-w-xs">
                          {task.subject?.name}
                        </p>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-medium text-slate-800 text-xs">
                          {formatDate(task.deadline)}
                        </div>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                          <Clock size={11} />
                          <span>{getRelativeDeadline(task.deadline).text}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className={cn("badge text-xs", pr.className)}>
                          {pr.label}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            onClick={() => openEditModal(task)}
                            className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            type="button"
                            onClick={() => openDeleteDialog(task)}
                            className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-red-600"
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
        description="Set assignment requirements, course relation, and submission deadlines."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Subject *</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="form-select text-sm w-full"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Task Title *</label>
            <input
              type="text"
              placeholder="e.g. Final Sprint Project Documentation"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Description & Instructions</label>
            <textarea
              placeholder="Provide detailed submission requirements, rubric, or submission link instructions..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea text-sm w-full"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">Deadline *</label>
              <input
                type="datetime-local"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                className="form-input text-sm w-full"
                required
              />
            </div>

            <div>
              <label className="form-label">Priority</label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="form-select text-sm w-full"
              >
                <option value={TaskPriority.LOW}>Low</option>
                <option value={TaskPriority.MEDIUM}>Medium</option>
                <option value={TaskPriority.HIGH}>High</option>
              </select>
            </div>

            <div>
              <label className="form-label">Status</label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as TaskStatus })
                }
                className="form-select text-sm w-full"
              >
                <option value={TaskStatus.UPCOMING}>Upcoming</option>
                <option value={TaskStatus.DUE_SOON}>Due Soon</option>
                <option value={TaskStatus.OVERDUE}>Overdue</option>
                <option value={TaskStatus.COMPLETED}>Completed</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
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
