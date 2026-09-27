"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { Plus, Edit2, Trash2, BookOpen, Search, User, Loader2, Calendar, CheckSquare, ExternalLink } from "lucide-react";
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
  englishName?: string | null;
  description?: string | null;
  sks?: number | null;
  lecturerName?: string | null;
  semester?: string | null;
  academicYear?: string | null;
  color?: string | null;
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
    englishName: "",
    sks: 3,
    lecturerName: "",
    description: "",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    color: "#1498FF",
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
      englishName: "",
      sks: 3,
      lecturerName: "",
      description: "",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
      color: "#1498FF",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(sub: SubjectItem) {
    setEditingSubject(sub);
    setFormData({
      code: sub.code,
      name: sub.name,
      englishName: sub.englishName || "",
      sks: sub.sks || 3,
      lecturerName: sub.lecturerName || "",
      description: sub.description || "",
      semester: sub.semester || "Semester Ganjil 2026/2027",
      academicYear: sub.academicYear || "2026/2027",
      color: sub.color || "#1498FF",
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
      setFormError("Subject code is required (e.g. BBK1AAB4).");
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
        sks: Number(formData.sks) || 3,
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
            id: (res.data as any)?.id || `temp-${Date.now()}`,
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
      (s.englishName && s.englishName.toLowerCase().includes(q)) ||
      (s.lecturerName && s.lecturerName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            type="text"
            placeholder="Search subjects or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input text-xs pl-8 pr-3 py-1.5 w-full bg-surface border-border text-text-primary"
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
      <div className="card border border-border bg-card shadow-xs overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-text-primary">No subjects found</p>
            <p className="text-xs text-text-muted mt-1">
              Add a new course curriculum or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-6">Kode & Nama Mata Kuliah</th>
                  <th className="py-3.5 px-6">SKS</th>
                  <th className="py-3.5 px-6">Dosen Pengampu</th>
                  <th className="py-3.5 px-6">Deskripsi</th>
                  <th className="py-3.5 px-6">Aktivitas</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20 inline-block mb-1">
                        {sub.code}
                      </span>
                      <div className="font-semibold text-text-primary leading-snug">
                        {sub.name}
                      </div>
                      {sub.englishName && (
                        <div className="text-xs text-text-muted italic mt-0.5">
                          {sub.englishName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-surface border border-border text-text-primary">
                        {sub.sks || 3} SKS
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <User size={14} className="text-text-muted shrink-0" />
                        <span className="text-xs font-medium">{sub.lecturerName || "Belum ditentukan"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-text-muted line-clamp-2">
                        {sub.description || "No description provided."}
                      </p>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3 text-xs text-text-muted">
                        <span className="flex items-center gap-1" title="Schedules">
                          <Calendar size={12} className="text-brand-500" />
                          {sub._count?.schedules ?? 0} slots
                        </span>
                        <span className="flex items-center gap-1" title="Tasks">
                          <CheckSquare size={12} className="text-amber-500" />
                          {sub._count?.tasks ?? 0} tasks
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/subjects/${sub.code}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                          title="View Subject Hub"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(sub)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(sub)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-surface transition-colors"
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
        description="Configure academic course details, code, curriculum SKS, and lecturer."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Kode Mata Kuliah *</label>
              <input
                type="text"
                placeholder="e.g. BBK1AAB4"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="form-input text-sm uppercase font-mono w-full bg-surface border-border text-text-primary"
                required
              />
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Bobot SKS *</label>
              <input
                type="number"
                min={1}
                max={6}
                value={formData.sks}
                onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) || 3 })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
                required
              />
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Aksen Warna</label>
              <input
                type="text"
                placeholder="#1498FF"
                value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Nama Mata Kuliah (Indonesia) *</label>
              <input
                type="text"
                placeholder="e.g. Algoritma dan Pemrograman"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
                required
              />
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">English Course Name</label>
              <input
                type="text"
                placeholder="e.g. Algorithms and Programming"
                value={formData.englishName}
                onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Dosen Pengampu (Lecturer Name)</label>
            <input
              type="text"
              placeholder="e.g. Dosen Pengampu S1 SI"
              value={formData.lecturerName}
              onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
              className="form-input text-sm w-full bg-surface border-border text-text-primary"
            />
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Deskripsi / Silabus Ringkas</label>
            <textarea
              placeholder="Gambaran umum materi kuliah, capaian pembelajaran, dan silabus..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="form-textarea text-sm w-full bg-surface border-border text-text-primary"
              rows={3}
            />
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

