"use client";

import React, { useState, useTransition, useRef } from "react";
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
  Upload,
  X,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons";
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
  instagramUrl?: string | null;
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
  const fileInputRef = useRef<HTMLInputElement | null>(null);
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
    instagramUrl: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setFormError("Ukuran file foto maksimal 2MB.");
      return;
    }

    if (!file.type.startsWith("image/")) {
      setFormError("File harus berupa gambar (JPG, PNG, WebP, dll).");
      return;
    }

    setFormError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setFormData((prev) => ({ ...prev, photoUrl: dataUrl }));
    };
    reader.readAsDataURL(file);
  }

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
      instagramUrl: "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      instagramUrl: student.instagramUrl || "",
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
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
        instagramUrl: formData.instagramUrl.trim() || null,
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
          {/* {majors.length > 0 && (
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
          )} */}
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
                        {st.instagramUrl && (
                          <a
                            href={st.instagramUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="btn btn-ghost btn-icon p-1.5 text-pink-500 hover:text-pink-600 hover:bg-pink-50 dark:hover:bg-pink-950/30"
                            title="Instagram"
                          >
                            <InstagramIcon size={15} />
                          </a>
                        )}
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
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Alex Pratama"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Student ID / NIM (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 220601201"
                value={formData.studentNumber}
                onChange={(e) => setFormData({ ...formData, studentNumber: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 font-mono text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Major / Department <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Computer Science or Information Systems"
                value={formData.major}
                onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Foto Profil (Opsional)
              </label>
              <div className="flex items-center gap-3.5 p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 border-2 border-white dark:border-slate-800 shadow-xs">
                  {formData.photoUrl ? (
                    <img
                      src={formData.photoUrl}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Users size={22} className="text-white/80" />
                  )}
                </div>

                <div className="flex-1 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="file"
                      ref={fileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1.5 transition-colors shadow-xs"
                    >
                      <Upload size={13} />
                      <span>{formData.photoUrl ? "Ganti Foto" : "Pilih File Foto"}</span>
                    </button>
                    {formData.photoUrl && (
                      <button
                        type="button"
                        onClick={() => {
                          setFormData((prev) => ({ ...prev, photoUrl: "" }));
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                        className="px-2.5 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/40 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 flex items-center gap-1 transition-colors"
                      >
                        <X size={13} />
                        <span>Hapus</span>
                      </button>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Bisa unggah file (JPG/PNG/WebP maks 2MB) atau masukkan URL foto di bawah.
                  </p>
                </div>
              </div>

              <div className="mt-2">
                <input
                  type="url"
                  placeholder="Atau masukkan URL foto langsung: https://..."
                  value={formData.photoUrl.startsWith("data:") ? "" : formData.photoUrl}
                  onChange={(e) => setFormData({ ...formData, photoUrl: e.target.value })}
                  className="h-9 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Bio & Background
            </label>
            <textarea
              placeholder="Tell about background, tech stack interests, or hobbies..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              className="min-h-[85px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Career Dream / Aspiration
              </label>
              <input
                type="text"
                placeholder="e.g. AI Research Scientist"
                value={formData.dream}
                onChange={(e) => setFormData({ ...formData, dream: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Personal Motto / Motivation
              </label>
              <input
                type="text"
                placeholder="e.g. Keep pushing boundaries every day"
                value={formData.motivation}
                onChange={(e) => setFormData({ ...formData, motivation: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5 flex items-center gap-1.5">
                <InstagramIcon size={14} className="text-pink-500" />
                Instagram URL
              </label>
              <input
                type="url"
                placeholder="https://instagram.com/..."
                value={formData.instagramUrl}
                onChange={(e) => setFormData({ ...formData, instagramUrl: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">GitHub URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={formData.githubUrl}
                onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">LinkedIn URL</label>
              <input
                type="url"
                placeholder="https://linkedin.com/in/..."
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">Portfolio URL</label>
              <input
                type="url"
                placeholder="https://mywebsite.dev"
                value={formData.portfolioUrl}
                onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

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
              <span>{editingStudent ? "Save Changes" : "Add Student"}</span>
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
