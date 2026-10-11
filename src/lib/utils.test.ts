import { describe, it, expect } from "vitest";
import { getRelativeDeadline, formatDate, cn } from "./utils";

describe("Utils tests", () => {
  it("merges class names correctly", () => {
    expect(cn("px-2 py-1", "bg-blue-500", { "text-white": true })).toBe("px-2 py-1 bg-blue-500 text-white");
    expect(cn("p-4", "p-2")).toBe("p-2");
  });

  it("formats date strings and objects", () => {
    const d = new Date("2026-10-15T00:00:00Z");
    expect(formatDate(d)).toContain("2026");
    expect(formatDate(null)).toBe("");
  });

  it("calculates relative deadlines correctly", () => {
    const now = new Date();

    // 2 days in the future
    const future = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000);
    const futureResult = getRelativeDeadline(future);
    expect(futureResult.isOverdue).toBe(false);
    expect(futureResult.isDueSoon).toBe(true);

    // 5 days in the future
    const later = new Date(now.getTime() + 5 * 24 * 60 * 60 * 1000);
    const laterResult = getRelativeDeadline(later);
    expect(laterResult.isOverdue).toBe(false);
    expect(laterResult.isDueSoon).toBe(false);

    // 2 days in the past
    const past = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);
    const pastResult = getRelativeDeadline(past);
    expect(pastResult.isOverdue).toBe(true);
    expect(pastResult.text).toContain("Overdue");

    // Flexible / No Deadline
    const flexibleResult = getRelativeDeadline(past, { isNoDeadline: true });
    expect(flexibleResult.isOverdue).toBe(false);
    expect(flexibleResult.text).toBe("Fleksibel (Tanpa Tenggat)");
  });

  it("identifies tasks with flexible or no deadline correctly", async () => {
    const { isTaskFlexibleOrNoDeadline } = await import("./utils");
    expect(isTaskFlexibleOrNoDeadline({ title: "Tugas [Tanpa Deadline] Praktek" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ notes: "Tugas mandiri tanpa tenggat waktu" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ notes: "Tugas fleksibel" })).toBe(true);
    expect(isTaskFlexibleOrNoDeadline({ title: "Tugas Biasa", notes: "Kumpul di LMS" })).toBe(false);
  });

  it("normalizes external URLs and prevents relative navigation bugs", async () => {
    const {
      formatExternalUrl,
      formatInstagramUrl,
      formatGithubUrl,
      formatLinkedinUrl,
    } = await import("./utils");

    // Portfolio URL checks (specifically the user's issue: desakpradnyani.vercel.app)
    expect(formatExternalUrl("desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("https://desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("http://desakpradnyani.vercel.app")).toBe("http://desakpradnyani.vercel.app");
    expect(formatExternalUrl("/desakpradnyani.vercel.app")).toBe("https://desakpradnyani.vercel.app");
    expect(formatExternalUrl("")).toBe("");
    expect(formatExternalUrl(null)).toBe("");
    expect(formatExternalUrl(undefined)).toBe("");

    // Instagram URL checks
    expect(formatInstagramUrl("desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("@desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("https://instagram.com/desakpradnyani")).toBe("https://instagram.com/desakpradnyani");
    expect(formatInstagramUrl("")).toBe("");

    // GitHub URL checks
    expect(formatGithubUrl("desakpradnyani")).toBe("https://github.com/desakpradnyani");
    expect(formatGithubUrl("@desakpradnyani")).toBe("https://github.com/desakpradnyani");
    expect(formatGithubUrl("https://github.com/desakpradnyani")).toBe("https://github.com/desakpradnyani");

    // LinkedIn URL checks
    expect(formatLinkedinUrl("desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
    expect(formatLinkedinUrl("@desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
    expect(formatLinkedinUrl("https://linkedin.com/in/desakpradnyani")).toBe("https://linkedin.com/in/desakpradnyani");
  });
});
