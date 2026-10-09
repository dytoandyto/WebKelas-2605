import { z } from "zod";
import {
  UserRole,
  DayOfWeek,
  TaskType,
  MaterialType,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
} from "@prisma/client";

// URL validation helper allowing empty strings and auto-formatting domain-only URLs
export const optionalUrl = z
  .string()
  .trim()
  .transform((val) => {
    if (!val) return val;
    // Auto-prepend https:// if user pasted domain without scheme (e.g. drive.google.com/...)
    if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/i.test(val) && !/^https?:\/\//i.test(val)) {
      return `https://${val}`;
    }
    return val;
  })
  .refine((val) => val === "" || /^https?:\/\/.+/i.test(val), {
    message: "Must be a valid URL starting with http:// or https://",
  })
  .optional()
  .nullable();

// File URL validation helper allowing external links, relative paths, and base64 data URLs
export const optionalFileUrl = z
  .string()
  .trim()
  .refine(
    (val) =>
      val === "" ||
      /^https?:\/\/.+/i.test(val) ||
      /^data:.+/i.test(val) ||
      val.startsWith("/") ||
      val.startsWith("blob:"),
    {
      message: "Must be a valid URL or uploaded file",
    }
  )
  .optional()
  .nullable();

export const optionalPhotoUrl = z
  .string()
  .trim()
  .refine((val) => val === "" || /^https?:\/\/.+/i.test(val) || /^data:image\/.+/i.test(val) || val.startsWith("/"), {
    message: "Must be a valid URL or image",
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
  major: z.string().trim().default("Sistem Informasi").optional(),
  photoUrl: optionalPhotoUrl,
  bio: z.string().trim().max(1000).optional().nullable(),
  dream: z.string().trim().max(255).optional().nullable(),
  motivation: z.string().trim().max(1000).optional().nullable(),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  portfolioUrl: optionalUrl,
  instagramUrl: optionalUrl,
});
export type StudentInput = z.infer<typeof studentSchema>;

// 4. Subject Schemas
export const subjectSchema = z.object({
  code: z
    .string()
    .trim()
    .min(2, "Subject code is required (e.g. BBK1AAB4)")
    .toUpperCase(),
  name: z.string().trim().min(2, "Subject name is required"),
  englishName: z.string().trim().max(200).optional().nullable(),
  description: z.string().trim().max(1000).optional().nullable(),
  sks: z.coerce.number().int().min(1).max(10).optional().default(3),
  lecturerName: z.string().trim().max(200).optional().nullable(),
  semester: z.string().trim().max(100).optional().nullable().default("Semester Ganjil 2026/2027"),
  academicYear: z.string().trim().max(50).optional().nullable().default("2026/2027"),
  color: z.string().trim().max(100).optional().nullable(),
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
    room: z.string().trim().min(1, "Room/location is required (e.g. RLC.KJ.05.001)"),
    lecturerName: z.string().trim().optional().nullable(),
    className: z.string().trim().max(100).optional().nullable().default("JS1SI-26-REG-05"),
    semester: z.string().trim().max(100).optional().nullable().default("Semester Ganjil 2026/2027"),
    academicYear: z.string().trim().max(50).optional().nullable().default("2026/2027"),
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
  subjectId: z.string().optional().nullable(),
  title: z.string().trim().min(3, "Task title must be at least 3 characters"),
  description: z.string().trim().max(3000).optional().nullable(),
  taskType: z.nativeEnum(TaskType).default(TaskType.INDIVIDUAL),
  deadline: z.string().min(1, "Deadline date and time is required"),
  estimatedTime: z.string().trim().max(100).optional().nullable(),
  priority: z.nativeEnum(TaskPriority).default(TaskPriority.MEDIUM),
  status: z.nativeEnum(TaskStatus).default(TaskStatus.UPCOMING),
  groupName: z.string().trim().max(200).optional().nullable(),
  groupMembers: z.string().trim().max(1000).optional().nullable(),
  attachmentUrl: optionalFileUrl,
  submissionUrl: optionalUrl,
  referenceUrl: optionalUrl,
  notes: z.string().trim().max(1000).optional().nullable(),
});
export type TaskInput = z.infer<typeof taskSchema>;

// 7. Material Schemas
export const materialSchema = z.object({
  title: z.string().trim().min(3, "Material title is required"),
  description: z.string().trim().max(2000).optional().nullable(),
  subjectId: z.string().optional().nullable(),
  type: z.nativeEnum(MaterialType).default(MaterialType.PDF),
  fileUrl: optionalFileUrl,
  externalUrl: optionalUrl,
  fileName: z.string().trim().max(255).optional().nullable(),
  fileSize: z.string().trim().max(50).optional().nullable(),
  tags: z.string().trim().max(255).optional().nullable(),
  attachments: z.string().optional().nullable(),
});
export type MaterialInput = z.infer<typeof materialSchema>;

