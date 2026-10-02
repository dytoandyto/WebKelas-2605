"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  FolderOpen,
  Search,
  ExternalLink,
  Loader2,
  Link as LinkIcon,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createResourceAction,
  updateResourceAction,
  deleteResourceAction,
} from "@/lib/actions/resources";
import { ResourceCategory } from "@prisma/client";
import { cn } from "@/lib/utils";
import { EmptyState } from "@/components/ui/empty-state";

interface ResourceItem {
  id: string;
  title: string;
  description?: string | null;
  url: string;
  category: ResourceCategory;
}

interface ResourcesManagerProps {
  initialResources: ResourceItem[];
}

const CATEGORY_COLOR: Record<ResourceCategory, string> = {
  ACADEMIC: "badge-blue",
  CLASS: "badge-purple",
  REFERENCE: "badge-teal",
  IMPORTANT_LINK: "badge-amber",
  OTHER: "badge-gray",
};

const CATEGORY_LABELS: Record<ResourceCategory, string> = {
  ACADEMIC: "Academic",
  CLASS: "Class Hub",
  REFERENCE: "Reference",
  IMPORTANT_LINK: "Important Link",
  OTHER: "Other",
};

export function ResourcesManager({ initialResources }: ResourcesManagerProps) {
  const [resources, setResources] = useState<ResourceItem[]>(initialResources);
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<ResourceItem | null>(null);
  const [formData, setFormData] = useState<{
    title: string;
    description: string;
    url: string;
    category: ResourceCategory;
  }>({
    title: "",
    description: "",
    url: "",
    category: ResourceCategory.CLASS,
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingResource, setDeletingResource] = useState<ResourceItem | null>(null);

  function openCreateModal() {
    setEditingResource(null);
    setFormData({
      title: "",
      description: "",
      url: "",
      category: ResourceCategory.CLASS,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(res: ResourceItem) {
    setEditingResource(res);
    setFormData({
      title: res.title,
      description: res.description || "",
      url: res.url,
      category: res.category,
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(res: ResourceItem) {
    setDeletingResource(res);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Resource title is required.");
      return;
    }
    if (!formData.url.trim() || !/^https?:\/\//i.test(formData.url.trim())) {
      setFormError("A valid URL starting with http:// or https:// is required.");
      return;
    }

    startTransition(async () => {
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim() || null,
        url: formData.url.trim(),
        category: formData.category,
      };

      if (editingResource) {
        const res = await updateResourceAction(editingResource.id, payload);
        if (!res.success) {
          setFormError(res.error || "Failed to update resource.");
        } else {
          setResources((prev) =>
            prev.map((r) =>
              r.id === editingResource.id
                ? {
                    ...r,
                    ...payload,
                  }
                : r
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createResourceAction(payload);
        if (!res.success) {
          setFormError(res.error || "Failed to create resource.");
        } else {
          const newRes: ResourceItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...payload,
          };
          setResources((prev) => [newRes, ...prev]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingResource) return;
    const res = await deleteResourceAction(deletingResource.id);
    if (res.success) {
      setResources((prev) => prev.filter((r) => r.id !== deletingResource.id));
    }
  }

  const filteredResources = resources.filter((r) => {
    if (categoryFilter !== "ALL" && r.category !== categoryFilter) return false;
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.title.toLowerCase().includes(q) ||
      (r.description && r.description.toLowerCase().includes(q)) ||
      r.url.toLowerCase().includes(q)
    );
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
            All Links ({resources.length})
          </button>
          {Object.keys(ResourceCategory).map((catKey) => {
            const count = resources.filter((r) => r.category === catKey).length;
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
                {CATEGORY_LABELS[catKey as ResourceCategory]} {count > 0 && `(${count})`}
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
              placeholder="Search resources..."
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
            <span>Add Resource</span>
          </button>
        </div>
      </div>

      {/* Resources Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {resources.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-7 h-7 stroke-[1.75]" />}
            title="No campus resources yet"
            description="Add useful links and campus resources for the class."
            action={
              <button
                type="button"
                onClick={openCreateModal}
                className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm"
              >
                <Plus size={16} />
                <span>+ Add Resource</span>
              </button>
            }
          />
        ) : filteredResources.length === 0 ? (
          <EmptyState
            icon={<FolderOpen className="w-7 h-7 stroke-[1.75]" />}
            title="No resources found"
            description="No resources match your search or filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Resource Title & Description</th>
                  <th className="py-3.5 px-6">Destination URL</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredResources.map((res) => (
                  <tr key={res.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6 whitespace-nowrap">
                      <span className={cn("badge text-xs", CATEGORY_COLOR[res.category])}>
                        {CATEGORY_LABELS[res.category]}
                      </span>
                    </td>
                    <td className="py-4 px-6 max-w-md">
                      <div className="font-semibold text-slate-900 leading-snug">
                        {res.title}
                      </div>
                      {res.description && (
                        <p className="text-xs text-slate-500 line-clamp-1 mt-0.5">
                          {res.description}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6 max-w-xs">
                      <a
                        href={res.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-brand-600 hover:text-brand-800 flex items-center gap-1 truncate"
                        title={res.url}
                      >
                        <LinkIcon size={12} className="flex-shrink-0" />
                        <span className="truncate">{res.url}</span>
                        <ExternalLink size={11} className="flex-shrink-0 opacity-60" />
                      </a>
                    </td>
                    <td className="py-4 px-6 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(res)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(res)}
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
        title={editingResource ? "Edit Resource Link" : "Add Resource Link"}
        description="Share reference websites, course drives, syllabus docs, or tools."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4.5">
          {formError && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-xl text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Resource Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. Official Class Google Drive"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Category <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  category: e.target.value as ResourceCategory,
                })
              }
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors cursor-pointer"
            >
              {Object.keys(ResourceCategory).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat as ResourceCategory]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              URL Destination <span className="text-rose-500">*</span>
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/..."
              value={formData.url}
              onChange={(e) => setFormData({ ...formData, url: e.target.value })}
              className="h-10.5 px-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Description (Optional)
            </label>
            <textarea
              placeholder="Brief explanation of how to use this resource..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="min-h-[90px] p-3.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={2}
            />
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
              <span>{editingResource ? "Save Changes" : "Add Link"}</span>
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Resource Link"
        description="Are you sure you want to remove this resource link?"
        itemTitle={deletingResource?.title}
      />
    </div>
  );
}
