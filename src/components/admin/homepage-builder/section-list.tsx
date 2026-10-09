"use client";

import React, { useState } from "react";
import { SectionConfig, SectionKey } from "@/lib/homepage/types";
import { getSectionMeta } from "@/lib/homepage/registry";
import {
  GripVertical,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  ChevronRight,
  RotateCcw,
} from "lucide-react";

interface SectionListProps {
  sections: SectionConfig[];
  selectedKey: SectionKey;
  onSelectSection: (key: SectionKey) => void;
  onToggleVisibility: (key: SectionKey) => void;
  onReorder: (newOrder: SectionConfig[]) => void;
  onResetSection: (key: SectionKey) => void;
}

export function SectionList({
  sections,
  selectedKey,
  onSelectSection,
  onToggleVisibility,
  onReorder,
  onResetSection,
}: SectionListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Accessible move Up / Down
  function handleMove(index: number, direction: "up" | "down") {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const updated = [...sections];
    const temp = updated[index];
    updated[index] = updated[targetIndex];
    updated[targetIndex] = temp;

    // re-assign sequential order numbers
    updated.forEach((s, idx) => {
      s.order = idx;
    });

    onReorder(updated);
  }

  // HTML5 Drag and Drop handlers
  function handleDragStart(e: React.DragEvent, index: number) {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", index.toString());
  }

  function handleDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    if (dragOverIndex !== index) {
      setDragOverIndex(index);
    }
  }

  function handleDragEnd() {
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  function handleDrop(e: React.DragEvent, dropIndex: number) {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...sections];
    const [draggedItem] = updated.splice(draggedIndex, 1);
    updated.splice(dropIndex, 0, draggedItem);

    updated.forEach((s, idx) => {
      s.order = idx;
    });

    onReorder(updated);
    setDraggedIndex(null);
    setDragOverIndex(null);
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between pb-1">
        <span className="text-xs font-bold uppercase tracking-wider text-text-secondary font-mono">
          Susunan Section ({sections.length})
        </span>
        <span className="text-[11px] text-text-muted">
          Drag & Drop atau gunakan panah
        </span>
      </div>

      <div className="space-y-2">
        {sections.map((section, idx) => {
          const meta = getSectionMeta(section.key);
          const Icon = meta.icon;
          const isSelected = selectedKey === section.key;
          const isDragging = draggedIndex === idx;
          const isDragOver = dragOverIndex === idx;

          return (
            <div
              key={section.key}
              draggable
              onDragStart={(e) => handleDragStart(e, idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              onDrop={(e) => handleDrop(e, idx)}
              className={`rounded-xl border transition-all select-none ${
                isDragging
                  ? "opacity-40 scale-[0.98] border-dashed border-brand-500"
                  : isDragOver
                  ? "border-brand-500 bg-brand-500/10 shadow-sm"
                  : isSelected
                  ? "border-brand-500 bg-brand-500/5 shadow-xs"
                  : "border-border bg-card hover:border-brand-500/30"
              }`}
            >
              <div className="p-3 flex items-center gap-2 sm:gap-3">
                {/* Drag Handle */}
                <div
                  className="cursor-grab active:cursor-grabbing text-text-muted hover:text-text-primary p-1 -ml-1 touch-none"
                  title="Drag untuk mengubah urutan"
                >
                  <GripVertical size={16} />
                </div>

                {/* Section Order Pill */}
                <span className="text-[10px] font-mono font-bold w-5 text-center text-text-muted shrink-0">
                  #{idx + 1}
                </span>

                {/* Section Icon & Meta */}
                <div
                  onClick={() => onSelectSection(section.key)}
                  className="flex items-center gap-2.5 flex-1 min-w-0 cursor-pointer"
                >
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                      section.visible
                        ? `bg-gradient-to-tr ${meta.accentColor} text-white shadow-xs`
                        : "bg-surface-muted text-text-muted"
                    }`}
                  >
                    <Icon size={15} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold truncate ${
                          isSelected
                            ? "text-brand-600 dark:text-brand-400"
                            : section.visible
                            ? "text-text-primary"
                            : "text-text-muted"
                        }`}
                      >
                        {section.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded font-medium ${
                          section.visible
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-slate-500/10 text-slate-500 dark:text-slate-400"
                        }`}
                      >
                        {section.visible ? "Tampil" : "Disembunyikan"}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-brand-500 hidden sm:inline">
                          &bull; Sedang diedit
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Accessible Action Controls */}
                <div className="flex items-center gap-1 shrink-0">
                  {/* Up / Down arrows */}
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMove(idx, "up")}
                    className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-20 hover:bg-surface-muted transition-colors"
                    title="Geser ke atas"
                  >
                    <ArrowUp size={14} />
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMove(idx, "down")}
                    className="p-1 rounded text-text-muted hover:text-text-primary disabled:opacity-20 hover:bg-surface-muted transition-colors"
                    title="Geser ke bawah"
                  >
                    <ArrowDown size={14} />
                  </button>

                  {/* Visibility Toggle */}
                  <button
                    type="button"
                    onClick={() => onToggleVisibility(section.key)}
                    className={`p-1.5 rounded-lg transition-colors ml-1 ${
                      section.visible
                        ? "text-brand-600 hover:bg-brand-500/10"
                        : "text-text-muted hover:bg-surface-muted"
                    }`}
                    title={section.visible ? "Sembunyikan section" : "Tampilkan section"}
                  >
                    {section.visible ? <Eye size={15} /> : <EyeOff size={15} />}
                  </button>

                  {/* Reset single section */}
                  <button
                    type="button"
                    onClick={() => onResetSection(section.key)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-amber-500 hover:bg-amber-500/10 transition-colors"
                    title="Kembalikan section ini ke default"
                  >
                    <RotateCcw size={13} />
                  </button>

                  {/* Chevron select indicator */}
                  <button
                    type="button"
                    onClick={() => onSelectSection(section.key)}
                    className={`p-1 rounded text-text-muted hover:text-text-primary ${
                      isSelected ? "text-brand-500" : ""
                    }`}
                  >
                    <ChevronRight size={15} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
