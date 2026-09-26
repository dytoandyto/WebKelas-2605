"use server";

import { revalidatePath } from "next/cache";
import { subjectSchema, SubjectInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createSubjectAction(input: SubjectInput): Promise<ActionResult> {
  try {
    await assertPermission("SUBJECTS_MANAGE");
    const validation = subjectSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.subject.findUnique({
      where: { code: data.code },
    });
    if (existing) {
      return { success: false, error: `Subject code ${data.code} already exists.` };
    }

    const subject = await prisma.subject.create({
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        lecturerName: data.lecturerName || null,
      },
    });

    await logActivity("CREATE_SUBJECT", "SUBJECT", subject.id, `Created subject ${subject.code} - ${subject.name}`);
    revalidatePath("/admin/subjects");
    revalidatePath("/schedule");
    revalidatePath("/tasks");
    revalidatePath("/");

    return { success: true, data: subject };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create subject." };
  }
}

export async function updateSubjectAction(id: string, input: SubjectInput): Promise<ActionResult> {
  try {
    await assertPermission("SUBJECTS_MANAGE");
    const validation = subjectSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const existing = await prisma.subject.findFirst({
      where: {
        code: data.code,
        NOT: { id },
      },
    });
    if (existing) {
      return { success: false, error: `Subject code ${data.code} is already in use by another course.` };
    }

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        code: data.code,
        name: data.name,
        description: data.description || null,
        lecturerName: data.lecturerName || null,
      },
    });

    await logActivity("UPDATE_SUBJECT", "SUBJECT", subject.id, `Updated subject ${subject.code} - ${subject.name}`);
    revalidatePath("/admin/subjects");
    revalidatePath("/schedule");
    revalidatePath("/tasks");
    revalidatePath("/");

    return { success: true, data: subject };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update subject." };
  }
}

export async function deleteSubjectAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("SUBJECTS_MANAGE");

    // Check if subject is associated with schedules or tasks
    const [schedulesCount, tasksCount] = await Promise.all([
      prisma.schedule.count({ where: { subjectId: id } }),
      prisma.task.count({ where: { subjectId: id } }),
    ]);

    if (schedulesCount > 0 || tasksCount > 0) {
      return {
        success: false,
        error: `Cannot delete subject. It has ${schedulesCount} scheduled classes and ${tasksCount} tasks attached.`,
      };
    }

    await prisma.subject.delete({ where: { id } });

    await logActivity("DELETE_SUBJECT", "SUBJECT", id, "Deleted subject record");
    revalidatePath("/admin/subjects");
    revalidatePath("/schedule");
    revalidatePath("/tasks");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete subject." };
  }
}
