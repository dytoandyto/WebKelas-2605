import prisma from "@/lib/db";
import { HomepageConfig, HomepageMeta, HomepagePayload, SectionKey } from "./types";
import { getDefaultHomepageConfig, getDefaultSectionConfig, DEFAULT_HOMEPAGE_SECTIONS } from "./defaults";
import { validateAndNormalizeHomepageConfig } from "./validation";
import { Prisma, PrismaClient } from "@prisma/client";

const HOMEPAGE_PAGE_KEY = "home";

function getDb(): typeof prisma {
  if (
    prisma &&
    "homepageConfiguration" in prisma &&
    Boolean((prisma as unknown as { homepageConfiguration?: unknown }).homepageConfiguration)
  ) {
    return prisma;
  }
  const fresh = new PrismaClient();
  (globalThis as unknown as { prisma: PrismaClient }).prisma = fresh;
  return fresh;
}

/**
 * Get the currently published homepage configuration for public pages.
 */
export async function getHomepagePublishedConfig(): Promise<HomepageConfig> {
  try {
    const db = getDb();
    const record = await db.homepageConfiguration.findUnique({
      where: { pageKey: HOMEPAGE_PAGE_KEY },
    });

    if (!record || !record.publishedConfig) {
      return getDefaultHomepageConfig();
    }

    const normalized = validateAndNormalizeHomepageConfig(record.publishedConfig);
    if (normalized.success && normalized.data) {
      return normalized.data;
    }

    return getDefaultHomepageConfig();
  } catch (err: unknown) {
    console.error("Error fetching published homepage configuration, using default:", err);
    return getDefaultHomepageConfig();
  }
}

/**
 * Get draft configuration and metadata for the Admin Homepage Builder.
 */
export async function getHomepageDraftPayload(): Promise<HomepagePayload> {
  const defaultConfig = getDefaultHomepageConfig();

  try {
    const db = getDb();
    let record = await db.homepageConfiguration.findUnique({
      where: { pageKey: HOMEPAGE_PAGE_KEY },
    });

    if (!record) {
      // Seed initial default record if not yet present
      const initialJson = JSON.parse(JSON.stringify(defaultConfig)) as Prisma.InputJsonValue;
      record = await db.homepageConfiguration.create({
        data: {
          pageKey: HOMEPAGE_PAGE_KEY,
          draftConfig: initialJson,
          publishedConfig: initialJson,
          draftVersion: 1,
          publishedVersion: 1,
        },
      });
    }

    const normalizedDraft = validateAndNormalizeHomepageConfig(record.draftConfig);
    const draftConfig = normalizedDraft.success && normalizedDraft.data ? normalizedDraft.data : defaultConfig;

    // Check if draft has unpublished changes compared to publishedConfig
    const draftStr = JSON.stringify(record.draftConfig);
    const pubStr = JSON.stringify(record.publishedConfig);
    const hasUnpublishedChanges = draftStr !== pubStr;

    const meta: HomepageMeta = {
      draftVersion: record.draftVersion,
      publishedVersion: record.publishedVersion,
      updatedBy: record.updatedBy,
      publishedBy: record.publishedBy,
      publishedAt: record.publishedAt ? record.publishedAt.toISOString() : null,
      createdAt: record.createdAt ? record.createdAt.toISOString() : null,
      updatedAt: record.updatedAt ? record.updatedAt.toISOString() : null,
      hasUnpublishedChanges,
    };

    return {
      config: draftConfig,
      meta,
    };
  } catch (err: unknown) {
    console.error("Error fetching homepage draft payload, using default:", err);
    return {
      config: defaultConfig,
      meta: {
        draftVersion: 1,
        publishedVersion: 1,
        hasUnpublishedChanges: false,
      },
    };
  }
}

/**
 * Save configuration as a Draft without modifying the published homepage.
 */
export async function saveHomepageDraft(
  config: unknown,
  userId?: string
): Promise<{ success: boolean; config?: HomepageConfig; error?: string }> {
  const normalized = validateAndNormalizeHomepageConfig(config);
  if (!normalized.success || !normalized.data) {
    return { success: false, error: normalized.error || "Konfigurasi tidak valid." };
  }

  const validConfig = normalized.data;

  try {
    const db = getDb();
    const jsonValue = JSON.parse(JSON.stringify(validConfig)) as Prisma.InputJsonValue;

    await db.homepageConfiguration.upsert({
      where: { pageKey: HOMEPAGE_PAGE_KEY },
      create: {
        pageKey: HOMEPAGE_PAGE_KEY,
        draftConfig: jsonValue,
        publishedConfig: jsonValue,
        draftVersion: 1,
        publishedVersion: 1,
        updatedBy: userId,
      },
      update: {
        draftConfig: jsonValue,
        draftVersion: { increment: 1 },
        updatedBy: userId,
      },
    });

    return { success: true, config: validConfig };
  } catch (err: unknown) {
    console.error("Failed to save homepage draft:", err);
    const message = err instanceof Error ? err.message : "Gagal menyimpan draft homepage.";
    return { success: false, error: message };
  }
}

