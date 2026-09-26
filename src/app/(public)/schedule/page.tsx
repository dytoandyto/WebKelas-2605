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
    <div className="bg-slate-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl gradient-brand flex items-center justify-center">
              <Calendar className="text-white" size={20} />
            </div>
            <div>
              <h1 className="page-title">Class Schedule</h1>
              <p className="text-slate-500 text-sm mt-0.5">
                Full semester schedule — {schedules.length} session{schedules.length !== 1 ? "s" : ""} across {activeDays.length} days
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Subject Legend */}
        {subjects.length > 0 && (
          <div className="card p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Subjects this semester</p>
            <div className="flex flex-wrap gap-2">
              {subjects.map((sub: any, i: number) => (
                <div key={sub.id} className="flex items-center gap-1.5">
                  <div className={cn("w-3 h-3 rounded-full bg-gradient-to-r", SUBJECT_COLORS[i % SUBJECT_COLORS.length])} />
                  <span className="text-xs font-medium text-slate-700">{sub.code} — {sub.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Day-by-day grid */}
        {schedules.length === 0 ? (
          <div className="card p-16 text-center">
            <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-slate-600 font-semibold">No schedule yet</h3>
            <p className="text-slate-400 text-sm mt-1">The schedule will appear here once it&apos;s set up.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {DAYS_ORDER.map((day) => {
              const daySessions = byDay[day];
              if (daySessions.length === 0) return null;
              const isToday = day === todayDay;
              return (
                <div key={day} id={day.toLowerCase()}>
                  {/* Day header */}
                  <div className={cn("flex items-center gap-3 mb-3")}>
                    <div
                      className={cn(
                        "flex items-center justify-center w-14 h-14 rounded-2xl font-bold text-sm flex-shrink-0",
                        isToday
                          ? "gradient-brand text-white shadow-brand"
                          : "bg-white border-2 border-slate-200 text-slate-500"
                      )}
                    >
                      {DAY_SHORT[day]}
                    </div>
                    <div>
                      <h2 className="font-bold text-lg text-slate-900 flex items-center gap-2">
                        {DAY_FULL[day]}
                        {isToday && (
                          <span className="badge badge-blue text-xs">Today</span>
                        )}
                      </h2>
                      <p className="text-sm text-slate-500">
                        {daySessions.length} session{daySessions.length !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Sessions */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 ml-0 sm:ml-17">
                    {daySessions.map((sch: any) => {
                      const gradient = subjectColorMap[sch.subjectId] || SUBJECT_COLORS[0];
                      return (
                        <div key={sch.id} className={cn("card p-5 card-interactive border-l-4", isToday ? "border-l-brand-500" : "border-l-slate-200")}>
                          <div className="flex items-start gap-3">
                            <div className={cn("w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center flex-shrink-0 text-white", gradient)}>
                              <BookOpen size={16} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="badge badge-blue">{sch.subject?.code}</span>
                              </div>
                              <p className="font-semibold text-slate-900 mt-1 leading-snug line-clamp-2">
                                {sch.subject?.name}
                              </p>
                            </div>
                          </div>
                          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <Clock size={13} className="text-slate-400 flex-shrink-0" />
                              <span className="font-medium">{sch.startTime} – {sch.endTime}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-600">
                              <BookOpen size={13} className="text-slate-400 flex-shrink-0" />
                              <span className="truncate">{sch.room}</span>
                            </div>
                            {sch.lecturerName && (
                              <div className="flex items-center gap-2 text-sm text-slate-500">
                                <span className="w-3.5 h-3.5 rounded-full bg-slate-200 flex-shrink-0" />
                                <span className="truncate">{sch.lecturerName}</span>
                              </div>
                            )}
                            {sch.notes && (
                              <div className="flex items-start gap-2 text-xs text-slate-400 mt-1">
                                <Info size={11} className="flex-shrink-0 mt-0.5" />
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
