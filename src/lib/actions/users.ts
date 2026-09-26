"use server";

import { revalidatePath } from "next/cache";
import { userCreateSchema, userUpdateSchema, UserCreateInput, UserUpdateInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import { hashPassword } from "@/lib/auth/password";
import prisma from "@/lib/db";
import { UserRole } from "@prisma/client";

export async function createUserAction(input: UserCreateInput): Promise<ActionResult> {
  try {
    await assertPermission("USERS_MANAGE");
    const validation = userCreateSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
    });
    if (existing) {
      return { success: false, error: "A user with this email address already exists." };
    }

    const passwordHash = await hashPassword(data.password);
    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        role: data.role,
        isActive: data.isActive,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logActivity("CREATE_USER", "USER", user.id, `Created user account: ${user.name} (${user.role})`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, data: user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create user account." };
  }
}

export async function updateUserAction(id: string, input: UserUpdateInput): Promise<ActionResult> {
  try {
    await assertPermission("USERS_MANAGE");
    const validation = userUpdateSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.user.findFirst({
      where: {
        email: data.email.toLowerCase(),
        NOT: { id },
      },
    });
    if (existing) {
      return { success: false, error: "Another user already uses this email address." };
    }

    // Protect last active admin from role demotion or deactivation
    const currentUser = await prisma.user.findUnique({ where: { id } });
    if (currentUser?.role === UserRole.ADMIN) {
      if (data.role !== UserRole.ADMIN || !data.isActive) {
        const activeAdminCount = await prisma.user.count({
          where: { role: UserRole.ADMIN, isActive: true },
        });
        if (activeAdminCount <= 1) {
          return {
            success: false,
            error: "Cannot deactivate or demote the last remaining active Administrator.",
          };
        }
      }
    }

    const updateData: any = {
      name: data.name,
      email: data.email.toLowerCase(),
      role: data.role,
      isActive: data.isActive,
    };

    if (data.password && data.password.trim().length >= 8) {
      updateData.passwordHash = await hashPassword(data.password);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    await logActivity("UPDATE_USER", "USER", user.id, `Updated user account: ${user.name} (${user.role})`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true, data: user };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user account." };
  }
}

export async function deleteUserAction(id: string): Promise<ActionResult> {
  try {
    const sessionUser = await assertPermission("USERS_MANAGE");
    if (sessionUser.id === id) {
      return { success: false, error: "You cannot delete your own administrative account." };
    }

    const target = await prisma.user.findUnique({ where: { id } });
    if (target?.role === UserRole.ADMIN) {
      const activeAdminCount = await prisma.user.count({
        where: { role: UserRole.ADMIN, isActive: true },
      });
      if (activeAdminCount <= 1) {
        return {
          success: false,
          error: "Cannot delete the last remaining active Administrator.",
        };
      }
    }

    await prisma.user.delete({ where: { id } });

    await logActivity("DELETE_USER", "USER", id, `Deleted user account: ${target?.name || id}`);
    revalidatePath("/admin/users");
    revalidatePath("/admin");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete user account." };
  }
}
