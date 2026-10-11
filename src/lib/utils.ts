import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(
  date: Date | string | null | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat(
    "en-US",
    options || {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(d);
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function isTaskFlexibleOrNoDeadline(task?: {
  notes?: string | null;
  title?: string;
  deadline?: Date | string;
} | null): boolean {
  if (!task) return false;
  const notesLower = (task.notes || "").toLowerCase();
  const titleLower = (task.title || "").toLowerCase();
  return (
    notesLower.includes("tanpa deadline") ||
    notesLower.includes("tanpa tenggat") ||
    notesLower.includes("[fleksibel]") ||
    notesLower.includes("fleksibel") ||
    titleLower.includes("tanpa deadline") ||
    titleLower.includes("tanpa tenggat")
  );
}

export function getRelativeDeadline(
  deadlineDate: Date | string,
  options?: { isNoDeadline?: boolean }
): {
  text: string;
  isOverdue: boolean;
  isDueSoon: boolean;
  daysRemaining: number;
} {
  if (options?.isNoDeadline) {
    return {
      text: "Fleksibel (Tanpa Tenggat)",
      isOverdue: false,
      isDueSoon: false,
      daysRemaining: 999,
    };
  }

  const deadline = typeof deadlineDate === "string" ? new Date(deadlineDate) : deadlineDate;
  const now = new Date();
  const diffMs = deadline.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));

  if (diffMs < 0) {
    const overdueDays = Math.abs(diffDays);
    return {
      text: overdueDays <= 1 ? "Overdue (Yesterday)" : `Overdue (${overdueDays} days ago)`,
      isOverdue: true,
      isDueSoon: false,
      daysRemaining: diffDays,
    };
  }

  if (diffHours <= 24) {
    return {
      text: "Due Today",
      isOverdue: false,
      isDueSoon: true,
      daysRemaining: 0,
    };
  }

  if (diffDays === 1) {
    return {
      text: "Due Tomorrow",
      isOverdue: false,
      isDueSoon: true,
      daysRemaining: 1,
    };
  }

  if (diffDays <= 3) {
    return {
      text: `${diffDays} days left`,
      isOverdue: false,
      isDueSoon: true,
      daysRemaining: diffDays,
    };
  }

  return {
    text: `${diffDays} days left`,
    isOverdue: false,
    isDueSoon: false,
    daysRemaining: diffDays,
  };
}

/**
 * Ensures an external URL starts with http:// or https://.
 * If user inputs a domain or path like "desakpradnyani.vercel.app",
 * it auto-prepends "https://" so the browser navigates externally instead of as a relative route.
 */
export function formatExternalUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  if (/^(https?:\/\/|mailto:|tel:)/i.test(trimmed)) {
    return trimmed;
  }
  const clean = trimmed.replace(/^\/+/, "");
  return `https://${clean}`;
}

/**
 * Normalizes an Instagram username, handle, or URL to a full valid https:// URL.
 */
export function formatInstagramUrl(handleOrUrl?: string | null): string {
  if (!handleOrUrl) return "";
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  if (clean.includes("instagram.com")) {
    return `https://${clean.replace(/^https?:\/\//, "")}`;
  }
  return `https://instagram.com/${clean}`;
}

/**
 * Normalizes a GitHub username, handle, or URL to a full valid https:// URL.
 */
export function formatGithubUrl(handleOrUrl?: string | null): string {
  if (!handleOrUrl) return "";
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  if (clean.includes("github.com")) {
    return `https://${clean.replace(/^https?:\/\//, "")}`;
  }
  return `https://github.com/${clean}`;
}

/**
 * Normalizes a LinkedIn handle, profile slug, or URL to a full valid https:// URL.
 */
export function formatLinkedinUrl(handleOrUrl?: string | null): string {
  if (!handleOrUrl) return "";
  const trimmed = handleOrUrl.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const clean = trimmed.replace(/^@/, "").replace(/^\/+/, "");
  if (clean.includes("linkedin.com")) {
    return `https://${clean.replace(/^https?:\/\//, "")}`;
  }
  return `https://linkedin.com/in/${clean}`;
}

/**
 * Extracts a Google Drive file ID from various URL patterns.
 * Supports:
 * - drive.google.com/open?id=FILE_ID
 * - drive.google.com/file/d/FILE_ID/view (or /preview, /edit)
 * - drive.google.com/uc?export=view&id=FILE_ID
 * - drive.google.com/thumbnail?id=FILE_ID
 * - docs.google.com/file/d/FILE_ID/...
 * - lh3.googleusercontent.com/d/FILE_ID
 */
export function extractGoogleDriveFileId(url?: string | null): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;

  const isGoogleDomain = /(drive\.google\.com|docs\.google\.com|googleusercontent\.com)/i.test(trimmed);
  if (!isGoogleDomain) return null;

  // 1. /file/d/{id}
  const fileDMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (fileDMatch?.[1]) return fileDMatch[1];

  // 2. /d/{id} (e.g. lh3.googleusercontent.com/d/FILE_ID or drive.google.com/d/FILE_ID)
  const dMatch = trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (dMatch?.[1]) return dMatch[1];

  // 3. Query param id={id}
  const idQueryMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (idQueryMatch?.[1]) return idQueryMatch[1];

  return null;
}

/**
 * Checks whether a URL is a recognized Google Drive URL.
 */
export function isGoogleDriveUrl(url?: string | null): boolean {
  return !!extractGoogleDriveFileId(url);
}

/**
 * Centralized utility to format and normalize student photo URLs.
 * If the URL is from Google Drive, it extracts the file ID and converts
 * it to Google's direct image CDN endpoint:
 * https://lh3.googleusercontent.com/d/{fileId}
 * 
 * Data URLs, relative paths, and non-Google external URLs (e.g. Unsplash, S3, Cloudinary)
 * are preserved safely without unwanted alterations.
 */
export function formatPhotoUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";

  // Preserve data URLs (base64) and relative paths
  if (trimmed.startsWith("data:") || trimmed.startsWith("blob:") || trimmed.startsWith("/")) {
    return trimmed;
  }

  // Check if it's a Google Drive URL
  const driveFileId = extractGoogleDriveFileId(trimmed);
  if (driveFileId) {
    return `https://lh3.googleusercontent.com/d/${driveFileId}`;
  }

  // Other external URLs: preserve as-is if already valid protocol
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Auto-prepend https:// only if it looks like a valid hostname (e.g. "example.com/photo.jpg")
  if (/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/.test(trimmed)) {
    return `https://${trimmed.replace(/^\/+/, "")}`;
  }

  return "";
}

/**
 * Converts any Google Drive URL into the standard browser viewer URL:
 * https://drive.google.com/file/d/{fileId}/view
 * If the URL is not Google Drive, returns formatExternalUrl(url).
 */
export function getGoogleDriveViewUrl(url?: string | null): string {
  if (!url) return "";
  const trimmed = url.trim();
  if (!trimmed) return "";
  const driveId = extractGoogleDriveFileId(trimmed);
  if (driveId) {
    return `https://drive.google.com/file/d/${driveId}/view`;
  }
  return formatExternalUrl(trimmed);
}

