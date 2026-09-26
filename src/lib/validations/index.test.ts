import { describe, it, expect } from "vitest";
import {
  loginSchema,
  scheduleSchema,
  subjectSchema,
  taskSchema,
  studentSchema,
} from "./index";
import { DayOfWeek, TaskPriority, TaskStatus } from "@prisma/client";

describe("Validation Schemas tests", () => {
  it("validates login inputs correctly", () => {
    expect(loginSchema.safeParse({ email: "invalid", password: "123" }).success).toBe(false);
    expect(loginSchema.safeParse({ email: "admin@classhub.edu", password: "password123" }).success).toBe(true);
  });

  it("validates schedule time constraints (startTime < endTime)", () => {
    const invalidSchedule = {
      subjectId: "sub1",
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "12:00",
      endTime: "10:00", // invalid!
      room: "Room 101",
    };
    expect(scheduleSchema.safeParse(invalidSchedule).success).toBe(false);

    const validSchedule = {
      subjectId: "sub1",
      dayOfWeek: DayOfWeek.MONDAY,
      startTime: "08:30",
      endTime: "10:30",
      room: "Room 101",
    };
    expect(scheduleSchema.safeParse(validSchedule).success).toBe(true);
  });

  it("validates subject code uppercase transformation", () => {
    const parsed = subjectSchema.safeParse({
      code: "cs101",
      name: "Intro to CS",
    });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.code).toBe("CS101");
    }
  });

  it("validates student required fields and URL checks", () => {
    expect(studentSchema.safeParse({ name: "A", major: "" }).success).toBe(false);
    expect(studentSchema.safeParse({
      name: "Jane Doe",
      major: "Computer Science",
      githubUrl: "not-a-url",
    }).success).toBe(false);

    expect(studentSchema.safeParse({
      name: "Jane Doe",
      major: "Computer Science",
      githubUrl: "https://github.com/janedoe",
    }).success).toBe(true);
  });

  it("validates task priority and deadline requirements", () => {
    expect(taskSchema.safeParse({
      subjectId: "sub1",
      title: "Homework 1",
      deadline: "2026-10-01T23:59:00Z",
      priority: TaskPriority.HIGH,
      status: TaskStatus.UPCOMING,
    }).success).toBe(true);
  });
});
