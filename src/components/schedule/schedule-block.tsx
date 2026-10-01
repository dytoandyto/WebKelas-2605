"use client";

import * as React from "react";
import { Clock, MapPin, User, Sparkles, ExternalLink, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export interface ScheduleBlockProps {
  code: string;
  name: string;
  englishName?: string | null;
  time: string;
  room?: string | null;
  lecturerName?: string | null;
  sks?: number | null;
  color?: string | null;
  isCurrent?: boolean;
  isNext?: boolean;
  isCompleted?: boolean;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
  variant?: "grid" | "compact" | "card";
}

export function ScheduleBlock({
  code,
  name,
  englishName,
  time,
  room,
  lecturerName,
  sks,
  color,
  isCurrent = false,
  isNext = false,
  isCompleted = false,
  isSelected = false,
  onClick,
  className,
  variant = "grid",
}: ScheduleBlockProps) {
  if (variant === "compact") {
    return (
      <div
        onClick={onClick}
        className={cn(
          "group flex items-center justify-between p-3.5 rounded-xl border transition-all duration-200 text-left select-none",
          isSelected
            ? "ring-2 ring-cyan-400 light:ring-blue-600 bg-cyan-950/40 light:bg-blue-50/95 border-cyan-400 light:border-blue-400 shadow-md"
            : isCurrent
            ? "bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(6,182,212,0.25)] light:bg-blue-50/90 light:border-blue-300"
            : isNext
            ? "bg-blue-500/10 border-blue-500/30 light:bg-sky-50/90 light:border-sky-200"
            : "bg-[var(--surface-primary)] border-[var(--border-color)] hover:border-cyan-400/50 hover:bg-slate-900/50 light:bg-white light:border-slate-200 light:hover:bg-blue-50/70 light:hover:border-blue-300",
          onClick && "cursor-pointer",
          className
        )}
      >
        <div className="min-w-0 space-y-1 flex-1 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold text-cyan-300 light:text-blue-700">
              {code}
            </span>
            {sks && (
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-white/10 text-[var(--text-secondary)] light:bg-slate-100 light:text-slate-600">
                {sks} SKS
              </span>
            )}
            {isCurrent && (
              <Badge variant="cyan" size="sm" dot>
                Sedang Berlangsung
              </Badge>
            )}
            {isNext && (
              <Badge variant="blue" size="sm">
                Berikutnya
              </Badge>
            )}
          </div>
          <h4 className="text-sm font-bold text-[var(--text-primary)] truncate group-hover:text-cyan-300 light:group-hover:text-blue-700 transition-colors">
            {name}
          </h4>
          <div className="flex items-center gap-3 text-xs text-[var(--text-secondary)] flex-wrap">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-cyan-400 light:text-blue-600" />
              {time}
            </span>
            {room && (
              <span className="flex items-center gap-1 font-mono">
                <MapPin className="w-3.5 h-3.5 text-emerald-400 light:text-emerald-600" />
                {room}
              </span>
            )}
          </div>
        </div>
        <div className="shrink-0 text-[var(--text-muted)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors p-1">
          <Info className="w-4 h-4" />
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onClick}
      className={cn(
        "group relative rounded-xl p-3 sm:p-3.5 border transition-all duration-200 text-left select-none h-full flex flex-col justify-between overflow-hidden",
        isSelected
          ? "ring-2 ring-cyan-400 light:ring-blue-600 bg-gradient-to-br from-cyan-950/80 to-blue-950/70 border-cyan-400 shadow-[0_0_24px_rgba(6,182,212,0.35)] scale-[1.01] z-20 light:from-blue-50 light:to-sky-50 light:border-blue-400 light:shadow-lg"
          : isCurrent
          ? "bg-gradient-to-br from-cyan-950/70 to-blue-950/60 border-cyan-400/70 shadow-[0_0_20px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/40 light:from-blue-50 light:to-sky-50 light:border-blue-400 light:shadow-md"
          : isNext
          ? "bg-blue-950/40 border-blue-500/40 light:bg-sky-50/70 light:border-sky-300"
          : isCompleted
          ? "bg-slate-900/30 border-slate-800/60 opacity-60 light:bg-slate-100 light:border-slate-200"
          : "bg-slate-900/75 border-slate-700/60 hover:border-cyan-400/50 hover:bg-slate-900/95 hover:shadow-[0_4px_16px_rgba(6,182,212,0.15)] shadow-sm light:bg-white light:border-slate-200/90 light:shadow-sm light:hover:bg-blue-50/90 light:hover:border-blue-300 light:hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
    >
      {/* Top Header: Code, Badges, SKS */}
      <div>
        <div className="flex items-start justify-between gap-1.5 mb-1.5">
          <span className="font-mono text-[11px] font-bold text-cyan-300 light:text-blue-700 tracking-wider">
            {code}
          </span>
          <div className="flex items-center gap-1 shrink-0">
            {sks && (
              <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-white/10 text-[var(--text-secondary)] light:bg-slate-100 light:text-slate-700 font-mono">
                {sks} SKS
              </span>
            )}
            {isCurrent && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-cyan-500 text-white shadow-[0_0_8px_rgba(6,182,212,0.8)] animate-pulse">
                <Sparkles className="w-2.5 h-2.5" /> LIVE
              </span>
            )}
            {isSelected && !isCurrent && (
              <span className="inline-flex items-center px-1.5 py-0.2 rounded text-[9px] font-bold bg-cyan-500/20 text-cyan-300 light:bg-blue-100 light:text-blue-700 border border-cyan-400/30">
                ACTIVE
              </span>
            )}
          </div>
        </div>

        {/* Course Name */}
        <h4 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] leading-snug line-clamp-2 group-hover:text-cyan-300 light:group-hover:text-blue-700 transition-colors">
          {name}
        </h4>

        {englishName && englishName !== name && (
          <p className="text-[10px] text-[var(--text-muted)] italic truncate mt-0.5">
            {englishName}
          </p>
        )}
      </div>

      {/* Meta Footer: Time & Room & Click Hint */}
      <div className="mt-2 pt-2 border-t border-[var(--border-color)]/60 flex flex-col gap-1 text-[11px] text-[var(--text-secondary)]">
        <div className="flex items-center gap-1.5 font-medium">
          <Clock className="w-3.5 h-3.5 text-cyan-400/90 light:text-blue-600 shrink-0" />
          <span className="truncate">{time}</span>
        </div>
        {room && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400/90 light:text-emerald-600 shrink-0" />
            <span className="font-mono text-[10px] font-semibold text-[var(--text-primary)] truncate">
              {room}
            </span>
          </div>
        )}
        {lecturerName && (
          <div className="flex items-center gap-1.5 text-[10px] text-[var(--text-muted)] truncate">
            <User className="w-3 h-3 shrink-0" />
            <span className="truncate">{lecturerName}</span>
          </div>
        )}

        {/* Subtle click indicator */}
        <div className="flex items-center justify-between pt-1 text-[9px] text-[var(--text-muted)] font-mono opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-cyan-400 light:text-blue-600 font-semibold">
            Klik untuk detail
          </span>
          <Info className="w-3 h-3 text-cyan-400 light:text-blue-600" />
        </div>
      </div>
    </div>
  );
}
