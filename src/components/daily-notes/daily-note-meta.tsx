"use client";

import * as React from "react";
import { Calendar, User, BookOpen, Tag } from "lucide-react";
import { formatDate, cn } from "@/lib/utils";

export interface DailyNoteMetaData {
  date: string | Date;
  subject?: {
    code: string;
    name: string;
  } | null;
  author?: {
    name: string;
  } | null;
  tags?: string | null;
}

export function DailyNoteMeta({
  date,
  subject,
  author,
  tags,
  className,
}: DailyNoteMetaData & { className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-xs text-[var(--text-muted)] flex-wrap",
        className
      )}
    >
      <div className="flex items-center gap-1 font-medium text-cyan-300 light:text-blue-700">
        <Calendar className="w-3.5 h-3.5 shrink-0" />
        <span>{formatDate(date)}</span>
      </div>

      {subject && (
        <div className="flex items-center gap-1 font-mono font-bold text-cyan-400 light:text-blue-600">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span>{subject.code}</span>
        </div>
      )}

      {author && (
        <div className="flex items-center gap-1">
          <User className="w-3.5 h-3.5 shrink-0" />
          <span>{author.name}</span>
        </div>
      )}

      {tags && (
        <div className="flex items-center gap-1">
          <Tag className="w-3 h-3 shrink-0" />
          <span className="truncate max-w-[120px]">{tags}</span>
        </div>
      )}
    </div>
  );
}
