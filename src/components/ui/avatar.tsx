"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  status?: "online" | "offline" | "busy" | "away";
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  status,
  className,
  ...props
}: AvatarProps) {
  const [imageError, setImageError] = React.useState(false);

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl font-bold",
  }[size];

  const statusClasses = {
    online: "bg-emerald-400",
    offline: "bg-slate-400",
    busy: "bg-red-400",
    away: "bg-amber-400",
  };

  const getInitials = (text?: string) => {
    if (!text) return "??";
    const parts = text.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return text.substring(0, 2).toUpperCase();
  };

  return (
    <div
      className={cn(
        "relative rounded-full shrink-0 flex items-center justify-center font-semibold select-none overflow-hidden",
        "bg-gradient-to-tr from-blue-600/30 to-cyan-500/30 border border-cyan-400/30 text-cyan-200",
        "light:bg-blue-50 light:border-blue-200 light:text-blue-700",
        sizeClasses,
        className
      )}
      {...props}
    >
      {src && !imageError ? (
        <Image
          src={src}
          alt={alt || name || "Avatar"}
          fill
          sizes="80px"
          className="object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--surface-primary)] light:border-white",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3",
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}
