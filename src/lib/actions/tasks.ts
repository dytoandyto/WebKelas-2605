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
        subjectId: data.subjectId || null,
        title: data.title,
        description: data.description || null,
        taskType: data.taskType,
        deadline: new Date(data.deadline),
        estimatedTime: data.estimatedTime || null,
        priority: data.priority,
        status: data.status,
        groupName: data.groupName || null,
        groupMembers: data.groupMembers || null,
        attachmentUrl: data.attachmentUrl || null,
        submissionUrl: data.submissionUrl || null,
        referenceUrl: data.referenceUrl || null,
        notes: data.notes || null,
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
        subjectId: data.subjectId || null,
        title: data.title,
        description: data.description || null,
        taskType: data.taskType,
        deadline: new Date(data.deadline),
        estimatedTime: data.estimatedTime || null,
        priority: data.priority,
        status: data.status,
        groupName: data.groupName || null,
        groupMembers: data.groupMembers || null,
        attachmentUrl: data.attachmentUrl || null,
        submissionUrl: data.submissionUrl || null,
        referenceUrl: data.referenceUrl || null,
        notes: data.notes || null,
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

export async function updateTaskStatusAction(id: string, status: any): Promise<ActionResult> {
  try {
    await assertPermission("TASKS_MANAGE");
    const updated = await prisma.task.update({
      where: { id },
      data: { status },
      include: { subject: { select: { id: true, code: true, name: true } } },
    });

    await logActivity("UPDATE_TASK_STATUS", "TASK", id, `Changed status to ${status}`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true, data: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update task status." };
  }
}

export async function duplicateTaskAction(id: string): Promise<ActionResult> {
  try {
    const user = await assertPermission("TASKS_MANAGE");
    const original = await prisma.task.findUnique({
      where: { id },
    });
    if (!original) {
      return { success: false, error: "Task not found." };
    }

    // New deadline: 7 days from now
    const newDeadline = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const duplicated = await prisma.task.create({
      data: {
        subjectId: original.subjectId,
        title: `Copy of ${original.title}`,
        description: original.description,
        taskType: original.taskType,
        deadline: newDeadline,
        estimatedTime: original.estimatedTime,
        priority: original.priority,
        status: "UPCOMING",
        groupName: original.groupName,
        groupMembers: original.groupMembers,
        attachmentUrl: original.attachmentUrl,
        submissionUrl: null, // Clear submission for duplicate
        referenceUrl: original.referenceUrl,
        notes: original.notes,
        createdBy: user.id,
      },
      include: {
        subject: { select: { id: true, code: true, name: true } },
      },
    });

    await logActivity("DUPLICATE_TASK", "TASK", duplicated.id, `Duplicated from ${original.title}`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true, data: duplicated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to duplicate task." };
  }
}

export async function bulkUpdateTasksStatusAction(ids: string[], status: any): Promise<ActionResult> {
  try {
    await assertPermission("TASKS_MANAGE");
    await prisma.task.updateMany({
      where: { id: { in: ids } },
      data: { status },
    });

    await logActivity("BULK_UPDATE_TASKS", "TASK", "BULK", `Updated ${ids.length} tasks to ${status}`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed bulk update." };
  }
}

export async function bulkDeleteTasksAction(ids: string[]): Promise<ActionResult> {
  try {
    await assertPermission("TASKS_MANAGE");
    await prisma.task.deleteMany({
      where: { id: { in: ids } },
    });

    await logActivity("BULK_DELETE_TASKS", "TASK", "BULK", `Deleted ${ids.length} tasks`);
    revalidatePath("/tasks");
    revalidatePath("/admin/tasks");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed bulk delete." };
  }
}

