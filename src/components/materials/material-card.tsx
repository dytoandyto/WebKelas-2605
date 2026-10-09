"use client";

import * as React from "react";
import {
  FileText,
  Video,
  FileSpreadsheet,
  FileCode,
  Download,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  Layers,
  File,
  ArrowRight,
} from "lucide-react";
import { MaterialType } from "@prisma/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, cn } from "@/lib/utils";

export interface MaterialAttachment {
  id: string;
  name: string;
  url: string;
  size?: string;
  type?: string;
}

export function parseAttachments(attachmentsStr?: string | null): MaterialAttachment[] {
  if (!attachmentsStr) return [];
  try {
    const parsed = JSON.parse(attachmentsStr);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export interface MaterialData {
  id: string;
  title: string;
  description?: string | null;
  type: MaterialType | string;
  fileUrl?: string | null;
  externalUrl?: string | null;
  fileName?: string | null;
  fileSize?: string | null;
  tags?: string | null;
  attachments?: string | null;
  createdAt: string | Date;
  subject?: {
    id: string;
    code: string;
    name: string;
    englishName?: string | null;
    lecturerName?: string | null;
  } | null;
  sectionId?: string | null;
  section?: {
    id: string;
    title: string;
    description?: string | null;
    sortOrder?: number;
  } | null;
  uploader?: {
    id: string;
    name: string;
  } | null;
}

export interface MaterialCardProps {
  material: MaterialData;
  onClick?: () => void;
  className?: string;
}

export function getMaterialIcon(type: MaterialType | string) {
  switch (type) {
    case MaterialType.PDF:
    case "PDF":
      return <FileText className="w-5 h-5 text-rose-400 light:text-rose-600" />;
    case MaterialType.PPT:
    case "PPT":
    case "SLIDE":
      return <FileSpreadsheet className="w-5 h-5 text-amber-400 light:text-amber-600" />;
    case MaterialType.DOC:
    case "DOC":
    case "DOCUMENT":
      return <FileText className="w-5 h-5 text-blue-400 light:text-blue-600" />;
    case MaterialType.XLS:
    case "XLS":
      return <FileSpreadsheet className="w-5 h-5 text-emerald-400 light:text-emerald-600" />;
    case MaterialType.VIDEO:
    case "VIDEO":
      return <Video className="w-5 h-5 text-purple-400 light:text-purple-600" />;
    default:
      return <BookOpen className="w-5 h-5 text-cyan-400 light:text-blue-600" />;
  }
}

export function getMaterialTypeBadge(type: MaterialType | string) {
  let color = "bg-slate-500/10 text-slate-300 border-slate-500/20";
  if (type === "PDF") color = "bg-rose-500/10 text-rose-300 light:bg-rose-50 light:text-rose-700 border-rose-500/30";
  if (type === "PPT" || type === "SLIDE")
    color = "bg-amber-500/10 text-amber-300 light:bg-amber-50 light:text-amber-700 border-amber-500/30";
  if (type === "DOC" || type === "DOCUMENT")
    color = "bg-blue-500/10 text-blue-300 light:bg-blue-50 light:text-blue-700 border-blue-500/30";
  if (type === "XLS")
    color = "bg-emerald-500/10 text-emerald-300 light:bg-emerald-50 light:text-emerald-700 border-emerald-500/30";
  if (type === "VIDEO")
    color = "bg-purple-500/10 text-purple-300 light:bg-purple-50 light:text-purple-700 border-purple-500/30";

  return (
    <span
      className={cn(
        "font-mono text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider",
        color
      )}
    >
      {type}
    </span>
  );
}

export function MaterialCard({ material, onClick, className }: MaterialCardProps) {
  const downloadUrl = material.fileUrl || material.externalUrl;
  const attachments = parseAttachments(material.attachments);

  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onClick}
      className={cn(
        "flex flex-col justify-between text-left h-full transition-all duration-200",
        "hover:-translate-y-0.5 hover:shadow-md hover:border-cyan-400/50 light:hover:border-blue-400/60",
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
      aria-label={`Materi ${material.title}`}
    >
      <div className="space-y-3">
        {/* Header: Icon & Metadata Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0 light:bg-blue-50 light:border-blue-200">
            {getMaterialIcon(material.type)}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {getMaterialTypeBadge(material.type)}
            {material.fileSize && (
              <span className="font-mono text-[10px] text-[var(--text-muted)] px-1.5 py-0.5 rounded bg-slate-800/60 light:bg-slate-100">
                {material.fileSize}
              </span>
            )}
            {material.section?.title && (
              <span className="font-mono text-[10px] font-bold text-cyan-400 light:text-blue-700 bg-cyan-500/10 light:bg-blue-50 px-2 py-0.5 rounded border border-cyan-400/20 light:border-blue-200">
                {material.section.title}
              </span>
            )}
          </div>
        </div>

        {/* Title & Subject */}
        <div>
          <h4 className="text-sm sm:text-base font-bold text-[var(--text-primary)] tracking-tight line-clamp-2 group-hover:text-cyan-400 light:group-hover:text-blue-600 transition-colors leading-snug">
            {material.title}
          </h4>
          {material.subject?.name && (
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {material.subject.code} &bull; {material.subject.name}
            </p>
          )}
        </div>

        {/* Description */}
        {material.description && (
          <p className="text-xs text-[var(--text-secondary)] line-clamp-2 leading-relaxed">
            {material.description}
          </p>
        )}
      </div>

      {/* Footer: Date, Uploader & Action */}
      <div className="pt-3 mt-4 border-t border-[var(--border-color)]/70 flex items-center justify-between text-xs text-[var(--text-muted)]">
        <div className="space-y-0.5 min-w-0">
          <div className="flex items-center gap-1 text-[11px] font-mono">
            <Calendar className="w-3.5 h-3.5 shrink-0 text-cyan-400 light:text-blue-600" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
          {material.uploader?.name && (
            <div className="flex items-center gap-1 text-[11px] truncate">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{material.uploader.name}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2">
          {downloadUrl ? (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-cyan-500/10 light:bg-blue-50 text-cyan-400 light:text-blue-600 border border-cyan-500/20 light:border-blue-200 hover:bg-cyan-500/20 light:hover:bg-blue-100 transition-colors"
              title="Unduh / Buka Materi"
            >
              <Download size={13} />
              <span>Buka</span>
            </a>
          ) : (
            <span className="text-xs font-semibold text-cyan-400 light:text-blue-600 flex items-center gap-1">
              <span>Detail</span>
              <ArrowRight size={13} />
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
