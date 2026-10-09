"use client";

import * as React from "react";
import {
  Download,
  Calendar,
  User,
  ExternalLink,
  ChevronRight,
  FileText,
} from "lucide-react";
import { MaterialData, getMaterialIcon, getMaterialTypeBadge } from "./material-card";
import { formatDate, cn } from "@/lib/utils";

export interface MaterialRowProps {
  material: MaterialData;
  onClick: () => void;
  showSubject?: boolean;
  className?: string;
}

export function MaterialRow({
  material,
  onClick,
  showSubject = true,
  className,
}: MaterialRowProps) {
  const downloadUrl = material.fileUrl || material.externalUrl;

  return (
    <div
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick();
        }
      }}
      className={cn(
        "group flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl",
        "bg-[var(--surface-card)] hover:bg-[var(--primary)]/5 border border-[var(--border-color)] hover:border-cyan-400/40 light:hover:border-blue-400/50",
        "transition-all duration-150 cursor-pointer text-left shadow-[var(--shadow-xs)]",
        className
      )}
    >
      {/* Left: Icon, Title, and Metadata */}
      <div className="flex items-start sm:items-center gap-3.5 min-w-0 flex-1">
        <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 light:bg-blue-50 light:border-blue-200 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0 transition-transform group-hover:scale-105">
          {getMaterialIcon(material.type)}
        </div>

        <div className="space-y-1 min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-bold text-[var(--text-primary)] group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors line-clamp-1">
              {material.title}
            </h4>
            {getMaterialTypeBadge(material.type)}
            {material.fileSize && (
              <span className="font-mono text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-slate-800/60 light:bg-slate-100 border border-[var(--border-color)]">
                {material.fileSize}
              </span>
            )}
          </div>

          {material.description && (
            <p className="text-xs text-[var(--text-secondary)] line-clamp-1 leading-relaxed">
              {material.description}
            </p>
          )}

          {/* Sub-meta details */}
          <div className="flex items-center gap-3 text-[11px] font-mono text-[var(--text-muted)] flex-wrap pt-0.5">
            {showSubject && material.subject && (
              <span className="inline-flex items-center gap-1 font-semibold text-cyan-400/90 light:text-blue-700">
                <span>{material.subject.code}</span>
                <span className="hidden md:inline">&bull; {material.subject.name}</span>
              </span>
            )}

            {material.section?.title && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-700 font-bold">
                {material.section.title}
              </span>
            )}

            <span className="inline-flex items-center gap-1">
              <Calendar className="w-3 h-3 text-[var(--text-muted)]" />
              <span>{formatDate(material.createdAt)}</span>
            </span>

            {material.uploader?.name && (
              <span className="hidden sm:inline-flex items-center gap-1">
                <User className="w-3 h-3 text-[var(--text-muted)]" />
                <span className="truncate max-w-[120px]">{material.uploader.name}</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border-color)]/60">
        {downloadUrl ? (
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-600 border border-cyan-500/20 light:border-blue-200 hover:bg-cyan-500/20 light:hover:bg-blue-100 transition-colors cursor-pointer"
            title="Unduh / Buka Dokumen"
          >
            <Download size={13} />
            <span>Buka / Unduh</span>
          </a>
        ) : (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-primary)] border border-[var(--border-color)] transition-colors"
          >
            <span>Detail</span>
            <ChevronRight size={13} />
          </button>
        )}
      </div>
    </div>
  );
}
