import { z } from "zod";
import { HomepageConfig, SectionConfig, SectionKey } from "./types";
import { DEFAULT_HOMEPAGE_SECTIONS, getDefaultSectionConfig } from "./defaults";

const safeUrlSchema = z
  .string()
  .trim()
  .refine(
    (val) => {
      if (!val) return true;
      if (val.startsWith("/")) return true;
      try {
        const parsed = new URL(val);
        return parsed.protocol === "http:" || parsed.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "URL harus diawali dengan http://, https://, atau /path internal" }
  );

export const heroSettingsSchema = z.object({
  eyebrow: z.string().trim().max(100),
  title: z.string().trim().min(1, "Judul utama tidak boleh kosong").max(100),
  subtitle: z.string().trim().max(200),
  description: z.string().trim().max(1000),
  academicYear: z.string().trim().max(100),
  primaryButtonText: z.string().trim().max(50),
  primaryButtonUrl: safeUrlSchema,
  primaryButtonVisible: z.boolean(),
  secondaryButtonText: z.string().trim().max(50),
  secondaryButtonUrl: safeUrlSchema,
  secondaryButtonVisible: z.boolean(),
  showClassPills: z.boolean(),
  showBadges: z.boolean(),
});

export const statsSettingsSchema = z.object({
  title: z.string().trim().max(100),
  subtitle: z.string().trim().max(300),
  visibleCards: z.object({
    students: z.boolean(),
    subjects: z.boolean(),
    tasks: z.boolean(),
    materials: z.boolean(),
    achievements: z.boolean(),
    dailyNotes: z.boolean(),
  }),
});

export const scheduleSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(20),
  showRoom: z.boolean(),
  showLecturer: z.boolean(),
  buttonText: z.string().trim().max(50),
});

export const campusLinkItemSchema = z.object({
  id: z.string(),
  name: z.string().trim().min(1, "Nama link tidak boleh kosong").max(100),
  description: z.string().trim().max(300),
  url: safeUrlSchema,
  badge: z.string().trim().max(50),
  iconKey: z.enum(["mytelu", "lms", "igracias", "general"]),
  visible: z.boolean(),
});

export const campusLinksSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  links: z.array(campusLinkItemSchema),
});

export const tasksSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(20),
  showSubject: z.boolean(),
  showDeadline: z.boolean(),
  buttonText: z.string().trim().max(50),
});

export const materialsSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(20),
  buttonText: z.string().trim().max(50),
});

export const achievementsSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(20),
  layout: z.enum(["grid", "compact"]),
  buttonText: z.string().trim().max(50),
});

export const studentsSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(30),
  showMajor: z.boolean(),
  buttonText: z.string().trim().max(50),
});

export const gallerySettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(24),
  buttonText: z.string().trim().max(50),
});

export const dailyNotesSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  maxItems: z.number().int().min(1).max(20),
  buttonText: z.string().trim().max(50),
});

export const aboutSettingsSchema = z.object({
  title: z.string().trim().max(100),
  description: z.string().trim().max(300),
  showVision: z.boolean(),
  showLeaders: z.boolean(),
  buttonText: z.string().trim().max(50),
});

const sectionSchemas: Record<SectionKey, z.ZodTypeAny> = {
  hero: heroSettingsSchema,
  stats: statsSettingsSchema,
  today_schedule: scheduleSettingsSchema,
  campus_links: campusLinksSettingsSchema,
  upcoming_tasks: tasksSettingsSchema,
  materials: materialsSettingsSchema,
  achievements: achievementsSettingsSchema,
  students: studentsSettingsSchema,
  gallery: gallerySettingsSchema,
  daily_notes: dailyNotesSettingsSchema,
  about: aboutSettingsSchema,
};

export function validateSectionSettings(key: SectionKey, settings: unknown) {
  const schema = sectionSchemas[key];
  if (!schema) {
    throw new Error(`Schema not found for section key ${key}`);
  }
  return schema.safeParse(settings);
}

export function normalizeHomepageConfig(config: HomepageConfig): HomepageConfig {
  const sorted = [...config.sections].sort((a, b) => a.order - b.order);
  const normalized = sorted.map((s, idx) => ({
    ...s,
    order: idx,
  }));
  return {
    ...config,
    sections: normalized,
  };
}

