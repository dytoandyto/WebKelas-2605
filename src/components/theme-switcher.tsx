"use client";

import { useTheme } from "next-themes";
import { useEffect, useState, useRef } from "react";
import { Sun, Moon, Monitor, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface ThemeSwitcherProps {
  className?: string;
  variant?: "pill" | "icon" | "dropdown";
}

export function ThemeSwitcher({ className, variant = "pill" }: ThemeSwitcherProps) {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
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
    { key: "system", label: "System", icon: Monitor },
  ] as const;

  const currentTheme = themes.find((t) => t.key === theme) || themes[1];
  const CurrentIcon = currentTheme.icon;

  if (variant === "pill") {
    return (
      <div
        className={cn(
          "inline-flex items-center p-0.5 rounded-full bg-slate-900/60 light:bg-slate-200/80 border border-cyan-500/20 light:border-slate-300 backdrop-blur-md shadow-sm",
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
                "p-1.5 rounded-full transition-all duration-200 flex items-center justify-center text-xs",
                isActive
                  ? "bg-cyan-500 text-white shadow-[0_0_10px_rgba(6,182,212,0.5)] scale-105"
                  : "text-slate-400 hover:text-slate-200 light:text-slate-600 light:hover:text-slate-900 hover:bg-white/5"
              )}
            >
              <Icon size={13} />
            </button>
          );
        })}
      </div>
    );
  }

  // Dropdown variant for admin header or compact nav
  return (
    <div className="relative inline-block" ref={dropdownRef}>
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
          "bg-slate-900/70 border border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50",
          "light:bg-white light:border-slate-300 light:text-slate-700 light:hover:bg-slate-100",
          className
        )}
        aria-label="Toggle theme dropdown"
        aria-expanded={open}
      >
        <CurrentIcon size={15} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute right-0 mt-2 w-36 rounded-xl p-1 z-50 shadow-xl border animate-in fade-in slide-in-from-top-2 duration-150",
            "bg-[#0a182f]/95 border-cyan-500/30 backdrop-blur-xl text-slate-200",
            "light:bg-white/95 light:border-slate-200 light:text-slate-800"
          )}
        >
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
                  "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                  isSelected
                    ? "bg-cyan-500/20 text-cyan-300 light:bg-blue-50 light:text-blue-700 font-semibold"
                    : "text-slate-300 hover:bg-white/5 light:text-slate-600 light:hover:bg-slate-100"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={14} className={isSelected ? "text-cyan-400 light:text-blue-600" : "text-slate-400"} />
                  <span>{t.label}</span>
                </div>
                {isSelected && <Check size={13} className="text-cyan-400 light:text-blue-600" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
