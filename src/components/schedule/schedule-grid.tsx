"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { DayOfWeek } from "@prisma/client";
import { cn } from "@/lib/utils";
import { ScheduleBlock } from "./schedule-block";

export interface ScheduleItem {
  id: string;
  dayOfWeek: DayOfWeek;
  startTime: string;
  endTime: string;
  room?: string | null;
  lecturerName?: string | null;
  className?: string | null;
  semester?: string | null;
  notes?: string | null;
  subject: {
    id: string;
    code: string;
    name: string;
    englishName?: string | null;
    sks?: number | null;
    color?: string | null;
    lecturerName?: string | null;
  };
}

export interface ScheduleGridProps {
  schedules: ScheduleItem[];
  currentScheduleId?: string;
  nextScheduleId?: string;
  selectedScheduleId?: string;
  todayDayOfWeek?: string;
  onBlockClick?: (schedule: ScheduleItem) => void;
  className?: string;
}

export const TIME_SLOTS = [
  { slot: 0, start: "07:30", end: "08:30", label: "Sesi 1" },
  { slot: 1, start: "08:30", end: "09:30", label: "Sesi 2" },
  { slot: 2, start: "09:30", end: "10:30", label: "Sesi 3" },
  { slot: 3, start: "10:30", end: "11:30", label: "Sesi 4" },
  { slot: 4, start: "11:30", end: "12:30", label: "Sesi 5" },
  { slot: 5, start: "12:30", end: "13:30", label: "Sesi 6 / Istirahat" },
  { slot: 6, start: "13:30", end: "14:30", label: "Sesi 7" },
  { slot: 7, start: "14:30", end: "15:30", label: "Sesi 8" },
  { slot: 8, start: "15:30", end: "16:30", label: "Sesi 9" },
  { slot: 9, start: "16:30", end: "17:30", label: "Sesi 10" },
];

export const DAYS: { key: DayOfWeek; label: string; short: string }[] = [
  { key: DayOfWeek.MONDAY, label: "Senin", short: "SEN" },
  { key: DayOfWeek.TUESDAY, label: "Selasa", short: "SEL" },
  { key: DayOfWeek.WEDNESDAY, label: "Rabu", short: "RAB" },
  { key: DayOfWeek.THURSDAY, label: "Kamis", short: "KAM" },
  { key: DayOfWeek.FRIDAY, label: "Jum'at", short: "JUM" },
  { key: DayOfWeek.SATURDAY, label: "Sabtu", short: "SAB" },
];

function parseTimeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

const BASE_START_MINUTES = 7 * 60 + 30; // 07:30 = 450 minutes
const SLOT_DURATION_MINUTES = 60; // 60 minutes per slot
const TOTAL_SLOTS = 10;

