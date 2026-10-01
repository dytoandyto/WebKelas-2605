"use client";

import React, { useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
}

const maxWidthClasses = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-[600px]",
  xl: "max-w-2xl",
  "2xl": "max-w-4xl",
};

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  maxWidth = "lg",
}: ModalProps) {
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop: Soft overlay in light mode, deeper in dark mode */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/80 backdrop-blur-[2px] transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Container */}
      <div className="flex min-h-full items-center justify-center p-3 sm:p-4 text-center">
        <div
          className={cn(
            "relative transform overflow-hidden rounded-2xl text-left shadow-2xl transition-all sm:my-8 w-full",
            maxWidthClasses[maxWidth],
            "animate-in zoom-in-95 duration-200 ease-out",
            "bg-white dark:bg-[#0c1427] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-start justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-5 bg-white dark:bg-[#0c1427]">
            <div className="pr-4">
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-xs sm:text-[13px] text-slate-500 dark:text-slate-400 leading-relaxed">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors -mr-1 cursor-pointer shrink-0"
              aria-label="Close modal"
            >
              <X size={18} />
            </button>
          </div>

          {/* Body */}
          <div className="px-6 py-5 max-h-[calc(85vh-140px)] overflow-y-auto bg-white dark:bg-[#0c1427] text-slate-900 dark:text-slate-100">
            {children}
          </div>

          {/* Optional Footer */}
          {footer && (
            <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#090f1d]">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
