export type SectionKey =
  | "hero"
  | "stats"
  | "today_schedule"
  | "campus_links"
  | "upcoming_tasks"
  | "materials"
  | "achievements"
  | "students"
  | "gallery"
  | "daily_notes"
  | "about";

export interface HeroSettings {
  eyebrow: string;
  title: string;
  subtitle: string;
  description: string;
  academicYear: string;
  primaryButtonText: string;
  primaryButtonUrl: string;
  primaryButtonVisible: boolean;
  secondaryButtonText: string;
  secondaryButtonUrl: string;
  secondaryButtonVisible: boolean;
  showClassPills: boolean;
  showBadges: boolean;
}

export interface StatsSettings {
  title: string;
  subtitle: string;
  visibleCards: {
    students: boolean;
    subjects: boolean;
    tasks: boolean;
    materials: boolean;
    achievements: boolean;
    dailyNotes: boolean;
  };
}

export interface ScheduleSettings {
  title: string;
  description: string;
  maxItems: number;
  showRoom: boolean;
  showLecturer: boolean;
  buttonText: string;
}

export interface CampusLinkItem {
  id: string;
  name: string;
  description: string;
  url: string;
  badge: string;
  iconKey: "mytelu" | "lms" | "igracias" | "general";
  visible: boolean;
}

export interface CampusLinksSettings {
  title: string;
  description: string;
  links: CampusLinkItem[];
}

export interface TasksSettings {
  title: string;
  description: string;
  maxItems: number;
  showSubject: boolean;
  showDeadline: boolean;
  buttonText: string;
}

export interface MaterialsSettings {
  title: string;
  description: string;
  maxItems: number;
  buttonText: string;
}

export interface AchievementsSettings {
  title: string;
  description: string;
  maxItems: number;
  layout: "grid" | "compact";
  buttonText: string;
}

export interface StudentsSettings {
  title: string;
  description: string;
  maxItems: number;
  showMajor: boolean;
  buttonText: string;
}

export interface GallerySettings {
  title: string;
  description: string;
  maxItems: number;
  buttonText: string;
}

export interface DailyNotesSettings {
  title: string;
  description: string;
  maxItems: number;
  buttonText: string;
}

export interface AboutSettings {
  title: string;
  description: string;
  showVision: boolean;
  showLeaders: boolean;
  buttonText: string;
}

export type SectionSettingsMap = {
  hero: HeroSettings;
  stats: StatsSettings;
  today_schedule: ScheduleSettings;
  campus_links: CampusLinksSettings;
  upcoming_tasks: TasksSettings;
  materials: MaterialsSettings;
  achievements: AchievementsSettings;
  students: StudentsSettings;
  gallery: GallerySettings;
  daily_notes: DailyNotesSettings;
  about: AboutSettings;
};

export interface SectionConfig<K extends SectionKey = SectionKey> {
  key: K;
  label: string;
  description: string;
  visible: boolean;
  order: number;
  settings: SectionSettingsMap[K];
}

export interface HomepageConfig {
  version: number;
  sections: SectionConfig[];
}

export interface HomepageMeta {
  draftVersion: number;
  publishedVersion: number;
  updatedBy?: string | null;
  publishedBy?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  hasUnpublishedChanges: boolean;
}

export interface HomepagePayload {
  config: HomepageConfig;
  meta: HomepageMeta;
}
