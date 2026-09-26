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
  subject: {
    id: string;
    code: string;
    name: string;
    lecturerName?: string | null;
  };
}

interface ScheduleTimelineProps {
  schedules: ScheduleItem[];
  defaultDay?: DayOfWeek;
}

const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: DayOfWeek.MONDAY, label: "Monday", short: "MON" },
  { key: DayOfWeek.TUESDAY, label: "Tuesday", short: "TUE" },
  { key: DayOfWeek.WEDNESDAY, label: "Wednesday", short: "WED" },
  { key: DayOfWeek.THURSDAY, label: "Thursday", short: "THU" },
  { key: DayOfWeek.FRIDAY, label: "Friday", short: "FRI" },
];

export function ScheduleTimeline({ schedules, defaultDay = DayOfWeek.MONDAY }: ScheduleTimelineProps) {
  const [activeDay, setActiveDay] = useState<DayOfWeek>(defaultDay);

  const daySchedules = schedules
    .filter((s) => s.dayOfWeek === activeDay)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {/* Day Selector Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {DAYS.map((day) => {
          const count = schedules.filter((s) => s.dayOfWeek === day.key).length;
          const isActive = activeDay === day.key;
          return (
            <button
              key={day.key}
              onClick={() => setActiveDay(day.key)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer whitespace-nowrap",
                isActive
                  ? "bg-gradient-to-r from-blue-600 via-cyan-500 to-teal-400 text-white shadow-[0_0_20px_rgba(6,182,212,0.5)] border border-cyan-300/40"
                  : "bg-[#0a1a2f]/80 text-slate-400 hover:text-white hover:bg-cyan-500/10 border border-cyan-500/20"
              )}
            >
              <span>{day.label}</span>
              <span
                className={cn(
                  "w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold font-mono",
                  isActive ? "bg-white/20 text-white" : "bg-white/5 text-slate-400"
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
        <div className="relative border-l-2 border-cyan-500/25 ml-4 sm:ml-6 pl-6 sm:pl-8 space-y-6">
          {daySchedules.map((item, idx) => (
            <div key={item.id} className="relative group">
              {/* Timeline Glowing Node */}
              <div className="absolute -left-[31px] sm:-left-[39px] top-1.5 w-4 h-4 rounded-full bg-[#060b17] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_12px_#38bdf8] group-hover:scale-125 transition-transform">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-300" />
              </div>

              {/* Class Slot Card */}
              <div className="card p-5 border border-cyan-500/20 hover:border-cyan-400/50 bg-[#0a1a2f]/70 backdrop-blur-xl transition-all duration-200 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5),0_0_20px_rgba(6,182,212,0.15)]">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="px-2.5 py-1 rounded-md bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 font-mono text-xs font-bold">
                      {item.subject.code}
                    </span>
                    <h4 className="text-base font-bold text-white group-hover:text-cyan-200 transition-colors">
                      {item.subject.name}
                    </h4>
                  </div>
                  <div className="inline-flex items-center gap-1.5 text-cyan-300 font-mono text-xs bg-cyan-950/60 border border-cyan-500/20 px-3 py-1 rounded-full w-fit">
                    <Clock size={12} className="text-cyan-400" />
                    <span>
                      {item.startTime} &mdash; {item.endTime}
                    </span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 pt-2 border-t border-cyan-500/10">
                  {(item.room) && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <MapPin size={13} className="text-cyan-400" />
                      <span>Room {item.room}</span>
                    </div>
                  )}
                  {(item.lecturerName || item.subject.lecturerName) && (
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <User size={13} className="text-cyan-400" />
                      <span>{item.lecturerName || item.subject.lecturerName}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card p-8 text-center border-dashed border-cyan-500/20 bg-[#0a1a2f]/40">
          <Calendar className="w-8 h-8 text-cyan-400/50 mx-auto mb-2" />
          <p className="text-slate-300 font-medium text-sm">No scheduled classes for this day.</p>
          <p className="text-slate-500 text-xs mt-1">Dedicated research, laboratory sprints, or self-directed study.</p>
        </div>
      )}

      <div className="flex justify-end pt-2">
        <Link
          href="/schedule"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-cyan-400 hover:text-cyan-300 group"
        >
          <span>Open Full Interactive Timetable</span>
          <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
