"use client";

import * as React from "react";
import Link from "next/link";
import { Calendar, BookOpen, ArrowRight } from "lucide-react";
import { cn, formatDate } from "@/lib/utils";

export interface StudyNoteCardProps {
  note: {
    id: string;
    title: string;
    date: Date | string;
    summary?: string | null;
    content: string;
    importantPoints?: string | null;
    subject?: {
      code: string;
      name: string;
    } | null;
    author?: {
      name: string;
      role?: string;
    } | null;
    article?: {
      id: string;
      title: string;
      slug: string;
    } | null;
  };
  className?: string;
}

export function StudyNoteCard({ note, className }: StudyNoteCardProps) {
  return (
    <div
      className={cn(
        "group flex flex-col justify-between rounded-2xl border border-cyan-500/20 light:border-slate-200 bg-[#08152e]/80 light:bg-white p-5 shadow-[0_0_15px_rgba(6,182,212,0.06)] hover:border-cyan-400/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.18)] transition-all duration-200",
        className
      )}
    >
      <div className="space-y-3">
        {/* Meta Bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
          {note.subject ? (
            <span className="px-2.5 py-0.5 rounded-md font-mono text-[11px] font-semibold bg-cyan-500/15 light:bg-blue-50 text-cyan-300 light:text-blue-700 border border-cyan-500/30 light:border-blue-200">
              {note.subject.code}
            </span>
          ) : (
            <span className="px-2 py-0.5 rounded-md font-mono text-[11px] text-slate-400 bg-slate-900/60 light:bg-slate-100">
              Umum
            </span>
          )}
          <span className="flex items-center gap-1 text-slate-400 font-mono text-[11px]">
            <Calendar size={12} className="text-cyan-400 light:text-blue-600" />
            {formatDate(note.date)}
          </span>
        </div>

        {/* Note Title */}
        <Link href={`/learning/notes/${note.id}`}>
          <h4 className="text-base font-bold text-white light:text-slate-900 group-hover:text-cyan-300 light:group-hover:text-blue-600 transition-colors font-display line-clamp-2 leading-snug">
            {note.title}
          </h4>
        </Link>

        {/* Summary */}
        <p className="text-xs sm:text-sm text-slate-300 light:text-slate-600 line-clamp-3 leading-relaxed">
          {note.summary || note.content}
        </p>

        {/* Connected Article Pill */}
        {note.article && (
          <div className="pt-1">
            <Link
              href={`/learning/articles/${note.article.slug}`}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-cyan-500/10 text-cyan-300 light:bg-slate-100 light:text-slate-700 border border-cyan-500/20 light:border-slate-200 hover:border-cyan-400/40 transition-colors"
            >
              <BookOpen size={12} />
              <span className="truncate max-w-[220px]">Artikel: {note.article.title}</span>
            </Link>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="pt-4 mt-4 border-t border-cyan-500/15 light:border-slate-100 flex items-center justify-between text-xs">
        <span className="text-slate-400 truncate max-w-[140px]">
          Oleh: {note.author?.name || "Mahasiswa"}
        </span>

        <Link
          href={`/learning/notes/${note.id}`}
          className="flex items-center gap-1 text-cyan-400 light:text-blue-600 hover:text-cyan-300 light:hover:text-blue-700 font-semibold"
        >
          <span>Baca Catatan</span>
          <ArrowRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}
