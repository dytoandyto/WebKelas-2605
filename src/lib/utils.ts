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

