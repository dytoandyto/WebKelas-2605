"use server";

import { revalidatePath } from "next/cache";
import { achievementSchema, AchievementInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";
import { formatPhotoUrl } from "@/lib/utils";

export async function createAchievementAction(input: AchievementInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("ACHIEVEMENTS_MANAGE");
    const validation = achievementSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const uniqueStudentIds = Array.from(new Set(data.studentIds || []));
    const formattedBadgeIcon = data.badgeIconUrl
      ? /^https?:\/\//i.test(data.badgeIconUrl)
        ? formatPhotoUrl(data.badgeIconUrl)
        : data.badgeIconUrl
      : null;
    const formattedImage = data.imageUrl ? formatPhotoUrl(data.imageUrl) : null;

    const achievement = await prisma.achievement.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        achievementDate: new Date(data.achievementDate),
        organization: data.organization || null,
        location: data.location || null,
        badgeIconUrl: formattedBadgeIcon,
        imageUrl: formattedImage,
        createdBy: user.id,
        students: {
          create: uniqueStudentIds.map((studentId) => ({
            studentId,
          })),
        },
      },
    });

    await logActivity("CREATE_ACHIEVEMENT", "ACHIEVEMENT", achievement.id, `Created achievement ${achievement.title}`);
    revalidatePath("/achievements");
    revalidatePath(`/achievements/${achievement.id}`);
    revalidatePath("/admin/achievements");
    revalidatePath("/students");
    revalidatePath("/admin/students");
    uniqueStudentIds.forEach((sId) => revalidatePath(`/students/${sId}`));
    revalidatePath("/");

    return { success: true, data: achievement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create achievement." };
  }
}

export async function updateAchievementAction(id: string, input: AchievementInput): Promise<ActionResult> {
  try {
    await assertPermission("ACHIEVEMENTS_MANAGE");
    const validation = achievementSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const uniqueStudentIds = Array.from(new Set(data.studentIds || []));
    const formattedBadgeIcon = data.badgeIconUrl
      ? /^https?:\/\//i.test(data.badgeIconUrl)
        ? formatPhotoUrl(data.badgeIconUrl)
        : data.badgeIconUrl
      : null;
    const formattedImage = data.imageUrl ? formatPhotoUrl(data.imageUrl) : null;

    // Use a transaction to update achievement and student relationships
    const achievement = await prisma.$transaction(async (tx) => {
      // Clear existing student links
      await tx.studentAchievement.deleteMany({
        where: { achievementId: id },
      });

      // Update achievement and recreate links
      return tx.achievement.update({
        where: { id },
        data: {
          title: data.title,
          description: data.description || null,
          category: data.category,
          achievementDate: new Date(data.achievementDate),
          organization: data.organization || null,
          location: data.location || null,
          badgeIconUrl: formattedBadgeIcon,
          imageUrl: formattedImage,
          students: {
            create: uniqueStudentIds.map((studentId) => ({
              studentId,
            })),
          },
        },
      });
    });

    await logActivity("UPDATE_ACHIEVEMENT", "ACHIEVEMENT", achievement.id, `Updated achievement ${achievement.title}`);
    revalidatePath("/achievements");
    revalidatePath(`/achievements/${id}`);
    revalidatePath("/admin/achievements");
    revalidatePath("/students");
    revalidatePath("/admin/students");
    uniqueStudentIds.forEach((sId) => revalidatePath(`/students/${sId}`));
    revalidatePath("/");

    return { success: true, data: achievement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update achievement." };
  }
}

export async function deleteAchievementAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ACHIEVEMENTS_MANAGE");

    // Fetch linked student IDs before deletion for revalidation
    const existing = await prisma.achievement.findUnique({
      where: { id },
      select: {
        id: true,
        students: { select: { studentId: true } },
      },
    });

    await prisma.achievement.delete({ where: { id } });

    await logActivity("DELETE_ACHIEVEMENT", "ACHIEVEMENT", id, "Deleted achievement");
    revalidatePath("/achievements");
    revalidatePath(`/achievements/${id}`);
    revalidatePath("/admin/achievements");
    revalidatePath("/students");
    revalidatePath("/admin/students");
    existing?.students.forEach((s) => revalidatePath(`/students/${s.studentId}`));
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete achievement." };
  }
}
