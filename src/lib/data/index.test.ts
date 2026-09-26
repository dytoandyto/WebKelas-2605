import { describe, it, expect } from "vitest";
import { computeDynamicTaskStatus } from "./index";
import { TaskStatus } from "@prisma/client";

describe("Dynamic Task Status tests", () => {
  it("preserves COMPLETED status even if deadline has passed", () => {
    const past = new Date(Date.now() - 1000000);
    expect(computeDynamicTaskStatus({ deadline: past, status: TaskStatus.COMPLETED })).toBe(TaskStatus.COMPLETED);
  });

  it("marks past deadline as OVERDUE if not completed", () => {
    const past = new Date(Date.now() - 5000);
    expect(computeDynamicTaskStatus({ deadline: past, status: TaskStatus.UPCOMING })).toBe(TaskStatus.OVERDUE);
  });

  it("marks deadline within 3 days as DUE_SOON", () => {
    const inTwoDays = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000);
    expect(computeDynamicTaskStatus({ deadline: inTwoDays, status: TaskStatus.UPCOMING })).toBe(TaskStatus.DUE_SOON);
  });

  it("leaves deadline > 3 days as UPCOMING", () => {
    const inTenDays = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
    expect(computeDynamicTaskStatus({ deadline: inTenDays, status: TaskStatus.UPCOMING })).toBe(TaskStatus.UPCOMING);
  });
});
