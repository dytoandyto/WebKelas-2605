"use client";

import * as React from "react";
import { BookOpen, User, ArrowRight, Layers } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export interface MaterialSubjectCardProps {
  code: string;
  name: string;
  englishName?: string | null;
  lecturerName?: string | null;
  sks?: number | null;
  materialsCount?: number;
  description?: string | null;
  color?: string | null;
  onClick?: () => void;
  className?: string;
}

export function MaterialSubjectCard({
  code,
  name,
  englishName,
  lecturerName,
  sks,
  materialsCount = 0,
  description,
  onClick,
  className,
}: MaterialSubjectCardProps) {
  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onClick}
      className={cn(
        "p-5 text-left flex flex-col justify-between h-full transition-all duration-200 cursor-pointer group",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-400/50 light:hover:border-blue-400/60",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400",
        className
      )}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick?.();
        }
      }}
      aria-label={`Mata kuliah ${name} (${code}), ${materialsCount} materi tersedia`}
    >
      <div className="space-y-3">
        {/* Top Badges */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-700 border border-cyan-500/20 light:border-blue-200">
              {code}
            </span>
            {sks && (
              <span className="text-[11px] font-mono text-[var(--text-muted)] font-medium">
                {sks} SKS
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-slate-800/80 light:bg-slate-100 text-[11px] font-mono font-semibold text-slate-300 light:text-slate-700 border border-slate-700/50 light:border-slate-200">
            <Layers size={11} className="text-cyan-400 light:text-blue-600" />
            <span>{materialsCount} materi</span>
          </div>
        </div>

        {/* Title */}
        <div>
          <h3 className="text-base sm:text-lg font-bold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors leading-snug">
            {name}
          </h3>
          {englishName && (
            <p className="text-xs text-[var(--text-muted)] italic mt-0.5">
              {englishName}
            </p>
          )}
        </div>

        {/* Lecturer if available */}
        {lecturerName && (
          <div className="flex items-center gap-1.5 text-xs text-[var(--text-secondary)] font-mono pt-1">
            <User size={13} className="text-cyan-400 light:text-blue-600 shrink-0" />
            <span className="truncate">Dosen: {lecturerName}</span>
          </div>
        )}

        {/* Short description */}
        {description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed pt-1">
            {description}
          </p>
        )}
      </div>

      {/* Action Footer */}
      <div className="pt-4 mt-4 border-t border-[var(--border-color)]/70 flex items-center justify-between text-xs font-semibold text-cyan-400 light:text-blue-600 group-hover:text-cyan-300 light:group-hover:text-blue-700 transition-colors">
        <span>Lihat materi</span>
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </div>
    </Card>
  );
}
