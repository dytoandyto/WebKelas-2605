"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  position?: "top" | "bottom" | "left" | "right";
  className?: string;
}

export function Tooltip({
  content,
  children,
  position = "top",
  className,
}: TooltipProps) {
  const [visible, setVisible] = React.useState(false);

  const positionClasses = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  }[position];

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      {visible && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-2.5 py-1 text-xs font-medium rounded-lg whitespace-nowrap pointer-events-none transition-all duration-150 animate-in fade-in-0 zoom-in-95",
            "bg-[#0a1d35] text-cyan-200 border border-cyan-500/30 shadow-[0_4px_16px_rgba(0,0,0,0.5)]",
            "light:bg-slate-900 light:text-white light:border-slate-800 light:shadow-md",
            positionClasses,
            className
          )}
        >
          {content}
        </div>
      )}
    </div>
  );
}
