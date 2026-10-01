"use client";

import * as React from "react";
import Link from "next/link";
import {
  Clock,
  MapPin,
  User,
  GraduationCap,
  BookOpen,
  ExternalLink,
  FileText,
  Sparkles,
  Calendar,
  X,
  ArrowRight,
} from "lucide-react";
import { ScheduleItem } from "./schedule-grid";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ScheduleDetailDialogProps {
  schedule: ScheduleItem | null;
  open: boolean;
  onClose: () => void;
  todayDayOfWeek?: string;
}

const DAY_LABELS: Record<string, string> = {
  MONDAY: "Senin",
  TUESDAY: "Selasa",
  WEDNESDAY: "Rabu",
  THURSDAY: "Kamis",
  FRIDAY: "Jum'at",
  SATURDAY: "Sabtu",
  SUNDAY: "Minggu",
};

export function ScheduleDetailDialog({
  schedule,
  open,
  onClose,
  todayDayOfWeek,
}: ScheduleDetailDialogProps) {
  // Close on ESC
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        onClose();
      }
    };
    if (open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open || !schedule) return null;

  const isToday = schedule.dayOfWeek === todayDayOfWeek;
  const dayName = DAY_LABELS[schedule.dayOfWeek] || schedule.dayOfWeek;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/80 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="schedule-dialog-title"
        className={cn(
          "relative z-50 w-full max-w-xl rounded-2xl p-6 sm:p-7 shadow-2xl transition-all",
          "bg-white dark:bg-[#081326] border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-slate-100",
          "shadow-2xl shadow-slate-900/10 dark:shadow-[0_25px_60px_rgba(0,0,0,0.85)]",
          "animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
        )}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)] dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Badges */}
        <div className="flex items-center gap-2 flex-wrap pr-8 mb-3">
          <span className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-blue-50 border border-blue-200 text-blue-700 dark:bg-cyan-500/15 dark:border-cyan-400/40 dark:text-cyan-300">
            {schedule.subject.code}
          </span>
          {schedule.subject.sks && (
            <span className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-[var(--text-secondary)] font-mono">
              {schedule.subject.sks} SKS
            </span>
          )}
          {isToday ? (
            <Badge variant="cyan" size="sm" dot>
              Perkuliahan Hari Ini
            </Badge>
          ) : (
            <Badge variant="outline" size="sm">
              Terjadwal
            </Badge>
          )}
        </div>

        {/* Course Title */}
        <h3
          id="schedule-dialog-title"
          className="text-xl sm:text-2xl font-black text-slate-900 dark:text-[var(--text-primary)] tracking-tight leading-snug"
        >
          {schedule.subject.name}
        </h3>

        {schedule.subject.englishName &&
          schedule.subject.englishName !== schedule.subject.name && (
            <p className="text-sm text-slate-500 dark:text-[var(--text-muted)] italic mt-1 font-sans">
              {schedule.subject.englishName}
            </p>
          )}

        {/* Info Grid - High Contrast & Clearly Legible */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
          {/* Day & Time */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-[var(--border-color)] dark:bg-[var(--surface-card)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-400 mb-1.5">
              <Clock className="w-4 h-4" />
              <span>Hari & Waktu</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-[var(--text-primary)]">
              {dayName}
            </div>
            <div className="text-xs font-mono text-slate-500 dark:text-[var(--text-secondary)] mt-0.5">
              {schedule.startTime} - {schedule.endTime} WIB
            </div>
          </div>

          {/* Room */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-[var(--border-color)] dark:bg-[var(--surface-card)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-1.5">
              <MapPin className="w-4 h-4" />
              <span>Ruangan Kuliah</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-[var(--text-primary)]">
              {schedule.room || "Ruang Belum Ditentukan"}
            </div>
            <div className="text-xs text-slate-500 dark:text-[var(--text-secondary)] mt-0.5">
              Kampus Telkom University Jakarta
            </div>
          </div>

          {/* Lecturer */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-[var(--border-color)] dark:bg-[var(--surface-card)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-1.5">
              <User className="w-4 h-4" />
              <span>Dosen Pengampu</span>
            </div>
            <div className="text-sm font-bold text-slate-900 dark:text-[var(--text-primary)]">
              {schedule.lecturerName ||
                schedule.subject.lecturerName ||
                "Dosen Pengampu"}
            </div>
            {schedule.subject.code === "BBK1AAB4" && (
              <div className="text-[11px] text-blue-600 dark:text-cyan-400 font-medium mt-0.5">
                Wali Dosen JS1SI-26-REG-05
              </div>
            )}
          </div>

          {/* Class Code & Program */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/80 dark:border-[var(--border-color)] dark:bg-[var(--surface-card)]">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-1.5">
              <GraduationCap className="w-4 h-4" />
              <span>Kelas & Prodi</span>
            </div>
            <div className="text-sm font-bold font-mono text-slate-900 dark:text-[var(--text-primary)]">
              {schedule.className || "JS1SI-26-REG-05"}
            </div>
            <div className="text-xs text-slate-500 dark:text-[var(--text-secondary)] mt-0.5">
              S1 Sistem Informasi • Ganjil 2026/2027
            </div>
          </div>
        </div>

        {/* Academic Notes */}
        {schedule.notes && (
          <div className="mt-3.5 p-3.5 rounded-xl border border-blue-200 bg-blue-50/60 dark:border-cyan-500/20 dark:bg-cyan-950/20">
            <div className="flex items-center gap-2 text-xs font-bold text-blue-700 dark:text-cyan-300 mb-1">
              <FileText className="w-3.5 h-3.5" />
              <span>Catatan Perkuliahan:</span>
            </div>
            <p className="text-xs sm:text-sm text-slate-900 dark:text-[var(--text-primary)] leading-relaxed">
              {schedule.notes}
            </p>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-200 dark:border-[var(--border-color)] flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <a
              href="https://lms.telkomuniversity.ac.id"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-gradient-to-r from-red-600 to-rose-600 text-white hover:brightness-110 shadow-sm transition-all w-full sm:w-auto"
            >
              <span>Buka LMS Telkom</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            <Link
              href={`/subjects/${schedule.subject.code}`}
              onClick={onClose}
              className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 dark:bg-cyan-500/15 dark:border-cyan-400/40 dark:text-cyan-300 dark:hover:bg-cyan-500/25 transition-all w-full sm:w-auto"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Detail Matkul</span>
            </Link>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="w-full sm:w-auto rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
          >
            Tutup
          </Button>
        </div>
      </div>
    </div>
  );
}