export function validateHomepageConfig(raw: unknown): {
  success: boolean;
  data?: HomepageConfig;
  error?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { success: false, error: "Konfigurasi homepage tidak valid." };
  }

  const obj = raw as Record<string, unknown>;
  const version = typeof obj.version === "number" ? obj.version : 1;
  const rawSections = Array.isArray(obj.sections) ? obj.sections : [];

  const seenKeys = new Set<string>();
  const validatedSections: SectionConfig[] = [];

  for (const rawSec of rawSections) {
    if (!rawSec || typeof rawSec !== "object") {
      return { success: false, error: "Terdapat section yang tidak valid." };
    }
    const key = (rawSec as { key?: unknown }).key;
    if (typeof key !== "string") {
      return { success: false, error: "Key section tidak boleh kosong." };
    }

    if (seenKeys.has(key)) {
      return { success: false, error: `Section key duplikat terdeteksi: ${key}` };
    }
    seenKeys.add(key);

    const validKey = key as SectionKey;
    const schema = sectionSchemas[validKey];
    if (!schema) {
      return { success: false, error: `Section key tidak dikenal: ${key}` };
    }

    const settingsVal = schema.safeParse((rawSec as { settings?: unknown }).settings);
    if (!settingsVal.success) {
      const issue = settingsVal.error.issues[0]?.message || "Pengaturan section tidak valid.";
      return {
        success: false,
        error: `Pengaturan section "${key}" tidak valid: ${issue}`,
      };
    }

    const defaultSec = getDefaultSectionConfig(validKey);
    validatedSections.push({
      key: validKey,
      label: typeof (rawSec as { label?: unknown }).label === "string" ? (rawSec as { label: string }).label : defaultSec.label,
      description: typeof (rawSec as { description?: unknown }).description === "string" ? (rawSec as { description: string }).description : defaultSec.description,
      visible: typeof (rawSec as { visible?: unknown }).visible === "boolean" ? (rawSec as { visible: boolean }).visible : defaultSec.visible,
      order: typeof (rawSec as { order?: unknown }).order === "number" ? (rawSec as { order: number }).order : defaultSec.order,
      settings: settingsVal.data as SectionConfig["settings"],
    });
  }

  return {
    success: true,
    data: normalizeHomepageConfig({
      version,
      sections: validatedSections,
    }),
  };
}

export function validateAndNormalizeHomepageConfig(raw: unknown): {
  success: boolean;
  data?: HomepageConfig;
  error?: string;
} {
  if (!raw || typeof raw !== "object") {
    return { success: false, error: "Konfigurasi homepage tidak valid." };
  }

  const obj = raw as Record<string, unknown>;
  const version = typeof obj.version === "number" ? obj.version : 1;
  const rawSections = Array.isArray(obj.sections) ? obj.sections : [];

  const seenKeys = new Set<string>();
  const validSections: SectionConfig[] = [];

  // Sort input by order if present
  const sortedRaw = [...rawSections].sort((a, b) => {
    const orderA = typeof a?.order === "number" ? a.order : 999;
    const orderB = typeof b?.order === "number" ? b.order : 999;
    return orderA - orderB;
  });

  for (const rawSec of sortedRaw) {
    if (!rawSec || typeof rawSec !== "object") continue;
    const key = (rawSec as { key?: unknown }).key;
    if (typeof key !== "string") continue;

    // Reject duplicates
    if (seenKeys.has(key)) {
      return { success: false, error: `Section key duplikat terdeteksi: ${key}` };
    }

    // Check if key is registered in our defaults
    const validKey = key as SectionKey;
    const schema = sectionSchemas[validKey];
    if (!schema) {
      // Safely ignore unknown legacy section keys without crashing
      continue;
    }

    seenKeys.add(key);

    const defaultSec = getDefaultSectionConfig(validKey);
    const label = typeof (rawSec as { label?: unknown }).label === "string" ? (rawSec as { label: string }).label : defaultSec.label;
    const description =
      typeof (rawSec as { description?: unknown }).description === "string"
        ? (rawSec as { description: string }).description
        : defaultSec.description;
    const visible = typeof (rawSec as { visible?: unknown }).visible === "boolean" ? (rawSec as { visible: boolean }).visible : defaultSec.visible;

    // Validate settings with fallback to default if malformed
    const settingsVal = schema.safeParse((rawSec as { settings?: unknown }).settings);
    const settings = settingsVal.success ? settingsVal.data : defaultSec.settings;

    validSections.push({
      key: validKey,
      label,
      description,
      visible,
      order: validSections.length,
      settings: settings as SectionConfig["settings"],
    });
  }

  // Ensure all registered sections exist (add missing ones at the end with defaults)
  for (const defaultSec of DEFAULT_HOMEPAGE_SECTIONS) {
    if (!seenKeys.has(defaultSec.key)) {
      validSections.push({
        ...defaultSec,
        order: validSections.length,
      });
      seenKeys.add(defaultSec.key);
    }
  }

  // Final sequential re-ordering
  validSections.forEach((s, idx) => {
    s.order = idx;
  });

  return {
    success: true,
    data: {
      version,
      sections: validSections,
    },
  };
}

