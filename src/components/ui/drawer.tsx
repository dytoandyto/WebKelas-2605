"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DrawerContextValue {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const DrawerContext = React.createContext<DrawerContextValue | null>(null);

export interface DrawerProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

export function Drawer({
  open: controlledOpen,
  onOpenChange,
  children,
}: DrawerProps) {
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
    <DrawerContext.Provider
      value={{ open: isOpen, onOpenChange: handleOpenChange }}
    >
      {children}
    </DrawerContext.Provider>
  );
}

export function DrawerTrigger({
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
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("DrawerTrigger must be used within Drawer");

  const handleClick = () => {
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

export function DrawerContent({
  children,
  className,
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg" | "xl" | "full";
}) {
  const ctx = React.useContext(DrawerContext);
  if (!ctx) throw new Error("DrawerContent must be used within Drawer");

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

  const sizeClasses = {
    sm: "sm:max-w-md",
    md: "sm:max-w-xl",
    lg: "sm:max-w-2xl",
    xl: "sm:max-w-3xl",
    full: "sm:max-w-4xl",
  }[size];

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in-0 duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/20 dark:bg-black/75 backdrop-blur-xs transition-opacity"
        onClick={() => ctx.onOpenChange(false)}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 flex max-w-full pl-0 sm:pl-10">
        {/* Right drawer on desktop, full-screen on mobile */}
        <div
          role="dialog"
          aria-modal="true"
          className={cn(
            "w-screen bg-white dark:bg-[var(--surface-primary)] border-l border-slate-200 dark:border-cyan-500/25 text-slate-900 dark:text-white shadow-2xl flex flex-col h-full",
            "animate-in slide-in-from-right duration-300 ease-out",
            sizeClasses,
            className
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function DrawerHeader({
  className,
  children,
  onClose,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { onClose?: () => void }) {
  const ctx = React.useContext(DrawerContext);
  return (
    <div
      className={cn(
        "flex items-center justify-between p-4 sm:p-6 border-b border-slate-100 dark:border-[var(--border-color)] bg-slate-50/70 dark:bg-[#060e1d] shrink-0",
        className
      )}
      {...props}
    >
      <div className="space-y-1">{children}</div>
      <button
        type="button"
        onClick={() => {
          onClose?.();
          ctx?.onOpenChange(false);
        }}
        className="rounded-xl p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 dark:text-[var(--text-muted)] dark:hover:text-[var(--text-primary)] dark:hover:bg-cyan-500/10 transition-colors ml-4 shrink-0 cursor-pointer"
        aria-label="Close drawer"
      >
        <X className="w-5 h-5" />
      </button>
    </div>
  );
}

export function DrawerTitle({
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

export function DrawerDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-xs sm:text-sm text-[var(--text-secondary)]", className)}
      {...props}
    />
  );
}

export function DrawerBody({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex-1 overflow-y-auto p-4 sm:p-6", className)}
      {...props}
    />
  );
}

export function DrawerFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "p-4 sm:p-6 border-t border-slate-100 dark:border-[var(--border-color)] bg-slate-50/80 dark:bg-[var(--surface-primary)] shrink-0 flex items-center justify-end gap-3",
        className
      )}
      {...props}
    />
  );
}
