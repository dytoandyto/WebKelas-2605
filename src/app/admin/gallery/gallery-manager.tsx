"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  ImageIcon,
  Search,
  Calendar,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createGalleryAction,
  updateGalleryAction,
  deleteGalleryAction,
} from "@/lib/actions/gallery";
import { formatDate } from "@/lib/utils";

interface GalleryItem {
  id: string;
  title: string;
  description?: string | null;
  imageUrl: string;
  eventDate?: Date | string | null;
  createdAt: Date | string;
}

interface GalleryManagerProps {
  initialGallery: GalleryItem[];
}

export function GalleryManager({ initialGallery }: GalleryManagerProps) {
  const [gallery, setGallery] = useState<GalleryItem[]>(initialGallery);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPhoto, setEditingPhoto] = useState<GalleryItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    imageUrl: "",
    eventDate: new Date().toISOString().slice(0, 10),
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingPhoto, setDeletingPhoto] = useState<GalleryItem | null>(null);

  function openCreateModal() {
    setEditingPhoto(null);
    setFormData({
      title: "",
      description: "",
      imageUrl: "",
      eventDate: new Date().toISOString().slice(0, 10),
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(photo: GalleryItem) {
    setEditingPhoto(photo);
    const d = photo.eventDate ? new Date(photo.eventDate) : new Date();
    const dateStr = !isNaN(d.getTime()) ? d.toISOString().slice(0, 10) : "";

    setFormData({
      title: photo.title,
      description: photo.description || "",
      imageUrl: photo.imageUrl,
      eventDate: dateStr,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(photo: GalleryItem) {
    setDeletingPhoto(photo);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Photo title is required.");
      return;
    }
    if (!formData.imageUrl.trim()) {
      setFormError("Image URL is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        imageUrl: formData.imageUrl.trim(),
        eventDate: formData.eventDate || null,
      };

      if (editingPhoto) {
        const res = await updateGalleryAction(editingPhoto.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update photo.");
        } else {
          setGallery((prev) =>
            prev.map((g) =>
              g.id === editingPhoto.id
                ? {
                    ...g,
                    ...payload,
                    eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
                  }
                : g
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createGalleryAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to upload photo.");
        } else {
          const newPhoto: GalleryItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
            eventDate: payload.eventDate ? new Date(payload.eventDate) : null,
            createdAt: new Date(),
          };
          setGallery((prev) => [newPhoto, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingPhoto) return;
    const res = await deleteGalleryAction(deletingPhoto.id);
    if (res.success) {
      setGallery((prev) => prev.filter((g) => g.id !== deletingPhoto.id));
    }
  }

  const filteredGallery = gallery.filter((g) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return g.title.toLowerCase().includes(q) || (g.description && g.description.toLowerCase().includes(q));
  });

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 sm:max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search photo memories..."
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
          <span>Upload Photo</span>
        </button>
      </div>

      {/* Photo Grid */}
      {filteredGallery.length === 0 ? (
        <div className="card p-16 text-center border border-slate-200/80">
          <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-slate-600">No photos in gallery</p>
          <p className="text-xs text-slate-400 mt-1">
            Upload pictures from workshops, campus hangouts, or hackathons.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {filteredGallery.map((photo) => (
            <div
              key={photo.id}
              className="card overflow-hidden border border-slate-200/80 shadow-xs flex flex-col group"
            >
              {/* Image Preview Container */}
              <div className="relative h-48 bg-slate-100 overflow-hidden">
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <a
                    href={photo.imageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 flex items-center justify-center transition-colors shadow-sm"
                    title="View Full Image"
                  >
                    <ExternalLink size={14} />
                  </a>
                  <button
                    type="button"
                    onClick={() => openEditModal(photo)}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-brand-600 flex items-center justify-center transition-colors shadow-sm"
                    title="Edit"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => openDeleteDialog(photo)}
                    className="w-8 h-8 rounded-full bg-white/90 hover:bg-white text-red-600 flex items-center justify-center transition-colors shadow-sm"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Photo Details */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2">
                    {photo.title}
                  </h4>
                  {photo.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                      {photo.description}
                    </p>
                  )}
                </div>

                {photo.eventDate && (
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3 pt-2 border-t border-slate-100">
                    <Calendar size={12} />
                    <span>{formatDate(photo.eventDate)}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingPhoto ? "Edit Photo Details" : "Upload to Gallery"}
        description={
          editingPhoto
            ? "Modify the photo title, event date, or caption."
            : "Share class memories, activities, and important moments."
        }
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {/* Photo Title */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Photo Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. National Hackathon Team Pitch"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          {/* Image Source & Upload Area */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100">
                Image <span className="text-rose-500">*</span>
              </label>
            </div>

            {formData.imageUrl ? (
              /* Preview with Replace / Remove Actions */
              <div className="rounded-xl border border-slate-200 dark:border-slate-700 p-3 bg-slate-50/70 dark:bg-slate-900/50">
                <div className="relative h-44 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-900">
                  <img
                    src={formData.imageUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex items-center justify-between mt-3 px-1">
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[280px]">
                    Image selected
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 cursor-pointer">
                      <span>Replace</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const reader = new FileReader();
                            reader.onload = (evt) => {
                              if (evt.target?.result) {
                                setFormData({ ...formData, imageUrl: evt.target.result as string });
                              }
                            };
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </label>
                    <span className="text-slate-300 dark:text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, imageUrl: "" })}
                      className="text-xs font-semibold text-rose-500 hover:text-rose-600 cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Modern Dropzone & URL Input Option */
              <div className="space-y-3">
                <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl bg-slate-50/50 dark:bg-slate-900/30 hover:bg-blue-50/30 dark:hover:bg-blue-950/20 cursor-pointer transition-all text-center group">
                  <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center mb-2 text-blue-600 dark:text-blue-400 group-hover:scale-105 transition-transform">
                    <ImageIcon size={20} />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Upload your image
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    PNG, JPG, WebP up to 5MB
                  </span>
                  <span className="mt-3 inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-2xs group-hover:border-slate-300">
                    Choose Image
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setFormData({ ...formData, imageUrl: evt.target.result as string });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </label>

                {/* Secondary URL Input Option */}
                <div>
                  <div className="relative flex items-center my-1.5">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="shrink-0 px-2.5 text-[10px] uppercase font-semibold text-slate-400 font-mono">
                      or use URL
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/... or hosted image"
                    value={formData.imageUrl}
                    onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    className="h-10 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-xs sm:text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Event Date */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Event Date
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Description & Caption
            </label>
            <textarea
              placeholder="Describe this moment, location, or participants..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[100px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
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
              <span>{editingPhoto ? "Save Changes" : "Upload Photo"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Photo"
        description="Are you sure you want to remove this photo from the gallery?"
        itemTitle={deletingPhoto?.title}
      />
    </div>
  );
}
