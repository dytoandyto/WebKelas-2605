"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

export function Dropdown({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <DropdownContext.Provider value={{ open, setOpen }}>
      <div ref={containerRef} className="relative inline-block text-left">
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({
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
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownTrigger must be used within Dropdown");

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    ctx.setOpen((prev) => !prev);
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

export function DropdownMenu({
  align = "right",
  children,
  className,
}: {
  align?: "left" | "right";
  children: React.ReactNode;
  className?: string;
}) {
  const ctx = React.useContext(DropdownContext);
  if (!ctx) throw new Error("DropdownMenu must be used within Dropdown");

  if (!ctx.open) return null;

  return (
    <div
      className={cn(
        "absolute z-50 mt-1.5 min-w-[180px] rounded-xl border bg-[var(--surface-primary)] p-1.5 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl border-cyan-500/25 animate-in fade-in-0 zoom-in-95 duration-150",
        "light:bg-white light:border-slate-200 light:shadow-[0_10px_25px_rgba(18,32,44,0.12)]",
        align === "right" ? "right-0" : "left-0",
        className
      )}
    >
      {children}
    </div>
  );
}

export function DropdownItem({
  children,
  className,
  onClick,
  disabled = false,
  danger = false,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  danger?: boolean;
}) {
  const ctx = React.useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return;
    onClick?.(e);
    ctx?.setOpen(false);
  };

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "w-full flex items-center gap-2.5 px-3 py-2 text-xs sm:text-sm font-medium rounded-lg text-left transition-colors cursor-pointer select-none",
        danger
          ? "text-red-400 hover:bg-red-500/15 light:text-red-600 light:hover:bg-red-50"
          : "text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-cyan-500/10 light:text-slate-700 light:hover:text-slate-900 light:hover:bg-slate-100",
        disabled && "opacity-50 cursor-not-allowed pointer-events-none",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "my-1.5 h-px bg-[var(--border-color)] light:bg-slate-200",
        className
      )}
    />
  );
}
