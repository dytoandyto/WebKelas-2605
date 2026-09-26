import { describe, it, expect } from "vitest";
import { hasPermission } from "./index";
import { UserRole } from "@prisma/client";

describe("Permissions tests", () => {
  it("allows ADMIN full access", () => {
    expect(hasPermission(UserRole.ADMIN, "USERS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ADMIN, "SETTINGS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ADMIN, "TASKS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ADMIN, "GALLERY_MANAGE")).toBe(true);
  });

  it("prevents CLASS_ADMIN from managing users and settings", () => {
    expect(hasPermission(UserRole.CLASS_ADMIN, "USERS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.CLASS_ADMIN, "SETTINGS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.CLASS_ADMIN, "TASKS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.CLASS_ADMIN, "STUDENTS_MANAGE")).toBe(true);
  });

  it("allows LECTURER to manage tasks and announcements but not users or gallery", () => {
    expect(hasPermission(UserRole.LECTURER, "TASKS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.LECTURER, "ANNOUNCEMENTS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.LECTURER, "USERS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.LECTURER, "GALLERY_MANAGE")).toBe(false);
  });

  it("allows ASSISTANT to manage gallery, tasks, achievements but not users", () => {
    expect(hasPermission(UserRole.ASSISTANT, "GALLERY_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ASSISTANT, "TASKS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ASSISTANT, "ACHIEVEMENTS_MANAGE")).toBe(true);
    expect(hasPermission(UserRole.ASSISTANT, "USERS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.ASSISTANT, "SUBJECTS_MANAGE")).toBe(false);
  });

  it("returns false for unauthenticated / null roles", () => {
    expect(hasPermission(null, "VIEW_ADMIN")).toBe(false);
    expect(hasPermission(undefined, "TASKS_MANAGE")).toBe(false);
  });
});