export function ScheduleGrid({
  schedules,
  currentScheduleId,
  nextScheduleId,
  selectedScheduleId,
  todayDayOfWeek,
  onBlockClick,
  className,
}: ScheduleGridProps) {
  // Day column index mapping (0 to 5)
  const dayColMap: Record<DayOfWeek, number> = {
    MONDAY: 0,
    TUESDAY: 1,
    WEDNESDAY: 2,
    THURSDAY: 3,
    FRIDAY: 4,
    SATURDAY: 5,
    SUNDAY: -1,
  };

  return (
    <div
      className={cn(
        "w-full overflow-x-auto rounded-2xl border border-[var(--border-color)] bg-[var(--surface-card)] p-4 shadow-[var(--shadow-sm)]",
        className
      )}
    >
      <div className="min-w-[1020px]">
        {/* CSS Grid Timetable Container - Straight & Aligned */}
        <div
          className="grid gap-2"
          style={{
            gridTemplateColumns: "110px repeat(6, minmax(140px, 1fr))",
            gridTemplateRows: "46px repeat(10, minmax(84px, auto))",
          }}
        >
          {/* Row 1, Col 1: Waktu Header */}
          <div
            style={{ gridColumn: 1, gridRow: 1 }}
            className="rounded-xl bg-[var(--surface-primary)] border border-[var(--border-color)] text-xs font-mono font-bold text-cyan-400 light:text-blue-700 flex items-center justify-center tracking-wider"
          >
            WAKTU / SHIFT
          </div>

          {/* Row 1, Cols 2..7: Day Headers */}
          {DAYS.map((day, idx) => {
            const isToday = todayDayOfWeek === day.key;
            return (
              <div
                key={day.key}
                style={{ gridColumn: idx + 2, gridRow: 1 }}
                className={cn(
                  "rounded-xl border text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 px-2",
                  isToday
                    ? "bg-gradient-to-r from-blue-600/30 to-cyan-500/30 light:bg-blue-100 border-cyan-400/50 light:border-blue-300 text-cyan-200 light:text-blue-800 shadow-sm"
                    : "bg-[var(--surface-primary)] border-[var(--border-color)] text-[var(--text-secondary)]"
                )}
              >
                <span>{day.label}</span>
                {isToday && (
                  <span
                    className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"
                    title="Hari ini"
                  />
                )}
              </div>
            );
          })}

          {/* Col 1, Rows 2..11: Time Slot Labels */}
          {TIME_SLOTS.map((slot) => (
            <div
              key={slot.slot}
              style={{ gridColumn: 1, gridRow: slot.slot + 2 }}
              className="rounded-xl border border-[var(--border-color)]/70 bg-[var(--surface-primary)]/60 p-2 text-center flex flex-col justify-center text-xs font-mono text-[var(--text-muted)] light:bg-slate-50/90 light:border-slate-200"
            >
              <div className="flex items-center justify-center gap-1 font-bold text-[var(--text-primary)]">
                <Clock className="w-3.5 h-3.5 text-cyan-400 light:text-blue-600 shrink-0" />
                <span>{slot.start}</span>
              </div>
              <div className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {slot.end}
              </div>
              <span className="text-[9px] mt-1 font-semibold uppercase tracking-wider text-cyan-500/80 light:text-blue-600">
                {slot.label}
              </span>
            </div>
          ))}

          {/* Background Grid Cells for Cols 2..7, Rows 2..11 (Visual Alignment Guides) */}
          {DAYS.map((day, dayIdx) =>
            TIME_SLOTS.map((slot) => (
              <div
                key={`bg-${day.key}-${slot.slot}`}
                style={{ gridColumn: dayIdx + 2, gridRow: slot.slot + 2 }}
                className="rounded-xl border border-dashed border-[var(--border-color)]/25 light:border-slate-200/60 bg-[var(--surface-primary)]/10 light:bg-slate-50/30 transition-colors pointer-events-none"
              />
            ))
          )}

          {/* Schedule Blocks (Accurately Placed & Spanned across exact time rows) */}
          {schedules.map((item) => {
            const colIdx = dayColMap[item.dayOfWeek];
            if (colIdx === undefined || colIdx < 0) return null;

            const startMin = parseTimeToMinutes(item.startTime);
            const endMin = parseTimeToMinutes(item.endTime);

            // Compute slot start & end
            const slotStart = Math.max(
              0,
              Math.min(
                TOTAL_SLOTS - 1,
                Math.round((startMin - BASE_START_MINUTES) / SLOT_DURATION_MINUTES)
              )
            );
            const slotEnd = Math.max(
              slotStart + 1,
              Math.min(
                TOTAL_SLOTS,
                Math.round((endMin - BASE_START_MINUTES) / SLOT_DURATION_MINUTES)
              )
            );

            const gridRowStart = slotStart + 2;
            const gridRowEnd = slotEnd + 2;

            const isCurrent = item.id === currentScheduleId;
            const isNext = item.id === nextScheduleId;
            const isSelected = item.id === selectedScheduleId;

            return (
              <div
                key={item.id}
                style={{
                  gridColumn: colIdx + 2,
                  gridRow: `${gridRowStart} / ${gridRowEnd}`,
                }}
                className="z-10 p-0.5 h-full min-h-0"
              >
                <ScheduleBlock
                  code={item.subject.code}
                  name={item.subject.name}
                  englishName={item.subject.englishName}
                  time={`${item.startTime} - ${item.endTime}`}
                  room={item.room}
                  lecturerName={item.lecturerName || item.subject.lecturerName}
                  sks={item.subject.sks}
                  color={item.subject.color}
                  isCurrent={isCurrent}
                  isNext={isNext}
                  isSelected={isSelected}
                  onClick={() => onBlockClick?.(item)}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
