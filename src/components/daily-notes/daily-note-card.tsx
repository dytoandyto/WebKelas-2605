"use client";

import * as React from "react";
import { ChevronRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { DailyNoteMeta, DailyNoteMetaData } from "./daily-note-meta";
import { cn } from "@/lib/utils";

export interface DailyNoteData extends DailyNoteMetaData {
  id: string;
  title: string;
  summary?: string | null;
  content: string;
  importantPoints?: string | null;
  nextSteps?: string | null;
  mood?: string | null;
  createdAt: string | Date;
}

export interface DailyNoteCardProps {
  note: DailyNoteData;
  onClick?: () => void;
  className?: string;
}

export function DailyNoteCard({
  note,
  onClick,
  className,
}: DailyNoteCardProps) {
  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onClick}
      className={cn("text-left space-y-3", className)}
    >
      {/* Meta Top Strip */}
      <DailyNoteMeta
        date={note.date}
        subject={note.subject}
        author={note.author}
        tags={note.tags}
      />

      {/* Title */}
      <div>
        <h4 className="text-base sm:text-lg font-bold text-[var(--text-primary)] tracking-tight line-clamp-2 hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
          {note.title}
        </h4>
        {note.subject?.name && (
          <p className="text-xs text-[var(--text-muted)] mt-0.5">
            {note.subject.name}
          </p>
        )}
      </div>

      {/* Summary */}
      {note.summary && (
        <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
          {note.summary}
        </p>
      )}

      {/* Footer Read CTA */}
      <div className="pt-2 border-t border-[var(--border-color)]/70 flex items-center justify-between text-xs text-cyan-400 light:text-blue-600 font-medium">
        <span>Baca Catatan Jurnal</span>
        <ChevronRight className="w-4 h-4" />
      </div>
    </Card>
  );
}
