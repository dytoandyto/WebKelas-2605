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
        description="Share class memories, hackathons, and gatherings."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Photo Title *</label>
            <input
              type="text"
              placeholder="e.g. National Hackathon Team Pitch"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Image URL *</label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... or hosted image"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
            {formData.imageUrl && (
              <div className="mt-2 h-32 rounded-lg overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={formData.imageUrl}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>

          <div>
            <label className="form-label">Event Date</label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
              className="form-input text-sm w-full"
            />
          </div>

          <div>
            <label className="form-label">Description & Caption</label>
            <textarea
              placeholder="Describe this moment, location, or participants..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="form-textarea text-sm w-full"
              rows={2}
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
              {editingPhoto ? "Save Changes" : "Upload Photo"}
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
