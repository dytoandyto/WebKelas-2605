"use server";

import { revalidatePath } from "next/cache";
import { studentSchema, StudentInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createStudentAction(input: StudentInput): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const validation = studentSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    if (data.studentNumber) {
      const existing = await prisma.student.findUnique({
        where: { studentNumber: data.studentNumber },
      });
      if (existing) {
        return { success: false, error: `Student number (NIM) ${data.studentNumber} is already registered.` };
      }
    }

    const student = await prisma.student.create({
      data: {
        name: data.name,
        studentNumber: data.studentNumber || null,
        major: data.major,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        dream: data.dream || null,
        motivation: data.motivation || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
      },
    });

    await logActivity("CREATE_STUDENT", "STUDENT", student.id, `Enrolled student: ${student.name}`);
    revalidatePath("/students");
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create student." };
  }
}

export async function updateStudentAction(id: string, input: StudentInput): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    const validation = studentSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    if (data.studentNumber) {
      const existing = await prisma.student.findFirst({
        where: {
          studentNumber: data.studentNumber,
          NOT: { id },
        },
      });
      if (existing) {
        return { success: false, error: `Student number (NIM) ${data.studentNumber} is already registered.` };
      }
    }

    const student = await prisma.student.update({
      where: { id },
      data: {
        name: data.name,
        studentNumber: data.studentNumber || null,
        major: data.major,
        photoUrl: data.photoUrl || null,
        bio: data.bio || null,
        dream: data.dream || null,
        motivation: data.motivation || null,
        githubUrl: data.githubUrl || null,
        linkedinUrl: data.linkedinUrl || null,
        portfolioUrl: data.portfolioUrl || null,
      },
    });

    await logActivity("UPDATE_STUDENT", "STUDENT", student.id, `Updated student profile: ${student.name}`);
    revalidatePath("/students");
    revalidatePath(`/students/${id}`);
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true, data: student };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update student." };
  }
}

export async function deleteStudentAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("STUDENTS_MANAGE");
    await prisma.student.delete({ where: { id } });

    await logActivity("DELETE_STUDENT", "STUDENT", id, "Removed student from cohort");
    revalidatePath("/students");
    revalidatePath("/admin/students");
    revalidatePath("/about");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete student." };
  }
}
