"use server";

import { revalidatePath } from "next/cache";
import { classEventSchema, ClassEventInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createEventAction(input: ClassEventInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("EVENTS_MANAGE");
    const validation = classEventSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const event = await prisma.classEvent.create({
      data: {
        title: data.title,
        description: data.description || null,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        location: data.location || null,
        imageUrl: data.imageUrl || null,
        createdBy: user.id,
      },
    });

    await logActivity("CREATE_EVENT", "EVENT", event.id, `Created class event: ${event.title}`);
    revalidatePath("/admin/events");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: event };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create class event." };
  }
}

export async function updateEventAction(id: string, input: ClassEventInput): Promise<ActionResult> {
  try {
    await assertPermission("EVENTS_MANAGE");
    const validation = classEventSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const event = await prisma.classEvent.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        eventDate: new Date(data.eventDate),
        startTime: data.startTime || null,
        endTime: data.endTime || null,
        location: data.location || null,
        imageUrl: data.imageUrl || null,
      },
    });

    await logActivity("UPDATE_EVENT", "EVENT", event.id, `Updated class event: ${event.title}`);
    revalidatePath("/admin/events");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: event };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update class event." };
  }
}

export async function deleteEventAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("EVENTS_MANAGE");
    await prisma.classEvent.delete({ where: { id } });

    await logActivity("DELETE_EVENT", "EVENT", id, "Deleted class event");
    revalidatePath("/admin/events");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete class event." };
  }
}
