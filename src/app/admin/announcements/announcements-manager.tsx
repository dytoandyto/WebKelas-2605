"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Megaphone,
  Search,
  Eye,
  EyeOff,
  Calendar,
  Loader2,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createAnnouncementAction,
  updateAnnouncementAction,
  togglePublishAnnouncementAction,
  deleteAnnouncementAction,
} from "@/lib/actions/announcements";
import { formatDate, cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface AnnouncementItem {
  id: string;
  title: string;
  content: string;
  imageUrl?: string | null;
  isPublished: boolean;
  publishedAt?: Date | string | null;
  createdAt: Date | string;
}

interface AnnouncementsManagerProps {
  initialAnnouncements: AnnouncementItem[];
}

export function AnnouncementsManager({ initialAnnouncements }: AnnouncementsManagerProps) {
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>(initialAnnouncements);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<AnnouncementItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    imageUrl: "",
    isPublished: true,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingAnnouncement, setDeletingAnnouncement] = useState<AnnouncementItem | null>(null);

  function openCreateModal() {
    setEditingAnnouncement(null);
    setFormData({
      title: "",
      content: "",
      imageUrl: "",
      isPublished: true,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(ann: AnnouncementItem) {
    setEditingAnnouncement(ann);
    setFormData({
      title: ann.title,
      content: ann.content,
      imageUrl: ann.imageUrl || "",
      isPublished: ann.isPublished,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(ann: AnnouncementItem) {
    setDeletingAnnouncement(ann);
    setDeleteDialogOpen(true);
  }

  async function handleTogglePublish(ann: AnnouncementItem) {
    startTransition(async () => {
      const res = await togglePublishAnnouncementAction(ann.id);
      if (res.success) {
        setAnnouncements((prev) =>
          prev.map((a) =>
            a.id === ann.id
              ? {
                  ...a,
                  isPublished: !a.isPublished,
                  publishedAt: !a.isPublished ? new Date() : null,
                }
              : a
          )
        );
      }
    });
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Announcement title is required.");
      return;
    }
    if (formData.content.trim().length < 10) {
      setFormError("Content must be at least 10 characters.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        imageUrl: formData.imageUrl.trim() || null,
        isPublished: formData.isPublished,
        publishedAt: formData.isPublished ? new Date().toISOString() : null,
      };

      if (editingAnnouncement) {
        const res = await updateAnnouncementAction(editingAnnouncement.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update announcement.");
        } else {
          setAnnouncements((prev) =>
            prev.map((a) =>
              a.id === editingAnnouncement.id
                ? {
                    ...a,
                    ...payload,
                    publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
                  }
                : a
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createAnnouncementAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create announcement.");
        } else {
          const newAnn: AnnouncementItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            createdAt: new Date(),
            publishedAt: payload.publishedAt ? new Date(payload.publishedAt) : null,
          };
          setAnnouncements((prev) => [newAnn, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingAnnouncement) return;
    const res = await deleteAnnouncementAction(deletingAnnouncement.id);
    if (res.success) {
      setAnnouncements((prev) =>
        prev.filter((a) => a.id !== deletingAnnouncement.id)
      );
    }
  }

  const filteredAnnouncements = announcements.filter((a) => {
    if (filter === "PUBLISHED" && !a.isPublished) return false;
    if (filter === "DRAFT" && a.isPublished) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setFilter("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              filter === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            All ({announcements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("PUBLISHED")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              filter === "PUBLISHED"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Published ({announcements.filter((a) => a.isPublished).length})
          </button>
          <button
            type="button"
            onClick={() => setFilter("DRAFT")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              filter === "DRAFT"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            Drafts ({announcements.filter((a) => !a.isPublished).length})
          </button>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-60">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search announcements..."
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
            <span>New Announcement</span>
          </button>
        </div>
      </div>

      {/* Announcements Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {announcements.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-7 h-7 stroke-[1.75]" />}
            title="No announcements yet"
            description="Important class announcements will appear here."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm whitespace-nowrap"
              >
                <Plus size={16} />
                <span>+ Add Announcement</span>
              </button>
            }
          />
        ) : filteredAnnouncements.length === 0 ? (
          <EmptyState
            icon={<Megaphone className="w-7 h-7 stroke-[1.75]" />}
            title="No announcements found"
            description="No announcements match your search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Announcement Title & Snippet</th>
                  <th className="py-3.5 px-6">Date</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredAnnouncements.map((ann) => (
                  <tr key={ann.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <button
                        type="button"
                        onClick={() => handleTogglePublish(ann)}
                        className="flex items-center gap-1.5 group cursor-pointer"
                        title={ann.isPublished ? "Click to unpublish" : "Click to publish"}
                      >
                        <span
                          className={cn(
                            "badge text-xs flex items-center gap-1",
                            ann.isPublished ? "badge-green" : "badge-gray"
                          )}
                        >
                          {ann.isPublished ? <Eye size={11} /> : <EyeOff size={11} />}
                          {ann.isPublished ? "Published" : "Draft"}
                        </span>
                      </button>
                    </td>
                    <td className="py-4 px-6 max-w-lg">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {ann.title}
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                        {ann.content}
                      </p>
                    </td>
                    <td className="py-4 px-6 whitespace-nowrap text-xs text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={12} className="text-slate-400" />
                        <span>{formatDate(ann.createdAt)}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(ann)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(ann)}
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
        title={editingAnnouncement ? "Edit Announcement" : "Create Announcement"}
        description="Share important class notices, exam schedules, or classroom news."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Announcement Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Mid-Term Examination Schedule Released"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Content Body <span className="text-rose-500">*</span>
            </label>
            <textarea
              placeholder="Write the complete announcement details, instructions, or meeting links..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="min-h-[120px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={5}
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          <div className="pt-1">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs sm:text-sm font-medium text-slate-700 dark:text-slate-300">
              <input
                type="checkbox"
                checked={formData.isPublished}
                onChange={(e) =>
                  setFormData({ ...formData, isPublished: e.target.checked })
                }
                className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
              />
              <span>Publish immediately to public announcements page</span>
            </label>
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
              <span>{editingAnnouncement ? "Save Changes" : "Post Announcement"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Announcement"
        description="Are you sure you want to delete this announcement?"
        itemTitle={deletingAnnouncement?.title}
      />
    </div>
  );
}
