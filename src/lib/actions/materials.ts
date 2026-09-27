"use server";

import { revalidatePath } from "next/cache";
import { materialSchema, MaterialInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createMaterialAction(input: MaterialInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("MATERIALS_MANAGE");
    const validation = materialSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const material = await prisma.material.create({
      data: {
        title: data.title,
        description: data.description || null,
        subjectId: data.subjectId || null,
        type: data.type,
        fileUrl: data.fileUrl || null,
        externalUrl: data.externalUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        tags: data.tags || null,
        uploadedBy: user.id,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    await logActivity("CREATE_MATERIAL", "MATERIAL", material.id, `Uploaded material: ${material.title}`);
    revalidatePath("/materials");
    revalidatePath("/admin/materials");
    revalidatePath("/");

    return { success: true, data: material };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create material." };
  }
}

export async function updateMaterialAction(id: string, input: MaterialInput): Promise<ActionResult> {
  try {
    await assertPermission("MATERIALS_MANAGE");
    const validation = materialSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const material = await prisma.material.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        subjectId: data.subjectId || null,
        type: data.type,
        fileUrl: data.fileUrl || null,
        externalUrl: data.externalUrl || null,
        fileName: data.fileName || null,
        fileSize: data.fileSize || null,
        tags: data.tags || null,
      },
      include: {
        subject: {
          select: { id: true, code: true, name: true },
        },
      },
    });

    await logActivity("UPDATE_MATERIAL", "MATERIAL", material.id, `Updated material: ${material.title}`);
    revalidatePath("/materials");
    revalidatePath(`/materials/${id}`);
    revalidatePath("/admin/materials");
    revalidatePath("/");

    return { success: true, data: material };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update material." };
  }
}

export async function deleteMaterialAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("MATERIALS_MANAGE");
    await prisma.material.delete({ where: { id } });

    await logActivity("DELETE_MATERIAL", "MATERIAL", id, "Deleted material");
    revalidatePath("/materials");
    revalidatePath("/admin/materials");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete material." };
  }
}
