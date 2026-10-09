import { describe, it, expect, vi } from "vitest";
import {
  computeDynamicTaskStatus,
  getTasksData,
  sanitizePublicStudent,
  getStudentsData,
  getStudentById,
  getGlobalSearchData,
} from "./index";
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
    student: {
      findMany: vi.fn().mockImplementation((args) => {
        const mockList = [
          {
            id: "stu-1",
            name: "Budi Pratama",
            studentNumber: "1202223001",
            major: "S1 Sistem Informasi",
            photoUrl: "/images/students/budi.jpg",
            achievements: [],
          },
        ];
        if (args?.select?.major && !args?.select?.name) {
          return Promise.resolve([{ major: "S1 Sistem Informasi" }]);
        }
        if (args?.select) {
          return Promise.resolve(
            mockList.map((s) => {
              const item: Record<string, unknown> = {};
              for (const k of Object.keys(args.select)) {
                if (args.select[k]) item[k] = (s as Record<string, unknown>)[k];
              }
              return item;
            })
          );
        }
        return Promise.resolve(mockList);
      }),
      findUnique: vi.fn().mockImplementation(({ where }) => {
        return Promise.resolve({
          id: where.id,
          name: "Budi Pratama",
          studentNumber: "1202223001",
          major: "S1 Sistem Informasi",
          achievements: [],
        });
      }),
      count: vi.fn().mockResolvedValue(1),
    },
    achievement: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    material: {
      findMany: vi.fn().mockResolvedValue([]),
    },
    dailyNote: {
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

describe("Student Security & NIM Protection tests", () => {
  it("sanitizePublicStudent strips studentNumber completely", () => {
    const student = {
      id: "stu-100",
      name: "Siti Rahma",
      studentNumber: "1202223055",
      major: "S1 Sistem Informasi",
    };

    const sanitized = sanitizePublicStudent(student);
    expect(sanitized).toHaveProperty("id", "stu-100");
    expect(sanitized).toHaveProperty("name", "Siti Rahma");
    expect(sanitized).toHaveProperty("major", "S1 Sistem Informasi");
    expect(sanitized).not.toHaveProperty("studentNumber");
    expect((sanitized as { studentNumber?: string }).studentNumber).toBeUndefined();
  });

  it("getStudentsData omits studentNumber by default for public consumption", async () => {
    const { students } = await getStudentsData();
    expect(students.length).toBeGreaterThan(0);
    for (const s of students) {
      expect(s).not.toHaveProperty("studentNumber");
    }
  });

  it("getStudentsData preserves studentNumber when includePrivate: true is requested by admin", async () => {
    const { students } = await getStudentsData(undefined, { includePrivate: true });
    expect(students.length).toBeGreaterThan(0);
    expect(students[0]).toHaveProperty("studentNumber", "1202223001");
  });

  it("getStudentById omits studentNumber by default", async () => {
    const student = await getStudentById("stu-1");
    expect(student).not.toBeNull();
    expect(student).not.toHaveProperty("studentNumber");
  });

  it("getStudentById preserves studentNumber when includePrivate: true is requested by admin", async () => {
    const student = await getStudentById("stu-1", { includePrivate: true });
    expect(student).not.toBeNull();
    expect(student).toHaveProperty("studentNumber", "1202223001");
  });

  it("getGlobalSearchData omits studentNumber from search results", async () => {
    const result = await getGlobalSearchData("Budi");
    expect(result.students.length).toBeGreaterThan(0);
    for (const s of result.students) {
      expect(s).not.toHaveProperty("studentNumber");
    }
  });
});
