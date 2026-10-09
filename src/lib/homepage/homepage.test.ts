import { describe, it, expect } from "vitest";
import { getDefaultHomepageConfig, getDefaultSectionConfig } from "./defaults";
import { validateHomepageConfig, normalizeHomepageConfig } from "./validation";
import { SECTION_REGISTRY } from "./registry";
import { SectionConfig, HomepageConfig, HeroSettings, CampusLinksSettings, StatsSettings } from "./types";
import { hasPermission } from "@/lib/permissions";
import { UserRole } from "@prisma/client";

describe("Homepage CMS - Configuration & Defaults Tests", () => {
  it("generates a valid default homepage configuration", () => {
    const config = getDefaultHomepageConfig();

    expect(config.version).toBe(1);
    expect(config.sections.length).toBe(11);

    const keys = config.sections.map((s) => s.key);
    const uniqueKeys = new Set(keys);
    expect(uniqueKeys.size).toBe(keys.length);

    // Verify all keys exist in registry
    keys.forEach((key) => {
      expect(SECTION_REGISTRY[key]).toBeDefined();
    });

    // Verify ordering starts from 0 and is sequential
    config.sections.forEach((s, idx) => {
      expect(s.order).toBe(idx);
    });
  });

  it("ensures hero defaults contain correct class identity and safe links", () => {
    const hero = getDefaultSectionConfig("hero");
    const settings = hero.settings as HeroSettings;

    expect(settings.title).toBe("JS1SI-26-REG-05");
    expect(settings.eyebrow).toBe("Ruang Digital Kelas");
    expect(settings.primaryButtonUrl).toMatch(/^\//);
    expect(settings.secondaryButtonUrl).toMatch(/^\//);
    expect(settings.primaryButtonUrl).not.toContain("javascript:");
  });

  it("ensures campus links contain valid Tel-U URLs with https", () => {
    const campus = getDefaultSectionConfig("campus_links");
    const settings = campus.settings as CampusLinksSettings;

    expect(settings.links.length).toBeGreaterThanOrEqual(3);
    settings.links.forEach((link) => {
      expect(link.url).toMatch(/^https:\/\//);
      expect(link.url).not.toContain("javascript:");
    });
  });
});

describe("Homepage CMS - Validation & Normalization Tests", () => {
  it("passes validation for valid default configuration", () => {
    const config = getDefaultHomepageConfig();
    const result = validateHomepageConfig(config);

    expect(result.success).toBe(true);
    expect(result.data?.sections.length).toBe(11);
  });

  it("rejects configuration with duplicate section keys", () => {
    const valid = getDefaultHomepageConfig();
    const duplicateConfig: HomepageConfig = {
      version: 1,
      sections: [
        ...valid.sections,
        {
          ...valid.sections[0],
          order: 12,
        },
      ],
    };

    const result = validateHomepageConfig(duplicateConfig);
    expect(result.success).toBe(false);
    expect(result.error).toContain("duplikat");
  });

  it("rejects dangerous javascript: URLs in hero button", () => {
    const valid = getDefaultHomepageConfig();
    const maliciousConfig: HomepageConfig = {
      ...valid,
      sections: valid.sections.map((s) => {
        if (s.key === "hero") {
          return {
            ...s,
            settings: {
              ...s.settings,
              primaryButtonUrl: "javascript:alert('xss')",
            },
          };
        }
        return s;
      }),
    };

    const result = validateHomepageConfig(maliciousConfig);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tidak valid|protokol/i);
  });

  it("rejects dangerous javascript: URLs in campus links", () => {
    const valid = getDefaultHomepageConfig();
    const maliciousConfig: HomepageConfig = {
      ...valid,
      sections: valid.sections.map((s) => {
        if (s.key === "campus_links") {
          return {
            ...s,
            settings: {
              ...(s.settings as CampusLinksSettings),
              links: [
                {
                  id: "hack",
                  name: "Exploit",
                  description: "test",
                  badge: "test",
                  iconKey: "general" as const,
                  url: "javascript:document.cookie",
                  visible: true,
                },
              ],
            },
          };
        }
        return s;
      }),
    };

    const result = validateHomepageConfig(maliciousConfig);
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/tidak valid|protokol/i);
  });

  it("normalizes non-sequential or conflicting order values sequentially", () => {
    const valid = getDefaultHomepageConfig();
    const scrambledConfig: HomepageConfig = {
      ...valid,
      sections: [
        { ...valid.sections[3], order: 99 },
        { ...valid.sections[1], order: 5 },
        { ...valid.sections[0], order: 2 },
      ],
    };

    const normalized = normalizeHomepageConfig(scrambledConfig);
    expect(normalized.sections[0].order).toBe(0);
    expect(normalized.sections[1].order).toBe(1);
    expect(normalized.sections[2].order).toBe(2);
    // Keys preserve the sorted order by initial order
    expect(normalized.sections[0].key).toBe(valid.sections[0].key);
    expect(normalized.sections[1].key).toBe(valid.sections[1].key);
    expect(normalized.sections[2].key).toBe(valid.sections[3].key);
  });
});

describe("Homepage CMS - Reset Operations Logic Tests", () => {
  it("resets a single section to defaults while preserving other customized sections", () => {
    const original = getDefaultHomepageConfig();

    // Customize hero and upcoming_tasks
    const customizedSections = original.sections.map((s) => {
      if (s.key === "hero") {
        return {
          ...s,
          settings: {
            ...s.settings,
            title: "Customized Class Name",
          },
        };
      }
      if (s.key === "upcoming_tasks") {
        return {
          ...s,
          settings: {
            ...s.settings,
            title: "Customized Tasks Title",
          },
        };
      }
      return s;
    });

    // Reset only hero
    const defaultHero = getDefaultSectionConfig("hero");
    const afterReset = customizedSections.map((s) =>
      s.key === "hero" ? { ...defaultHero, order: s.order, visible: s.visible } : s
    );

    const heroAfter = afterReset.find((s) => s.key === "hero");
    const tasksAfter = afterReset.find((s) => s.key === "upcoming_tasks");

    // Hero settings should be back to default
    expect((heroAfter?.settings as HeroSettings).title).toBe("JS1SI-26-REG-05");
    // Tasks settings should remain customized
    expect((tasksAfter?.settings as { title?: string }).title).toBe("Customized Tasks Title");
  });

  it("resets layout (order and visibility) while preserving customized section content", () => {
    const original = getDefaultHomepageConfig();
    const defaultMap = new Map(original.sections.map((s) => [s.key, s]));

    // Admin swapped order, hid a section, and customized text
    const defaultStats = getDefaultSectionConfig("stats");
    const defaultHero = getDefaultSectionConfig("hero");
    const customizedSections: SectionConfig[] = [
      {
        ...defaultStats,
        visible: false, // Changed visibility
        order: 0, // Swapped order
        settings: {
          ...defaultStats.settings,
          title: "Statistik Kelas JS1SI",
        },
      },
      {
        ...defaultHero,
        visible: true,
        order: 1, // Swapped order
        settings: {
          ...defaultHero.settings,
          title: "Kelas Unggulan 2026",
        },
      },
    ];

    // Reset Layout operation
    const resetLayout = customizedSections.map((s) => {
      const def = defaultMap.get(s.key);
      return {
        ...s,
        order: def ? def.order : s.order,
        visible: def ? def.visible : s.visible,
      };
    });

    const hero = resetLayout.find((s) => s.key === "hero");
    const stats = resetLayout.find((s) => s.key === "stats");

    // Order and visibility are restored to default
    expect(hero?.order).toBe(0);
    expect(hero?.visible).toBe(true);
    expect(stats?.order).toBe(1);
    expect(stats?.visible).toBe(true);

    // Custom text is PRESERVED
    expect((hero?.settings as HeroSettings).title).toBe("Kelas Unggulan 2026");
    expect((stats?.settings as StatsSettings).title).toBe("Statistik Kelas JS1SI");
  });
});

describe("Homepage CMS - Authorization Tests", () => {
  it("grants SETTINGS_MANAGE only to ADMIN", () => {
    expect(hasPermission(UserRole.ADMIN, "SETTINGS_MANAGE")).toBe(true);
  });

  it("denies SETTINGS_MANAGE to CLASS_ADMIN, LECTURER, ASSISTANT, and unauthenticated users", () => {
    expect(hasPermission(UserRole.CLASS_ADMIN, "SETTINGS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.LECTURER, "SETTINGS_MANAGE")).toBe(false);
    expect(hasPermission(UserRole.ASSISTANT, "SETTINGS_MANAGE")).toBe(false);
    expect(hasPermission(null, "SETTINGS_MANAGE")).toBe(false);
    expect(hasPermission(undefined, "SETTINGS_MANAGE")).toBe(false);
  });
});

describe("Homepage CMS - Storage & Persistence Tests", () => {
  it("saves draft and publishes configuration successfully without crashing", async () => {
    const {
      saveHomepageDraft,
      publishHomepageConfig,
      getHomepageDraftPayload,
      getHomepagePublishedConfig,
    } = await import("./storage");

    const config = getDefaultHomepageConfig();
    const saveRes = await saveHomepageDraft(config, "test-user");
    expect(saveRes.success).toBe(true);

    const pubRes = await publishHomepageConfig(config, "test-user");
    expect(pubRes.success).toBe(true);

    const published = await getHomepagePublishedConfig();
    expect(published.sections.length).toBe(11);

    const draft = await getHomepageDraftPayload();
    expect(draft.config.sections.length).toBe(11);
  }, 15000);
});
