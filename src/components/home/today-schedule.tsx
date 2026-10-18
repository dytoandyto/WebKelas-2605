"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, ArrowRight } from "lucide-react";
import { ScheduleBlock } from "@/components/schedule/schedule-block";
import { ScheduleItem } from "@/components/schedule/schedule-grid";
import { ScheduleDetailDialog } from "@/components/schedule/schedule-detail-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { ScheduleSettings } from "@/lib/homepage/types";

export interface TodayScheduleProps {
  schedules: ScheduleItem[];
  todayDayOfWeek?: string;
  settings?: ScheduleSettings;
  className?: string;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function TodaySchedule({
  schedules,
  todayDayOfWeek,
  settings,
  className,
}: TodayScheduleProps) {
  const [selectedSchedule, setSelectedSchedule] =
    React.useState<ScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Filter for today
  const todaySchedules = React.useMemo(() => {
    const filtered = schedules
      .filter((s) => s.dayOfWeek === todayDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
    if (settings?.maxItems && settings.maxItems > 0) {
      return filtered.slice(0, settings.maxItems);
    }
    return filtered;
  }, [schedules, todayDayOfWeek, settings]);

  const title = settings?.title || "Jadwal Kuliah Hari Ini";
  const description = settings?.description;

  // Compute status: CURRENT, NEXT, COMPLETED, UPCOMING
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const nextItemIndex = todaySchedules.findIndex((item) => {
    const startMin = timeToMinutes(item.startTime);
    return currentMinutes < startMin;
  });

  const schedulesWithStatus = todaySchedules.map((item, index) => {
    const startMin = timeToMinutes(item.startTime);
    const endMin = timeToMinutes(item.endTime);

    const isCurrent = currentMinutes >= startMin && currentMinutes < endMin;
    const isCompleted = currentMinutes >= endMin;
    const isNext = !isCompleted && !isCurrent && index === nextItemIndex;

    return {
      ...item,
      isCurrent,
      isNext,
      isCompleted,
    };
  });

  const handleBlockClick = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsDetailOpen(true);
  };

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-blue-700 dark:text-blue-400 font-bold">
              {"// Hari Ini"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
              {description}
            </p>
          )}
        </div>

        <Link href="/schedule">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            Lihat Jadwal Lengkap
          </Button>
        </Link>
      </div>

      {todaySchedules.length === 0 ? (
        <Card
          variant="default"
          padding="lg"
          className="text-center border-dashed space-y-3 p-8 sm:p-10"
        >
          <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200 text-blue-600 dark:bg-blue-950/40 dark:border-blue-800/50 dark:text-blue-400 flex items-center justify-center mx-auto">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-[var(--text-primary)]">
              Tidak ada perkuliahan hari ini
            </h4>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] max-w-md mx-auto">
              Gunakan waktunya untuk istirahat, belajar mandiri, atau menyelesaikan tugas.
            </p>
          </div>
          <div className="pt-2">
            <Link href="/schedule">
              <Button variant="outline" size="sm" className="text-xs cursor-pointer">
                Lihat Jadwal Mingguan
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div
          className={cn(
            "grid gap-3.5",
            schedulesWithStatus.length === 1
              ? "grid-cols-1 max-w-md"
              : "grid-cols-1 sm:grid-cols-2"
          )}
        >
          {schedulesWithStatus.map((item) => (
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
              isCurrent={item.isCurrent}
              isNext={item.isNext}
              isCompleted={item.isCompleted}
              onClick={() => handleBlockClick(item)}
            />
          ))}
        </div>
      )}

      {/* Schedule Detail Dialog */}
      <ScheduleDetailDialog
        schedule={selectedSchedule}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        todayDayOfWeek={todayDayOfWeek}
      />
    </section>
  );
}
