"use server";

import { revalidatePath } from "next/cache";
import { dailyNoteSchema, DailyNoteInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createDailyNoteAction(input: DailyNoteInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("DAILY_NOTES_MANAGE");
    const validation = dailyNoteSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const note = await prisma.dailyNote.create({
      data: {
        date: new Date(data.date),
        title: data.title,
        summary: data.summary || null,
        content: data.content,
        importantPoints: data.importantPoints || null,
        nextSteps: data.nextSteps || null,
        subjectId: data.subjectId || null,
        tags: data.tags || null,
        authorId: user.id,
        materials: {
          create: (data.materialIds || []).map((mId) => ({
            material: { connect: { id: mId } },
          })),
        },
        tasks: {
          create: (data.taskIds || []).map((tId) => ({
            task: { connect: { id: tId } },
          })),
        },
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    await logActivity("CREATE_DAILY_NOTE", "DAILY_NOTE", note.id, `Created daily note: ${note.title}`);
    revalidatePath("/daily-notes");
    revalidatePath("/admin/daily-notes");
    revalidatePath("/");

    return { success: true, data: note };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create daily note." };
  }
}

export async function updateDailyNoteAction(id: string, input: DailyNoteInput): Promise<ActionResult> {
  try {
    await assertPermission("DAILY_NOTES_MANAGE");
    const validation = dailyNoteSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;

    // Remove existing connections first
    await prisma.dailyNoteMaterial.deleteMany({ where: { dailyNoteId: id } });
    await prisma.dailyNoteTask.deleteMany({ where: { dailyNoteId: id } });

    const note = await prisma.dailyNote.update({
      where: { id },
      data: {
        date: new Date(data.date),
        title: data.title,
        summary: data.summary || null,
        content: data.content,
        importantPoints: data.importantPoints || null,
        nextSteps: data.nextSteps || null,
        subjectId: data.subjectId || null,
        tags: data.tags || null,
        materials: {
          create: (data.materialIds || []).map((mId) => ({
            material: { connect: { id: mId } },
          })),
        },
        tasks: {
          create: (data.taskIds || []).map((tId) => ({
            task: { connect: { id: tId } },
          })),
        },
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });

    await logActivity("UPDATE_DAILY_NOTE", "DAILY_NOTE", note.id, `Updated daily note: ${note.title}`);
    revalidatePath("/daily-notes");
    revalidatePath(`/daily-notes/${id}`);
    revalidatePath("/admin/daily-notes");
    revalidatePath("/");

    return { success: true, data: note };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update daily note." };
  }
}

export async function deleteDailyNoteAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("DAILY_NOTES_MANAGE");
    await prisma.dailyNote.delete({ where: { id } });

    await logActivity("DELETE_DAILY_NOTE", "DAILY_NOTE", id, "Deleted daily note");
    revalidatePath("/daily-notes");
    revalidatePath("/admin/daily-notes");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete daily note." };
  }
}
