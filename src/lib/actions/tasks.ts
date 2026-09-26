"use server";

import { revalidatePath } from "next/cache";
import { taskSchema, TaskInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createTaskAction(input: TaskInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("TASKS_MANAGE");
    const validation = taskSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const task = await prisma.task.create({
      data: {
        subjectId: data.subjectId,
        title: data.title,
        description: data.description || null,
        deadline: new Date(data.deadline),
        priority: data.priority,
        status: data.status,
        createdBy: user.id,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    await logActivity("CREATE_TASK", "TASK", task.id, `Created task: ${task.title}`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true, data: task };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create task." };
  }
}

export async function updateTaskAction(id: string, input: TaskInput): Promise<ActionResult> {
  try {
    await assertPermission("TASKS_MANAGE");
    const validation = taskSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const task = await prisma.task.update({
      where: { id },
      data: {
        subjectId: data.subjectId,
        title: data.title,
        description: data.description || null,
        deadline: new Date(data.deadline),
        priority: data.priority,
        status: data.status,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    await logActivity("UPDATE_TASK", "TASK", task.id, `Updated task: ${task.title}`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true, data: task };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update task." };
  }
}

export async function deleteTaskAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("TASKS_MANAGE");
    await prisma.task.delete({ where: { id } });

    await logActivity("DELETE_TASK", "TASK", id, "Deleted task");
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete task." };
  }
}
