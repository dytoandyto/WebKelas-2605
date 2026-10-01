"use client";

import React, { useState, useTransition, useMemo } from "react";
import {
  Plus,
  Edit2,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  User,
  Loader2,
  AlertTriangle,
  Search,
  LayoutGrid,
  List as ListIcon,
  X,
} from "lucide-react";
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
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");
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
      setFormError("Pilih mata kuliah.");
      return;
    }
    if (!formData.room.trim()) {
      setFormError("Ruangan / Lokasi harus diisi.");
      return;
    }
    if (formData.startTime >= formData.endTime) {
      setFormError("Jam mulai harus lebih awal dari jam selesai.");
      return;
    }

    startTransition(async () => {
      if (editingSchedule) {
        const res = await updateScheduleAction(editingSchedule.id, formData);
        if (!res.success) {
          setFormError(res.error || "Gagal memperbarui jadwal.");
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
          setFormError(res.error || "Gagal menambahkan jadwal.");
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

  // Filtered schedules with day and search query
  const filteredSchedules = useMemo(() => {
    return schedules
      .filter((s) => {
        if (selectedDay !== "ALL" && s.dayOfWeek !== selectedDay) {
          return false;
        }
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchSub = s.subject?.name.toLowerCase().includes(q);
          const matchCode = s.subject?.code.toLowerCase().includes(q);
          const matchRoom = s.room.toLowerCase().includes(q);
          const matchLect = (s.lecturerName || "").toLowerCase().includes(q);
          const matchClass = (s.className || "").toLowerCase().includes(q);
          if (!matchSub && !matchCode && !matchRoom && !matchLect && !matchClass) {
            return false;
          }
        }
        return true;
      })
      .sort((a, b) => {
        const dayOrder = DAYS.indexOf(a.dayOfWeek) - DAYS.indexOf(b.dayOfWeek);
        if (dayOrder !== 0) return dayOrder;
        return a.startTime.localeCompare(b.startTime);
      });
  }, [schedules, selectedDay, searchQuery]);

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Action Bar: Day Segmented Tabs, Search & Action Button */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3.5">
        {/* Compact Segmented Day Navigation */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-slate-800 overflow-x-auto max-w-full">
          <button
            type="button"
            onClick={() => setSelectedDay("ALL")}
            className={cn(
              "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
              selectedDay === "ALL"
                ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
            )}
          >
            <span>All</span>
            <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
              {schedules.length}
            </span>
          </button>
          {DAYS.filter((d) => d !== "SUNDAY").map((day) => {
            const count = schedules.filter((s) => s.dayOfWeek === day).length;
            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDay(day)}
                className={cn(
                  "px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 cursor-pointer",
                  selectedDay === day
                    ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                )}
              >
                <span>{DAY_LABELS[day]}</span>
                <span
                  className={cn(
                    "text-[11px] font-mono",
                    count > 0
                      ? "text-slate-500 dark:text-slate-400 font-medium"
                      : "text-slate-400 dark:text-slate-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Right Controls: Search, View Switcher & Primary Action */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72 md:w-80">
            <Search
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
            />
            <input
              type="text"
              placeholder="Search subjects, rooms, lecturers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9.5 pl-8.5 pr-8 w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs sm:text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:border-blue-600 transition-colors shadow-2xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
                title="Clear search"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* View Toggle */}
          <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-900/80 rounded-lg border border-slate-200/80 dark:border-slate-800 shrink-0">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={cn(
                "p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "table"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="Table View"
            >
              <ListIcon size={15} />
              <span className="hidden sm:inline text-xs font-semibold">Table</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer",
                viewMode === "grid"
                  ? "bg-white dark:bg-slate-800 text-blue-600 dark:text-blue-400 shadow-xs"
                  : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
              )}
              title="Weekly Timetable Grid"
            >
              <LayoutGrid size={15} />
              <span className="hidden sm:inline text-xs font-semibold">Timetable</span>
            </button>
          </div>

          {/* Add Schedule Button */}
          <button
            type="button"
            onClick={openCreateModal}
            className="h-9.5 px-4 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus size={16} />
            <span>Add Schedule</span>
          </button>
        </div>
      </div>

      {/* Main View Area */}
      {viewMode === "table" ? (
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] shadow-2xs overflow-hidden">
          {filteredSchedules.length === 0 ? (
            <div className="p-12 text-center">
              <Calendar className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                No schedule slots found
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchQuery
                  ? `Tidak ditemukan jadwal yang cocok dengan kata kunci "${searchQuery}".`
                  : selectedDay === "ALL"
                  ? "Belum ada jadwal yang didaftarkan. Klik 'Add Schedule' untuk membuat sesi kelas baru."
                  : `Tidak ada jadwal perkuliahan untuk hari ${DAY_LABELS[selectedDay as DayOfWeek] || selectedDay}.`}
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-slate-50/90 dark:bg-slate-900/60 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-3 px-6">DAY & TIME</th>
                      <th className="py-3 px-6">SUBJECT</th>
                      <th className="py-3 px-6">ROOM & VENUE</th>
                      <th className="py-3 px-6">LECTURER</th>
                      <th className="py-3 px-6 text-right">ACTION</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/70">
                    {filteredSchedules.map((schedule) => (
                      <tr
                        key={schedule.id}
                        className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                      >
                        {/* Day & Time */}
                        <td className="py-4.5 px-6 whitespace-nowrap">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white">
                            {DAY_LABELS[schedule.dayOfWeek]}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 mt-1 font-mono font-medium">
                            <Clock size={13} className="shrink-0 text-slate-400" />
                            <span>
                              {schedule.startTime} &ndash; {schedule.endTime}
                            </span>
                            <span className="text-[10px] text-slate-400 font-sans font-normal">
                              WIB
                            </span>
                          </div>
                        </td>

                        {/* Subject Title, Code & SKS */}
                        <td className="py-4.5 px-6">
                          <div className="font-semibold text-sm text-slate-900 dark:text-white leading-snug">
                            {schedule.subject?.name || "Unknown Subject"}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {schedule.subject?.code}
                            </span>
                            {schedule.subject?.sks && (
                              <span className="text-xs text-slate-500 dark:text-slate-400 font-normal">
                                · {schedule.subject.sks} SKS
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Room, Class & Notes */}
                        <td className="py-4.5 px-6">
                          <div className="flex items-center gap-1.5 font-semibold text-sm text-slate-900 dark:text-white font-mono">
                            <MapPin size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                            <span>{schedule.room}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-mono">
                            {schedule.className || "JS1SI-26-REG-05"}
                          </div>
                          {schedule.notes && (
                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-1 max-w-xs">
                              {schedule.notes}
                            </div>
                          )}
                        </td>

                        {/* Lecturer & Semester */}
                        <td className="py-4.5 px-6">
                          <div className="font-medium text-sm text-slate-900 dark:text-white flex items-center gap-1.5">
                            <User size={14} className="text-slate-400 shrink-0" />
                            <span>{schedule.lecturerName || "Belum ditentukan"}</span>
                          </div>
                          <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                            {schedule.semester || "Semester Ganjil 2026/2027"}
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4.5 px-6 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openEditModal(schedule)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/40 dark:text-slate-400 dark:hover:text-blue-400 border border-transparent hover:border-blue-200 dark:hover:border-blue-800 transition-colors cursor-pointer"
                              title="Edit Schedule"
                              aria-label="Edit"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteDialog(schedule)}
                              className="h-9 w-9 inline-flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 dark:text-slate-400 dark:hover:text-rose-400 border border-transparent hover:border-rose-200 dark:hover:border-rose-800 transition-colors cursor-pointer"
                              title="Delete Schedule"
                              aria-label="Delete"
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

              {/* Mobile Responsive Cards */}
              <div className="md:hidden divide-y divide-slate-100 dark:divide-slate-800/80">
                {filteredSchedules.map((schedule) => (
                  <div key={schedule.id} className="p-4 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {DAY_LABELS[schedule.dayOfWeek]}
                        </span>
                        <span className="text-slate-300 dark:text-slate-700">·</span>
                        <span className="text-xs font-mono font-medium text-blue-600 dark:text-blue-400">
                          {schedule.startTime} - {schedule.endTime} WIB
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => openEditModal(schedule)}
                          className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => openDeleteDialog(schedule)}
                          className="p-2 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <div className="font-semibold text-sm text-slate-900 dark:text-white">
                        {schedule.subject?.name || "Unknown Subject"}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                          {schedule.subject?.code}
                        </span>
                        {schedule.subject?.sks && (
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            · {schedule.subject.sks} SKS
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400 pt-1">
                      <div className="flex items-center gap-1 font-mono text-slate-700 dark:text-slate-300">
                        <MapPin size={13} className="text-blue-600 shrink-0" />
                        <span>{schedule.room}</span>
                        <span className="text-slate-400">({schedule.className || "JS1SI-26-REG-05"})</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <User size={13} className="text-slate-400 shrink-0" />
                        <span>{schedule.lecturerName || "Belum ditentukan"}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      ) : (
        /* Weekly Timetable Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3.5">
          {DAYS.filter((d) => d !== "SUNDAY").map((day) => {
            const daySchedules = schedules
              .filter((s) => s.dayOfWeek === day)
              .sort((a, b) => a.startTime.localeCompare(b.startTime));

            return (
              <div
                key={day}
                className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c1427] p-3.5 flex flex-col min-h-[220px] shadow-2xs"
              >
                <div className="flex items-center justify-between pb-2.5 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                    {DAY_LABELS[day]}
                  </span>
                  <span className="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                    {daySchedules.length}
                  </span>
                </div>

                {daySchedules.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-xs text-slate-400 dark:text-slate-600">
                    Tidak ada jadwal
                  </div>
                ) : (
                  <div className="space-y-2 flex-1">
                    {daySchedules.map((item) => (
                      <div
                        key={item.id}
                        className="p-2.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/40 hover:border-blue-300 dark:hover:border-blue-700/60 transition-colors group relative"
                      >
                        <div className="flex items-center justify-between text-[11px] font-mono font-medium text-blue-600 dark:text-blue-400">
                          <span>
                            {item.startTime} - {item.endTime}
                          </span>
                          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => openEditModal(item)}
                              className="p-0.5 text-slate-400 hover:text-blue-600"
                              title="Edit"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              type="button"
                              onClick={() => openDeleteDialog(item)}
                              className="p-0.5 text-slate-400 hover:text-rose-600"
                              title="Delete"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="font-semibold text-xs text-slate-900 dark:text-white mt-1 line-clamp-2">
                          {item.subject?.name}
                        </div>
                        <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500 font-mono">
                          <span>📍 {item.room}</span>
                          <span>{item.subject?.sks} SKS</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 rounded-lg text-xs text-rose-600 dark:text-rose-400">
              {formError}
            </div>
          )}

          {conflictingSlots.length > 0 && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 space-y-1">
              <div className="flex items-center gap-1.5 font-semibold">
                <AlertTriangle size={14} className="shrink-0 text-amber-600 dark:text-amber-400" />
                <span>Peringatan Konflik Jadwal:</span>
              </div>
              <ul className="list-disc list-inside text-[11px] space-y-0.5 pl-1">
                {conflictingSlots.map((cs) => (
                  <li key={cs.id}>
                    Bentrok dengan {cs.subject?.name || cs.subject?.code} ({cs.startTime} - {cs.endTime} WIB) di {cs.room}
                  </li>
                ))}
              </ul>
              <p className="text-[10px] text-amber-600 dark:text-amber-400/80 mt-1">
                * Anda tetap dapat menyimpan jadwal ini jika kelas paralel atau asistensi bersamaan.
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Subject <span className="text-rose-500">*</span>
              </label>
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
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors cursor-pointer"
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
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Hari (Day of the Week) <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.dayOfWeek}
                onChange={(e) =>
                  setFormData({ ...formData, dayOfWeek: e.target.value as DayOfWeek })
                }
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors cursor-pointer"
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

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Jam Mulai (WIB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full font-mono focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Jam Selesai (WIB) <span className="text-rose-500">*</span>
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full font-mono focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Ruangan / Lokasi <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. RLC.KJ.05.001"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full font-mono focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Dosen Pengampu
              </label>
              <input
                type="text"
                placeholder="e.g. Nama Dosen / Asisten"
                value={formData.lecturerName}
                onChange={(e) => setFormData({ ...formData, lecturerName: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Kelas
              </label>
              <input
                type="text"
                value={formData.className}
                onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full font-mono focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
                Semester & Periode
              </label>
              <input
                type="text"
                value={formData.semester}
                onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
                className="h-10 px-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white text-sm w-full focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs sm:text-[13px] font-semibold text-slate-900 dark:text-slate-100 mb-1.5">
              Catatan / Keterangan (Opsional)
            </label>
            <textarea
              placeholder="e.g. Praktikum di Lab Pemrograman, bawa laptop terinstall IDE..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="min-h-[80px] p-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder:text-slate-400 text-sm w-full resize-y focus:border-blue-600 dark:focus:border-blue-500 focus:ring-1 focus:ring-blue-600 outline-none transition-colors"
              rows={2}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="h-9.5 px-4 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
              disabled={isPending}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="h-9.5 px-5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs sm:text-sm font-medium flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              {isPending && <Loader2 size={15} className="animate-spin" />}
              <span>{editingSchedule ? "Save Changes" : "Create Slot"}</span>
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
