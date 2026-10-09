import prisma from "@/lib/db";
import { HomepageConfig, HomepageMeta, HomepagePayload, SectionKey } from "./types";
import { getDefaultHomepageConfig, getDefaultSectionConfig, DEFAULT_HOMEPAGE_SECTIONS } from "./defaults";
import { validateAndNormalizeHomepageConfig } from "./validation";
import { Prisma } from "@prisma/client";

const HOMEPAGE_PAGE_KEY = "home";

interface StoredHomepageData {
  draftConfig: unknown;
  publishedConfig: unknown;
  draftVersion: number;
  publishedVersion: number;
  updatedBy?: string | null;
  publishedBy?: string | null;
  publishedAt?: Date | null;
  createdAt?: Date | null;
  updatedAt?: Date | null;
}

/**
 * Robust database reader:
 * 1. Attempts reading from homepageConfiguration model
 * 2. Falls back to Setting table (key: 'homepage_draft' / 'homepage_published' / 'homepage_meta')
 */
async function loadStoredHomepageData(): Promise<StoredHomepageData | null> {
  const db = prisma as unknown as {
    homepageConfiguration?: {
      findUnique: (args: { where: { pageKey: string } }) => Promise<StoredHomepageData | null>;
    };
    setting?: {
      findUnique: (args: { where: { key: string } }) => Promise<{ key: string; value: string } | null>;
    };
  };

  // 1. Try homepageConfiguration model if present on the active Prisma client
  if (db && db.homepageConfiguration && typeof db.homepageConfiguration.findUnique === "function") {
    try {
      const record = await db.homepageConfiguration.findUnique({
        where: { pageKey: HOMEPAGE_PAGE_KEY },
      });
      if (record) {
        return record;
      }
    } catch (err) {
      console.warn("homepageConfiguration query warning, checking Setting fallback:", err);
    }
  }

  // 2. Fallback to Setting table (available in every PrismaClient instance)
  if (db && db.setting && typeof db.setting.findUnique === "function") {
    try {
      const [draftRow, pubRow, metaRow] = await Promise.all([
        db.setting.findUnique({ where: { key: "homepage_draft" } }),
        db.setting.findUnique({ where: { key: "homepage_published" } }),
        db.setting.findUnique({ where: { key: "homepage_meta" } }),
      ]);

      if (!draftRow && !pubRow) {
        return null;
      }

      let meta: { draftVersion?: number; publishedVersion?: number; publishedAt?: string } = {};
      if (metaRow?.value) {
        try {
          meta = JSON.parse(metaRow.value);
        } catch {}
      }

      let draftConfig: unknown = null;
      let publishedConfig: unknown = null;

      if (draftRow?.value) {
        try {
          draftConfig = JSON.parse(draftRow.value);
        } catch {}
      }
      if (pubRow?.value) {
        try {
          publishedConfig = JSON.parse(pubRow.value);
        } catch {}
      }

      return {
        draftConfig: draftConfig || publishedConfig,
        publishedConfig: publishedConfig || draftConfig,
        draftVersion: typeof meta.draftVersion === "number" ? meta.draftVersion : 1,
        publishedVersion: typeof meta.publishedVersion === "number" ? meta.publishedVersion : 1,
        publishedAt: meta.publishedAt ? new Date(meta.publishedAt) : null,
        updatedBy: null,
        publishedBy: null,
        createdAt: null,
        updatedAt: null,
      };
    } catch (err) {
      console.error("Error loading fallback homepage settings:", err);
    }
  }

  return null;
}

/**
 * Robust database writer:
 * 1. Upserts to homepageConfiguration model if present
 * 2. Also persists to Setting table (guarantees persistence across HMR/stale client)
 */
