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
    <div className="space-y-5">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Search subjects or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="h-10 pl-8.5 pr-3 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs"
          />
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="h-10 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Subjects Table */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] shadow-xs overflow-hidden">
        {filteredSubjects.length === 0 ? (
          <div className="p-12 text-center">
            <BookOpen className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3 opacity-60" />
            <p className="text-sm font-semibold text-slate-900 dark:text-white">No subjects found</p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Add a new course curriculum or adjust your search filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/90 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="py-3 px-6">KODE & NAMA MATA KULIAH</th>
                  <th className="py-3 px-6">SKS</th>
                  <th className="py-3 px-6">DOSEN PENGAMPU</th>
                  <th className="py-3 px-6">DESKRIPSI</th>
                  <th className="py-3 px-6">AKTIVITAS</th>
                  <th className="py-3 px-6 text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70 bg-white dark:bg-[#0c1427]">
                {filteredSubjects.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-4 px-6">
                      <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 inline-block mb-1">
                        {sub.code}
                      </span>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                        {sub.name}
                      </div>
                      {sub.englishName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                          {sub.englishName}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className="px-2 py-0.5 rounded text-xs font-medium bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                        {sub.sks || 3} SKS
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-900 dark:text-white">
                        <User size={14} className="text-slate-400 shrink-0" />
                        <span className="text-xs font-medium">{sub.lecturerName || "Belum ditentukan"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 max-w-sm">
                      <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                        {sub.description || "No description provided."}
                      </p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap">
                      <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="flex items-center gap-1" title="Schedules">
                          <Calendar size={12} className="text-blue-600 dark:text-blue-400" />
                          {sub._count?.schedules ?? 0} slots
                        </span>
                        <span className="flex items-center gap-1" title="Tasks">
                          <CheckSquare size={12} className="text-amber-500" />
                          {sub._count?.tasks ?? 0} tasks
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/subjects/${sub.code}`}
                          target="_blank"
                          className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                          title="View Subject Hub"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(sub)}
                          className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(sub)}
                          className="h-8.5 w-8.5 inline-flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 transition-colors cursor-pointer"
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
        description={
          editingSubject
            ? "Update the course information, lecturer, and academic details."
            : "Add the course information used throughout the class system."
        }
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* Row 1: Course Code, SKS, Accent Color */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5">
            <div className="sm:col-span-5">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Course Code <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. BKK1AAB4"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 uppercase font-mono text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                SKS <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                min={1}
                max={6}
                value={formData.sks}
                onChange={(e) => setFormData({ ...formData, sks: parseInt(e.target.value) || 3 })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div className="sm:col-span-4">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Accent Color
              </label>
              <div className="relative flex items-center">
                <input
                  type="color"
                  value={formData.color.startsWith("#") ? formData.color : "#1498FF"}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="absolute left-2 w-6 h-6 rounded-full border-0 p-0 cursor-pointer bg-transparent"
                />
                <input
                  type="text"
                  placeholder="#1498FF"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="h-10.5 pl-10 pr-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Course Name & English Course Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Course Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Algoritma dan Pemrograman"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                English Course Name
              </label>
              <input
                type="text"
                placeholder="e.g. Algorithms and Programming"
                value={formData.englishName}
                onChange={(e) => setFormData({ ...formData, englishName: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          {/* Row 3: Lecturer */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Lecturer
            </label>
            <input
              type="text"
              placeholder="e.g. Dosen Pengampu S1 SI"
              value={formData.lecturerName}
              onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          {/* Row 4: Description */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Description
            </label>
            <textarea
              placeholder="Gambaran umum materi kuliah, capaian pembelajaran, dan silabus..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="min-h-[110px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={3}
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary text-sm font-medium px-4 py-2"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="btn btn-primary text-sm font-medium px-5 py-2 flex items-center gap-2"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{editingSubject ? "Save Changes" : "Create Subject"}</span>
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

