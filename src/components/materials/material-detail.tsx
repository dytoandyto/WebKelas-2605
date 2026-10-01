"use client";

import * as React from "react";
import {
  Download,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  Tag,
  Layers,
  FileText,
  FileSpreadsheet,
  FileCode,
  File,
} from "lucide-react";
import {
  MaterialData,
  MaterialAttachment,
  getMaterialIcon,
  getMaterialTypeBadge,
  parseAttachments,
} from "./material-card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";

export interface MaterialDetailProps {
  material: MaterialData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function getAttachmentIcon(type?: string, name?: string) {
  const ext = (name?.split(".").pop() || type || "").toLowerCase();
  if (["pdf"].includes(ext)) {
    return <FileText className="w-4 h-4 text-rose-400" />;
  }
  if (["doc", "docx"].includes(ext)) {
    return <FileText className="w-4 h-4 text-blue-400" />;
  }
  if (["ppt", "pptx", "slide"].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-amber-400" />;
  }
  if (["xls", "xlsx", "csv"].includes(ext)) {
    return <FileSpreadsheet className="w-4 h-4 text-emerald-400" />;
  }
  if (["zip", "rar", "7z", "tar"].includes(ext)) {
    return <FileCode className="w-4 h-4 text-cyan-400" />;
  }
  return <File className="w-4 h-4 text-slate-400" />;
}

export function MaterialDetail({
  material,
  open,
  onOpenChange,
}: MaterialDetailProps) {
  if (!material) return null;
  const downloadUrl = material.fileUrl || material.externalUrl;
  const attachments = parseAttachments(material.attachments);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {getMaterialTypeBadge(material.type)}
            {attachments.length > 0 && (
              <span className="font-mono text-xs font-semibold text-purple-600 dark:text-purple-400 bg-purple-500/10 light:bg-purple-50 px-2 py-0.5 rounded-full border border-purple-400/20 light:border-purple-200 flex items-center gap-1">
                <Layers className="w-3 h-3" />
                <span>{attachments.length} Dokumen</span>
              </span>
            )}
            {material.subject?.code && (
              <span className="font-mono text-xs font-bold text-cyan-400 light:text-blue-600 bg-cyan-500/10 light:bg-blue-50 px-2 py-0.5 rounded-full border border-cyan-400/20 light:border-blue-200">
                {material.subject.code}
              </span>
            )}
            {material.fileSize && (
              <span className="text-xs text-[var(--text-muted)] font-mono">
                {material.fileSize}
              </span>
            )}
          </div>
          <DialogTitle>{material.title}</DialogTitle>
          {material.subject?.name && (
            <DialogDescription>
              Mata Kuliah: {material.subject.name}
            </DialogDescription>
          )}
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-xs text-[var(--text-secondary)]">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Diunggah: {formatDate(material.createdAt)}</span>
            </div>
            {material.uploader?.name && (
              <div className="flex items-center gap-2 truncate">
                <User className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="truncate">Oleh: {material.uploader.name}</span>
              </div>
            )}
          </div>

          {/* Description */}
          {material.description && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono">
                Deskripsi Materi
              </h5>
              <div className="p-4 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] text-sm text-[var(--text-primary)] leading-relaxed whitespace-pre-wrap">
                {material.description}
              </div>
            </div>
          )}

          {/* Document Attachments List */}
          {attachments.length > 0 && (
            <div className="space-y-2">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  Berkas Dokumen Perkuliahan ({attachments.length})
                </span>
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {attachments.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex items-center justify-between p-3 rounded-xl border border-[var(--border-color)] bg-[var(--surface-primary)] hover:border-cyan-400/40 transition-colors gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center shrink-0 light:bg-blue-50 light:border-blue-200">
                        {getAttachmentIcon(doc.type, doc.name)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-[var(--text-primary)] truncate" title={doc.name}>
                          {doc.name}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {doc.type && (
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-[var(--text-muted)] font-bold">
                              {doc.type}
                            </span>
                          )}
                          {doc.size && (
                            <span className="text-[11px] text-[var(--text-muted)] font-mono">
                              {doc.size}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-cyan-500/10 text-cyan-300 light:bg-blue-50 light:text-blue-600 hover:bg-cyan-500/20 text-xs font-semibold shrink-0 transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Unduh</span>
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tags */}
          {material.tags && (
            <div className="space-y-1.5">
              <h5 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] font-mono flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Tags
              </h5>
              <div className="flex items-center gap-1.5 flex-wrap">
                {material.tags.split(",").map((tag, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-0.5 rounded-full text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-400/20 light:bg-blue-50 light:text-blue-700 light:border-blue-200"
                  >
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          {downloadUrl && attachments.length === 0 && (
            <a
              href={downloadUrl}
              target="_blank"
              rel="noreferrer"
              className="w-full sm:w-auto"
            >
              <Button
                variant="primary"
                size="sm"
                className="w-full"
                rightIcon={<Download className="w-4 h-4" />}
              >
                Unduh Berkas Utama
              </Button>
            </a>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
