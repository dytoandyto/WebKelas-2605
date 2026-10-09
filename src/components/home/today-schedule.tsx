"use client";

import * as React from "react";
import Link from "next/link";
import { Clock, Calendar, ArrowRight } from "lucide-react";
import { ScheduleBlock } from "@/components/schedule/schedule-block";
import { ScheduleItem } from "@/components/schedule/schedule-grid";
import { ScheduleDetailDialog } from "@/components/schedule/schedule-detail-dialog";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TodayScheduleProps {
  schedules: ScheduleItem[];
  todayDayOfWeek?: string;
  className?: string;
}

function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

export function TodaySchedule({
  schedules,
  todayDayOfWeek,
  className,
}: TodayScheduleProps) {
  const [selectedSchedule, setSelectedSchedule] =
    React.useState<ScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Filter for today
  const todaySchedules = React.useMemo(() => {
    return schedules
      .filter((s) => s.dayOfWeek === todayDayOfWeek)
      .sort((a, b) => a.startTime.localeCompare(b.startTime));
  }, [schedules, todayDayOfWeek]);

  // Compute status: CURRENT, NEXT, COMPLETED, UPCOMING
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  let nextFound = false;

  const schedulesWithStatus = todaySchedules.map((item) => {
    const startMin = timeToMinutes(item.startTime);
    const endMin = timeToMinutes(item.endTime);

    const isCurrent = currentMinutes >= startMin && currentMinutes < endMin;
    const isCompleted = currentMinutes >= endMin;
    let isNext = false;

    if (!isCompleted && !isCurrent && !nextFound && currentMinutes < startMin) {
      isNext = true;
      nextFound = true;
    }

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
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              // Hari Ini
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            Jadwal Kuliah Hari Ini
          </h2>
        </div>

        <Link href="/schedule">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold cursor-pointer"
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
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center mx-auto text-cyan-400 light:text-blue-600">
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
