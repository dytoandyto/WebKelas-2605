"use client";

import * as React from "react";
import Link from "next/link";
import { StickyNote, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DailyNoteCard, DailyNoteData } from "@/components/daily-notes/daily-note-card";
import { DailyNotesSettings } from "@/lib/homepage/types";
import { cn } from "@/lib/utils";

export interface HomeDailyNotesProps {
  notes?: DailyNoteData[];
  settings?: DailyNotesSettings;
  className?: string;
}

export function HomeDailyNotes({
  notes = [],
  settings,
  className,
}: HomeDailyNotesProps) {
  const max = settings?.maxItems ?? 3;
  const displayNotes = notes.slice(0, max);
  const title = settings?.title || "Catatan & Rangkuman Kelas";
  const description =
    settings?.description ||
    "Rangkuman kuliah dan catatan penting yang dibagikan teman sekelas.";
  const buttonLabel = settings?.buttonText || "Lihat Semua Catatan";

  return (
    <section className={cn("space-y-4 text-left", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600 animate-pulse" />
            <span className="text-xs font-mono uppercase tracking-wider text-cyan-400 light:text-blue-700 font-bold">
              {"// Arsip Belajar"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
            {description}
          </p>
        </div>

        <Link href="/daily-notes">
          <Button
            variant="ghost"
            size="sm"
            className="text-xs text-cyan-400 light:text-blue-600 font-semibold cursor-pointer"
            rightIcon={<ArrowRight className="w-4 h-4" />}
          >
            {buttonLabel}
          </Button>
        </Link>
      </div>

      {displayNotes.length === 0 ? (
        <div className="max-w-xl mx-auto w-full">
          <Card
            variant="interactive"
            padding="md"
            className="text-center border-dashed p-6 sm:p-8 space-y-3"
          >
            <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 light:bg-blue-50 border border-cyan-500/20 light:border-blue-200 flex items-center justify-center mx-auto text-cyan-400 light:text-blue-600">
              <StickyNote className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h4 className="text-base font-bold text-[var(--text-primary)]">
                Belum ada catatan harian
              </h4>
              <p className="text-xs sm:text-sm text-[var(--text-secondary)]">
                Nanti setelah kuliah ada yang rangkum bareng di sini, ya.
              </p>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayNotes.map((note) => (
            <Link key={note.id} href={`/daily-notes/${note.id}`} className="block h-full">
              <DailyNoteCard note={note} className="h-full" />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
