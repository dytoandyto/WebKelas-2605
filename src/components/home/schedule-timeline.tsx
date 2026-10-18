"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, MapPin, User, ArrowRight, Calendar, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { DayOfWeek } from "@prisma/client";

interface ScheduleItem {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  lecturerName?: string | null;
  className?: string | null;
  subject: {
    id: string;
    code: string;
    name: string;
    englishName?: string | null;
    lecturerName?: string | null;
    color?: string | null;
  };
}

interface ScheduleTimelineProps {
  schedules: ScheduleItem[];
  defaultDay?: DayOfWeek;
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: DayOfWeek.MONDAY, label: "Senin", short: "SEN" },
  { key: DayOfWeek.TUESDAY, label: "Selasa", short: "SEL" },
  { key: DayOfWeek.WEDNESDAY, label: "Rabu", short: "RAB" },
  { key: DayOfWeek.THURSDAY, label: "Kamis", short: "KAM" },
  { key: DayOfWeek.FRIDAY, label: "Jum'at", short: "JUM" },
  { key: DayOfWeek.SATURDAY, label: "Sabtu", short: "SAB" },
];

function getScheduleStatus(startTime: string, endTime: string, isToday: boolean): "UPCOMING" | "ONGOING" | "COMPLETED" {
  if (!isToday) return "UPCOMING";

  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const [startH, startM] = startTime.split(":").map(Number);
  const [endH, endM] = endTime.split(":").map(Number);

  const startMinutes = startH * 60 + (startM || 0);
  const endMinutes = endH * 60 + (endM || 0);

  if (currentMinutes >= startMinutes && currentMinutes <= endMinutes) {
    return "ONGOING";
  }
  if (currentMinutes > endMinutes) {
    return "COMPLETED";
  }
  return "UPCOMING";
}

export function ScheduleTimeline({ schedules, defaultDay = DayOfWeek.MONDAY }: ScheduleTimelineProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>(defaultDay);

  const daySchedules = schedules
    .filter((s) => s.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const todayIndex = new Date().getDay();
  const dayIndexMap: Record<number, DayOfWeek> = {
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  const isSelectedToday = dayIndexMap[todayIndex] === activeDay;

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map((day) => {
          const count = schedules.filter((s) => s.dayOfWeek === day.key).length;
          const isActive = activeDay === day.key;
          const isCurrentDay = dayIndexMap[todayIndex] === day.key;

          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-[var(--brand-primary)] text-white shadow-xs font-semibold"
                  : "bg-[var(--surface-primary)] border border-[var(--border-color)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-slate-100 dark:hover:bg-slate-800/60"
              )}
            >
              <span>{day.label}</span>
              {isCurrentDay && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" title="Hari ini" />
              )}
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300"
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Stream */}
      {daySchedules.length > 0 ? (
        <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {daySchedules.map((item) => {
            const status = getScheduleStatus(item.startTime, item.endTime, isSelectedToday);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Glowing Node */}
                <div className={cn(
                  "absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-125",
                  status === "ONGOING"
                    ? "bg-emerald-500 border-2 border-white shadow-xs animate-pulse"
                    : status === "COMPLETED"
                    ? "bg-slate-400 dark:bg-slate-700 border-2 border-slate-300 dark:border-slate-500"
                    : "bg-[var(--surface-primary)] border-2 border-blue-500 shadow-xs"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    status === "ONGOING" ? "bg-white" : status === "COMPLETED" ? "bg-slate-200 dark:bg-slate-400" : "bg-blue-600 dark:bg-blue-400"
                  )} />
                </div>

                {/* Class Slot Card */}
                <div className="p-5 rounded-2xl border border-[var(--border-color)] hover:border-blue-400/50 bg-[var(--surface-card)] transition-all duration-200 shadow-xs">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-300 font-mono text-xs font-bold">
                          {item.subject.code}
                        </span>
                        {item.className && (
                          <span className="text-[11px] font-mono text-[var(--text-muted)]">
                            {item.className}
                          </span>
                        )}
                        {/* Status Badge */}
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          status === "ONGOING"
                            ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/50 animate-pulse"
                            : status === "COMPLETED"
                            ? "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700"
                            : "bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                        )}>
                          {status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-[var(--text-primary)] group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {item.subject.name}
                      </h4>
                      {item.subject.englishName && (
                        <p className="text-xs text-[var(--text-muted)] italic">
                          {item.subject.englishName}
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-blue-700 dark:text-blue-300 font-mono text-xs bg-blue-50 dark:bg-blue-950/50 border border-blue-200 dark:border-blue-800/50 px-3 py-1.5 rounded-full w-fit">
                      <Clock size={12} className="text-blue-600 dark:text-blue-400" />
                      <span>
                        {item.startTime} &mdash; {item.endTime} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)] pt-3 border-t border-[var(--border-color)]">
                    {item.room && (
                      <div className="flex items-center gap-1.5 font-mono">
                        <MapPin size={13} className="text-blue-600 dark:text-blue-400" />
                        <span>Ruang {item.room}</span>
                      </div>
                    )}
                    {(item.lecturerName || item.subject.lecturerName) && (
                      <div className="flex items-center gap-1.5">
                        <User size={13} className="text-blue-600 dark:text-blue-400" />
                        <span>{item.lecturerName || item.subject.lecturerName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="p-8 text-center rounded-2xl border border-dashed border-[var(--border-color)] bg-[var(--surface-primary)]">
          <Calendar className="w-8 h-8 text-[var(--text-muted)] mx-auto mb-2" />
          <p className="text-[var(--text-primary)] font-medium text-sm">Tidak ada jadwal kuliah untuk hari ini.</p>
          <p className="text-[var(--text-muted)] text-xs mt-1">Gunakan waktu untuk studi mandiri, pengerjaan tugas, atau proyek kelompok.</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 group"
        >
          <span>Buka Jadwal Kuliah Lengkap (Timetable Grid &amp; List)</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
