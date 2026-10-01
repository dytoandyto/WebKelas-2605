"use client";

import * as React from "react";
import { CheckCircle2, ArrowRight, BookOpen } from "lucide-react";
import { DailyNoteData } from "./daily-note-card";
import { DailyNoteMeta } from "./daily-note-meta";
import { cn } from "@/lib/utils";

export interface DailyNoteContentProps {
  note: DailyNoteData;
  className?: string;
}

export function DailyNoteContent({ note, className }: DailyNoteContentProps) {
  return (
    <article
      className={cn(
        "max-w-[800px] mx-auto space-y-6 text-left leading-relaxed",
        className
      )}
    >
      {/* Header & Meta */}
      <div className="space-y-3 pb-4 border-b border-[var(--border-color)]">
        <DailyNoteMeta
          date={note.date}
          subject={note.subject}
          author={note.author}
          tags={note.tags}
        />
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
          {note.title}
        </h1>
        {note.subject?.name && (
          <p className="text-sm text-cyan-400 light:text-blue-700 font-medium">
            Mata Kuliah: {note.subject.code} - {note.subject.name}
          </p>
        )}
      </div>

      {/* Summary Highlight Box */}
      {note.summary && (
        <div className="p-4 rounded-xl border border-cyan-500/30 bg-cyan-500/5 light:bg-blue-50/60 light:border-blue-200">
          <h5 className="text-xs font-bold uppercase tracking-wider text-cyan-300 light:text-blue-700 font-mono mb-1">
            Ringkasan Kuliah
          </h5>
          <p className="text-sm text-[var(--text-primary)] leading-relaxed">
            {note.summary}
          </p>
        </div>
      )}

      {/* Main Long-Form Content */}
      <div className="text-sm sm:text-base text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed space-y-4">
        {note.content}
      </div>

      {/* Important Points */}
      {note.importantPoints && (
        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 light:bg-emerald-50/50 light:border-emerald-200 space-y-2">
          <div className="flex items-center gap-2 text-emerald-300 light:text-emerald-800 text-xs font-bold uppercase tracking-wider font-mono">
            <CheckCircle2 className="w-4 h-4" />
            <span>Poin-Poin Penting</span>
          </div>
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {note.importantPoints}
          </div>
        </div>
      )}

      {/* Next Steps / Tindak Lanjut */}
      {note.nextSteps && (
        <div className="p-4 rounded-xl border border-amber-500/30 bg-amber-500/5 light:bg-amber-50/50 light:border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-300 light:text-amber-800 text-xs font-bold uppercase tracking-wider font-mono">
            <ArrowRight className="w-4 h-4" />
            <span>Tindak Lanjut & Persiapan Berikutnya</span>
          </div>
          <div className="text-sm text-[var(--text-primary)] whitespace-pre-wrap leading-relaxed">
            {note.nextSteps}
          </div>
        </div>
      )}
    </article>
  );
}
