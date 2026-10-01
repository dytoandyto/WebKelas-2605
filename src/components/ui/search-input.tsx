"use client";

import * as React from "react";
import { Search, X, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange"> {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  isLoading?: boolean;
  showShortcut?: boolean;
  containerClassName?: string;
}

export function SearchInput({
  value,
  onChange,
  onClear,
  isLoading = false,
  showShortcut = true,
  placeholder = "Search...",
  className,
  containerClassName,
  ...props
}: SearchInputProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        inputRef.current?.focus();
        inputRef.current?.select();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleClear = () => {
    onChange("");
    onClear?.();
    inputRef.current?.focus();
  };

  return (
    <div className={cn("relative w-full", containerClassName)}>
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] pointer-events-none transition-colors"
      />
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "w-full h-10 pl-9 pr-14 rounded-xl text-xs sm:text-sm transition-all duration-200 shadow-xs",
          "bg-white dark:bg-[var(--surface-primary)] text-slate-900 dark:text-[var(--text-primary)] placeholder:text-slate-400 dark:placeholder:text-[var(--text-muted)]",
          "border border-slate-300 dark:border-[var(--border-color)]",
          "hover:border-blue-400 dark:hover:border-cyan-400/40",
          "focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:focus:border-cyan-400 dark:focus:ring-cyan-400/20",
          className
        )}
        {...props}
      />
      <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1">
        {isLoading ? (
          <Loader2 size={14} className="animate-spin text-blue-500 dark:text-cyan-400 mr-1" />
        ) : value ? (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors cursor-pointer"
            title="Clear search"
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        ) : showShortcut ? (
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[10px] font-mono text-slate-400 dark:text-slate-500 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 select-none">
            <span className="text-xs">⌘</span>K
          </kbd>
        ) : null}
      </div>
    </div>
  );
}
