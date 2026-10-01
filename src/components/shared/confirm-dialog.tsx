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
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative w-full max-w-md rounded-2xl p-6 bg-white dark:bg-[#081326] border border-slate-200 dark:border-cyan-500/30 text-slate-900 dark:text-slate-100 shadow-xl shadow-slate-900/10 dark:shadow-2xl z-10 space-y-4 animate-in fade-in zoom-in-95 duration-150"
      >
        <button
          onClick={onClose}
          aria-label="Tutup dialog"
          className="absolute right-4 top-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-white dark:hover:bg-slate-800 cursor-pointer"
        >
          <X size={16} />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${variantStyles.iconBg}`}>
            <AlertTriangle size={20} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-slate-900 dark:text-white">
              {title}
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={`px-4 py-2 text-xs font-semibold rounded-xl transition-all cursor-pointer ${variantStyles.btn}`}
          >
            {isLoading ? "Memproses..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
