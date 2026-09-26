"use server";

import { revalidatePath } from "next/cache";
import { gallerySchema, GalleryInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function createGalleryAction(input: GalleryInput): Promise<ActionResult> {
  try {
    const user = await assertPermission("GALLERY_MANAGE");
    const validation = gallerySchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const photo = await prisma.gallery.create({
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        uploadedBy: user.id,
      },
    });

    await logActivity("CREATE_GALLERY", "GALLERY", photo.id, `Uploaded photo: ${photo.title}`);
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: photo };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to add photo to gallery." };
  }
}

export async function updateGalleryAction(id: string, input: GalleryInput): Promise<ActionResult> {
  try {
    await assertPermission("GALLERY_MANAGE");
    const validation = gallerySchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const photo = await prisma.gallery.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
      },
    });

    await logActivity("UPDATE_GALLERY", "GALLERY", photo.id, `Updated photo: ${photo.title}`);
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true, data: photo };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update photo." };
  }
}

export async function deleteGalleryAction(id: string): Promise<ActionResult> {
  try {
    await assertPermission("GALLERY_MANAGE");
    await prisma.gallery.delete({ where: { id } });

    await logActivity("DELETE_GALLERY", "GALLERY", id, "Deleted photo from gallery");
    revalidatePath("/gallery");
    revalidatePath("/admin/gallery");
    revalidatePath("/");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to delete photo." };
  }
}
