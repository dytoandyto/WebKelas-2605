"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Monitor } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ThemeSwitcherProps {
  className?: string;
  variant?: "pill" | "icon" ;
}

export function ThemeSwitcher({
  className,
  variant = "pill",
}: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const dropdownRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [open]);

  if (!mounted) {
    return (
      <div
        className={cn(
          "w-8 h-8 rounded-full bg-slate-800/40 border border-slate-700/40 flex items-center justify-center opacity-70",
          className
        )}
      >
        <Moon size={14} className="text-slate-400" />
      </div>
    );
  }

  const themes = [
    { key: "light", label: "Light", icon: Sun },
    { key: "dark", label: "Dark", icon: Moon },
  ] as const;

  const currentTheme = themes.find((t) => t.key === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-2xs",
          className
        )}
        role="group"
        aria-label="Theme switcher"
      >
        {themes.map((t) => {
          const Icon = t.icon;
          const isActive = theme === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTheme(t.key)}
              title={`${t.label} theme`}
              aria-label={`${t.label} theme`}
              aria-pressed={isActive}
              className={cn(
                "p-1.5 rounded-md transition-all duration-150 flex items-center justify-center text-xs cursor-pointer",
                isActive
                  ? "bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold"
                  : "text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              )}
            >
              <Icon size={13} />
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-150 cursor-pointer",
          "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/60 shadow-2xs",
          className
        )}
        aria-label="Pilih tema"
        aria-expanded={open}
      >
        <CurrentIcon size={14} />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-32 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl py-1 z-50 text-xs animate-in fade-in-0 zoom-in-95 duration-150">
          {themes.map((t) => {
            const Icon = t.icon;
            const isSelected = theme === t.key;
            return (
              <button
                key={t.key}
                onClick={() => {
                  setTheme(t.key);
                  setOpen(false);
                }}
                className={cn(
                  "w-full px-3 py-1.5 flex items-center gap-2 text-left transition-colors cursor-pointer",
                  isSelected
                    ? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <Icon size={13} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
