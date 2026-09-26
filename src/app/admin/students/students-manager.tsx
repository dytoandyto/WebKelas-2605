"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import {
  Plus,
  Edit2,
  Trash2,
  Users,
  Search,
  ExternalLink,
  Loader2,
  Star,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createStudentAction,
  updateStudentAction,
  deleteStudentAction,
} from "@/lib/actions/students";
import { cn } from "@/lib/utils";

interface StudentItem {
  id: string;
  name: string;
  studentNumber?: string | null;
  major: string;
  photoUrl?: string | null;
  bio?: string | null;
  dream?: string | null;
  motivation?: string | null;
  githubUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  achievements?: any[];
}

interface StudentsManagerProps {
  initialStudents: StudentItem[];
  majors: string[];
}

export function StudentsManager({ initialStudents, majors }: StudentsManagerProps) {
  const [students, setStudents] = useState<StudentItem[]>(initialStudents);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMajor, setSelectedMajor] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<StudentItem | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    studentNumber: "",
    major: majors[0] || "Informatics",
    photoUrl: "",
    bio: "",
    dream: "",
    motivation: "",
    githubUrl: "",
    linkedinUrl: "",
    portfolioUrl: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingStudent, setDeletingStudent] = useState<StudentItem | null>(null);

  function openCreateModal() {
    setEditingStudent(null);
    setFormData({
      name: "",
      studentNumber: "",
      major: majors[0] || "Informatics",
      photoUrl: "",
      bio: "",
      dream: "",
      motivation: "",
      githubUrl: "",
      linkedinUrl: "",
      portfolioUrl: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(student: StudentItem) {
    setEditingStudent(student);
    setFormData({
      name: student.name,
      studentNumber: student.studentNumber || "",
      major: student.major,
      photoUrl: student.photoUrl || "",
      bio: student.bio || "",
      dream: student.dream || "",
      motivation: student.motivation || "",
      githubUrl: student.githubUrl || "",
      linkedinUrl: student.linkedinUrl || "",
      portfolioUrl: student.portfolioUrl || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(student: StudentItem) {
    setDeletingStudent(student);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.name.trim()) {
      setFormError("Full name is required.");
      return;
    }
    if (!formData.major.trim()) {
      setFormError("Major is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        name: formData.name.trim(),
        studentNumber: formData.studentNumber.trim() || null,
        major: formData.major.trim(),
        photoUrl: formData.photoUrl.trim() || null,
        bio: formData.bio.trim() || null,
        dream: formData.dream.trim() || null,
        motivation: formData.motivation.trim() || null,
        githubUrl: formData.githubUrl.trim() || null,
        linkedinUrl: formData.linkedinUrl.trim() || null,
        portfolioUrl: formData.portfolioUrl.trim() || null,
      };

      if (editingStudent) {
        const res = await updateStudentAction(editingStudent.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update student profile.");
        } else {
          setStudents((prev) =>
            prev.map((s) =>
              s.id === editingStudent.id
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
        const res = await createStudentAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to add student.");
        } else {
          const newStudent: StudentItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            achievements: [],
          };
          setStudents((prev) => [...prev, newStudent]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingStudent) return;
    const res = await deleteStudentAction(deletingStudent.id);
    if (res.success) {
      setStudents((prev) => prev.filter((s) => s.id !== deletingStudent.id));
    }
  }

  const filteredStudents = students.filter((s) => {
    if (selectedMajor !== "ALL" && s.major !== selectedMajor) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      s.name.toLowerCase().includes(q) ||
      (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
      s.major.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1">
          {/* Search Box */}
          <div className="relative flex-1 sm:max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name or NIM..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="form-input text-xs pl-8 pr-3 py-1.5 w-full"
            />
          </div>

          {/* Major Select */}
          {majors.length > 0 && (
            <select
              value={selectedMajor}
              onChange={(e) => setSelectedMajor(e.target.value)}
              className="form-select text-xs py-1.5 hidden sm:block max-w-xs"
            >
              <option value="ALL">All Majors ({students.length})</option>
              {majors.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          )}
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Student</span>
        </button>
      </div>

      {/* Students Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredStudents.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No students found</p>
            <p className="text-xs text-slate-400 mt-1">
              Add new student profiles to populate the class directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Student</th>
                  <th className="py-3.5 px-6">Major</th>
                  <th className="py-3.5 px-6">Bio / Dream</th>
                  <th className="py-3.5 px-6">Achievements</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredStudents.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-brand-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow-xs">
                          {st.photoUrl ? (
                            <img
                              src={st.photoUrl}
                              alt={st.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            st.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 leading-snug">
                            {st.name}
                          </div>
                          {st.studentNumber && (
                            <div className="text-xs text-slate-400 font-mono">
                              NIM: {st.studentNumber}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="badge badge-blue text-[11px]">{st.major}</span>
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      {st.bio ? (
                        <p className="text-xs text-slate-500 line-clamp-1">{st.bio}</p>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No bio</span>
                      )}
                      {st.dream && (
                        <p className="text-[11px] text-brand-600 line-clamp-1 mt-0.5 font-medium">
                          Goal: {st.dream}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {st.achievements && st.achievements.length > 0 ? (
                        <div className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                          <Star size={12} className="fill-amber-400 text-amber-400" />
                          <span>{st.achievements.length} award{st.achievements.length !== 1 ? "s" : ""}</span>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">&mdash;</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/students/${st.id}`}
                          target="_blank"
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-slate-700"
                          title="View Public Profile"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditModal(st)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(st)}
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
        title={editingStudent ? "Edit Student Profile" : "Add Student to Class"}
        description="Fill in academic background, personal bio, and social links."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Full Name *</label>
              <input
                type="text"
                placeholder="e.g. Alex Pratama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="form-input text-sm w-full"
                required
              />
            </div>

            <div>
              <label className="form-label">Student ID / NIM (Optional)</label>
              <input
                type="text"
                placeholder="e.g. 220601201"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className="form-input text-sm font-mono w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Major / Department *</label>
              <input
                type="text"
                placeholder="e.g. Computer Science or Information Systems"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="form-input text-sm w-full"
                required
              />
            </div>

            <div>
              <label className="form-label">Profile Photo URL (Optional)</label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.photoUrl}
                onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                className="form-input text-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Bio & Background</label>
            <textarea
              placeholder="Tell about background, tech stack interests, or hobbies..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="form-textarea text-sm w-full"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Career Dream / Aspiration</label>
              <input
                type="text"
                placeholder="e.g. AI Research Scientist"
                value={formData.dream}
                onChange={(e) => setFormData({ ...formData, dream: e.target.value })}
                className="form-input text-sm w-full"
              />
            </div>

            <div>
              <label className="form-label">Personal Motto / Motivation</label>
              <input
                type="text"
                placeholder="e.g. Keep pushing boundaries every day"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="form-input text-sm w-full"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="form-input text-xs w-full"
              />
            </div>
            <div>
              <label className="form-label">LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="form-input text-xs w-full"
              />
            </div>
            <div>
              <label className="form-label">Portfolio URL</label>
              <input
                type="url"
                placeholder="https://mywebsite.dev"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="form-input text-xs w-full"
              />
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
              {editingStudent ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Student"
        description="Are you sure you want to remove this student from the class roster? Their linked achievements will remain intact."
        itemTitle={deletingStudent?.name}
      />
    </div>
  );
}
