"use client";

import React, { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./modal";
import { cn } from "@/lib/utils";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  message?: string;
  itemTitle?: string;
  isDeleting?: boolean;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Hapus Data",
  description,
  message,
  itemTitle,
  isDeleting: externalIsDeleting,
}: DeleteDialogProps) {
  const [internalPending, startTransition] = useTransition();
  const isPending = externalIsDeleting ?? internalPending;
  const displayText =
    message ||
    description ||
    "Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.";

  async function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2 text-slate-800 dark:text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-4 shadow-xs">
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-2 leading-relaxed">
          {displayText}
        </p>
        {itemTitle && (
          <p className="text-xs font-mono font-semibold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg py-2 px-3 mb-6 w-full truncate">
            &ldquo;{itemTitle}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg text-sm font-medium bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shadow-2xs"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-2 rounded-lg text-sm font-medium text-white bg-rose-600 hover:bg-rose-700 shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isPending ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              <span>Delete</span>
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
