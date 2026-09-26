"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Trophy,
  Search,
  Calendar,
  Building,
  MapPin,
  Loader2,
  Users,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createAchievementAction,
  updateAchievementAction,
  deleteAchievementAction,
} from "@/lib/actions/achievements";
import { AchievementCategory } from "@prisma/client";
import { formatDate, cn } from "@/lib/utils";

interface StudentOption {
  id: string;
  name: string;
  studentNumber?: string | null;
  photoUrl?: string | null;
}

interface AchievementItem {
  id: string;
  title: string;
  description?: string | null;
  category: AchievementCategory;
  achievementDate: Date | string;
  organization?: string | null;
  location?: string | null;
  badgeIconUrl?: string | null;
  imageUrl?: string | null;
  students?: any[];
}

interface AchievementsManagerProps {
  initialAchievements: AchievementItem[];
  allStudents: StudentOption[];
}

const CATEGORY_COLOR: Record<AchievementCategory, string> = {
  COMPETITION: "badge-amber",
  VOLUNTEER: "badge-teal",
  ORGANIZATION: "badge-purple",
  ACADEMIC: "badge-blue",
  CREATIVE: "badge-green",
  TECHNOLOGY: "badge-indigo",
  OTHER: "badge-gray",
};

export function AchievementsManager({
  initialAchievements,
  allStudents,
}: AchievementsManagerProps) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(initialAchievements);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAchievement, setEditingAchievement] = useState<AchievementItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    category: AchievementCategory;
    achievementDate: string;
    organization: string;
    location: string;
    badgeIconUrl: string;
    imageUrl: string;
    studentIds: string[];
  }>({
    title: "",
    description: "",
    category: AchievementCategory.COMPETITION,
    achievementDate: new Date().toISOString().slice(0, 10),
    organization: "",
    location: "",
    badgeIconUrl: "",
    imageUrl: "",
    studentIds: [] as string[],
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAchievement, setDeletingAchievement] = useState<AchievementItem | null>(null);

  function openCreateModal() {
    setEditingAchievement(null);
    setFormData({
      title: "",
      description: "",
      category: AchievementCategory.COMPETITION,
      achievementDate: new Date().toISOString().slice(0, 10),
      organization: "",
      location: "",
      badgeIconUrl: "",
      imageUrl: "",
      studentIds: [],
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(ach: AchievementItem) {
    setEditingAchievement(ach);
    const d = new Date(ach.achievementDate);
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";

    const currentStudentIds = (ach.students || []).map(
      (s: any) => s.studentId || s.student?.id
    ).filter(Boolean);

    setFormData({
      title: ach.title,
      description: ach.description || "",
      category: ach.category,
      achievementDate: dateStr,
      organization: ach.organization || "",
      location: ach.location || "",
      badgeIconUrl: ach.badgeIconUrl || "",
      imageUrl: ach.imageUrl || "",
      studentIds: currentStudentIds,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(ach: AchievementItem) {
    setDeletingAchievement(ach);
    setDeleteDialogOpen(true);
  }

  function toggleStudentSelection(studentId: string) {
    setFormData((prev) => {
      const exists = prev.studentIds.includes(studentId);
      return {
        ...prev,
        studentIds: exists
          ? prev.studentIds.filter((id) => id !== studentId)
          : [...prev.studentIds, studentId],
      };
    });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Achievement title is required.");
      return;
    }
    if (!formData.achievementDate) {
      setFormError("Achievement date is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        category: formData.category,
        achievementDate: formData.achievementDate,
        organization: formData.organization.trim() || null,
        location: formData.location.trim() || null,
        badgeIconUrl: formData.badgeIconUrl.trim() || null,
        imageUrl: formData.imageUrl.trim() || null,
        studentIds: formData.studentIds,
      };

      if (editingAchievement) {
        const res = await updateAchievementAction(editingAchievement.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update achievement.");
        } else {
          const selectedStudentObjs = allStudents
            .filter((s) => formData.studentIds.includes(s.id))
            .map((s) => ({ student: s, studentId: s.id }));

          setAchievements((prev) =>
            prev.map((a) =>
              a.id === editingAchievement.id
                ? {
                    ...a,
                    ...payload,
                    achievementDate: new Date(formData.achievementDate),
                    students: selectedStudentObjs,
                  }
                : a
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createAchievementAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create achievement.");
        } else {
          const selectedStudentObjs = allStudents
            .filter((s) => formData.studentIds.includes(s.id))
            .map((s) => ({ student: s, studentId: s.id }));

          const newAch: AchievementItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            achievementDate: new Date(formData.achievementDate),
            students: selectedStudentObjs,
          };
          setAchievements((prev) => [newAch, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingAchievement) return;
    const res = await deleteAchievementAction(deletingAchievement.id);
    if (res.success) {
      setAchievements((prev) => prev.filter((a) => a.id !== deletingAchievement.id));
    }
  }

  const filteredAchievements = achievements.filter((a) => {
    if (categoryFilter !== "ALL" && a.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchTitle = a.title.toLowerCase().includes(q);
    const matchOrg = a.organization && a.organization.toLowerCase().includes(q);
    const matchStudent = (a.students || []).some(
      (s: any) => s.student?.name && s.student.name.toLowerCase().includes(q)
    );
    return matchTitle || matchOrg || matchStudent;
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Category Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setCategoryFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              categoryFilter === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            All ({achievements.length})
          </button>
          {Object.keys(AchievementCategory).map((catKey) => {
            const count = achievements.filter((a) => a.category === catKey).length;
            return (
              <button
                key={catKey}
                type="button"
                onClick={() => setCategoryFilter(catKey)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                  categoryFilter === catKey
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {catKey.charAt(0) + catKey.slice(1).toLowerCase()} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search awards, orgs, students..."
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
            <span>Add Achievement</span>
          </button>
        </div>
      </div>

      {/* Achievements Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredAchievements.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No achievements found</p>
            <p className="text-xs text-slate-400 mt-1">
              Record competition wins, academic milestones, or leadership awards.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Achievement & Category</th>
                  <th className="py-3.5 px-6">Organization & Date</th>
                  <th className="py-3.5 px-6">Awardees / Participants</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAchievements.map((ach) => (
                  <tr key={ach.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                          {ach.badgeIconUrl ? (
                            <span className="text-base">{ach.badgeIconUrl}</span>
                          ) : (
                            <Trophy size={16} className="text-amber-500" />
                          )}
                        </div>
                        <div>
                          <span className={cn("badge text-[10px] mb-1", CATEGORY_COLOR[ach.category])}>
                            {ach.category}
                          </span>
                          <h4 className="font-semibold text-slate-900 leading-snug line-clamp-2">
                            {ach.title}
                          </h4>
                          {ach.description && (
                            <p className="text-xs text-slate-400 line-clamp-1 mt-0.5">
                              {ach.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {ach.organization && (
                        <div className="flex items-center gap-1.5 text-xs font-medium text-slate-800">
                          <Building size={13} className="text-slate-400 flex-shrink-0" />
                          <span className="truncate">{ach.organization}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
                        <Calendar size={12} className="text-slate-400 flex-shrink-0" />
                        <span>{formatDate(ach.achievementDate)}</span>
                        {ach.location && (
                          <>
                            <span>&bull;</span>
                            <span className="truncate">{ach.location}</span>
                          </>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      {ach.students && ach.students.length > 0 ? (
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {ach.students.map((sa: any) => (
                            <span
                              key={sa.studentId || sa.student?.id}
                              className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full"
                            >
                              {sa.student?.name || "Student"}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400 italic">No students linked</span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(ach)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(ach)}
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
        title={editingAchievement ? "Edit Achievement" : "Add Class Achievement"}
        description="Record competition champions, hackathon winners, or research accolades."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Achievement Title *</label>
            <input
              type="text"
              placeholder="e.g. 1st Place Champion - National Hackathon 2026"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Category *</label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as AchievementCategory,
                  })
                }
                className="form-select text-sm w-full"
              >
                {Object.keys(AchievementCategory).map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label">Date of Achievement *</label>
              <input
                type="date"
                value={formData.achievementDate}
                onChange={(e) =>
                  setFormData({ ...formData, achievementDate: e.target.value })
                }
                className="form-input text-sm w-full"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Organizer / Institution</label>
              <input
                type="text"
                placeholder="e.g. Ministry of Education or Google Tech"
                value={formData.organization}
                onChange={(e) =>
                  setFormData({ ...formData, organization: e.target.value })
                }
                className="form-input text-sm w-full"
              />
            </div>

            <div>
              <label className="form-label">Location / City</label>
              <input
                type="text"
                placeholder="e.g. Jakarta, Indonesia or Online"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="form-input text-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="form-label">Description & Notes</label>
            <textarea
              placeholder="Details about project presented, number of competing teams, etc..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-textarea text-sm w-full"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="form-label">Badge Emoji or Icon</label>
              <input
                type="text"
                placeholder="e.g. 🏆 or 🥇"
                value={formData.badgeIconUrl}
                onChange={(e) =>
                  setFormData({ ...formData, badgeIconUrl: e.target.value })
                }
                className="form-input text-sm w-full"
              />
            </div>

            <div>
              <label className="form-label">Image or Certificate URL</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="form-input text-sm w-full"
              />
            </div>
          </div>

          {/* Student Multi-Select Checkboxes */}
          <div>
            <label className="form-label flex items-center justify-between">
              <span>Select Participating Students</span>
              <span className="text-xs text-brand-600 font-normal">
                {formData.studentIds.length} selected
              </span>
            </label>
            <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-xl p-3 bg-slate-50/50 space-y-2">
              {allStudents.length === 0 ? (
                <p className="text-xs text-slate-400">No students available.</p>
              ) : (
                allStudents.map((st) => {
                  const isChecked = formData.studentIds.includes(st.id);
                  return (
                    <label
                      key={st.id}
                      className={cn(
                        "flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-white cursor-pointer transition-colors text-xs",
                        isChecked && "bg-brand-50/80 font-medium text-brand-900"
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleStudentSelection(st.id)}
                        className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                      />
                      <span>{st.name}</span>
                      {st.studentNumber && (
                        <span className="text-slate-400 font-mono text-[10px]">
                          ({st.studentNumber})
                        </span>
                      )}
                    </label>
                  );
                })
              )}
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
              {editingAchievement ? "Save Changes" : "Create Achievement"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Achievement"
        description="Are you sure you want to remove this achievement record?"
        itemTitle={deletingAchievement?.title}
      />
    </div>
  );
}
