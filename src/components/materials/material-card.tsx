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

export function getMaterialIcon(type: string) {
  switch (type) {
    case "PDF":
      return <FileText className="w-5 h-5 text-rose-400" />;
    case "VIDEO":
      return <Video className="w-5 h-5 text-purple-400" />;
    case "SLIDE":
      return <FileSpreadsheet className="w-5 h-5 text-amber-400" />;
    case "DOCUMENT":
      return <FileText className="w-5 h-5 text-blue-400" />;
    case "CODE":
    case "ZIP":
      return <FileCode className="w-5 h-5 text-cyan-400" />;
    default:
      return <BookOpen className="w-5 h-5 text-cyan-400" />;
  }
}

export function getMaterialTypeBadge(type: string) {
  switch (type) {
    case "PDF":
      return <Badge variant="red">PDF</Badge>;
    case "VIDEO":
      return <Badge variant="purple">Video</Badge>;
    case "SLIDE":
      return <Badge variant="yellow">Slide</Badge>;
    case "DOCUMENT":
      return <Badge variant="blue">Dokumen</Badge>;
    case "CODE":
      return <Badge variant="cyan">Kode</Badge>;
    default:
      return <Badge variant="default">{type}</Badge>;
  }
}

export function MaterialCard({
  material,
  onClick,
  className,
}: MaterialCardProps) {
  const downloadUrl = material.fileUrl || material.externalUrl;
  const attachments = parseAttachments(material.attachments);

  return (
    <Card
      variant="interactive"
      padding="md"
      onClick={onClick}
      className={cn("flex flex-col justify-between text-left", className)}
    >
      <div className="space-y-3">
        {/* Header: Type icon & Badges */}
        <div className="flex items-start justify-between gap-2">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0 light:bg-blue-50 light:border-blue-200">
            {getMaterialIcon(material.type)}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {getMaterialTypeBadge(material.type)}
            {attachments.length > 0 && (
              <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 light:bg-purple-50 px-2 py-0.5 rounded-full border border-purple-400/20 light:border-purple-200 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{attachments.length} Berkas</span>
              </span>
            )}
            {material.subject?.code && (
              <span className="font-mono text-xs font-bold text-cyan-400 light:text-blue-600 bg-cyan-500/10 light:bg-blue-50 px-2 py-0.5 rounded-full border border-cyan-400/20 light:border-blue-200">
                {material.subject.code}
              </span>
            )}
          </div>
        </div>

        {/* Title & Subject */}
        <div>
          <h4 className="text-base font-bold text-[var(--text-primary)] tracking-tight line-clamp-2 hover:text-cyan-400 light:hover:text-blue-600 transition-colors">
            {material.title}
          </h4>
          {material.subject?.name && (
            <p className="text-xs text-[var(--text-muted)] mt-1 truncate">
              {material.subject.name}
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
          <div className="flex items-center gap-1 text-[11px]">
            <Calendar className="w-3.5 h-3.5 shrink-0" />
            <span>{formatDate(material.createdAt)}</span>
          </div>
          {material.uploader?.name && (
            <div className="flex items-center gap-1 text-[11px] truncate">
              <User className="w-3 h-3 shrink-0" />
              <span className="truncate">{material.uploader.name}</span>
            </div>
          )}
        </div>

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
              className="text-xs h-8 px-2.5 rounded-lg"
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Unduh
            </Button>
          </a>
        )}
      </div>
    </Card>
  );
}
