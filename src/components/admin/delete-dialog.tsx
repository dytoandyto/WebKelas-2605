"use client";

import React, { useTransition } from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Modal } from "./modal";

interface DeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  itemTitle?: string;
}

export function DeleteDialog({
  isOpen,
  onClose,
  onConfirm,
  title = "Delete Item",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemTitle,
}: DeleteDialogProps) {
  const [isPending, startTransition] = useTransition();

  async function handleConfirm() {
    startTransition(async () => {
      await onConfirm();
      onClose();
    });
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} maxWidth="sm">
      <div className="flex flex-col items-center text-center py-2 text-slate-200">
        <div className="w-12 h-12 rounded-2xl bg-rose-950/60 border border-rose-500/30 text-rose-400 flex items-center justify-center mb-4 shadow-sm">
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-slate-300 mb-2">{description}</p>
        {itemTitle && (
          <p className="text-xs font-mono font-bold text-white bg-[#061021] border border-cyan-500/20 rounded-xl py-2 px-3 mb-6 w-full truncate">
            &ldquo;{itemTitle}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-[#061021] border border-cyan-500/25 text-slate-300 hover:text-white hover:border-cyan-400 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-600 to-red-600 hover:brightness-110 shadow-md transition-all flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Deleting...</span>
              </>
            ) : (
              "Confirm Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
