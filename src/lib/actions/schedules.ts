"use server";

import { revalidatePath } from "next/cache";
import { scheduleSchema, ScheduleInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createScheduleAction(input: ScheduleInput): Promise<ActionResult> {
  try {
    await assertPermission("SCHEDULES_MANAGE");
    const validation = scheduleSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const schedule = await prisma.schedule.create({
      data: {
        subjectId: data.subjectId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        lecturerName: data.lecturerName || null,
        notes: data.notes || null,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true, lecturerName: true },
        },
      },
    });

    await logActivity("CREATE_SCHEDULE", "SCHEDULE", schedule.id, `Created schedule for ${schedule.subject.code} on ${schedule.dayOfWeek}`);
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    revalidatePath("/");

    return { success: true, data: schedule };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create schedule." };
  }
}

export async function updateScheduleAction(id: string, input: ScheduleInput): Promise<ActionResult> {
  try {
    await assertPermission("SCHEDULES_MANAGE");
    const validation = scheduleSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const schedule = await prisma.schedule.update({
      where: { id },
      data: {
        subjectId: data.subjectId,
        dayOfWeek: data.dayOfWeek,
        startTime: data.startTime,
        endTime: data.endTime,
        room: data.room,
        lecturerName: data.lecturerName || null,
        notes: data.notes || null,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true, lecturerName: true },
        },
      },
    });

    await logActivity("UPDATE_SCHEDULE", "SCHEDULE", schedule.id, `Updated schedule for ${schedule.subject.code} on ${schedule.dayOfWeek}`);
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    revalidatePath("/");

    return { success: true, data: schedule };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update schedule." };
  }
}

export async function deleteScheduleAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("SCHEDULES_MANAGE");
    await prisma.schedule.delete({ where: { id } });

    await logActivity("DELETE_SCHEDULE", "SCHEDULE", id, "Deleted class schedule slot");
    revalidatePath("/schedule");
    revalidatePath("/admin/schedule");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete schedule." };
  }
}
