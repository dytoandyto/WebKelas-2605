import type { Metadata } from "next";
import { Calendar, Clock, BookOpen, Info } from "lucide-react";
import { getScheduleData } from "@/lib/data";
import { DayOfWeek } from "@prisma/client";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Schedule",
  description: "View the complete class schedule by day and subject.",
};

const DAYS_ORDER: DayOfWeek[] = [
  DayOfWeek.MONDAY,
  DayOfWeek.TUESDAY,
  DayOfWeek.WEDNESDAY,
  DayOfWeek.THURSDAY,
  DayOfWeek.FRIDAY,
  DayOfWeek.SATURDAY,
  DayOfWeek.SUNDAY,
];

const DAY_FULL: Record<DayOfWeek, string> = {
  MONDAY: "Monday",
  TUESDAY: "Tuesday",
  WEDNESDAY: "Wednesday",
  THURSDAY: "Thursday",
  FRIDAY: "Friday",
  SATURDAY: "Saturday",
  SUNDAY: "Sunday",
};

const DAY_SHORT: Record<DayOfWeek, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
  SUNDAY: "Sun",
};

const SUBJECT_COLORS = [
  "from-blue-500 to-indigo-600",
  "from-purple-500 to-violet-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-cyan-500 to-sky-600",
];

function getTodayDayOfWeek(): DayOfWeek | null {
  const map: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  return map[new Date().getDay()] ?? null;
}

export default async function SchedulePage() {
  const { schedules, subjects } = await getScheduleData();
  const todayDay = getTodayDayOfWeek();

  // Group schedules by day
  const byDay: Record<DayOfWeek, typeof schedules> = {} as any;
  for (const day of DAYS_ORDER) {
    byDay[day] = schedules.filter((s: any) => s.dayOfWeek === day);
  }

  // Map subject id to color index
  const subjectColorMap: Record<string, string> = {};
  subjects.forEach((sub: any, i: number) => {
    subjectColorMap[sub.id] = SUBJECT_COLORS[i % SUBJECT_COLORS.length];
  });

  const activeDays = DAYS_ORDER.filter((d) => byDay[d].length > 0);

  return (
    <div className="cosmic-canvas min-h-screen text-slate-100 pb-20">
      {/* Header Banner */}
      <div className="relative py-14 px-4 border-b border-cyan-500/20 bg-[#060f22]/70 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-xs font-semibold text-cyan-300 mb-4 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span>Academic Semester &bull; Live Timetable</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-cyan-glow flex-shrink-0">
              <Calendar size={22} />
            </div>
            <div>
              <h1
                className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
              >
                Class Schedule
              </h1>
              <p className="text-slate-400 text-sm sm:text-base mt-1">
                Full semester schedule &mdash; {schedules.length} session{schedules.length !== 1 ? "s" : ""} across {activeDays.length} days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Subject Legend */}
        {subjects.length > 0 && (
          <div className="cyber-card p-5 rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20 backdrop-blur-xl">
            <p className="text-xs font-semibold text-cyan-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
              Subjects This Semester
            </p>
            <div className="flex flex-wrap gap-2.5">
              {subjects.map((sub: any, i: number) => (
                <div
                  key={sub.id}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#061021]/80 border border-cyan-500/15 text-xs text-slate-300"
                >
                  <div className={cn("w-2.5 h-2.5 rounded-full bg-gradient-to-r flex-shrink-0", SUBJECT_COLORS[i % SUBJECT_COLORS.length])} />
                  <span className="font-semibold text-cyan-300">{sub.code}</span>
                  <span className="text-slate-400">&mdash;</span>
                  <span className="text-slate-300 truncate max-w-[200px]">{sub.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day-by-day grid */}
        {schedules.length === 0 ? (
          <div className="cyber-card p-16 text-center rounded-2xl bg-[#0a1a2f]/60 border border-cyan-500/20">
            <Calendar className="w-12 h-12 text-slate-500 mx-auto mb-4" />
            <h3 className="text-slate-200 font-semibold text-lg">No schedule yet</h3>
            <p className="text-slate-400 text-sm mt-1">The timetable will appear here once configured.</p>
          </div>
        ) : (
          <div className="space-y-10">
            {DAYS_ORDER.map((day) => {
              const daySessions = byDay[day];
              if (daySessions.length === 0) return null;
              const isToday = day === todayDay;
              return (
                <div key={day} id={day.toLowerCase()} className="space-y-4">
                  {/* Day header */}
                  <div className="flex items-center gap-4">
                    <div
                      className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-sm flex-shrink-0 transition-all",
                        isToday
                          ? "bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-cyan-glow border border-cyan-300/40"
                          : "bg-[#0a1a2f]/80 border border-cyan-500/20 text-slate-300"
                      )}
                    >
                      {DAY_SHORT[day]}
                    </div>
                    <div>
                      <h2 className="font-bold text-xl text-white flex items-center gap-3">
                        {DAY_FULL[day]}
                        {isToday && (
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 animate-pulse">
                            Today
                          </span>
                        )}
                      </h2>
                      <p className="text-sm text-slate-400">
                        {daySessions.length} academic session{daySessions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {daySessions.map((sch: any) => {
                      const gradient = subjectColorMap[sch.subjectId] || SUBJECT_COLORS[0];
                      return (
                        <div
                          key={sch.id}
                          className={cn(
                            "cyber-card p-5 rounded-2xl bg-[#0a1a2f]/70 border transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1",
                            isToday
                              ? "border-cyan-400/40 shadow-sm shadow-cyan-500/10"
                              : "border-cyan-500/20 hover:border-cyan-400/40"
                          )}
                        >
                          <div>
                            <div className="flex items-start gap-3.5 mb-3">
                              <div className={cn("w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white shadow-xs", gradient)}>
                                <BookOpen size={18} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap mb-1">
                                  <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                                    {sch.subject?.code}
                                  </span>
                                </div>
                                <p className="font-bold text-slate-100 text-base leading-snug line-clamp-2 group-hover:text-cyan-300 transition-colors">
                                  {sch.subject?.name}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-cyan-500/15 space-y-2">
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-300">
                              <Clock size={14} className="text-cyan-400 flex-shrink-0" />
                              <span className="font-mono text-cyan-200">{sch.startTime} &ndash; {sch.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                              <BookOpen size={14} className="text-slate-500 flex-shrink-0" />
                              <span className="truncate text-slate-300">{sch.room}</span>
                            </div>
                            {sch.lecturerName && (
                              <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400">
                                <span className="w-2 h-2 rounded-full bg-cyan-400/60 flex-shrink-0" />
                                <span className="truncate text-slate-300">{sch.lecturerName}</span>
                              </div>
                            )}
                            {sch.notes && (
                              <div className="flex items-start gap-2 text-xs text-slate-400 mt-1 bg-[#061021]/60 p-2 rounded-lg border border-cyan-500/10">
                                <Info size={12} className="text-cyan-400 flex-shrink-0 mt-0.5" />
                                <span className="line-clamp-2">{sch.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
