"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema, SettingsInput, aboutSchema, AboutInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
import { getCurrentUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { ActionResult } from "./auth";
import prisma from "@/lib/db";

export async function updateSettingsAction(input: SettingsInput): Promise<ActionResult> {
  try {
    await assertPermission("SETTINGS_MANAGE");
    const validation = settingsSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const entries = Object.entries(data);

    for (const [key, value] of entries) {
      if (value !== undefined) {
        await prisma.setting.upsert({
          where: { key },
          update: { value: String(value) },
          create: { key, value: String(value) },
        });
      }
    }

    await logActivity("UPDATE_SETTINGS", "SETTINGS", undefined, "Updated class settings");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/about");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update settings.";
    return { success: false, error: message };
  }
}

export async function updateAboutAction(input: AboutInput): Promise<ActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user || (!hasPermission(user.role, "SETTINGS_MANAGE") && user.role !== "CLASS_ADMIN")) {
      await assertPermission("SETTINGS_MANAGE");
    }
    const validation = aboutSchema.safeParse(input);
    if (!validation.success) {
      return { success: false, error: validation.error.issues[0]?.message };
    }

    const data = validation.data;
    const settingsToSave: Record<string, string> = {
      classCode: data.classCode,
      studyProgram: data.studyProgram,
      institutionName: data.institutionName,
      academicYear: data.academicYear,
      waliDosen: data.waliDosen,
      classDescription: data.classDescription || "",
      aboutVision: data.aboutVision || "",
      aboutMission: data.aboutMission || "",
      aboutValues: JSON.stringify(data.aboutValues || []),
      aboutLeaders: JSON.stringify(data.aboutLeaders || []),
      aboutWaliDosenMessage: data.aboutWaliDosenMessage || "",
      contactEmail: data.contactEmail || "",
      githubUrl: data.githubUrl || "",
      instagramUrl: data.instagramUrl || "",
      discordUrl: data.discordUrl || "",
      linkedinUrl: data.linkedinUrl || "",
    };

    for (const [key, value] of Object.entries(settingsToSave)) {
      await prisma.setting.upsert({
        where: { key },
        update: { value },
        create: { key, value },
      });
    }

    await logActivity("UPDATE_SETTINGS", "SETTINGS", undefined, "Updated About page content");
    revalidatePath("/");
    revalidatePath("/about");
    revalidatePath("/admin/about");
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update about content.";
    return { success: false, error: message };
  }
}

