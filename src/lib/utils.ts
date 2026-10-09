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