async function storeHomepageData(data: {
  draftConfig: unknown;
  publishedConfig: unknown;
  draftVersion: number;
  publishedVersion: number;
  authorId?: string;
  isPublishing?: boolean;
}): Promise<void> {
  const db = prisma as unknown as {
    homepageConfiguration?: {
      upsert: (args: unknown) => Promise<unknown>;
    };
    setting?: {
      upsert: (args: {
        where: { key: string };
        create: { key: string; value: string };
        update: { value: string };
      }) => Promise<unknown>;
    };
  };

  const now = new Date();
  const draftJson = JSON.parse(JSON.stringify(data.draftConfig)) as Prisma.InputJsonValue;
  const pubJson = JSON.parse(JSON.stringify(data.publishedConfig)) as Prisma.InputJsonValue;

  // 1. Try writing to homepageConfiguration model
  if (db && db.homepageConfiguration && typeof db.homepageConfiguration.upsert === "function") {
    try {
      await db.homepageConfiguration.upsert({
        where: { pageKey: HOMEPAGE_PAGE_KEY },
        create: {
          pageKey: HOMEPAGE_PAGE_KEY,
          draftConfig: draftJson,
          publishedConfig: pubJson,
          draftVersion: data.draftVersion,
          publishedVersion: data.publishedVersion,
          updatedBy: data.authorId,
          publishedBy: data.isPublishing ? data.authorId : undefined,
          publishedAt: data.isPublishing ? now : undefined,
        },
        update: {
          draftConfig: draftJson,
          publishedConfig: pubJson,
          draftVersion: data.draftVersion,
          publishedVersion: data.publishedVersion,
          updatedBy: data.authorId,
          ...(data.isPublishing ? { publishedBy: data.authorId, publishedAt: now } : {}),
        },
      });
    } catch (err) {
      console.warn("homepageConfiguration upsert warning, saving to Setting fallback:", err);
    }
  }

  // 2. Persist to Setting table (failsafe backup)
  if (db && db.setting && typeof db.setting.upsert === "function") {
    try {
      const metaString = JSON.stringify({
        draftVersion: data.draftVersion,
        publishedVersion: data.publishedVersion,
        publishedAt: data.isPublishing ? now.toISOString() : undefined,
      });

      await Promise.all([
        db.setting.upsert({
          where: { key: "homepage_draft" },
          create: { key: "homepage_draft", value: JSON.stringify(data.draftConfig) },
          update: { value: JSON.stringify(data.draftConfig) },
        }),
        db.setting.upsert({
          where: { key: "homepage_published" },
          create: { key: "homepage_published", value: JSON.stringify(data.publishedConfig) },
          update: { value: JSON.stringify(data.publishedConfig) },
        }),
        db.setting.upsert({
          where: { key: "homepage_meta" },
          create: { key: "homepage_meta", value: metaString },
          update: { value: metaString },
        }),
      ]);
    } catch (err) {
      console.error("Failed to persist homepage Setting fallback:", err);
    }
  }
}

/**
 * Get the currently published homepage configuration for public pages.
 */
export async function getHomepagePublishedConfig(): Promise<HomepageConfig> {
  try {
    const record = await loadStoredHomepageData();
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
    let record = await loadStoredHomepageData();

    if (!record) {
      // Seed initial default record if not yet present
      await storeHomepageData({
        draftConfig: defaultConfig,
        publishedConfig: defaultConfig,
        draftVersion: 1,
        publishedVersion: 1,
      });

      record = await loadStoredHomepageData();
    }

    const rawDraft = record?.draftConfig || defaultConfig;
    const rawPublished = record?.publishedConfig || defaultConfig;

    const normalizedDraft = validateAndNormalizeHomepageConfig(rawDraft);
    const draftConfig =
      normalizedDraft.success && normalizedDraft.data ? normalizedDraft.data : defaultConfig;

    // Check if draft has unpublished changes compared to publishedConfig
    const draftStr = JSON.stringify(rawDraft);
    const pubStr = JSON.stringify(rawPublished);
    const hasUnpublishedChanges = draftStr !== pubStr;

    const meta: HomepageMeta = {
      draftVersion: record?.draftVersion || 1,
      publishedVersion: record?.publishedVersion || 1,
      updatedBy: record?.updatedBy,
      publishedBy: record?.publishedBy,
      publishedAt: record?.publishedAt ? new Date(record.publishedAt).toISOString() : null,
      createdAt: record?.createdAt ? new Date(record.createdAt).toISOString() : null,
      updatedAt: record?.updatedAt ? new Date(record.updatedAt).toISOString() : null,
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
    const current = await loadStoredHomepageData();
    const currentPublished = current?.publishedConfig || getDefaultHomepageConfig();
    const nextDraftVersion = (current?.draftVersion || 1) + 1;
    const currentPubVersion = current?.publishedVersion || 1;

    await storeHomepageData({
      draftConfig: validConfig,
      publishedConfig: currentPublished,
      draftVersion: nextDraftVersion,
      publishedVersion: currentPubVersion,
      authorId: userId,
      isPublishing: false,
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

    if (!rawConfig) {
      const current = await loadStoredHomepageData();
      rawConfig = current?.draftConfig || getDefaultHomepageConfig();
    }

    const normalized = validateAndNormalizeHomepageConfig(rawConfig);
    if (!normalized.success || !normalized.data) {
      return { success: false, error: normalized.error || "Draft tidak valid untuk dipublikasikan." };
    }

    const validConfig = normalized.data;
    const current = await loadStoredHomepageData();
    const nextDraftVersion = (current?.draftVersion || 1) + 1;
    const nextPubVersion = (current?.publishedVersion || 1) + 1;

    await storeHomepageData({
      draftConfig: validConfig,
      publishedConfig: validConfig,
      draftVersion: nextDraftVersion,
      publishedVersion: nextPubVersion,
      authorId,
      isPublishing: true,
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
