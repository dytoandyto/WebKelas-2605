"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  label?: React.ReactNode;
  description?: string;
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  (
    {
      className,
      checked = false,
      onCheckedChange,
      label,
      description,
      disabled,
      id,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;

    return (
      <div className="flex items-start gap-2.5 select-none">
        <div className="relative flex items-center justify-center shrink-0 mt-0.5">
          <input
            id={inputId}
            type="checkbox"
            ref={ref}
            checked={checked}
            disabled={disabled}
            onChange={(e) => onCheckedChange?.(e.target.checked)}
            className="sr-only"
            {...props}
          />
          <label
            htmlFor={inputId}
            className={cn(
              "w-5 h-5 rounded-md border flex items-center justify-center transition-all duration-150 cursor-pointer",
              checked
                ? "bg-gradient-to-tr from-blue-600 to-cyan-500 border-cyan-400 text-white shadow-[0_0_10px_rgba(6,182,212,0.4)]"
                : "bg-[var(--surface-primary)] border-[var(--border-color)] hover:border-cyan-400/50 light:bg-white light:border-slate-300",
              disabled && "opacity-50 cursor-not-allowed pointer-events-none",
              className
            )}
          >
            {checked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
          </label>
        </div>
        {(label || description) && (
          <div className="flex flex-col">
            {label && (
              <label
                htmlFor={inputId}
                className={cn(
                  "text-sm font-medium text-[var(--text-primary)] cursor-pointer",
                  disabled && "opacity-50 cursor-not-allowed"
                )}
              >
                {label}
              </label>
            )}
            {description && (
              <p className="text-xs text-[var(--text-muted)]">{description}</p>
            )}
          </div>
        )}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";
