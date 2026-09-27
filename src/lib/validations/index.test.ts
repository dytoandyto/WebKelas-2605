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

  it("validates taskType INDIVIDUAL, GROUP, and ADDITIONAL", () => {
    // INDIVIDUAL
    const indTask = taskSchema.safeParse({
      subjectId: "sub1",
      title: "Algoritma Praktek 1",
      taskType: "INDIVIDUAL",
      deadline: "2026-10-01T23:59:00Z",
    });
    expect(indTask.success).toBe(true);

    // GROUP
    const groupTask = taskSchema.safeParse({
      subjectId: "sub1",
      title: "Proyek Sistem Enterprise",
      taskType: "GROUP",
      deadline: "2026-10-15T23:59:00Z",
      groupName: "Kelompok 05",
      groupMembers: "Student A, Student B, Student C",
    });
    expect(groupTask.success).toBe(true);

    // ADDITIONAL: nullable subjectId
    const additTask = taskSchema.safeParse({
      subjectId: null,
      title: "Review materi orientasi kampus",
      taskType: "ADDITIONAL",
      deadline: "2026-10-20T23:59:00Z",
    });
    expect(additTask.success).toBe(true);
  });

  it("validates material schema with various types", async () => {
    const { materialSchema } = await import("./index");
    const validPdf = materialSchema.safeParse({
      title: "Modul 1 - Pengenalan Algoritma",
      type: "PDF",
      fileUrl: "https://example.com/modul1.pdf",
    });
    expect(validPdf.success).toBe(true);

    const validLink = materialSchema.safeParse({
      title: "Dokumentasi Resmi Python",
      type: "LINK",
      externalUrl: "https://docs.python.org/3/",
    });
    expect(validLink.success).toBe(true);
  });

  it("validates daily note schema", async () => {
    const { dailyNoteSchema } = await import("./index");
    const validNote = dailyNoteSchema.safeParse({
      date: "2026-09-21",
      title: "Belajar Dasar Algoritma & Flowchart",
      summary: "Memahami flowchart dan percabangan",
      content: "Hari ini kami belajar dasar algoritma dan bagaimana menyusun flowchart.",
      importantPoints: "- Flowchart\n- Pseudocode",
      nextSteps: "- Latihan soal logika",
      subjectId: "sub1",
    });
    expect(validNote.success).toBe(true);
  });

  it("validates class settings defaults", async () => {
    const { settingsSchema } = await import("./index");
    const defaultSettings = settingsSchema.safeParse({
      className: "JS1SI-26-REG-05",
    });
    expect(defaultSettings.success).toBe(true);
    if (defaultSettings.success) {
      expect(defaultSettings.data.institutionName).toBe("Telkom University Jakarta");
      expect(defaultSettings.data.studyProgram).toBe("S1 Sistem Informasi");
      expect(defaultSettings.data.waliDosen).toBe("Muhammad Ardiansyah");
      expect(defaultSettings.data.classShortName).toBe("SI • 26-05");
    }
  });
});
