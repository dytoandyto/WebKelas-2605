"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ComboboxOption {
  value: string;
  label: string;
  subLabel?: string;
}

export interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  className?: string;
  disabled?: boolean;
}

export function Combobox({
  options,
  value,
  onChange,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  emptyText = "No results found.",
  className,
  disabled = false,
}: ComboboxProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const containerRef = React.useRef<HTMLDivElement>(null);
  const searchInputRef = React.useRef<HTMLInputElement>(null);

  // Close on outside click
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      // Auto-focus search input on open
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    } else {
      setSearchQuery("");
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  // Selected Option
  const selectedOption = React.useMemo(
    () => options.find((opt) => opt.value === value),
    [options, value]
  );

  // Filtered Options
  const filteredOptions = React.useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return options;
    return options.filter(
      (opt) =>
        opt.label.toLowerCase().includes(q) ||
        (opt.subLabel && opt.subLabel.toLowerCase().includes(q))
    );
  }, [options, searchQuery]);

  const handleSelect = (val: string) => {
    onChange(val);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className={cn("relative w-full", className)}>
      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-xl border px-3.5 py-2 text-sm text-left transition-all duration-200 cursor-pointer shadow-xs",
          "bg-white dark:bg-[var(--surface-primary)] border-slate-300 dark:border-[var(--border-color)]",
          "hover:border-blue-400 dark:hover:border-cyan-400/40",
          open
            ? "border-blue-500 ring-2 ring-blue-500/20 dark:border-cyan-400 dark:ring-cyan-400/20"
            : "",
          disabled && "cursor-not-allowed opacity-50 bg-slate-100 dark:bg-slate-900/50",
          !selectedOption ? "text-slate-400 dark:text-[var(--text-muted)]" : "text-slate-900 dark:text-[var(--text-primary)]"
        )}
      >
        <span className="truncate">
          {selectedOption ? (
            <span className="flex items-center gap-1.5 truncate">
              {selectedOption.subLabel && (
                <span className="font-mono text-xs font-semibold text-blue-600 dark:text-cyan-400">
                  [{selectedOption.subLabel}]
                </span>
              )}
              <span>{selectedOption.label}</span>
            </span>
          ) : (
            placeholder
          )}
        </span>
        <ChevronDown
          size={16}
          className={cn(
            "text-slate-400 dark:text-[var(--text-muted)] transition-transform duration-200 shrink-0 ml-2",
            open && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Popover */}
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 rounded-xl border border-slate-200/90 dark:border-cyan-500/30 bg-white dark:bg-[#081326] shadow-xl dark:shadow-[0_12px_32px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in-0 zoom-in-95 duration-150">
          {/* Search Box */}
          <div className="p-2 border-b border-slate-100 dark:border-cyan-500/15">
            <div className="relative">
              <Search
                size={14}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-[var(--text-muted)] pointer-events-none"
              />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-8 pr-7 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-cyan-500/20 bg-slate-50 dark:bg-slate-900/50 text-slate-900 dark:text-[var(--text-primary)] placeholder:text-slate-400 focus:outline-none focus:border-blue-500 dark:focus:border-cyan-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white p-0.5"
                >
                  <X size={12} />
                </button>
              )}
            </div>
          </div>

          {/* Options List */}
          <div className="max-h-60 overflow-y-auto p-1 text-sm">
            {filteredOptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 dark:text-[var(--text-muted)]">
                {emptyText}
              </div>
            ) : (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => handleSelect(opt.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-lg text-left text-xs transition-colors cursor-pointer",
                      isSelected
                        ? "bg-blue-50 dark:bg-cyan-500/15 text-blue-700 dark:text-cyan-300 font-semibold"
                        : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5 hover:text-slate-900 dark:hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-2 truncate">
                      {opt.subLabel && (
                        <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-cyan-400 shrink-0">
                          {opt.subLabel}
                        </span>
                      )}
                      <span className="truncate">{opt.label}</span>
                    </div>
                    {isSelected && (
                      <Check
                        size={14}
                        className="text-blue-600 dark:text-cyan-400 shrink-0 ml-2"
                      />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
