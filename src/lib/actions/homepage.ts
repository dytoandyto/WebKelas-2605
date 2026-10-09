"use server";

import { revalidatePath } from "next/cache";
import { logActivity } from "./common";
import { getCurrentUser, getSession, SessionUser } from "@/lib/auth/session";
import { hasPermission } from "@/lib/permissions";
import { ActionResult } from "./auth";
import { SectionKey, HomepageConfig } from "@/lib/homepage/types";
import {
  saveHomepageDraft,
  publishHomepageConfig,
  resetHomepageSection,
  resetHomepageLayout,
  resetHomepageAll,
  getHomepageDraftPayload,
} from "@/lib/homepage/storage";

async function assertHomepagePermission(): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) {
    const session = await getSession();
    if (
      session &&
      (session.role === "ADMIN" ||
        session.role === "CLASS_ADMIN" ||
        hasPermission(session.role, "SETTINGS_MANAGE"))
    ) {
      return session;
    }
    throw new Error("Sesi tidak valid. Silakan login kembali dengan akun pengurus kelas atau admin.");
  }

  if (!user.isActive) {
    throw new Error("Akun Anda telah dinonaktifkan.");
  }

  const isAllowed =
    user.role === "ADMIN" ||
    user.role === "CLASS_ADMIN" ||
    hasPermission(user.role, "SETTINGS_MANAGE");

  if (!isAllowed) {
    throw new Error("Akses ditolak. Anda tidak memiliki izin untuk mengelola homepage.");
  }

  return user;
}

function safeRevalidateHomepage(includePublic = false) {
  try {
    revalidatePath("/admin/homepage-builder");
    revalidatePath("/admin/homepage-builder/preview");
    if (includePublic) {
      revalidatePath("/");
    }
  } catch {
    // Fail-open for Next.js cache revalidation if static generation store is not active
  }
}

export async function saveHomepageDraftAction(
  config: unknown
): Promise<ActionResult & { config?: HomepageConfig }> {
  try {
    const user = await assertHomepagePermission();

    const res = await saveHomepageDraft(config, user.id);
    if (!res.success) {
      return { success: false, error: res.error || "Gagal menyimpan draft homepage." };
    }

    safeRevalidateHomepage(false);
    await logActivity("UPDATE_SETTINGS", "HOMEPAGE", undefined, "Saved homepage draft configuration");
    return { success: true, config: res.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal menyimpan draft.";
    return { success: false, error: message };
  }
}

export async function publishHomepageAction(
  config?: unknown
): Promise<ActionResult & { config?: HomepageConfig }> {
  try {
    const user = await assertHomepagePermission();

    const res = await publishHomepageConfig(config, user.id);
    if (!res.success) {
      return { success: false, error: res.error || "Gagal mempublikasikan homepage." };
    }

    safeRevalidateHomepage(true);
    await logActivity("UPDATE_SETTINGS", "HOMEPAGE", undefined, "Published homepage configuration to live");
    return { success: true, config: res.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal mempublikasikan homepage.";
    return { success: false, error: message };
  }
}

export async function resetSectionAction(
  key: SectionKey
): Promise<ActionResult & { config?: HomepageConfig }> {
  try {
    const user = await assertHomepagePermission();

    const res = await resetHomepageSection(key, user.id);
    if (!res.success) {
      return { success: false, error: res.error || "Gagal me-reset section." };
    }

    safeRevalidateHomepage(false);
    await logActivity("UPDATE_SETTINGS", "HOMEPAGE", undefined, `Reset section ${key} to default`);
    return { success: true, config: res.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal me-reset section.";
    return { success: false, error: message };
  }
}

export async function resetLayoutAction(): Promise<ActionResult & { config?: HomepageConfig }> {
  try {
    const user = await assertHomepagePermission();

    const res = await resetHomepageLayout(user.id);
    if (!res.success) {
      return { success: false, error: res.error || "Gagal me-reset layout homepage." };
    }

    safeRevalidateHomepage(false);
    await logActivity("UPDATE_SETTINGS", "HOMEPAGE", undefined, "Reset homepage layout and order to default");
    return { success: true, config: res.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal me-reset layout.";
    return { success: false, error: message };
  }
}

export async function resetAllHomepageAction(): Promise<ActionResult & { config?: HomepageConfig }> {
  try {
    const user = await assertHomepagePermission();

    const res = await resetHomepageAll(user.id);
    if (!res.success) {
      return { success: false, error: res.error || "Gagal me-reset seluruh homepage." };
    }

    safeRevalidateHomepage(false);
    await logActivity("UPDATE_SETTINGS", "HOMEPAGE", undefined, "Reset all homepage configuration to default");
    return { success: true, config: res.config };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal me-reset seluruh homepage.";
    return { success: false, error: message };
  }
}

export async function getHomepageDraftAction() {
  try {
    await assertHomepagePermission();
    return await getHomepageDraftPayload();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Gagal memuat draft.";
    throw new Error(message);
  }
}
