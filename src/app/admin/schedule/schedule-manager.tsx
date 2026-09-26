"use client";

import React, { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, Loader2 } from "lucide-react";
import { Modal } from "@/components/admin/modal";
import { DeleteDialog } from "@/components/admin/delete-dialog";
import {
  createScheduleAction,
  updateScheduleAction,
  deleteScheduleAction,
} from "@/lib/actions/schedules";
import { DayOfWeek } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  subjectId: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room: string;
  lecturerName?: string | null;
  notes?: string | null;
  subject?: {
    id: string;
    code: string;
    name: string;
  };
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
}

interface ScheduleManagerProps {
  initialSchedules: ScheduleItem[];
  subjects: SubjectItem[];
}

const DAYS: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

const DAY_LABELS: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

export function ScheduleManager({ initialSchedules, subjects }: ScheduleManagerProps) {
  const [schedules, setSchedules] = useState<ScheduleItem[]>(initialSchedules);
  const [selectedDay, setSelectedDay] = useState<string>("ALL");
  const [isPending, startTransition] = useTransition();

  // Form modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<ScheduleItem | null>(null);
  const [formData, setFormData] = useState<{
    subjectId: string;
    dayOfWeek: DayOfWeek;
    startTime: string;
    endTime: string;
    room: string;
    lecturerName: string;
    notes: string;
  }>({
    subjectId: subjects[0]?.id || "",
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: "08:00",
    endTime: "10:30",
    room: "",
    lecturerName: "",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleItem | null>(null);

  function openCreateModal() {
    setEditingSchedule(null);
    setFormData({
      subjectId: subjects[0]?.id || "",
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "08:00",
      endTime: "10:30",
      room: "",
      lecturerName: "",
      notes: "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openEditModal(schedule: ScheduleItem) {
    setEditingSchedule(schedule);
    setFormData({
      subjectId: schedule.subjectId,
      dayOfWeek: schedule.dayOfWeek,
      startTime: schedule.startTime,
      endTime: schedule.endTime,
      room: schedule.room,
      lecturerName: schedule.lecturerName || "",
      notes: schedule.notes || "",
    });
    setFormError(null);
    setModalOpen(true);
  }

  function openDeleteDialog(schedule: ScheduleItem) {
    setDeletingSchedule(schedule);
    setDeleteDialogOpen(true);
  }

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);

    if (!formData.subjectId) {
      setFormError("Please select a subject.");
      return;
    }
    if (!formData.room.trim()) {
      setFormError("Room/Location is required.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setFormError("Start time must be earlier than end time.");
      return;
    }

    startTransition(async () => {
      if (editingSchedule) {
        const res = await updateScheduleAction(editingSchedule.id, formData);
        if (!res.success) {
          setFormError(res.error || "Failed to update schedule.");
        } else {
          const selectedSub = subjects.find((s) => s.id === formData.subjectId);
          setSchedules((prev) =>
            prev.map((s) =>
              s.id === editingSchedule.id
                ? {
                    ...s,
                    ...formData,
                    subject: selectedSub || s.subject,
                  }
                : s
            )
          );
          setModalOpen(false);
        }
      } else {
        const res = await createScheduleAction(formData);
        if (!res.success) {
          setFormError(res.error || "Failed to create schedule.");
        } else {
          const selectedSub = subjects.find((s) => s.id === formData.subjectId);
          const newSchedule: ScheduleItem = {
            id: res.data?.id || `temp-${Date.now()}`,
            ...formData,
            subject: selectedSub,
          };
          setSchedules((prev) => [...prev, newSchedule]);
          setModalOpen(false);
        }
      }
    });
  }

  async function handleDeleteConfirm() {
    if (!deletingSchedule) return;
    const res = await deleteScheduleAction(deletingSchedule.id);
    if (res.success) {
      setSchedules((prev) => prev.filter((s) => s.id !== deletingSchedule.id));
    }
  }

  const filteredSchedules = schedules.filter((s) => {
    if (selectedDay === "ALL") return true;
    return s.dayOfWeek === selectedDay;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls: Day Tabs + Add button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Day Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
              selectedDay === "ALL"
                ? "bg-brand-600 text-white shadow-xs"
                : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
            )}
          >
            All Days ({schedules.length})
          </button>
          {DAYS.map((day) => {
            const count = schedules.filter((s) => s.dayOfWeek === day).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors",
                  selectedDay === day
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                )}
              >
                {DAY_LABELS[day].slice(0, 3)} {count > 0 && `(${count})`}
              </button>
            );
          })}
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="btn btn-primary btn-sm flex items-center gap-1.5 shadow-sm self-start sm:self-auto"
        >
          <Plus size={16} />
          <span>Add Schedule</span>
        </button>
      </div>

      {/* Schedules List / Table */}
      <div className="card border border-slate-200/80 shadow-xs overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-600">No schedules found</p>
            <p className="text-xs text-slate-400 mt-1">
              {selectedDay === "ALL"
                ? "Click 'Add Schedule' to create class slots."
                : `No class schedule for ${DAY_LABELS[selectedDay as DayOfWeek] || selectedDay}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3.5 px-6">Day & Time</th>
                  <th className="py-3.5 px-6">Subject</th>
                  <th className="py-3.5 px-6">Room / Location</th>
                  <th className="py-3.5 px-6">Lecturer</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">
                        {DAY_LABELS[schedule.dayOfWeek]}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-slate-400 mt-0.5">
                        <Clock size={12} />
                        <span>
                          {schedule.startTime} &ndash; {schedule.endTime}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900">
                        {schedule.subject?.name || "Unknown Subject"}
                      </div>
                      <span className="badge badge-blue text-[11px] mt-0.5">
                        {schedule.subject?.code}
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <MapPin size={14} className="text-slate-400 flex-shrink-0" />
                        <span className="truncate">{schedule.room}</span>
                      </div>
                      {schedule.notes && (
                        <p className="text-xs text-slate-400 mt-0.5 truncate max-w-xs">
                          {schedule.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <User size={14} className="text-slate-400 flex-shrink-0" />
                        <span>{schedule.lecturerName || "Not assigned"}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(schedule)}
                          className="btn btn-ghost btn-icon p-1.5 text-slate-500 hover:text-brand-600"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(schedule)}
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
        title={editingSchedule ? "Edit Schedule Slot" : "Add Schedule Slot"}
        description="Set the weekly timing, room, and course assignment."
        maxWidth="md"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-600">
              {formError}
            </div>
          )}

          <div>
            <label className="form-label">Subject *</label>
            <select
              value={formData.subjectId}
              onChange={(e) => setFormData({ ...formData, subjectId: e.target.value })}
              className="form-select text-sm w-full"
              required
            >
              {subjects.map((sub) => (
                <option key={sub.id} value={sub.id}>
                  {sub.code} - {sub.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="form-label">Day of the Week *</label>
            <select
              value={formData.dayOfWeek}
              onChange={(e) =>
                setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })
              }
              className="form-select text-sm w-full"
              required
            >
              {DAYS.map((day) => (
                <option key={day} value={day}>
                  {DAY_LABELS[day]}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="form-label">Start Time *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="form-input text-sm w-full"
                required
              />
            </div>
            <div>
              <label className="form-label">End Time *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="form-input text-sm w-full"
                required
              />
            </div>
          </div>

          <div>
            <label className="form-label">Room / Location *</label>
            <input
              type="text"
              placeholder="e.g. Lab 402, Building A or Online Zoom"
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              className="form-input text-sm w-full"
              required
            />
          </div>

          <div>
            <label className="form-label">Lecturer Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Dr. Jane Doe"
              value={formData.lecturerName}
              onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
              className="form-input text-sm w-full"
            />
          </div>

          <div>
            <label className="form-label">Notes / Instructions (Optional)</label>
            <textarea
              placeholder="e.g. Bring your laptop with Docker installed"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
              {editingSchedule ? "Save Changes" : "Create Slot"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <DeleteDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Schedule Slot"
        description="Are you sure you want to remove this schedule slot?"
        itemTitle={
          deletingSchedule
            ? `${DAY_LABELS[deletingSchedule.dayOfWeek]} ${deletingSchedule.startTime}-${deletingSchedule.endTime} (${deletingSchedule.subject?.code})`
            : undefined
        }
      />
    </div>
  );
}
