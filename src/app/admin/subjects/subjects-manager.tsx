"use client";

import React, { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, BookOpen, Search, User, Loader2, Calendar, CheckSquare } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createSubjectAction,
  updateSubjectAction,
  deleteSubjectAction,
} from "@/lib/actions/subjects";

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  description?: string | null;
  lecturerName?: string | null;
  _count?: {
    schedules: number;
    tasks: number;
  };
}

interface SubjectsManagerProps {
  initialSubjects: SubjectItem[];
}

export function SubjectsManager({ initialSubjects }: SubjectsManagerProps) {
  const [subjects, setSubjects] = useState<SubjectItem[]>(initialSubjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<SubjectItem | null>(null);
  const [formData, setFormData] = useState({
    code: "",
    name: "",
    lecturerName: "",
    description: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSubject, setDeletingSubject] = useState<SubjectItem | null>(null);

  function openCreateModal() {
    setEditingSubject(null);
    setFormData({
      code: "",
      name: "",
      lecturerName: "",
      description: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(sub: SubjectItem) {
    setEditingSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      lecturerName: sub.lecturerName || "",
      description: sub.description || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(sub: SubjectItem) {
    setDeletingSubject(sub);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.code.trim()) {
      setFormError("Subject code is required (e.g. CS101).");
      return;
    }
    if (!formData.name.trim()) {
      setFormError("Subject name is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        ...formData,
        code: formData.code.toUpperCase().trim(),
      };

      if (editingSubject) {
        const res = await updateSubjectAction(editingSubject.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update subject.");
        } else {
          setSubjects((prev) =>
            prev.map((s) =>
              s.id === editingSubject.id
                ? {
                    ...s,
                    ...payload,
                  }
                : s
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createSubjectAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create subject.");
        } else {
          const newSub: SubjectItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            _count: { schedules: 0, tasks: 0 },
          };
          setSubjects((prev) => [...prev, newSub]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingSubject) return;
    const res = await deleteSubjectAction(deletingSubject.id);
    if (res.success) {
      setSubjects((prev) => prev.filter((s) => s.id !== deletingSubject.id));
    }
  }

  const filteredSubjects = subjects.filter((s) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.code.toLowerCase().includes(q) ||
      s.name.toLowerCase().includes(q) ||
      (s.lecturerName && s.lecturerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs pl-8 pr-3 py-1.5 w-full"
          />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No subjects found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add a new course curriculum or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Code & Title</th>
                  <th className="py-3.5 px-6">Assigned Lecturer</th>
                  <th className="py-3.5 px-6">Description</th>
                  <th className="py-3.5 px-6">Activity</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <span className="badge badge-blue text-[11px] font-mono mb-1">
                        {sub.code}
                      </span>
                      <div className="font-semibold text-slate-900 leading-snug">
                        {sub.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <User size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="text-xs">{sub.lecturerName || "Not assigned"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-slate-500 line-clamp-2">
                        {sub.description || "No description provided."}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1" title="Schedules">
                          <Calendar size={12} className="text-slate-400" />
                          {sub._count?.schedules ?? 0} slots
                        </span>
                        <span className="flex items-center gap-1" title="Tasks">
                          <CheckSquare size={12} className="text-slate-400" />
                          {sub._count?.tasks ?? 0} tasks
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(sub)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(sub)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-red-600"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingSubject ? "Edit Subject" : "Create New Subject"}
        description="Configure academic course details, code, and lecturer."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Subject Code *</label>
            <input
              type="text"
              placeholder="e.g. CS302 or IF401"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              className="form-input text-sm uppercase font-mono w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Subject Name *</label>
            <input
              type="text"
              placeholder="e.g. Cloud Computing & Distributed Architecture"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Lecturer Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Dr. Jane Smith, M.Sc."
              value={formData.lecturerName}
              onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
              className="form-input text-sm w-full"
            />
          </div>

          <div>
            <label className="form-label">Course Description</label>
            <textarea
              placeholder="Overview of syllabus, prerequisites, and learning objectives..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea text-sm w-full"
              rows={3}
            />
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
              {editingSubject ? "Save Changes" : "Create Subject"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Subject"
        description="Are you sure you want to delete this subject? Note that subjects with existing schedules or tasks cannot be deleted until those dependencies are cleared."
        itemTitle={deletingSubject ? `${deletingSubject.code} - ${deletingSubject.name}` : undefined}
      />
    </div>
  );
}
