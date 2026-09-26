"use server";

import { revalidatePath } from "next/cache";
import { achievementSchema, AchievementInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createAchievementAction(input: AchievementInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("ACHIEVEMENTS_MANAGE");
    const validation = achievementSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const achievement = await prisma.achievement.create({
      data: {
        title: data.title,
        description: data.description || null,
        category: data.category,
        achievementDate: new Date(data.achievementDate),
        organization: data.organization || null,
        location: data.location || null,
        badgeIconUrl: data.badgeIconUrl || null,
        imageUrl: data.imageUrl || null,
        createdBy: user.id,
        students: {
          create: (data.studentIds || []).map((studentId) => ({
            studentId,
          })),
        },
      },
    });

    await logActivity("CREATE_ACHIEVEMENT", "ACHIEVEMENT", achievement.id, `Created achievement ${achievement.title}`);
    revalidatePath("/achievements");
    revalidatePath("/admin/achievements");
    revalidatePath("/students");
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
          badgeIconUrl: data.badgeIconUrl || null,
          imageUrl: data.imageUrl || null,
          students: {
            create: (data.studentIds || []).map((studentId) => ({
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
    revalidatePath("/");

    return { success: true, data: achievement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update achievement." };
  }
}

export async function deleteAchievementAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ACHIEVEMENTS_MANAGE");

    await prisma.achievement.delete({ where: { id } });

    await logActivity("DELETE_ACHIEVEMENT", "ACHIEVEMENT", id, "Deleted achievement");
    revalidatePath("/achievements");
    revalidatePath("/admin/achievements");
    revalidatePath("/students");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete achievement." };
  }
}
