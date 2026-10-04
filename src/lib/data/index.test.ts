import { describe, it, expect, vi } from "vitest";
import { computeDynamicTaskStatus, getTasksData } from "./index";
import { TaskStatus } from "@prisma/client";

vi.mock("@/lib/db", () => ({
  default: {
    task: {
      findMany: vi.fn().mockResolvedValue([]),
      count: vi.fn().mockResolvedValue(0),
    },
    subject: {
      findMany: vi.fn().mockResolvedValue([]),
    },
  },
}));

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

describe("getTasksData scope filtering", () => {
  it("defaults to upcoming scope and returns counts", async () => {
    const result = await getTasksData();
    expect(result).toHaveProperty("tasks");
    expect(result).toHaveProperty("upcomingCount");
    expect(result).toHaveProperty("historyCount");
    expect(typeof result.upcomingCount).toBe("number");
    expect(typeof result.historyCount).toBe("number");
  });

  it("handles history scope query", async () => {
    const result = await getTasksData({ scope: "history" });
    expect(result).toHaveProperty("tasks");
    expect(Array.isArray(result.tasks)).toBe(true);
  });
});