// 8. Daily Note Schemas
export const dailyNoteSchema = z.object({
  date: z.string().min(1, "Date is required"),
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  summary: z.string().trim().max(1000).optional().nullable(),
  content: z.string().trim().min(5, "Content must have at least 5 characters"),
  importantPoints: z.string().trim().max(2000).optional().nullable(),
  nextSteps: z.string().trim().max(2000).optional().nullable(),
  subjectId: z.string().optional().nullable(),
  tags: z.string().trim().max(255).optional().nullable(),
  materialIds: z.array(z.string()).default([]),
  taskIds: z.array(z.string()).default([]),
});
export type DailyNoteInput = z.infer<typeof dailyNoteSchema>;

// 9. Achievement Schemas
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

// 10. Announcement Schemas
export const announcementSchema = z.object({
  title: z.string().trim().min(3, "Announcement title is required"),
  content: z.string().trim().min(10, "Content must be at least 10 characters"),
  imageUrl: optionalUrl,
  isPublished: z.boolean().default(false),
  publishedAt: z.string().optional().nullable(),
});
export type AnnouncementInput = z.infer<typeof announcementSchema>;

// 11. Gallery Schemas
export const gallerySchema = z.object({
  title: z.string().trim().min(2, "Photo title is required"),
  description: z.string().trim().max(1000).optional().nullable(),
  imageUrl: z.string().trim().min(1, "Image URL or upload is required"),
  eventDate: z.string().optional().nullable(),
});
export type GalleryInput = z.infer<typeof gallerySchema>;

// 12. Resource Schemas
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

// 13. Class Event Schema
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

// 14. Settings Schema
export const settingsSchema = z.object({
  className: z.string().trim().min(2, "Class name is required"),
  classShortName: z.string().trim().max(50).optional().default("SI • 26-05"),
  classCode: z.string().trim().max(50).optional().default("JS1SI-26-REG-05"),
  institutionName: z.string().trim().max(200).optional().default("Telkom University Jakarta"),
  campusName: z.string().trim().max(200).optional().default("Telkom University Jakarta"),
  studyProgram: z.string().trim().max(200).optional().default("S1 Sistem Informasi"),
  academicYear: z.string().trim().min(4, "Academic year is required (e.g. 2026/2027)").default("2026/2027"),
  semester: z.string().trim().max(100).optional().default("Semester Ganjil 2026/2027"),
  waliDosen: z.string().trim().max(200).optional().default("Muhammad Ardiansyah"),
  classHeadline: z.string().trim().max(200).optional().default("LEARN. BUILD. GROW. TOGETHER."),
  classDescription: z.string().trim().max(1000).optional(),
  contactEmail: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  logoUrl: optionalUrl,
  heroImageUrl: optionalUrl,
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  discordUrl: optionalUrl,
  classMotto: z.string().trim().max(200).optional(),
  aboutVision: z.string().trim().max(2000).optional(),
  aboutMission: z.string().trim().max(2000).optional(),
  aboutValues: z.string().optional(),
  aboutLeaders: z.string().optional(),
  aboutWaliDosenMessage: z.string().trim().max(2000).optional(),
});
export type SettingsInput = z.infer<typeof settingsSchema>;

// 15. About Page Schemas
export const aboutValueItemSchema = z.object({
  title: z.string().trim().min(1, "Judul nilai harus diisi"),
  description: z.string().trim().min(1, "Deskripsi nilai harus diisi"),
});
export type AboutValueItem = z.infer<typeof aboutValueItemSchema>;

export const aboutLeaderItemSchema = z.object({
  role: z.string().trim().min(1, "Jabatan harus diisi"),
  name: z.string().trim().min(1, "Nama pengurus harus diisi"),
  studentId: z.string().optional().nullable(),
  description: z.string().trim().min(1, "Deskripsi tugas harus diisi"),
  color: z.string().optional().default("from-cyan-500 to-blue-600"),
});
export type AboutLeaderItem = z.infer<typeof aboutLeaderItemSchema>;

export const aboutSchema = z.object({
  classCode: z.string().trim().min(1, "Kode kelas diperlukan"),
  studyProgram: z.string().trim().min(1, "Program studi diperlukan"),
  institutionName: z.string().trim().min(1, "Nama institusi diperlukan"),
  academicYear: z.string().trim().min(1, "Periode akademik diperlukan"),
  waliDosen: z.string().trim().min(1, "Nama wali dosen diperlukan"),
  classDescription: z.string().trim().max(2000).optional(),
  aboutVision: z.string().trim().max(2000).optional(),
  aboutMission: z.string().trim().max(2000).optional(),
  aboutValues: z.array(aboutValueItemSchema).default([]),
  aboutLeaders: z.array(aboutLeaderItemSchema).default([]),
  aboutWaliDosenMessage: z.string().trim().max(2000).optional(),
  contactEmail: z.string().trim().email("Must be a valid email").optional().or(z.literal("")),
  githubUrl: optionalUrl,
  linkedinUrl: optionalUrl,
  instagramUrl: optionalUrl,
  discordUrl: optionalUrl,
});
export type AboutInput = z.infer<typeof aboutSchema>;

