import { z } from "zod";
import {
  UserRole,
  DayOfWeek,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
} from "@prisma/client";

// URL validation helper allowing empty strings
const optionalUrl = z
  .string()
  .trim()
  .refine((val) => val === "" || /^https?:\/\/.+/i.test(val), {
    message: "Must be a valid URL starting with http:// or https://",
  })
  .optional()
  .nullable();

// 1. Auth Schemas
export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});
export type LoginInput = z.infer<typeof loginSchema>;

// 2. User Schemas (Admin only)
export const userCreateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.nativeEnum(UserRole, {
    message: "Please select a valid role",
  }),
  isActive: z.boolean().default(true),
});
export type UserCreateInput = z.infer<typeof userCreateSchema>;

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z
    .string()
    .optional()
    .refine((val) => !val || val.length >= 8, {
      message: "Password must be at least 8 characters if provided",
    }),
  role: z.nativeEnum(UserRole),
  isActive: z.boolean(),
});
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;

// 3. Student Schemas
export const studentSchema = z.object({
  name: z.string().trim().min(2, "Full name is required (min 2 characters)"),
  studentNumber: z
    .string()
    .trim()
    .optional()
    .nullable()
    .transform((val) => (val === "" ? null : val)),
  major: z.string().trim().min(2, "Major is required"),
  photoUrl: optionalUrl,
  bio: z.string().trim().max(1000).optional().nullable(),
  dream: z.string().trim().max(255).optional().nullable(),
  motivation: z.string().trim().max(1000).optional().nullable(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
});
export type StudentInput = z.infer<typeof studentSchema>;

// 4. Subject Schemas
export const subjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Subject code is required (e.g. CS101)")
    .toUpperCase(),
  name: z.string().trim().min(2, "Subject name is required"),
  description: z.string().trim().max(1000).optional().nullable(),
  lecturerName: z.string().trim().max(200).optional().nullable(),
});
export type SubjectInput = z.infer<typeof subjectSchema>;

// 5. Schedule Schemas
export const scheduleSchema = z
  .object({
    subjectId: z.string().min(1, "Please select a subject"),
    dayOfWeek: z.nativeEnum(DayOfWeek, {
      message: "Please select a day of the week",
    }),
    startTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Start time must be HH:MM format (e.g. 08:00)"),
    endTime: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "End time must be HH:MM format (e.g. 10:30)"),
    room: z.string().trim().min(1, "Room/location is required (e.g. Lab 402 or Online)"),
    lecturerName: z.string().trim().optional().nullable(),
    notes: z.string().trim().max(500).optional().nullable(),
  })
  .refine(
    (data) => {
      return data.startTime < data.endTime;
    },
    {
      message: "Start time must be earlier than end time",
      path: ["endTime"],
    }
  );
export type ScheduleInput = z.infer<typeof scheduleSchema>;

// 6. Task Schemas
export const taskSchema = z.object({
  subjectId: z.string().min(1, "Please select a subject"),
  title: z.string().trim().min(3, "Task title must be at least 3 characters"),
  description: z.string().trim().max(3000).optional().nullable(),
  deadline: z.string().min(1, "Deadline date and time is required"),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.UPCOMING),
});
export type TaskInput = z.infer<typeof taskSchema>;

// 7. Achievement Schemas
export const achievementSchema = z.object({
  title: z.string().trim().min(3, "Achievement title is required"),
  description: z.string().trim().max(2000).optional().nullable(),
  category: z.nativeEnum(AchievementCategory, {
    message: "Please select a valid achievement category",
  }),
  achievementDate: z.string().min(1, "Achievement date is required"),
  organization: z.string().trim().max(200).optional().nullable(),
  location: z.string().trim().max(200).optional().nullable(),
  badgeIconUrl: optionalUrl,
  imageUrl: optionalUrl,
  studentIds: z.array(z.string()).default([]),
});
export type AchievementInput = z.infer<typeof achievementSchema>;

// 8. Announcement Schemas
export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Announcement title is required"),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  imageUrl: optionalUrl,
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

// 9. Gallery Schemas
export const gallerySchema = z.object({
  title: z.string().trim().min(2, "Photo title is required"),
  description: z.string().trim().max(1000).optional().nullable(),
  imageUrl: z.string().trim().min(1, "Image URL or upload is required"),
  eventDate: z.string().optional().nullable(),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

// 10. Resource Schemas
export const resourceSchema = z.object({
  title: z.string().trim().min(2, "Resource title is required"),
  description: z.string().trim().max(1000).optional().nullable(),
  url: z
    .string()
    .trim()
    .regex(/^https?:\/\/.+/i, "Must be a valid URL starting with http:// or https://"),
  category: z.nativeEnum(ResourceCategory, {
    message: "Please select a valid resource category",
  }),
});
export type ResourceInput = z.infer<typeof resourceSchema>;

// 11. Class Event Schema
export const classEventSchema = z.object({
  title: z.string().trim().min(2, "Event title is required").max(200),
  description: z.string().trim().max(2000).optional(),
  eventDate: z.coerce.date({
    message: "Valid event date is required",
  }),
  startTime: z.string().trim().optional(),
  endTime: z.string().trim().optional(),
  location: z.string().trim().max(200).optional(),
  imageUrl: optionalUrl,
});
export type ClassEventInput = z.infer<typeof classEventSchema>;

// 12. Settings Schema
export const settingsSchema = z.object({
  className: z.string().trim().min(2, "Class name is required"),
  institutionName: z.string().trim().max(200).optional(),
  classDescription: z.string().trim().max(1000).optional(),
  academicYear: z.string().trim().min(4, "Academic year is required (e.g. 2026/2027)"),
  contactEmail: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  discordUrl: optionalUrl,
  classMotto: z.string().trim().max(200).optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;
