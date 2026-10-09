"use client";

import * as React from "react";
import { Folder, Layers, BookOpen } from "lucide-react";
import { MaterialData } from "./material-card";
import { MaterialRow } from "./material-row";
import { cn } from "@/lib/utils";

export interface MaterialSectionGroupProps {
  title: string;
  description?: string | null;
  materials: MaterialData[];
  onMaterialClick: (material: MaterialData) => void;
  showSubject?: boolean;
  className?: string;
  highlightedMaterialId?: string | null;
}

export function MaterialSectionGroup({
  title,
  description,
  materials,
  onMaterialClick,
  showSubject = true,
  className,
  highlightedMaterialId,
}: MaterialSectionGroupProps) {
  if (materials.length === 0) return null;

  return (
    <div className={cn("space-y-3", className)}>
      {/* Submateri Section Header */}
      <div className="flex items-center justify-between gap-2 pb-2 border-b border-[var(--border-color)]">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 light:bg-blue-600" />
          <h3 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight">
            {title}
          </h3>
          {description && (
            <span className="hidden md:inline text-xs text-[var(--text-muted)] italic font-mono">
              &bull; {description}
            </span>
          )}
        </div>
        <span className="text-xs font-mono font-semibold text-[var(--text-muted)] px-2 py-0.5 rounded-full bg-[var(--surface-primary)] border border-[var(--border-color)]">
          {materials.length} materi
        </span>
      </div>

      {/* Materials List Rows */}
      <div className="space-y-2">
        {materials.map((m) => (
          <MaterialRow
            key={m.id}
            material={m}
            showSubject={showSubject}
            onClick={() => onMaterialClick(m)}
            className={cn(
              highlightedMaterialId === m.id &&
                "ring-2 ring-cyan-400 light:ring-blue-500 bg-cyan-500/10 light:bg-blue-50/80 shadow-md"
            )}
          />
        ))}
      </div>
    </div>
  );
}
