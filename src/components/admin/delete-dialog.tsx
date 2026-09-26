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
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4">
          <AlertTriangle size={24} />
        </div>
        <p className="text-sm text-slate-600 mb-2">{description}</p>
        {itemTitle && (
          <p className="text-xs font-semibold text-slate-900 bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 mb-6 w-full truncate">
            &ldquo;{itemTitle}&rdquo;
          </p>
        )}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="btn btn-secondary flex-1 text-sm py-2.5"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isPending}
            className="btn btn-danger flex-1 text-sm py-2.5 flex items-center justify-center gap-2"
          >
            {isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Deleting...
              </>
            ) : (
              "Delete"
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
}
