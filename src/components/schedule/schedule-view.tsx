"use client";

import * as React from "react";
import { DayOfWeek } from "@prisma/client";
import { ScheduleToolbar } from "./schedule-toolbar";
import { ScheduleGrid, ScheduleItem } from "./schedule-grid";
import { ScheduleList } from "./schedule-list";
import { ScheduleDetailDialog } from "./schedule-detail-dialog";

export interface ScheduleViewProps {
  schedules: ScheduleItem[];
  subjects: any[];
  classCode?: string;
  academicYear?: string;
}

export function ScheduleView({
  schedules,
  subjects,
  classCode = "JS1SI-26-REG-05",
  academicYear = "Semester Ganjil 2026/2027",
}: ScheduleViewProps) {
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [selectedDay, setSelectedDay] = React.useState<string>("ALL");
  const [selectedSchedule, setSelectedSchedule] =
    React.useState<ScheduleItem | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);

  // Determine current Day of week
  const dayMap: Record<number, DayOfWeek> = {
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  const todayDay = dayMap[new Date().getDay()] || DayOfWeek.MONDAY;

  const handleBlockClick = (schedule: ScheduleItem) => {
    setSelectedSchedule(schedule);
    setIsDetailOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* 1. Schedule Toolbar */}
      <ScheduleToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        onTodayClick={() => setSelectedDay(todayDay)}
        classCode={classCode}
        academicYear={academicYear}
      />

      {/* 2. Grid (Desktop) or List (Mobile / List Mode) */}
      {viewMode === "grid" ? (
        <>
          <div className="hidden lg:block">
            <ScheduleGrid
              schedules={schedules}
              todayDayOfWeek={todayDay}
              selectedScheduleId={selectedSchedule?.id}
              onBlockClick={handleBlockClick}
            />
          </div>
          <div className="lg:hidden">
            <ScheduleList
              schedules={schedules}
              selectedDay={selectedDay === "ALL" ? todayDay : selectedDay}
              onBlockClick={handleBlockClick}
            />
          </div>
        </>
      ) : (
        <ScheduleList
          schedules={schedules}
          selectedDay={selectedDay}
          onBlockClick={handleBlockClick}
        />
      )}

      {/* 3. Schedule Detail Modal (Crystal-clear visibility on click) */}
      <ScheduleDetailDialog
        schedule={selectedSchedule}
        open={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        todayDayOfWeek={todayDay}
      />
    </div>
  );
}
