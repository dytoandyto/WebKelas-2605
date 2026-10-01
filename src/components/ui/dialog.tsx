"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DialogContext = React.createContext<DialogContextValue | null>(null);

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Dialog({
  open: controlledOpen,
  onOpenChange,
  children,
}: DialogProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : uncontrolledOpen;

  const handleOpenChange = React.useCallback(
    (open: boolean) => {
      if (!isControlled) {
        setUncontrolledOpen(open);
      }
      onOpenChange?.(open);
    },
    [isControlled, onOpenChange]
  );

  return (
    <DialogContext.Provider
      value={{ open: isOpen, onOpenChange: handleOpenChange }}
    >
      {children}
    </DialogContext.Provider>
  );
}

export function DialogTrigger({
  asChild,
  children,
  className,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("DialogTrigger must be used within Dialog");

  const handleClick = (e: React.MouseEvent) => {
    ctx.onOpenChange(true);
  };

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      {...props}
    >
      {children}
    </button>
  );
}

export function DialogContent({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DialogContext);
  if (!ctx) throw new Error("DialogContent must be used within Dialog");

  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && ctx.open) {
        ctx.onOpenChange(false);
      }
    };
    if (ctx.open) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ctx.open, ctx]);

  if (!ctx.open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => ctx.onOpenChange(false)}
        aria-hidden="true"
      />

      {/* Dialog Window */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative z-50 w-full max-w-lg rounded-2xl p-6 shadow-2xl transition-all",
          "bg-white dark:bg-[#081326] border border-slate-200 dark:border-cyan-500/25 text-slate-900 dark:text-slate-100",
          "shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_64px_rgba(0,0,0,0.85),0_0_24px_rgba(6,182,212,0.2)]",
          "animate-in zoom-in-95 duration-200 focus:outline-none max-h-[90vh] overflow-y-auto",
          className
        )}
      >
        <button
          type="button"
          onClick={() => ctx.onOpenChange(false)}
          className="absolute right-4 top-4 rounded-xl p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)] dark:hover:bg-cyan-500/10 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>
        {children}
      </div>
    </div>
  );
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 pb-4 text-left", className)}
      {...props}
    />
  );
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        "text-lg sm:text-xl font-bold text-slate-900 dark:text-[var(--text-primary)] tracking-tight",
        className
      )}
      {...props}
    />
  );
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-slate-500 dark:text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 pt-4 mt-4 border-t border-slate-100 dark:border-[var(--border-color)]",
        className
      )}
      {...props}
    />
  );
}

export function DialogClose({
  children,
  className,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  [key: string]: any;
}) {
  const ctx = React.useContext(DialogContext);
  return (
    <button
      type="button"
      onClick={() => ctx?.onOpenChange(false)}
      className={className}
      {...props}
    >
      {children || "Tutup"}
    </button>
  );
}
