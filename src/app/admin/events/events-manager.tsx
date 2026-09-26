"use client";

import React, { useState, useTransition } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  Search,
  Loader2,
  CalendarDays,
  Sparkles,
} from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createEventAction,
  updateEventAction,
  deleteEventAction,
} from "@/lib/actions/events";
import { formatDate, cn } from "@/lib/utils";

interface ClassEventItem {
  id: string;
  title: string;
  description?: string | null;
  eventDate: Date | string;
  startTime?: string | null;
  endTime?: string | null;
  location?: string | null;
  imageUrl?: string | null;
  createdBy?: string;
  creator?: { id: string; name: string; role: string } | null;
}

interface EventsManagerProps {
  initialEvents: ClassEventItem[];
}

export function EventsManager({ initialEvents }: EventsManagerProps) {
  const [events, setEvents] = useState<ClassEventItem[]>(initialEvents);
  const [filter, setFilter] = useState<"ALL" | "UPCOMING" | "PAST">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<ClassEventItem | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    startTime: "",
    endTime: "",
    location: "",
    imageUrl: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingEvent, setDeletingEvent] = useState<ClassEventItem | null>(null);

  function openCreateModal() {
    setEditingEvent(null);
    setFormData({
      title: "",
      description: "",
      eventDate: new Date().toISOString().split("T")[0],
      startTime: "09:00",
      endTime: "12:00",
      location: "",
      imageUrl: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(event: ClassEventItem) {
    setEditingEvent(event);
    const dateStr = typeof event.eventDate === "string" 
      ? event.eventDate.split("T")[0] 
      : new Date(event.eventDate).toISOString().split("T")[0];

    setFormData({
      title: event.title,
      description: event.description || "",
      eventDate: dateStr,
      startTime: event.startTime || "",
      endTime: event.endTime || "",
      location: event.location || "",
      imageUrl: event.imageUrl || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(event: ClassEventItem) {
    setDeletingEvent(event);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.title.trim()) {
      setFormError("Event title is required.");
      return;
    }
    if (!formData.eventDate) {
      setFormError("Event date is required.");
      return;
    }

    startTransition(async () => {
      try {
        const payload = {
          title: formData.title.trim(),
          description: formData.description.trim() || undefined,
          eventDate: new Date(formData.eventDate),
          startTime: formData.startTime.trim() || undefined,
          endTime: formData.endTime.trim() || undefined,
          location: formData.location.trim() || undefined,
          imageUrl: formData.imageUrl.trim() || undefined,
        };

        if (editingEvent) {
          const res = await updateEventAction(editingEvent.id, payload);
          if (res.success && res.data) {
            setEvents((prev) =>
              prev.map((ev) => (ev.id === editingEvent.id ? { ...ev, ...res.data } : ev))
            );
            setModalOpen(false);
          } else {
            setFormError(res.error || "Failed to update event.");
          }
        } else {
          const res = await createEventAction(payload);
          if (res.success && res.data) {
            setEvents((prev) => [res.data, ...prev]);
            setModalOpen(false);
          } else {
            setFormError(res.error || "Failed to create event.");
          }
        }
      } catch (err: any) {
        setFormError(err.message || "An unexpected error occurred.");
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingEvent) return;
    const res = await deleteEventAction(deletingEvent.id);
    if (res.success) {
      setEvents((prev) => prev.filter((ev) => ev.id !== deletingEvent.id));
      setDeletingEvent(null);
    } else {
      alert(res.error || "Failed to delete event.");
    }
  }

  const now = new Date();
  const filteredEvents = events.filter((ev) => {
    const evDate = new Date(ev.eventDate);
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.location && ev.location.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ev.description && ev.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filter === "UPCOMING") return evDate >= now;
    if (filter === "PAST") return evDate < now;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, location, or keyword..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input pl-10 w-full"
          />
        </div>

        {/* Filters and CTA */}
        <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
          <div className="inline-flex rounded-xl bg-slate-200/70 p-1 border border-slate-200">
            {(["ALL", "UPCOMING", "PAST"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-all",
                  filter === tab
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                )}
              >
                {tab.toLowerCase()}
              </button>
            ))}
          </div>

          <button onClick={openCreateModal} className="btn btn-primary whitespace-nowrap">
            <Plus size={16} />
            <span>Add Event</span>
          </button>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="w-14 h-14 rounded-2xl bg-cyan-50 border border-cyan-200 flex items-center justify-center mx-auto mb-4 text-cyan-600">
            <CalendarDays size={26} />
          </div>
          <h3 className="font-bold text-slate-900 text-lg mb-1">No class events found</h3>
          <p className="text-slate-500 text-sm max-w-md mx-auto mb-6">
            {searchQuery
              ? `No events match "${searchQuery}". Try adjusting your search keyword.`
              : "No activities have been scheduled yet. Plan a hackathon, workshop, or class trip!"}
          </p>
          <button onClick={openCreateModal} className="btn btn-primary inline-flex">
            <Plus size={16} />
            Create First Event
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((ev) => {
            const isUpcoming = new Date(ev.eventDate) >= now;
            return (
              <div
                key={ev.id}
                className="card overflow-hidden flex flex-col group border border-slate-200 hover:border-cyan-500/30 transition-all hover:shadow-lg"
              >
                {ev.imageUrl && (
                  <div className="h-44 w-full bg-slate-100 overflow-hidden relative">
                    <img
                      src={ev.imageUrl}
                      alt={ev.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 right-3">
                      <span
                        className={cn(
                          "badge text-xs font-semibold shadow-sm backdrop-blur-md",
                          isUpcoming ? "badge-blue" : "badge-gray"
                        )}
                      >
                        {isUpcoming ? "Upcoming" : "Past Event"}
                      </span>
                    </div>
                  </div>
                )}

                <div className="p-5 flex-1 flex flex-col">
                  {!ev.imageUrl && (
                    <div className="mb-2">
                      <span
                        className={cn(
                          "badge text-xs font-semibold",
                          isUpcoming ? "badge-blue" : "badge-gray"
                        )}
                      >
                        {isUpcoming ? "Upcoming" : "Past Event"}
                      </span>
                    </div>
                  )}

                  <h3 className="font-bold text-slate-900 text-base leading-snug group-hover:text-cyan-700 transition-colors line-clamp-2 mb-2">
                    {ev.title}
                  </h3>

                  {ev.description && (
                    <p className="text-slate-600 text-sm line-clamp-2 mb-4 leading-relaxed">
                      {ev.description}
                    </p>
                  )}

                  <div className="mt-auto space-y-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                    <div className="flex items-center gap-2">
                      <Calendar size={13} className="text-cyan-600 flex-shrink-0" />
                      <span>{formatDate(ev.eventDate)}</span>
                    </div>

                    {(ev.startTime || ev.endTime) && (
                      <div className="flex items-center gap-2">
                        <Clock size={13} className="text-cyan-600 flex-shrink-0" />
                        <span>
                          {ev.startTime || "--:--"}
                          {ev.endTime ? ` – ${ev.endTime}` : ""}
                        </span>
                      </div>
                    )}

                    {ev.location && (
                      <div className="flex items-center gap-2 truncate">
                        <MapPin size={13} className="text-cyan-600 flex-shrink-0" />
                        <span className="truncate">{ev.location}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
                    <button
                      onClick={() => openEditModal(ev)}
                      className="btn btn-ghost btn-sm text-slate-600 hover:text-slate-900"
                      title="Edit event"
                    >
                      <Edit2 size={14} />
                      <span>Edit</span>
                    </button>
                    <button
                      onClick={() => openDeleteDialog(ev)}
                      className="btn btn-ghost btn-sm text-red-500 hover:bg-red-50 hover:text-red-700"
                      title="Delete event"
                    >
                      <Trash2 size={14} />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingEvent ? "Edit Class Event" : "Create New Class Event"}
        description="Fill out event details. Non-recurring events appear on the public class calendar."
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Event Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. COMPFEST Hackathon Ideation Session"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Description / Itinerary
            </label>
            <textarea
              rows={3}
              placeholder="Brief details about the event, objectives, or activities..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="input w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Event Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                required
                value={formData.eventDate}
                onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Time</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="input w-full"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Time</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="input w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Location / Venue / Virtual Link
            </label>
            <input
              type="text"
              placeholder="e.g. Software Lab 3 / Campus Convention Center / Zoom"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="input w-full"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Banner Image URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://..."
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="input w-full"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" disabled={isPending} className="btn btn-primary">
              {isPending && <Loader2 size={16} className="animate-spin" />}
              {editingEvent ? "Save Changes" : "Create Event"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Class Event"
        itemTitle={deletingEvent?.title}
        description="Are you sure you want to delete this event? This action cannot be undone."
      />
    </div>
  );
}
