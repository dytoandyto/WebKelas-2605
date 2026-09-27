"use client";

import React, { useState, useTransition } from "react";
import { Plus, Edit2, Trash2, Calendar, Clock, MapPin, User, Loader2, AlertTriangle } from "lucide-react";
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
  className?: string | null;
  semester?: string | null;
  academicYear?: string | null;
  notes?: string | null;
  subject?: {
    id: string;
    code: string;
    name: string;
    sks?: number | null;
    color?: string | null;
  } | null;
}

interface SubjectItem {
  id: string;
  code: string;
  name: string;
  lecturerName?: string | null;
  sks?: number | null;
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
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jum'at",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
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
    className: string;
    semester: string;
    academicYear: string;
    notes: string;
  }>({
    subjectId: subjects[0]?.id || "",
    dayOfWeek: DayOfWeek.MONDAY,
    startTime: "07:30",
    endTime: "11:30",
    room: "RLC.KJ.05.001",
    lecturerName: "",
    className: "JS1SI-26-REG-05",
    semester: "Semester Ganjil 2026/2027",
    academicYear: "2026/2027",
    notes: "",
  });
  const [formError, setFormError] = useState<string | null>(null);

  // Delete modal state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSchedule, setDeletingSchedule] = useState<ScheduleItem | null>(null);

  // Conflict calculation
  const conflictingSlots = schedules.filter((s) => {
    if (editingSchedule && s.id === editingSchedule.id) return false;
    if (s.dayOfWeek !== formData.dayOfWeek) return false;
    // Check overlap: startA < endB && endA > startB
    return formData.startTime < s.endTime && formData.endTime > s.startTime;
  });

  function openCreateModal() {
    setEditingSchedule(null);
    const firstSub = subjects[0];
    setFormData({
      subjectId: firstSub?.id || "",
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "07:30",
      endTime: "11:30",
      room: "RLC.KJ.05.001",
      lecturerName: firstSub?.lecturerName || "",
      className: "JS1SI-26-REG-05",
      semester: "Semester Ganjil 2026/2027",
      academicYear: "2026/2027",
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
      className: schedule.className || "JS1SI-26-REG-05",
      semester: schedule.semester || "Semester Ganjil 2026/2027",
      academicYear: schedule.academicYear || "2026/2027",
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
          const selectedSub = subjects.find((s) => s.id === formData.subjectId) || null;
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
          const selectedSub = subjects.find((s) => s.id === formData.subjectId) || null;
          const newSchedule: ScheduleItem = {
            id: (res.data as any)?.id || `temp-${Date.now()}`,
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
                : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
            )}
          >
            Semua Hari ({schedules.length})
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
                    : "bg-surface text-text-secondary border border-border hover:bg-surface-elevated"
                )}
              >
                {DAY_LABELS[day]} {count > 0 && `(${count})`}
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
      <div className="card border border-border bg-card shadow-xs overflow-hidden">
        {filteredSchedules.length === 0 ? (
          <div className="p-12 text-center">
            <Calendar className="w-10 h-10 text-text-muted mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-text-primary">No schedules found</p>
            <p className="text-xs text-text-muted mt-1">
              {selectedDay === "ALL"
                ? "Click 'Add Schedule' to create class slots."
                : `No class schedule for ${DAY_LABELS[selectedDay as DayOfWeek] || selectedDay}.`}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-text-secondary">
              <thead className="bg-surface text-xs font-semibold text-text-muted uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-3.5 px-6">Hari & Jam</th>
                  <th className="py-3.5 px-6">Mata Kuliah</th>
                  <th className="py-3.5 px-6">Ruangan & Kelas</th>
                  <th className="py-3.5 px-6">Dosen Pengampu</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border bg-card">
                {filteredSchedules.map((schedule) => (
                  <tr key={schedule.id} className="hover:bg-surface/50 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-text-primary">
                        {DAY_LABELS[schedule.dayOfWeek]}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-text-muted mt-0.5 font-mono">
                        <Clock size={12} />
                        <span>
                          {schedule.startTime} &ndash; {schedule.endTime} WIB
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-semibold text-text-primary">
                        {schedule.subject?.name || "Unknown Subject"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-brand-500/10 text-brand-600 dark:text-brand-400 border border-brand-500/20">
                          {schedule.subject?.code}
                        </span>
                        {schedule.subject?.sks && (
                          <span className="text-[11px] text-text-muted">
                            {schedule.subject.sks} SKS
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-text-primary font-medium">
                        <MapPin size={14} className="text-brand-500 shrink-0" />
                        <span className="truncate font-mono">{schedule.room}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {schedule.className || "JS1SI-26-REG-05"}
                      </p>
                      {schedule.notes && (
                        <p className="text-xs text-text-muted mt-0.5 truncate max-w-xs italic">
                          {schedule.notes}
                        </p>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-1.5 text-text-primary">
                        <User size={14} className="text-text-muted shrink-0" />
                        <span>{schedule.lecturerName || "Belum ditentukan"}</span>
                      </div>
                      <p className="text-[11px] text-text-muted mt-0.5">
                        {schedule.semester || "Semester Ganjil 2026/2027"}
                      </p>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(schedule)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-brand-500 hover:bg-surface transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(schedule)}
                          className="p-1.5 rounded-lg text-text-muted hover:text-rose-500 hover:bg-surface transition-colors"
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
        description="Set weekly timing, classroom location, course metadata, and semester period."
        maxWidth="lg"
      >
        <form onSubmit={handleFormSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-600 dark:text-red-400">
              {formError}
            </div>
          )}

          {conflictingSlots.length > 0 && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs text-amber-700 dark:text-amber-400 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={14} className="shrink-0" />
                <span>Peringatan Konflik Jadwal:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                {conflictingSlots.map((cs) => (
                  <li key={cs.id}>
                    Bentrok dengan {cs.subject?.name || cs.subject?.code} ({cs.startTime} - {cs.endTime} WIB) di {cs.room}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-text-muted mt-1">
                * Anda tetap dapat menyimpan jadwal ini jika kelas paralel atau asistensi bersamaan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Subject *</label>
              <select
                value={formData.subjectId}
                onChange={(e) => {
                  const subId = e.target.value;
                  const found = subjects.find((s) => s.id === subId);
                  setFormData({
                    ...formData,
                    subjectId: subId,
                    lecturerName: found?.lecturerName || formData.lecturerName,
                  });
                }}
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
                required
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.code} - {sub.name} {sub.sks ? `(${sub.sks} SKS)` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Hari (Day of the Week) *</label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })
                }
                className="form-select text-sm w-full bg-surface border-border text-text-primary"
                required
              >
                {DAYS.map((day) => (
                  <option key={day} value={day}>
                    {DAY_LABELS[day]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Jam Mulai (WIB) *</label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
                required
              />
            </div>
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Jam Selesai (WIB) *</label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
                required
              />
            </div>
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Ruangan / Lokasi *</label>
              <input
                type="text"
                placeholder="e.g. RLC.KJ.05.001"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Dosen Pengampu</label>
              <input
                type="text"
                placeholder="e.g. Nama Dosen / Asisten"
                value={formData.lecturerName}
                onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
              />
            </div>
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Kelas</label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary font-mono"
              />
            </div>
            <div>
              <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Semester & Periode</label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="form-input text-sm w-full bg-surface border-border text-text-primary"
              />
            </div>
          </div>

          <div>
            <label className="form-label text-xs font-semibold text-text-primary mb-1 block">Catatan / Keterangan (Opsional)</label>
            <textarea
              placeholder="e.g. Praktikum di Lab Pemrograman, bawa laptop terinstall IDE..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="form-textarea text-sm w-full bg-surface border-border text-text-primary"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
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

