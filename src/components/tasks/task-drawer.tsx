"use client";

import * as React from "react";
import {
  Clock,
  Calendar,
  BookOpen,
  Paperclip,
  ExternalLink,
  Copy,
  Trash2,
  Edit,
  FileText,
  Link2,
  AlertCircle,
} from "lucide-react";
import { TaskCardData } from "./task-card";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
  DrawerFooter,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { DeadlineBadge } from "@/components/ui/badge";
import { formatDateTime, getRelativeDeadline } from "@/lib/utils";

export interface TaskDrawerProps {
  task: TaskCardData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onStatusChange?: (taskId: string, newStatus: any) => void;
  onEdit?: (task: TaskCardData) => void;
  onDuplicate?: (task: TaskCardData) => void;
  onDelete?: (task: TaskCardData) => void;
  isAdmin?: boolean;
}

export function TaskDrawer({
  task,
  open,
  onOpenChange,
  onEdit,
  onDuplicate,
  onDelete,
  isAdmin = false,
}: TaskDrawerProps) {
  if (!task) return null;

  const deadlineInfo = getRelativeDeadline(task.deadline);
  const lmsUrl = task.submissionUrl || task.lmsUrl;
  const resourceUrl = task.referenceUrl || task.attachmentUrl;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent size="lg">
        {/* Header */}
        <DrawerHeader onClose={() => onOpenChange(false)}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-cyan-500/25">
              {task.subject?.code || "TUGAS AKADEMIK"}
            </span>
            <DeadlineBadge deadline={task.deadline} />
          </div>
          <DrawerTitle className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {task.title}
          </DrawerTitle>
        </DrawerHeader>

        {/* Body Content */}
        <DrawerBody className="space-y-6">
          {/* Subject & Timing Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-4 rounded-xl border border-slate-200 dark:border-cyan-500/20 bg-slate-50/70 dark:bg-[var(--surface-card)]">
            <div className="space-y-1">
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <BookOpen className="w-3.5 h-3.5" /> Mata Kuliah
              </span>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">
                {task.subject ? `${task.subject.code} - ${task.subject.name}` : "Tugas Umum / Non-MK"}
              </p>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-[var(--text-muted)] flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5" /> Tenggat Waktu (Deadline)
              </span>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-slate-900 dark:text-white">
                  {formatDateTime(task.deadline)}
                </span>
              </div>
            </div>
          </div>

          {/* Overdue Alert Banner */}
          {deadlineInfo.isOverdue && task.status !== "COMPLETED" && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/60 text-xs flex items-start gap-2.5">
              <AlertCircle size={16} className="text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="font-bold text-rose-700 dark:text-rose-300">
                  Batas Waktu Pengumpulan Telah Berakhir (Sudah Lewat)
                </div>
                <p className="text-rose-600 dark:text-rose-400 leading-relaxed">
                  Tenggat waktu untuk tugas ini telah berakhir ({deadlineInfo.text}). Tautan pengumpulan pada portal LMS Telkom mungkin sudah ditutup. Hubungi dosen pengampu atau pengurus kelas jika Anda memerlukan perpanjangan tenggat.
                </p>
              </div>
            </div>
          )}

          {/* Primary Action Banner: Open LMS */}
          {lmsUrl && (
            <div className="p-4 rounded-xl border border-blue-200 dark:border-cyan-500/30 bg-blue-50/60 dark:bg-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold uppercase tracking-wider text-blue-700 dark:text-cyan-300">
                  Tautan Pengumpulan LMS
                </h5>
                <p className="text-xs text-slate-600 dark:text-slate-300">
                  Buka halaman penugasan langsung di portal Telkom University LMS atau platform kursus.
                </p>
              </div>
              <a
                href={lmsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 dark:bg-cyan-500 dark:hover:bg-cyan-400 text-white dark:text-slate-950 transition-colors shrink-0 shadow-xs"
              >
                <span>Open LMS</span>
                <ExternalLink size={14} />
              </a>
            </div>
          )}

          {/* Description & Requirements */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5" />
              <span>Instruksi & Deskripsi Penugasan</span>
            </h4>
            <div className="p-4 rounded-xl border border-slate-200 dark:border-[var(--border-color)] bg-white dark:bg-[var(--surface-primary)] text-sm text-slate-800 dark:text-slate-200 leading-relaxed whitespace-pre-wrap">
              {task.description || (
                <span className="text-[var(--text-muted)] italic">
                  Tidak ada deskripsi atau instruksi khusus untuk tugas ini.
                </span>
              )}
            </div>
          </div>

          {/* Resources & Links */}
          {resourceUrl && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                <Link2 className="w-3.5 h-3.5" />
                <span>Materi Pendukung & Referensi</span>
              </h4>
              <div className="space-y-2">
                <a
                  href={resourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-[var(--border-color)] bg-slate-50 hover:bg-slate-100 dark:bg-[var(--surface-card)] dark:hover:bg-white/5 transition-colors text-xs text-blue-600 dark:text-cyan-300"
                >
                  <span className="flex items-center gap-2 font-medium">
                    <Paperclip className="w-4 h-4 text-slate-400" />
                    <span className="truncate max-w-md">{resourceUrl}</span>
                  </span>
                  <ExternalLink className="w-3.5 h-3.5 shrink-0 opacity-70" />
                </a>
              </div>
            </div>
          )}
        </DrawerBody>

        {/* Footer Actions */}
        <DrawerFooter>
          {lmsUrl && (
            <a
              href={lmsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 dark:bg-cyan-500 dark:text-slate-950 transition-colors cursor-pointer"
            >
              <span>Open LMS</span>
              <ExternalLink size={13} />
            </a>
          )}

          {onDuplicate && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onDuplicate(task)}
              leftIcon={<Copy className="w-4 h-4" />}
            >
              Duplikat
            </Button>
          )}

          {isAdmin && onEdit && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEdit(task)}
              leftIcon={<Edit className="w-4 h-4" />}
            >
              Edit
            </Button>
          )}

          {isAdmin && onDelete && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onDelete(task)}
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Hapus
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Tutup
          </Button>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
