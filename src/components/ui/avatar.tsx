"use client";

import * as React from "react";
import { cn, formatPhotoUrl, extractGoogleDriveFileId } from "@/lib/utils";

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  shape?: "circle" | "rounded";
  status?: "online" | "offline" | "busy" | "away";
  unoptimized?: boolean;
}

export function Avatar({
  src,
  alt,
  name,
  size = "md",
  shape = "circle",
  status,
  className,
  ...props
}: AvatarProps) {
  const initialSrc = React.useMemo(() => formatPhotoUrl(src), [src]);
  const [currentSrc, setCurrentSrc] = React.useState<string>(initialSrc);
  const [useFallbackProxy, setUseFallbackProxy] = React.useState(false);
  const [imageError, setImageError] = React.useState(false);

  // Synchronize source when prop changes
  React.useEffect(() => {
    setImageError(false);
    setUseFallbackProxy(false);
    setCurrentSrc(formatPhotoUrl(src));
  }, [src]);

  const handleError = () => {
    // If direct Google CDN failed, try local server-side API proxy
    const driveId = extractGoogleDriveFileId(src);
    if (driveId && !useFallbackProxy) {
      setUseFallbackProxy(true);
      setCurrentSrc(`/api/avatar?id=${driveId}`);
      return;
    }

    if (process.env.NODE_ENV !== "production") {
      console.warn(
        `[Avatar] Foto profil gagal dimuat (${name || alt || "Avatar"}):`,
        src
      );
    }
    setImageError(true);
  };

  const sizeClasses = {
    xs: "w-6 h-6 text-[10px]",
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-base",
    xl: "w-20 h-20 text-xl font-bold",
    "2xl": "w-24 h-24 text-2xl font-extrabold font-display",
  }[size];

  const shapeClasses = {
    circle: "rounded-full",
    rounded: "rounded-2xl",
  }[shape];

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
        "relative shrink-0 flex items-center justify-center font-semibold select-none overflow-hidden",
        "bg-blue-50 border border-blue-200 text-blue-700 dark:bg-blue-950/50 dark:border-blue-800/60 dark:text-blue-300",
        shapeClasses,
        sizeClasses,
        className
      )}
      {...props}
    >
      {currentSrc && !imageError ? (
        <img
          src={currentSrc}
          alt={alt || name || "Avatar"}
          className="w-full h-full object-cover select-none pointer-events-none"
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          onError={handleError}
        />
      ) : (
        <span>{getInitials(name || alt)}</span>
      )}

      {status && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full border-2 border-[var(--surface-primary)]",
            size === "xs" || size === "sm" ? "w-2 h-2" : "w-3 h-3",
            statusClasses[status]
          )}
        />
      )}
    </div>
  );
}
