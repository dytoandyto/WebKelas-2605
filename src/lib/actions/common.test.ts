import { describe, it, expect, vi, beforeEach } from "vitest";
import { assertPermission } from "./common";
import { UserRole } from "@prisma/client";

vi.mock("@/lib/auth/session", () => ({
  getSession: vi.fn(),
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  default: {
    user: {
      findUnique: vi.fn(),
    },
    activityLog: {
      create: vi.fn(),
    },
  },
}));

import { getSession } from "@/lib/auth/session";
import prisma from "@/lib/db";

describe("assertPermission Security & Access Control Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("throws Unauthorized error when no session exists", async () => {
    vi.mocked(getSession).mockResolvedValue(null);

    await expect(assertPermission("USERS_MANAGE")).rejects.toThrow(
      "Unauthorized. Please log in with appropriate credentials."
    );
  });

  it("throws Unauthorized error when session user does not exist in the database", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "deleted-user-id",
      name: "Deleted User",
      email: "deleted@classhub.edu",
      role: UserRole.ADMIN,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue(null);

    await expect(assertPermission("USERS_MANAGE")).rejects.toThrow(
      "Unauthorized. User account no longer exists."
    );
  });

  it("throws Forbidden error when session user is deactivated in the database", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "deactivated-user-id",
      name: "Deactivated Admin",
      email: "deactivated@classhub.edu",
      role: UserRole.ADMIN,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "deactivated-user-id",
      name: "Deactivated Admin",
      email: "deactivated@classhub.edu",
      role: UserRole.ADMIN,
      isActive: false, // Account is deactivated
      avatarUrl: null,
    } as any);

    await expect(assertPermission("USERS_MANAGE")).rejects.toThrow(
      "Forbidden. Your account has been deactivated."
    );
  });

  it("throws Forbidden error when active user lacks the required permission", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "assistant-user-id",
      name: "Teaching Assistant",
      email: "assistant@classhub.edu",
      role: UserRole.ASSISTANT,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "assistant-user-id",
      name: "Teaching Assistant",
      email: "assistant@classhub.edu",
      role: UserRole.ASSISTANT,
      isActive: true,
      avatarUrl: null,
    } as any);

    await expect(assertPermission("USERS_MANAGE")).rejects.toThrow(
      "Forbidden. You do not have permission to perform this action."
    );
  });

  it("successfully returns SessionUser when user is active and has required permission", async () => {
    vi.mocked(getSession).mockResolvedValue({
      id: "admin-user-id",
      name: "Active SuperAdmin",
      email: "admin@classhub.edu",
      role: UserRole.ADMIN,
    });
    vi.mocked(prisma.user.findUnique).mockResolvedValue({
      id: "admin-user-id",
      name: "Active SuperAdmin",
      email: "admin@classhub.edu",
      role: UserRole.ADMIN,
      isActive: true,
      avatarUrl: "https://example.com/avatar.jpg",
    } as any);

    const user = await assertPermission("USERS_MANAGE");
    expect(user).toEqual({
      id: "admin-user-id",
      name: "Active SuperAdmin",
      email: "admin@classhub.edu",
      role: UserRole.ADMIN,
    });
  });
});
