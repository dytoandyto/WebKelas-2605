"use client";

import { useState } from "react";
import {
  Calendar,
  Grid,
  List,
  Clock,
  MapPin,
  User,
  GraduationCap,
  Sparkles,
  BookOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { DayOfWeek } from "@prisma/client";

interface Subject {
  id: string;
  code: string;
  name: string;
  englishName?: string | null;
  sks?: number | null;
  color?: string | null;
  lecturerName?: string | null;
}

interface ScheduleItem {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  lecturerName?: string | null;
  className?: string | null;
  semester?: string | null;
  academicYear?: string | null;
  notes?: string | null;
  subject: Subject;
}

interface ScheduleViewProps {
  schedules: ScheduleItem[];
  subjects: Subject[];
  classCode?: string;
  academicYear?: string;
}

const TIME_SLOTS = [
  "06:30",
  "07:30",
  "08:30",
  "09:30",
  "10:30",
  "11:30",
  "12:30",
  "13:30",
  "14:30",
  "15:30",
  "16:30",
];

const DAYS: { key: DayOfWeek; label: string; short: string; colIndex: number }[] = [
  { key: DayOfWeek.MONDAY, label: "Senin", short: "SEN", colIndex: 2 },
  { key: DayOfWeek.TUESDAY, label: "Selasa", short: "SEL", colIndex: 3 },
  { key: DayOfWeek.WEDNESDAY, label: "Rabu", short: "RAB", colIndex: 4 },
  { key: DayOfWeek.THURSDAY, label: "Kamis", short: "KAM", colIndex: 5 },
  { key: DayOfWeek.FRIDAY, label: "Jum'at", short: "JUM", colIndex: 6 },
  { key: DayOfWeek.SATURDAY, label: "Sabtu", short: "SAB", colIndex: 7 },
];

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

// Convert time to slot index (0 to 10)
function getSlotIndex(timeStr: string): number {
  const minutes = timeToMinutes(timeStr);
  const baseMinutes = 6 * 60 + 30; // 06:30
  const index = Math.round((minutes - baseMinutes) / 60);
  return Math.max(0, Math.min(index, TIME_SLOTS.length - 1));
}

export function ScheduleView({
  schedules,
  subjects,
  classCode = "JS1SI-26-REG-05",
  academicYear = "Semester Ganjil 2026/2027",
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = useState<"grid" | "list" | "today">("grid");
  const [mobileDay, setMobileDay] = useState<DayOfWeek>(DayOfWeek.MONDAY);

  // Today indicator
  const todayDayMap: Record<number, DayOfWeek> = {
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  const todayDay = todayDayMap[new Date().getDay()] || DayOfWeek.MONDAY;

  const mobileDaySchedules = schedules
    .filter((s) => s.dayOfWeek === mobileDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Today's classes
  const todaySchedules = schedules
    .filter((s) => s.dayOfWeek === todayDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  // Calculate real-time class status
  const currentMinutes = new Date().getHours() * 60 + new Date().getMinutes();
  let foundNext = false;

  const getTodayClassStatus = (s: ScheduleItem): "CURRENT" | "NEXT" | "COMPLETED" | "UPCOMING" => {
    const startMin = timeToMinutes(s.startTime);
    const endMin = timeToMinutes(s.endTime);

    if (currentMinutes >= startMin && currentMinutes <= endMin) {
      return "CURRENT";
    }
    if (currentMinutes > endMin) {
      return "COMPLETED";
    }
    if (!foundNext && currentMinutes < startMin) {
      foundNext = true;
      return "NEXT";
    }
    return "UPCOMING";
  };

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)] shadow-sm">
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30 text-xs font-mono font-bold text-[var(--primary)] dark:text-cyan-300">
            {classCode}
          </div>
          <span className="text-xs text-[var(--text-secondary)] font-medium">
            {academicYear}
          </span>
        </div>

        {/* View Switcher Tabs */}
        <div className="inline-flex items-center p-1 rounded-xl bg-[var(--bg-muted)] border border-[var(--border-color)] self-start sm:self-auto">
          <button
            onClick={() => setViewMode("today")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              viewMode === "today"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            aria-pressed={viewMode === "today"}
          >
            <Clock size={14} />
            <span>Hari Ini</span>
          </button>
          <button
            onClick={() => setViewMode("grid")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              viewMode === "grid"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            aria-pressed={viewMode === "grid"}
          >
            <Grid size={14} />
            <span>Timetable Grid</span>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer",
              viewMode === "list"
                ? "bg-[var(--primary)] text-white shadow-sm"
                : "text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
            )}
            aria-pressed={viewMode === "list"}
          >
            <List size={14} />
            <span>List / Table</span>
          </button>
        </div>
      </div>

      {/* ── MODE 1: JADWAL HARI INI (All screen sizes) ────────────────────────── */}
      {viewMode === "today" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-[var(--bg-card)] border border-[var(--border-color)]">
            <div className="space-y-0.5">
              <span className="text-xs font-mono uppercase text-[var(--primary)] dark:text-cyan-400 font-bold block">
                // Sesi Perkuliahan Hari Ini: {DAYS.find((d) => d.key === todayDay)?.label}
              </span>
              <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)]">
                {new Date().toLocaleDateString("id-ID", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </h3>
            </div>
            <span className="self-start sm:self-auto px-3 py-1 rounded-full text-xs font-mono font-bold bg-[var(--bg-muted)] text-[var(--text-secondary)] border border-[var(--border-color)]">
              {todaySchedules.length} Kelas Terjadwal
            </span>
          </div>

          {todaySchedules.length === 0 ? (
            <div className="card p-10 text-center border-dashed border-[var(--border-color)] space-y-3">
              <Clock className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-50" />
              <h4 className="text-base font-bold text-[var(--text-primary)]">Tidak ada perkuliahan hari ini</h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
                Hari ini tidak ada kelas tatap muka atau praktikum terjadwal. Nikmati waktu istirahat atau manfaatkan untuk belajar mandiri dan mengerjakan tugas.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {todaySchedules.map((item) => {
                const status = getTodayClassStatus(item);
                return (
                  <div
                    key={item.id}
                    className={`card p-5 space-y-3.5 transition-all ${
                      status === "CURRENT"
                        ? "border-[var(--primary)] ring-2 ring-[var(--primary)]/20 shadow-lg bg-[var(--primary)]/5"
                        : "bg-[var(--bg-card)]"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="px-2.5 py-0.5 rounded-lg bg-[var(--primary)]/10 text-[var(--primary)] dark:text-cyan-400 font-mono text-xs font-bold border border-[var(--primary)]/20">
                        {item.subject.code}
                      </span>

                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider ${
                          status === "CURRENT"
                            ? "bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 animate-pulse"
                            : status === "NEXT"
                            ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                            : status === "COMPLETED"
                            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                            : "bg-[var(--bg-muted)] text-[var(--text-muted)]"
                        }`}
                      >
                        {status === "CURRENT"
                          ? "● Berlangsung"
                          : status === "NEXT"
                          ? "Berikutnya"
                          : status === "COMPLETED"
                          ? "✓ Selesai"
                          : "Mendatang"}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-bold text-[var(--text-primary)]">
                        {item.subject.name}
                      </h4>
                      {item.subject.englishName && (
                        <p className="text-xs text-[var(--text-muted)] italic mt-0.5">
                          {item.subject.englishName}
                        </p>
                      )}
                    </div>

                    <div className="p-3 rounded-xl bg-[var(--bg-muted)]/60 border border-[var(--border-color)]/60 text-xs space-y-2 font-mono">
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Waktu Kuliah:</span>
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                          <Clock size={12} className="text-[var(--primary)]" />
                          {item.startTime} - {item.endTime} WIB
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[var(--text-muted)]">Ruangan:</span>
                        <span className="font-bold text-[var(--text-primary)] flex items-center gap-1">
                          <MapPin size={12} className="text-cyan-400" />
                          {item.room || "-"}
                        </span>
                      </div>
                      {item.subject.sks && (
                        <div className="flex items-center justify-between">
                          <span className="text-[var(--text-muted)]">Bobot SKS:</span>
                          <span className="text-[var(--text-secondary)]">{item.subject.sks} SKS</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ── MOBILE DAY SELECTOR & CARDS (Shown on screens < 1024px when not in Today mode) ────────────────── */}
      {viewMode !== "today" && (
        <div className="block lg:hidden space-y-4">
        {/* Day Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {DAYS.map((day) => {
            const count = schedules.filter((s) => s.dayOfWeek === day.key).length;
            const isActive = mobileDay === day.key;
            const isToday = todayDay === day.key;

            return (
              <button
                key={day.key}
                onClick={() => setMobileDay(day.key)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase transition-all whitespace-nowrap",
                  isActive
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md border border-cyan-300/40"
                    : "bg-[#08152e]/80 light:bg-white text-slate-400 light:text-slate-700 border border-cyan-500/20 light:border-slate-200"
                )}
              >
                <span>{day.label}</span>
                {isToday && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                <span className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 light:bg-slate-100 text-slate-400 light:text-slate-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Mobile Schedule Cards */}
        {mobileDaySchedules.length > 0 ? (
          <div className="space-y-3.5">
            {mobileDaySchedules.map((item) => (
              <div
                key={item.id}
                className="card p-5 bg-[#08152e]/90 light:bg-white border-cyan-500/25 light:border-slate-200 shadow-md space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold">
                      {item.subject.code}
                    </span>
                    <h3 className="text-base font-bold text-white light:text-slate-900 mt-1.5">
                      {item.subject.name}
                    </h3>
                    {item.subject.englishName && (
                      <p className="text-xs text-slate-400 light:text-slate-500 italic mt-0.5">
                        {item.subject.englishName}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold bg-cyan-950/60 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 px-2.5 py-1 rounded-lg">
                      <Clock size={11} className="text-cyan-400 light:text-blue-600" />
                      {item.startTime} - {item.endTime}
                    </span>
                    {item.subject.sks && (
                      <div className="text-[10px] font-mono text-slate-400 light:text-slate-500 mt-1">
                        {item.subject.sks} SKS
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-cyan-500/15 light:border-slate-100 flex flex-wrap items-center justify-between text-xs text-slate-300 light:text-slate-700 gap-2">
                  <div className="flex items-center gap-1.5 font-mono">
                    <MapPin size={13} className="text-cyan-400 light:text-blue-600" />
                    <span>Ruangan: <strong>{item.room || "-"}</strong></span>
                  </div>
                  <div className="text-[11px] font-mono text-slate-400 light:text-slate-500">
                    Kelas: {item.className || classCode}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#08152e]/40 light:bg-slate-50">
            <Calendar className="w-8 h-8 text-cyan-400/40 light:text-blue-400/40 mx-auto mb-2" />
            <p className="text-slate-300 light:text-slate-800 font-medium text-sm">Tidak ada jadwal kuliah di hari ini.</p>
          </div>
        )}
      </div>
      )}

      {/* ── DESKTOP VIEWS (Shown on screens >= 1024px) ────────────────────────── */}

      {/* 1. TIMETABLE GRID VIEW */}
      {viewMode === "grid" && (
        <div className="hidden lg:block overflow-x-auto pb-4">
          <div className="min-w-[900px] rounded-2xl bg-[#08152e]/85 light:bg-white border border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden p-4">
            {/* Header Days Row */}
            <div className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 mb-2 text-center">
              <div className="py-2.5 px-3 rounded-xl bg-[#040813] light:bg-slate-100 border border-cyan-500/20 light:border-slate-200 text-xs font-mono font-bold text-cyan-400 light:text-blue-700 flex items-center justify-center">
                SHIFT / TIME
              </div>
              {DAYS.map((day) => {
                const isToday = todayDay === day.key;
                return (
                  <div
                    key={day.key}
                    className={cn(
                      "py-2.5 px-3 rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5",
                      isToday
                        ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 light:bg-blue-50 border-cyan-400/50 light:border-blue-300 text-cyan-200 light:text-blue-700 shadow-sm"
                        : "bg-[#060f22]/70 light:bg-slate-50 border-cyan-500/15 light:border-slate-200 text-slate-300 light:text-slate-700"
                    )}
                  >
                    <span>{day.label}</span>
                    {isToday && (
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Hari ini" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Time Grid with Row Spanning */}
            <div
              className="grid grid-cols-[100px_repeat(6,1fr)] gap-2 relative"
              style={{
                gridTemplateRows: `repeat(${TIME_SLOTS.length}, minmax(52px, auto))`,
              }}
            >
              {/* Left Column: Time Slot Labels */}
              {TIME_SLOTS.map((time, idx) => (
                <div
                  key={time}
                  style={{ gridColumn: 1, gridRow: idx + 1 }}
                  className="flex items-center justify-center text-xs font-mono font-bold text-slate-400 light:text-slate-600 bg-[#040813]/60 light:bg-slate-50 rounded-lg border border-cyan-500/10 light:border-slate-200"
                >
                  {time}
                </div>
              ))}

              {/* Background Grid Cells for Empty Slots */}
              {DAYS.map((day) =>
                TIME_SLOTS.map((_, timeIdx) => (
                  <div
                    key={`${day.key}-${timeIdx}`}
                    style={{ gridColumn: day.colIndex, gridRow: timeIdx + 1 }}
                    className="border border-cyan-500/5 light:border-slate-100 rounded-lg pointer-events-none"
                  />
                ))
              )}

              {/* Schedule Blocks with Dynamic Row Spanning */}
              {schedules.map((item) => {
                const dayConfig = DAYS.find((d) => d.key === item.dayOfWeek);
                if (!dayConfig) return null;

                const startIdx = getSlotIndex(item.startTime);
                const endIdx = getSlotIndex(item.endTime);
                const span = Math.max(1, endIdx - startIdx);

                const gridRowStart = startIdx + 1;
                const gridRowEnd = gridRowStart + span;

                return (
                  <div
                    key={item.id}
                    style={{
                      gridColumn: dayConfig.colIndex,
                      gridRow: `${gridRowStart} / ${gridRowEnd}`,
                    }}
                    className={cn(
                      "p-3 rounded-xl border transition-all duration-200 flex flex-col justify-between group z-10",
                      "bg-gradient-to-br from-[#0c2344]/95 via-[#081b38]/90 to-[#0a2750]/95 light:from-white light:via-blue-50/40 light:to-white",
                      "border-cyan-400/40 light:border-blue-300 shadow-md hover:shadow-cyan-glow light:hover:shadow-md hover:border-cyan-300 light:hover:border-blue-500"
                    )}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="px-2 py-0.5 rounded text-[10px] font-mono font-extrabold bg-cyan-500/20 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-400/30 light:border-blue-200">
                          {item.subject.code}
                        </span>
                        {item.subject.sks && (
                          <span className="text-[10px] font-mono text-slate-400 light:text-slate-500">
                            {item.subject.sks} SKS
                          </span>
                        )}
                      </div>

                      <h4 className="text-xs font-bold text-white light:text-slate-900 group-hover:text-cyan-200 light:group-hover:text-blue-700 transition-colors uppercase leading-snug">
                        {item.subject.name}
                      </h4>

                      {item.subject.englishName && (
                        <p className="text-[10px] text-slate-400 light:text-slate-500 italic line-clamp-1">
                          {item.subject.englishName}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-cyan-500/15 light:border-slate-100 text-[10px] font-mono space-y-0.5">
                      <div className="text-cyan-300 light:text-blue-700 font-bold flex items-center gap-1">
                        <Clock size={10} className="text-cyan-400 light:text-blue-600" />
                        <span>{item.startTime} - {item.endTime} WIB</span>
                      </div>
                      <div className="text-slate-300 light:text-slate-700 font-semibold flex items-center gap-1">
                        <MapPin size={10} className="text-cyan-400 light:text-blue-600" />
                        <span>{item.room || "-"}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 2. RESPONSIVE LIST / TABLE VIEW */}
      {viewMode === "list" && (
        <div className="hidden lg:block">
          <div className="rounded-2xl bg-[#08152e]/85 light:bg-white border border-cyan-500/25 light:border-slate-200 backdrop-blur-xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-cyan-500/20 light:border-slate-200 bg-[#040813]/60 light:bg-slate-50 text-cyan-300 light:text-blue-700 font-mono uppercase tracking-wider">
                    <th className="py-3.5 px-4 font-bold">Hari</th>
                    <th className="py-3.5 px-4 font-bold">Jam Kuliah</th>
                    <th className="py-3.5 px-4 font-bold">Ruangan</th>
                    <th className="py-3.5 px-4 font-bold">Kode MK</th>
                    <th className="py-3.5 px-4 font-bold">Mata Kuliah</th>
                    <th className="py-3.5 px-4 font-bold">SKS</th>
                    <th className="py-3.5 px-4 font-bold">Kelas</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-cyan-500/10 light:divide-slate-100">
                  {schedules.map((item) => {
                    const dayLabel = DAYS.find((d) => d.key === item.dayOfWeek)?.label || item.dayOfWeek;
                    const isToday = todayDay === item.dayOfWeek;

                    return (
                      <tr
                        key={item.id}
                        className={cn(
                          "hover:bg-cyan-500/5 light:hover:bg-blue-50/50 transition-colors",
                          isToday && "bg-cyan-500/[0.03] light:bg-blue-50/20"
                        )}
                      >
                        <td className="py-3 px-4 font-bold text-white light:text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span>{dayLabel}</span>
                            {isToday && (
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" title="Hari ini" />
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-mono text-cyan-300 light:text-blue-700 font-semibold whitespace-nowrap">
                          {item.startTime} &ndash; {item.endTime} WIB
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-200 light:text-slate-800">
                          {item.room || "-"}
                        </td>
                        <td className="py-3 px-4 font-mono">
                          <span className="px-2 py-0.5 rounded bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 font-bold border border-cyan-400/30 light:border-blue-200">
                            {item.subject.code}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-white light:text-slate-900">
                            {item.subject.name}
                          </div>
                          {item.subject.englishName && (
                            <div className="text-[11px] text-slate-400 light:text-slate-500 italic">
                              {item.subject.englishName}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 light:text-slate-700 font-semibold">
                          {item.subject.sks ? `${item.subject.sks} SKS` : "-"}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-300 light:text-slate-600">
                          {item.className || classCode}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
