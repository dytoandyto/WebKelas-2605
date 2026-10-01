"use client";

import * as React from "react";
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react";
import { cn } from "@/lib/utils";

export type ToastType = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  type?: ToastType;
  duration?: number;
}

// Global dispatcher that works without react context
export function showToast(props: Omit<ToastItem, "id">) {
  if (typeof window !== "undefined") {
    const event = new CustomEvent("app-toast", {
      detail: { ...props, id: Math.random().toString(36).substring(2, 9) },
    });
    window.dispatchEvent(event);
  }
}

export function ToastProvider({ children }: { children?: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<ToastItem[]>([]);

  React.useEffect(() => {
    const handleToast = (e: CustomEvent<ToastItem>) => {
      const newToast = e.detail;
      setToasts((prev) => [...prev, newToast]);

      const duration = newToast.duration || 4000;
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== newToast.id));
      }, duration);
    };

    window.addEventListener("app-toast" as any, handleToast);
    return () => window.removeEventListener("app-toast" as any, handleToast);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  const getIcon = (type: ToastType = "info") => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0" />;
      case "info":
      default:
        return <Info className="w-5 h-5 text-cyan-400 shrink-0" />;
    }
  };

  return (
    <>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none px-4 sm:px-0"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            role="status"
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border bg-[var(--surface-primary)] shadow-[0_12px_36px_rgba(0,0,0,0.6)] backdrop-blur-xl transition-all duration-300 animate-in slide-in-from-bottom-5",
              "light:bg-white light:shadow-lg light:border-slate-200",
              toast.type === "success" && "border-emerald-500/40",
              toast.type === "error" && "border-red-500/40",
              toast.type === "warning" && "border-amber-500/40",
              toast.type === "info" && "border-cyan-500/40"
            )}
          >
            {getIcon(toast.type)}
            <div className="flex-1 min-w-0">
              <h5 className="text-sm font-semibold text-[var(--text-primary)]">
                {toast.title}
              </h5>
              {toast.description && (
                <p className="mt-0.5 text-xs text-[var(--text-secondary)] leading-relaxed">
                  {toast.description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              className="text-[var(--text-muted)] hover:text-[var(--text-primary)] p-0.5 rounded transition-colors"
              aria-label="Tutup notifikasi"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

export function useToast() {
  return {
    toast: showToast,
    success: (title: string, description?: string) =>
      showToast({ title, description, type: "success" }),
    error: (title: string, description?: string) =>
      showToast({ title, description, type: "error" }),
    warning: (title: string, description?: string) =>
      showToast({ title, description, type: "warning" }),
    info: (title: string, description?: string) =>
      showToast({ title, description, type: "info" }),
  };
}
