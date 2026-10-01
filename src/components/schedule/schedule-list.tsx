"use client";

import * as React from "react";
import { Clock, MapPin, Calendar, BookOpen } from "lucide-react";
import { DayOfWeek } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ScheduleItem } from "./schedule-grid";
import { ScheduleBlock } from "./schedule-block";
import { EmptyState } from "@/components/ui/empty-state";

export interface ScheduleListProps {
  schedules: ScheduleItem[];
  selectedDay?: string;
  onBlockClick?: (schedule: ScheduleItem) => void;
  className?: string;
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

export function ScheduleList({
  schedules,
  selectedDay = "ALL",
  onBlockClick,
  className,
}: ScheduleListProps) {
  const filtered = React.useMemo(() => {
    let items = schedules;
    if (selectedDay !== "ALL") {
      items = items.filter((s) => s.dayOfWeek === selectedDay);
    }
    return [...items].sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, selectedDay]);

  if (filtered.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-6 h-6 text-cyan-400" />}
        title="Tidak Ada Jadwal Kuliah"
        description={
          selectedDay !== "ALL"
            ? `Tidak ada jadwal perkuliahan yang terjadwal untuk hari ${DAY_LABELS[selectedDay] || selectedDay}.`
            : "Belum ada jadwal perkuliahan yang ditambahkan ke sistem."
        }
        className={className}
      />
    );
  }

  // If showing all days, group by day
  if (selectedDay === "ALL") {
    const grouped = filtered.reduce((acc, curr) => {
      const day = curr.dayOfWeek;
      if (!acc[day]) acc[day] = [];
      acc[day].push(curr);
      return acc;
    }, {} as Record<DayOfWeek, ScheduleItem[]>);

    const orderedDays: DayOfWeek[] = [
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ];

    return (
      <div className={cn("space-y-6", className)}>
        {orderedDays.map((dayKey) => {
          const dayItems = grouped[dayKey];
          if (!dayItems || dayItems.length === 0) return null;

          return (
            <div key={dayKey} className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
                <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] uppercase tracking-wider font-mono">
                  {DAY_LABELS[dayKey] || dayKey}
                </h3>
                <span className="text-xs text-[var(--text-muted)] font-mono">
                  ({dayItems.length} Sesi)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {dayItems.map((item) => (
                  <ScheduleBlock
                    key={item.id}
                    code={item.subject.code}
                    name={item.subject.name}
                    englishName={item.subject.englishName}
                    time={`${item.startTime} - ${item.endTime}`}
                    room={item.room}
                    lecturerName={item.lecturerName || item.subject.lecturerName}
                    sks={item.subject.sks}
                    color={item.subject.color}
                    onClick={() => onBlockClick?.(item)}
                    variant="compact"
                  />
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Single Day View
  return (
    <div className={cn("grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3", className)}>
      {filtered.map((item) => (
        <ScheduleBlock
          key={item.id}
          code={item.subject.code}
          name={item.subject.name}
          englishName={item.subject.englishName}
          time={`${item.startTime} - ${item.endTime}`}
          room={item.room}
          lecturerName={item.lecturerName || item.subject.lecturerName}
          sks={item.subject.sks}
          color={item.subject.color}
          onClick={() => onBlockClick?.(item)}
          variant="compact"
        />
      ))}
    </div>
  );
}
