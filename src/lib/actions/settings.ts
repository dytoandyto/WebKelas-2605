"use server";

import { revalidatePath } from "next/cache";
import { settingsSchema, SettingsInput } from "@/lib/validations";
import { assertPermission, logActivity } from "./common";
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
    revalidatePath("/admin/settings");

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update settings." };
  }
}
