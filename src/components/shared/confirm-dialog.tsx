import React from "react";
import { AlertTriangle, X } from "lucide-react";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "primary" | "warning";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: {
      btn: "bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20",
      iconBg: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    },
    primary: {
      btn: "bg-[var(--primary)] hover:opacity-90 text-white",
      iconBg: "bg-[var(--primary)]/10 text-[var(--primary)] border-[var(--primary)]/20",
    },
    warning: {
      btn: "bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20",
      iconBg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    },
  }[variant];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md card p-6 bg-[var(--bg-surface)] border-[var(--border-color)] shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-muted)]"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${variantStyles.iconBg}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-[var(--text-primary)]">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[var(--border-color)]/50">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="btn btn-secondary px-4 py-2 text-xs"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`btn px-4 py-2 text-xs font-semibold rounded-full transition-all ${variantStyles.btn}`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
