"use client";

import * as React from "react";
import { Download, ExternalLink, Calendar, BookOpen, Layers } from "lucide-react";
import { MaterialData, getMaterialIcon, getMaterialTypeBadge, parseAttachments } from "./material-card";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate, cn } from "@/lib/utils";

export interface MaterialListProps {
  materials: MaterialData[];
  onMaterialClick?: (material: MaterialData) => void;
  className?: string;
}

export function MaterialList({
  materials,
  onMaterialClick,
  className,
}: MaterialListProps) {
  if (materials.length === 0) {
    return (
      <EmptyState
        icon={<BookOpen className="w-6 h-6 text-cyan-400" />}
        title="Tidak Ada Materi Pembelajaran"
        description="Belum ada slide kuliah, modul PDF, atau referensi belajar yang diunggah."
        className={className}
      />
    );
  }

  return (
    <div className={cn("space-y-2.5", className)}>
      {materials.map((m) => {
        const downloadUrl = m.fileUrl || m.externalUrl;
        const attachments = parseAttachments(m.attachments);
        return (
          <Card
            key={m.id}
            variant="interactive"
            padding="sm"
            onClick={() => onMaterialClick?.(m)}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left p-3.5 sm:p-4"
          >
            <div className="flex items-center gap-3.5 min-w-0 flex-1">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0 light:bg-blue-50 light:border-blue-200">
                {getMaterialIcon(m.type)}
              </div>
              <div className="min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {m.subject?.code && (
                    <span className="font-mono text-xs font-bold text-cyan-400 light:text-blue-600">
                      {m.subject.code}
                    </span>
                  )}
                  {getMaterialTypeBadge(m.type)}
                  {attachments.length > 0 && (
                    <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 light:bg-purple-50 px-2 py-0.5 rounded-full border border-purple-400/20 light:border-purple-200 flex items-center gap-1">
                      <Layers className="w-3 h-3" />
                      <span>{attachments.length} Berkas</span>
                    </span>
                  )}
                  {m.fileSize && (
                    <span className="text-[11px] text-[var(--text-muted)] font-mono">
                      {m.fileSize}
                    </span>
                  )}
                </div>
                <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] truncate">
                  {m.title}
                </h4>
              </div>
            </div>

            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]">
              <span className="text-xs text-[var(--text-muted)]">
                {formatDate(m.createdAt)}
              </span>
              {downloadUrl && (
                <a
                  href={downloadUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8 px-3 rounded-lg"
                    rightIcon={<Download className="w-3.5 h-3.5" />}
                  >
                    Unduh
                  </Button>
                </a>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