/**
 * Publish configuration to live public homepage.
 * Accepts either direct config to publish atomically or publishes the existing draft.
 */
export async function publishHomepageConfig(
  configOrUserId?: unknown,
  userId?: string
): Promise<{ success: boolean; config?: HomepageConfig; error?: string }> {
  try {
    let rawConfig: unknown = undefined;
    let authorId: string | undefined = userId;

    if (typeof configOrUserId === "string") {
      authorId = configOrUserId;
    } else if (configOrUserId && typeof configOrUserId === "object") {
      rawConfig = configOrUserId;
    }

    const db = getDb();

    if (!rawConfig) {
      const record = await db.homepageConfiguration.findUnique({
        where: { pageKey: HOMEPAGE_PAGE_KEY },
      });
      rawConfig = record?.draftConfig || getDefaultHomepageConfig();
    }

    const normalized = validateAndNormalizeHomepageConfig(rawConfig);
    if (!normalized.success || !normalized.data) {
      return { success: false, error: normalized.error || "Draft tidak valid untuk dipublikasikan." };
    }

    const validConfig = normalized.data;
    const validJson = JSON.parse(JSON.stringify(validConfig)) as Prisma.InputJsonValue;
    const now = new Date();

    await db.homepageConfiguration.upsert({
      where: { pageKey: HOMEPAGE_PAGE_KEY },
      create: {
        pageKey: HOMEPAGE_PAGE_KEY,
        draftConfig: validJson,
        publishedConfig: validJson,
        draftVersion: 1,
        publishedVersion: 1,
        publishedBy: authorId,
        updatedBy: authorId,
        publishedAt: now,
      },
      update: {
        draftConfig: validJson,
        publishedConfig: validJson,
        draftVersion: { increment: 1 },
        publishedVersion: { increment: 1 },
        publishedBy: authorId,
        updatedBy: authorId,
        publishedAt: now,
      },
    });

    return { success: true, config: validConfig };
  } catch (err: unknown) {
    console.error("Failed to publish homepage configuration:", err);
    const message = err instanceof Error ? err.message : "Gagal mempublikasikan homepage.";
    return { success: false, error: message };
  }
}

/**
 * Reset a single section to its default configuration in the draft.
 */
export async function resetHomepageSection(
  key: SectionKey,
  userId?: string
): Promise<{ success: boolean; config?: HomepageConfig; error?: string }> {
  const current = await getHomepageDraftPayload();
  const draft = current.config;

  const defaultSec = getDefaultSectionConfig(key);
  const updatedSections = draft.sections.map((s) => {
    if (s.key === key) {
      return {
        ...defaultSec,
        order: s.order, // preserve current position in list
        visible: s.visible, // preserve current visibility preference
      };
    }
    return s;
  });

  return saveHomepageDraft({ ...draft, sections: updatedSections }, userId);
}

/**
 * Reset layout (order and visibility) to default, while preserving custom section contents!
 */
export async function resetHomepageLayout(
  userId?: string
): Promise<{ success: boolean; config?: HomepageConfig; error?: string }> {
  const current = await getHomepageDraftPayload();
  const draft = current.config;

  // Map each section to its default order and default visibility, keeping custom settings
  const defaultMap = new Map(DEFAULT_HOMEPAGE_SECTIONS.map((s) => [s.key, s]));

  const updatedSections = draft.sections.map((sec) => {
    const def = defaultMap.get(sec.key);
    return {
      ...sec,
      visible: def ? def.visible : true,
      order: def ? def.order : 999,
    };
  });

  // Sort by default order
  updatedSections.sort((a, b) => a.order - b.order);
  updatedSections.forEach((s, idx) => {
    s.order = idx;
  });

  return saveHomepageDraft({ ...draft, sections: updatedSections }, userId);
}

/**
 * Reset all homepage sections, ordering, visibility, and settings to default.
 */
export async function resetHomepageAll(
  userId?: string
): Promise<{ success: boolean; config?: HomepageConfig; error?: string }> {
  const defaultConfig = getDefaultHomepageConfig();
  return saveHomepageDraft(defaultConfig, userId);
}
