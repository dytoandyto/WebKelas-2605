"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Clock, MapPin, User, ArrowRight, CheckCircle2, Radio } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScheduleItem {
  id: string;
  startTime: string; // "07:30"
  endTime: string;   // "11:30"
  room: string;
  lecturerName?: string | null;
  subject?: {
    code: string;
    name: string;
  } | null;
}

interface NextClassCardProps {
  schedules: ScheduleItem[];
  classCode?: string;
  semester?: string;
}

export function NextClassCard({
  schedules,
  classCode = "JS1SI-26-REG-05",
  semester = "Semester Ganjil 2026/2027",
}: NextClassCardProps) {
  const [currentTime, setCurrentTime] = useState<Date | null>(null);

  useEffect(() => {
    setCurrentTime(new Date());
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

  if (!currentTime) {
    return (
      <div className="card p-5 border border-border bg-card shadow-xs animate-pulse">
        <div className="h-4 w-32 bg-surface rounded mb-3" />
        <div className="h-6 w-48 bg-surface rounded mb-2" />
        <div className="h-4 w-24 bg-surface rounded" />
      </div>
    );
  }

  const hours = currentTime.getHours().toString().padStart(2, "0");
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const currentHM = `${hours}:${minutes}`;

  // Find ongoing class
  const ongoing = schedules.find((s) => s.startTime <= currentHM && s.endTime >= currentHM);

  // Find next class
  const nextClass = schedules.find((s) => s.startTime > currentHM);

  // Compute countdown in minutes
  let countdownText = "";
  if (nextClass) {
    const [startH, startM] = nextClass.startTime.split(":").map(Number);
    const startTotalMinutes = startH * 60 + startM;
    const currentTotalMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();
    const diffMinutes = startTotalMinutes - currentTotalMinutes;

    if (diffMinutes < 60) {
      countdownText = `Starts in ${diffMinutes} minutes`;
    } else {
      const h = Math.floor(diffMinutes / 60);
      const m = diffMinutes % 60;
      countdownText = `Starts in ${h} hr ${m > 0 ? `${m} min` : ""}`;
    }
  }

  const activeSlot = ongoing || nextClass;

  return (
    <div className="card border border-border bg-gradient-to-br from-card via-card to-surface-elevated/40 p-5 shadow-xs relative overflow-hidden group">
      <div className="flex items-center justify-between gap-2 pb-3 mb-3 border-b border-border">
        <div className="flex items-center gap-2">
          {ongoing ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30 animate-pulse">
              <Radio size={10} />
              Class in Progress
            </span>
          ) : nextClass ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
              <Clock size={10} />
              Next Scheduled Class
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
              <CheckCircle2 size={10} />
              Schedule Completed
            </span>
          )}
        </div>

        <div className="text-[11px] font-mono text-text-muted">
          Current: <span className="font-semibold text-text-primary">{currentHM} WIB</span>
        </div>
      </div>

      {activeSlot ? (
        <div className="space-y-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-brand-500/15 text-brand-600 dark:text-brand-400 border border-brand-500/25">
                {activeSlot.subject?.code}
              </span>
              <span className="text-xs font-semibold text-text-muted">
                {activeSlot.startTime} - {activeSlot.endTime} WIB
              </span>
              {countdownText && (
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-400 ml-auto">
                  {countdownText}
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-text-primary leading-snug">
              {activeSlot.subject?.name}
            </h3>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs pt-1 border-t border-border/60">
            <div className="flex items-center gap-1.5 text-text-secondary">
              <MapPin size={13} className="text-brand-500 shrink-0" />
              <span className="font-mono font-medium truncate">{activeSlot.room}</span>
            </div>
            <div className="flex items-center gap-1.5 text-text-muted">
              <User size={13} className="shrink-0" />
              <span className="truncate">{activeSlot.lecturerName || "Dosen Pengampu"}</span>
            </div>
          </div>
        </div>
      ) : (
        <div className="py-3 text-center">
          <p className="text-sm font-semibold text-text-primary">
            {schedules.length === 0
              ? "Tidak ada jadwal kuliah hari ini."
              : "Semua perkuliahan hari ini telah selesai."}
          </p>
          <p className="text-xs text-text-muted mt-1">
            Gunakan waktu untuk mereview catatan kuliah atau menyelesaikan tugas.
          </p>
        </div>
      )}

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs">
        <span className="text-[11px] text-text-muted font-mono">{classCode}</span>
        <Link
          href="/admin/schedule"
          className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-500 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
        >
          <span>Open Timetable</span>
          <ArrowRight size={12} />
        </Link>
      </div>
    </div>
  );
}
