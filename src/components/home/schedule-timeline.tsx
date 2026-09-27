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
                  ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300/40"
                  : "bg-[#0a1a2f]/80 light:bg-slate-100 text-slate-400 light:text-slate-600 hover:text-white light:hover:text-slate-900 hover:bg-cyan-500/10 border border-cyan-500/20 light:border-slate-200"
              )}
            >
              <span>{day.label}</span>
              {isCurrentDay && (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" title="Hari ini" />
              )}
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 light:bg-slate-200 text-slate-400 light:text-slate-700"
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
        <div className="relative border-l-2 border-cyan-500/25 light:border-blue-300 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {daySchedules.map((item) => {
            const status = getScheduleStatus(item.startTime, item.endTime, isSelectedToday);

            return (
              <div key={item.id} className="relative group">
                {/* Timeline Glowing Node */}
                <div className={cn(
                  "absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full flex items-center justify-center transition-transform group-hover:scale-125",
                  status === "ONGOING"
                    ? "bg-emerald-500 border-2 border-white shadow-[0_0_12px_#10b981] animate-pulse"
                    : status === "COMPLETED"
                    ? "bg-slate-700 border-2 border-slate-500"
                    : "bg-[#060b17] light:bg-white border-2 border-cyan-400 light:border-blue-500 shadow-[0_0_12px_#38bdf8]"
                )}>
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    status === "ONGOING" ? "bg-white" : status === "COMPLETED" ? "bg-slate-400" : "bg-cyan-300 light:bg-blue-600"
                  )} />
                </div>

                {/* Class Slot Card */}
                <div className="card p-5 border border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/50 light:hover:border-blue-400 bg-[#0a1a2f]/70 light:bg-white backdrop-blur-xl transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)] light:shadow-[0_4px_16px_rgba(18,32,44,0.06)]">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-cyan-500/15 light:bg-blue-50 border border-cyan-400/30 light:border-blue-200 text-cyan-300 light:text-blue-700 font-mono text-xs font-bold">
                          {item.subject.code}
                        </span>
                        {item.className && (
                          <span className="text-[11px] font-mono text-slate-400 light:text-slate-500">
                            {item.className}
                          </span>
                        )}
                        {/* Status Badge */}
                        <span className={cn(
                          "px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase",
                          status === "ONGOING"
                            ? "bg-emerald-500/20 text-emerald-300 light:text-emerald-700 border border-emerald-500/30 animate-pulse"
                            : status === "COMPLETED"
                            ? "bg-slate-800 light:bg-slate-100 text-slate-400 border border-slate-700 light:border-slate-200"
                            : "bg-cyan-500/10 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-500/20 light:border-blue-200"
                        )}>
                          {status}
                        </span>
                      </div>

                      <h4 className="text-base font-bold text-white light:text-slate-900 group-hover:text-cyan-200 light:group-hover:text-blue-600 transition-colors">
                        {item.subject.name}
                      </h4>
                      {item.subject.englishName && (
                        <p className="text-xs text-slate-400 light:text-slate-500 italic">
                          {item.subject.englishName}
                        </p>
                      )}
                    </div>

                    <div className="inline-flex items-center gap-1.5 text-cyan-300 light:text-blue-700 font-mono text-xs bg-cyan-950/60 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 px-3 py-1.5 rounded-full w-fit">
                      <Clock size={12} className="text-cyan-400 light:text-blue-600" />
                      <span>
                        {item.startTime} &mdash; {item.endTime} WIB
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 light:text-slate-600 pt-3 border-t border-cyan-500/10 light:border-slate-100">
                    {item.room && (
                      <div className="flex items-center gap-1.5 text-slate-300 light:text-slate-700 font-mono">
                        <MapPin size={13} className="text-cyan-400 light:text-blue-600" />
                        <span>Ruang {item.room}</span>
                      </div>
                    )}
                    {(item.lecturerName || item.subject.lecturerName) && (
                      <div className="flex items-center gap-1.5 text-slate-300 light:text-slate-700">
                        <User size={13} className="text-cyan-400 light:text-blue-600" />
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
        <div className="card p-8 text-center border-dashed border-cyan-500/20 light:border-slate-200 bg-[#0a1a2f]/40 light:bg-slate-50">
          <Calendar className="w-8 h-8 text-cyan-400/50 light:text-blue-400/50 mx-auto mb-2" />
          <p className="text-slate-300 light:text-slate-800 font-medium text-sm">Tidak ada jadwal kuliah untuk hari ini.</p>
          <p className="text-slate-500 text-xs mt-1">Gunakan waktu untuk studi mandiri, pengerjaan tugas, atau proyek kelompok.</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 group"
        >
          <span>Buka Jadwal Kuliah Lengkap (Timetable Grid &amp; List)</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
