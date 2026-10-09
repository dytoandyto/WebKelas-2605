"use client";

import React from "react";
import { Send, AlertCircle, X, Loader2 } from "lucide-react";

interface PublishDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isPublishing: boolean;
  activeSectionsCount: number;
  totalSectionsCount: number;
}

export function PublishDialog({
  isOpen,
  onClose,
  onConfirm,
  isPublishing,
  activeSectionsCount,
  totalSectionsCount,
}: PublishDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="card max-w-md w-full p-6 border border-border bg-card shadow-xl space-y-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Send size={16} />
            </div>
            <h3 className="text-base font-bold text-text-primary">Publikasikan ke Homepage</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-muted"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-3 text-xs text-text-secondary leading-relaxed">
          <p>
            Konfigurasi draft saat ini akan diterapkan langsung ke <strong>homepage publik</strong> (
            <code className="px-1.5 py-0.5 rounded bg-surface-muted font-mono text-[11px] text-text-primary">/</code>).
          </p>

          <div className="p-3 rounded-xl bg-surface-muted/50 border border-border space-y-1.5">
            <div className="flex justify-between">
              <span className="text-text-muted">Section Aktif:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">
                {activeSectionsCount} dari {totalSectionsCount} section
              </strong>
            </div>
            <div className="flex justify-between">
              <span className="text-text-muted">Dampak Publik:</span>
              <span className="text-text-primary font-medium">Pengunjung langsung melihat urutan & konten baru</span>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 text-[11px]">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <span>
              Data akademik seperti tugas, nilai, jadwal, dan mahasiswa tetap utuh dan aman di database.
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isPublishing}
            className="btn btn-secondary btn-sm text-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isPublishing}
            className="btn btn-primary btn-sm flex items-center gap-1.5 text-xs bg-emerald-600 hover:bg-emerald-700 text-white"
          >
            {isPublishing ? (
              <>
                <Loader2 className="animate-spin" size={13} />
                <span>Mempublikasikan...</span>
              </>
            ) : (
              <>
                <Send size={13} />
                <span>Ya, Publikasikan Sekarang</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
