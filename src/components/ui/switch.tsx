"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  id?: string;
  className?: string;
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  (
    {
      checked = false,
      onCheckedChange,
      disabled = false,
      label,
      id,
      className,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const switchId = id || generatedId;

    return (
      <div className="flex items-center gap-3 select-none">
        <button
          type="button"
          role="switch"
          id={switchId}
          ref={ref}
          aria-checked={checked}
          disabled={disabled}
          onClick={() => onCheckedChange?.(!checked)}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 focus-visible:ring-offset-2",
            checked
              ? "bg-gradient-to-r from-blue-600 to-cyan-500 shadow-[0_0_12px_rgba(6,182,212,0.35)]"
              : "bg-slate-700/60 light:bg-slate-300",
            disabled && "cursor-not-allowed opacity-50",
            className
          )}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out",
              checked ? "translate-x-5" : "translate-x-0"
            )}
          />
        </button>
        {label && (
          <label
            htmlFor={switchId}
            className={cn(
              "text-sm font-medium text-[var(--text-primary)] cursor-pointer",
              disabled && "opacity-50 cursor-not-allowed"
            )}
          >
            {label}
          </label>
        )}
      </div>
    );
  }
);
Switch.displayName = "Switch";
