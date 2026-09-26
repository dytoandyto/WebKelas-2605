"use server";

import { revalidatePath } from "next/cache";
import { resourceSchema, ResourceInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createResourceAction(input: ResourceInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("RESOURCES_MANAGE");
    const validation = resourceSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const resource = await prisma.resource.create({
      data: {
        title: data.title,
        description: data.description || null,
        url: data.url,
        category: data.category,
        createdBy: user.id,
      },
    });

    await logActivity("CREATE_RESOURCE", "RESOURCE", resource.id, `Added class resource: ${resource.title}`);
    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    revalidatePath("/");

    return { success: true, data: resource };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add resource." };
  }
}

export async function updateResourceAction(id: string, input: ResourceInput): Promise<ActionResult> {
  try {
    await assertPermission("RESOURCES_MANAGE");
    const validation = resourceSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const resource = await prisma.resource.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        url: data.url,
        category: data.category,
      },
    });

    await logActivity("UPDATE_RESOURCE", "RESOURCE", resource.id, `Updated class resource: ${resource.title}`);
    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    revalidatePath("/");

    return { success: true, data: resource };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update resource." };
  }
}

export async function deleteResourceAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("RESOURCES_MANAGE");
    await prisma.resource.delete({ where: { id } });

    await logActivity("DELETE_RESOURCE", "RESOURCE", id, "Deleted resource link");
    revalidatePath("/resources");
    revalidatePath("/admin/resources");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete resource." };
  }
}
