"use server";

import { getSession, SessionUser } from "@/lib/auth/session";
import { hasPermission, Permission } from "@/lib/permissions";
import { UserRole } from "@prisma/client";
import prisma from "@/lib/db";

export async function assertPermission(permission: Permission): Promise<SessionUser> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized. Please log in with appropriate credentials.");
  }

  let user: { id: string; email: string; name: string; role: UserRole; isActive: boolean } | null = null;
  try {
    user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
      },
    });
  } catch {
    throw new Error("Service temporarily unavailable. Unable to verify user account status.");
  }

  if (!user) {
    throw new Error("Unauthorized. User account no longer exists.");
  }

  if (!user.isActive) {
    throw new Error("Forbidden. Your account has been deactivated.");
  }

  if (!hasPermission(user.role, permission)) {
    throw new Error("Forbidden. You do not have permission to perform this action.");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}

export async function logActivity(
  action: string,
  entityType: string,
  entityId?: string,
  details?: string
) {
  try {
    const session = await getSession();
    await prisma.activityLog.create({
      data: {
        userId: session?.id || null,
        action,
        entityType,
        entityId: entityId || null,
        details: details || null,
      },
    });
  } catch {
    // Silently continue if audit logging fails
  }
}
