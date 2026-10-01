"use client";

import * as React from "react";
import { GitCommit, Calendar } from "lucide-react";
import { DailyNoteData, DailyNoteCard } from "./daily-note-card";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";

export interface DailyNoteTimelineProps {
  notes: DailyNoteData[];
  onNoteClick?: (note: DailyNoteData) => void;
  className?: string;
}

export function DailyNoteTimeline({
  notes,
  onNoteClick,
  className,
}: DailyNoteTimelineProps) {
  if (notes.length === 0) {
    return (
      <EmptyState
        icon={<Calendar className="w-6 h-6 text-cyan-400" />}
        title="Belum Ada Jurnal Harian"
        description="Belum ada catatan perkuliahan atau rangkuman harian yang dipublikasikan."
        className={className}
      />
    );
  }

  // Sort chronologically descending
  const sorted = [...notes].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className={cn("relative pl-6 sm:pl-8 space-y-6 text-left", className)}>
      {/* Vertical Timeline Guide Line */}
      <div className="absolute top-3 bottom-3 left-2.5 sm:left-3.5 w-0.5 bg-gradient-to-b from-cyan-400 via-blue-500/50 to-transparent light:from-blue-600 light:via-blue-300" />

      {sorted.map((note) => (
        <div key={note.id} className="relative group">
          {/* Node Dot */}
          <div className="absolute -left-6 sm:-left-8 top-5 w-5 h-5 rounded-full bg-[var(--surface-primary)] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(6,182,212,0.6)] group-hover:scale-125 transition-transform light:bg-white light:border-blue-600">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 light:bg-blue-600" />
          </div>

          <DailyNoteCard note={note} onClick={() => onNoteClick?.(note)} />
        </div>
      ))}
    </div>
  );
}
