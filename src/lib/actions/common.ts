"use server";

import { getCurrentUser, getSession, SessionUser } from "@/lib/auth/session";
import { hasPermission, Permission } from "@/lib/permissions";
import prisma from "@/lib/db";

export async function assertPermission(permission: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    // If database is offline but session cookie is present, check session directly
    const session = await getSession();
    if (session && hasPermission(session.role, permission)) {
      return session;
    }
    throw new Error("Unauthorized. Please log in with appropriate credentials.");
  }

  if (!user.isActive) {
    throw new Error("Your account has been deactivated.");
  }

  if (!hasPermission(user.role, permission)) {
    throw new Error("Forbidden. You do not have permission to perform this action.");
  }

  return user;
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
