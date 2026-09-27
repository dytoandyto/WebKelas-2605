import { UserRole } from "@prisma/client";

export type Permission =
  | "USERS_MANAGE"
  | "SETTINGS_MANAGE"
  | "SUBJECTS_MANAGE"
  | "STUDENTS_MANAGE"
  | "SCHEDULES_MANAGE"
  | "TASKS_MANAGE"
  | "MATERIALS_MANAGE"
  | "DAILY_NOTES_MANAGE"
  | "ACHIEVEMENTS_MANAGE"
  | "ANNOUNCEMENTS_MANAGE"
  | "EVENTS_MANAGE"
  | "GALLERY_MANAGE"
  | "RESOURCES_MANAGE"
  | "LOGS_VIEW"
  | "VIEW_ADMIN";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  ADMIN: [
    "VIEW_ADMIN",
    "USERS_MANAGE",
    "SETTINGS_MANAGE",
    "SUBJECTS_MANAGE",
    "STUDENTS_MANAGE",
    "SCHEDULES_MANAGE",
    "TASKS_MANAGE",
    "MATERIALS_MANAGE",
    "DAILY_NOTES_MANAGE",
    "ACHIEVEMENTS_MANAGE",
    "ANNOUNCEMENTS_MANAGE",
    "EVENTS_MANAGE",
    "GALLERY_MANAGE",
    "RESOURCES_MANAGE",
    "LOGS_VIEW",
  ],
  CLASS_ADMIN: [
    "VIEW_ADMIN",
    "SUBJECTS_MANAGE",
    "STUDENTS_MANAGE",
    "SCHEDULES_MANAGE",
    "TASKS_MANAGE",
    "MATERIALS_MANAGE",
    "DAILY_NOTES_MANAGE",
    "ACHIEVEMENTS_MANAGE",
    "ANNOUNCEMENTS_MANAGE",
    "EVENTS_MANAGE",
    "GALLERY_MANAGE",
    "RESOURCES_MANAGE",
    "LOGS_VIEW",
  ],
  LECTURER: [
    "VIEW_ADMIN",
    "SUBJECTS_MANAGE",
    "SCHEDULES_MANAGE",
    "TASKS_MANAGE",
    "MATERIALS_MANAGE",
    "DAILY_NOTES_MANAGE",
    "ANNOUNCEMENTS_MANAGE",
    "EVENTS_MANAGE",
  ],
  ASSISTANT: [
    "VIEW_ADMIN",
    "SCHEDULES_MANAGE",
    "TASKS_MANAGE",
    "MATERIALS_MANAGE",
    "DAILY_NOTES_MANAGE",
    "ACHIEVEMENTS_MANAGE",
    "ANNOUNCEMENTS_MANAGE",
    "EVENTS_MANAGE",
    "GALLERY_MANAGE",
  ],
};

export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role];
  return Boolean(permissions?.includes(permission));
}

export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}
