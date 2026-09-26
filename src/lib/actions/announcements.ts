"use server";

import { revalidatePath } from "next/cache";
import { announcementSchema, AnnouncementInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createAnnouncementAction(input: AnnouncementInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("ANNOUNCEMENTS_MANAGE");
    const validation = announcementSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const publishedAt = data.isPublished
      ? data.publishedAt
        ? new Date(data.publishedAt)
        : new Date()
      : null;

    const announcement = await prisma.announcement.create({
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        isPublished: data.isPublished,
        publishedAt,
        createdBy: user.id,
      },
    });

    await logActivity("CREATE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.id, `Created announcement ${announcement.title}`);
    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create announcement." };
  }
}

export async function updateAnnouncementAction(id: string, input: AnnouncementInput): Promise<ActionResult> {
  try {
    await assertPermission("ANNOUNCEMENTS_MANAGE");
    const validation = announcementSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.announcement.findUnique({ where: { id } });

    let publishedAt = existing?.publishedAt || null;
    if (data.isPublished && !existing?.isPublished) {
      publishedAt = new Date();
    } else if (!data.isPublished) {
      publishedAt = null;
    }

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title: data.title,
        content: data.content,
        imageUrl: data.imageUrl || null,
        isPublished: data.isPublished,
        publishedAt,
      },
    });

    await logActivity("UPDATE_ANNOUNCEMENT", "ANNOUNCEMENT", announcement.id, `Updated announcement ${announcement.title}`);
    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update announcement." };
  }
}

export async function togglePublishAnnouncementAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ANNOUNCEMENTS_MANAGE");

    const existing = await prisma.announcement.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Announcement not found." };
    }

    const isPublished = !existing.isPublished;
    const publishedAt = isPublished ? new Date() : null;

    const announcement = await prisma.announcement.update({
      where: { id },
      data: { isPublished, publishedAt },
    });

    await logActivity(
      isPublished ? "PUBLISH_ANNOUNCEMENT" : "UNPUBLISH_ANNOUNCEMENT",
      "ANNOUNCEMENT",
      id,
      `${isPublished ? "Published" : "Unpublished"} announcement ${announcement.title}`
    );

    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true, data: announcement };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to toggle announcement status." };
  }
}

export async function deleteAnnouncementAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("ANNOUNCEMENTS_MANAGE");

    await prisma.announcement.delete({ where: { id } });

    await logActivity("DELETE_ANNOUNCEMENT", "ANNOUNCEMENT", id, "Deleted announcement");
    revalidatePath("/announcements");
    revalidatePath("/admin/announcements");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete announcement." };
  }
}
