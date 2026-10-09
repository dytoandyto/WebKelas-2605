import prisma from "@/lib/db";
import {
  initialAchievements,
  initialAnnouncements,
  initialClassEvents,
  initialActivityLogs,
  initialGallery,
  initialResources,
  initialSchedules,
  initialSettings,
  initialStudents,
  initialSubjects,
  initialTasks,
  initialUsers,
  initialMaterials,
  initialDailyNotes,
} from "./initial-data";
import {
  DayOfWeek,
  MaterialType,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
  Prisma,
} from "@prisma/client";

// Compute dynamic task status based on real-time deadline
export function computeDynamicTaskStatus(task: {
  deadline: Date | string;
  status: TaskStatus;
}): TaskStatus {
  if (task.status === TaskStatus.COMPLETED) {
    return TaskStatus.COMPLETED;
  }

  const deadline = typeof task.deadline === "string" ? new Date(task.deadline) : task.deadline;
  const now = new Date();

  if (deadline.getTime() < now.getTime()) {
    return TaskStatus.OVERDUE;
  }

  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  if (deadline.getTime() <= threeDaysFromNow.getTime()) {
    return TaskStatus.DUE_SOON;
  }

  return TaskStatus.UPCOMING;
}

// Privacy helper: ensure student identification numbers (NIM) are never leaked in public outputs
export function sanitizePublicStudent<T extends { studentNumber?: string | null }>(student: T): Omit<T, "studentNumber"> {
  if (!student) return student;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { studentNumber, ...rest } = student;
  return rest;
}

// Map day index to DayOfWeek enum
const DAYS_MAP: Record<number, DayOfWeek> = {
  0: DayOfWeek.SUNDAY,
  1: DayOfWeek.MONDAY,
  2: DayOfWeek.TUESDAY,
  3: DayOfWeek.WEDNESDAY,
  4: DayOfWeek.THURSDAY,
  5: DayOfWeek.FRIDAY,
  6: DayOfWeek.SATURDAY,
};

// 1. Home Page Data
export async function getHomeData() {
  try {
    const todayDayOfWeek = DAYS_MAP[new Date().getDay()] || DayOfWeek.MONDAY;

    const now = new Date();

    const [
      studentsCount,
      achievementsCount,
      subjectsCount,
      tasksCount,
      materialsCount,
      dailyNotesCount,
      upcomingTasksRaw,
      todaySchedulesRaw,
      latestAnnouncements,
      latestAchievementsRaw,
      featuredStudentsRaw,
      galleryPreview,
      latestMaterialsRaw,
      latestDailyNotesRaw,
      settingsRaw,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.achievement.count(),
      prisma.subject.count(),
      prisma.task.count({ where: { deadline: { gte: now } } }),
      prisma.material.count(),
      prisma.dailyNote.count(),
      prisma.task.findMany({
        where: { deadline: { gte: now } },
        orderBy: { deadline: "asc" },
        take: 4,
        include: { subject: true },
      }),
      prisma.schedule.findMany({
        where: { dayOfWeek: todayDayOfWeek },
        orderBy: { startTime: "asc" },
        include: { subject: true },
      }),
      prisma.announcement.findMany({
        where: { isPublished: true },
        orderBy: { publishedAt: "desc" },
        take: 3,
        include: { creator: { select: { id: true, name: true, role: true } } },
      }),
      prisma.achievement.findMany({
        orderBy: { achievementDate: "desc" },
        take: 3,
        include: {
          students: {
            include: {
              student: {
                select: { id: true, name: true, photoUrl: true, major: true },
              },
            },
          },
        },
      }),
      prisma.student.findMany({
        take: 4,
        orderBy: { name: "asc" },
        include: { achievements: { include: { achievement: true } } },
      }),
      prisma.gallery.findMany({
        orderBy: { eventDate: "desc" },
        take: 6,
      }),
      prisma.material.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { subject: true },
      }),
      prisma.dailyNote.findMany({
        orderBy: { date: "desc" },
        take: 3,
        include: { subject: true, author: { select: { id: true, name: true } } },
      }),
      prisma.setting.findMany(),
    ]);

    const settings = settingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const upcomingTasks = upcomingTasksRaw.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

    return {
      stats: {
        studentsCount,
        achievementsCount,
        subjectsCount,
        tasksCount,
        materialsCount,
        dailyNotesCount,
      },
      upcomingTasks,
      todaySchedules: todaySchedulesRaw,
      todayDayOfWeek,
      latestAnnouncements,
      latestAchievements: latestAchievementsRaw,
      featuredStudents: featuredStudentsRaw.map((s) => sanitizePublicStudent(s)),
      galleryPreview,
      latestMaterials: latestMaterialsRaw,
      latestDailyNotes: latestDailyNotesRaw,
      settings: { ...initialSettings, ...settings },
    };
  } catch {
    // Graceful fallback when database is not yet connected
    const todayDayOfWeek = DAYS_MAP[new Date().getDay()] || DayOfWeek.MONDAY;
    const upcomingTasks = initialTasks
      .filter((t) => t.status !== TaskStatus.COMPLETED)
      .map((t) => ({ ...t, computedStatus: computeDynamicTaskStatus(t) }))
      .slice(0, 4);

    return {
      stats: {
        studentsCount: initialStudents.length,
        achievementsCount: initialAchievements.length,
        subjectsCount: initialSubjects.length,
        tasksCount: initialTasks.filter((t) => t.status !== TaskStatus.COMPLETED).length,
        materialsCount: initialMaterials.length,
        dailyNotesCount: initialDailyNotes.length,
      },
      upcomingTasks,
      todaySchedules: initialSchedules.filter((s) => s.dayOfWeek === todayDayOfWeek),
      todayDayOfWeek,
      latestAnnouncements: initialAnnouncements.filter((a) => a.isPublished).slice(0, 3),
      latestAchievements: initialAchievements.slice(0, 3),
      featuredStudents: initialStudents.slice(0, 4).map((s) => sanitizePublicStudent(s)),
      galleryPreview: initialGallery.slice(0, 6),
      latestMaterials: initialMaterials.slice(0, 4),
      latestDailyNotes: initialDailyNotes.slice(0, 3),
      settings: initialSettings,
    };
  }
}

// 2. Schedule Page Data
export async function getScheduleData(filters?: { dayOfWeek?: DayOfWeek; subjectId?: string }) {
  try {
    const where: Prisma.ScheduleWhereInput = {};
    if (filters?.dayOfWeek) where.dayOfWeek = filters.dayOfWeek;
    if (filters?.subjectId) where.subjectId = filters.subjectId;

    const [schedules, subjects] = await Promise.all([
      prisma.schedule.findMany({
        where,
        orderBy: [{ dayOfWeek: "asc" }, { startTime: "asc" }],
        include: { subject: true },
      }),
      prisma.subject.findMany({ orderBy: { code: "asc" } }),
    ]);

    return { schedules, subjects };
  } catch {
    let schedules = initialSchedules;
    if (filters?.dayOfWeek) schedules = schedules.filter((s) => s.dayOfWeek === filters.dayOfWeek);
    if (filters?.subjectId) schedules = schedules.filter((s) => s.subjectId === filters.subjectId);
    return { schedules, subjects: initialSubjects };
  }
}

// 3. Tasks Page Data
export interface GetTasksDataFilters {
  scope?: "upcoming" | "history" | "all";
  subjectId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  search?: string;
  sort?: "newest" | "deadline" | "priority";
}

export type TaskItem = Prisma.TaskGetPayload<{
  include: {
    subject: true;
    creator: { select: { id: true; name: true; role: true } };
  };
}> & { computedStatus: TaskStatus };

export type SubjectItem = Prisma.SubjectGetPayload<Record<string, never>>;

export interface GetTasksDataResult {
  tasks: TaskItem[];
  subjects: SubjectItem[];
  upcomingCount: number;
  historyCount: number;
}

export async function getTasksData(filters?: GetTasksDataFilters): Promise<GetTasksDataResult> {
  const now = new Date();
  const scope = filters?.scope || "upcoming";

  try {
    const where: Prisma.TaskWhereInput = {};

    // Database-level filtering by deadline
    if (scope === "upcoming") {
      where.deadline = { gte: now };
    } else if (scope === "history") {
      where.deadline = { lt: now };
    }

    if (filters?.subjectId) where.subjectId = filters.subjectId;
    if (filters?.priority) where.priority = filters.priority;
    if (filters?.status) where.status = filters.status;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { subject: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    // Default sorting: Upcoming is chronological (asc), History is most recent past first (desc)
    let orderBy: Prisma.TaskOrderByWithRelationInput = scope === "history" ? { deadline: "desc" } : { deadline: "asc" };
    if (filters?.sort === "newest") orderBy = { createdAt: "desc" };
    if (filters?.sort === "priority") orderBy = { priority: "desc" };
    if (filters?.sort === "deadline") orderBy = { deadline: scope === "history" ? "desc" : "asc" };

    const [tasksRaw, subjects, upcomingCount, historyCount] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        include: { subject: true, creator: { select: { id: true, name: true, role: true } } },
      }),
      prisma.subject.findMany({ orderBy: { code: "asc" } }),
      prisma.task.count({ where: { deadline: { gte: now } } }),
      prisma.task.count({ where: { deadline: { lt: now } } }),
    ]);

    const tasks = tasksRaw.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

    return { tasks, subjects, upcomingCount, historyCount };
  } catch {
    let tasks = initialTasks.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

    const upcomingCount = tasks.filter((t) => new Date(t.deadline).getTime() >= now.getTime()).length;
    const historyCount = tasks.filter((t) => new Date(t.deadline).getTime() < now.getTime()).length;

    if (scope === "upcoming") {
      tasks = tasks.filter((t) => new Date(t.deadline).getTime() >= now.getTime());
    } else if (scope === "history") {
      tasks = tasks.filter((t) => new Date(t.deadline).getTime() < now.getTime());
    }

    if (filters?.subjectId) tasks = tasks.filter((t) => t.subjectId === filters.subjectId);
    if (filters?.priority) tasks = tasks.filter((t) => t.priority === filters.priority);
    if (filters?.status) tasks = tasks.filter((t) => t.computedStatus === filters.status);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      tasks = tasks.filter(
        (t) =>
          t.title.toLowerCase().includes(q) ||
          (t.description && t.description.toLowerCase().includes(q)) ||
          t.subject.name.toLowerCase().includes(q)
      );
    }

    if (filters?.sort === "newest") {
      tasks.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (filters?.sort === "priority") {
      tasks.sort((a, b) => (b.priority || "").localeCompare(a.priority || ""));
    } else {
      if (scope === "history") {
        tasks.sort((a, b) => new Date(b.deadline).getTime() - new Date(a.deadline).getTime());
      } else {
        tasks.sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
      }
    }

    return { tasks, subjects: initialSubjects, upcomingCount, historyCount };
  }
}

// 3b. Task Detail Page Data
export async function getTaskById(id: string) {
  try {
    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        subject: true,
        creator: { select: { id: true, name: true, role: true } },
        dailyNotes: {
          include: {
            dailyNote: {
              select: { id: true, title: true, date: true, summary: true },
            },
          },
        },
      },
    });
    if (task) {
      return {
        ...task,
        computedStatus: computeDynamicTaskStatus(task),
      };
    }
  } catch {
    // fallback
  }

  const initial = initialTasks.find((t) => t.id === id);
  if (initial) {
    return {
      ...initial,
      computedStatus: computeDynamicTaskStatus(initial),
      dailyNotes: [],
    };
  }
  return null;
}

// 4. Students Page Data
export async function getStudentsData(
  filters?: {
    search?: string;
    major?: string;
    sort?: "name_asc" | "name_desc" | "achievements";
  },
  options?: {
    includePrivate?: boolean;
  }
) {
  const includePrivate = options?.includePrivate ?? false;
  try {
    const where: Prisma.StudentWhereInput = {};
    if (filters?.major) where.major = filters.major;
    if (filters?.search) {
      const searchConditions: Prisma.StudentWhereInput[] = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { major: { contains: filters.search, mode: "insensitive" } },
      ];
      // Only include NIM in search filter if requested by authorized admin
      if (includePrivate) {
        searchConditions.push({ studentNumber: { contains: filters.search, mode: "insensitive" } });
      }
      where.OR = searchConditions;
    }

    const rawStudents = await prisma.student.findMany({
      where,
      orderBy: { name: filters?.sort === "name_desc" ? "desc" : "asc" },
      include: {
        achievements: {
          include: {
            achievement: {
              select: { id: true, title: true, category: true, badgeIconUrl: true },
            },
          },
        },
      },
    });

    const students = includePrivate ? rawStudents : rawStudents.map((s) => sanitizePublicStudent(s));

    if (filters?.sort === "achievements") {
      students.sort((a, b) => b.achievements.length - a.achievements.length);
    }

    const majorsRaw = await prisma.student.findMany({
      select: { major: true },
      distinct: ["major"],
    });
    const majors = majorsRaw.map((m) => m.major);

    return { students, majors };
  } catch {
    let rawStudents = [...initialStudents];
    if (filters?.major) rawStudents = rawStudents.filter((s) => s.major === filters.major);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      rawStudents = rawStudents.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (includePrivate && s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
          s.major.toLowerCase().includes(q)
      );
    }

    const students = includePrivate ? rawStudents : rawStudents.map((s) => sanitizePublicStudent(s));

    if (filters?.sort === "name_desc") {
      students.sort((a, b) => b.name.localeCompare(a.name));
    } else if (filters?.sort === "achievements") {
      students.sort((a, b) => b.achievements.length - a.achievements.length);
    } else {
      students.sort((a, b) => a.name.localeCompare(b.name));
    }

    const majors = Array.from(new Set(initialStudents.map((s) => s.major)));
    return { students, majors };
  }
}

// Admin Students Helper with private fields (NIM) included
export async function getAdminStudentsData(filters?: Parameters<typeof getStudentsData>[0]) {
  return getStudentsData(filters, { includePrivate: true });
}

// 5. Student Detail
export async function getStudentById(id: string, options?: { includePrivate?: boolean }) {
  const includePrivate = options?.includePrivate ?? false;
  try {
    const student = await prisma.student.findUnique({
      where: { id },
      include: {
        achievements: {
          include: {
            achievement: true,
          },
        },
      },
    });
    if (student) {
      return includePrivate ? student : sanitizePublicStudent(student);
    }
  } catch {
    // fallback
  }

  const initial = initialStudents.find((s) => s.id === id);
  if (!initial) return null;
  return includePrivate ? initial : sanitizePublicStudent(initial);
}

// 6. Achievements Page Data
export async function getAchievementsData(filters?: {
  category?: AchievementCategory;
  search?: string;
}) {
  try {
    const where: Prisma.AchievementWhereInput = {};
    if (filters?.category) where.category = filters.category;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { organization: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const achievements = await prisma.achievement.findMany({
      where,
      orderBy: { achievementDate: "desc" },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, photoUrl: true, major: true },
            },
          },
        },
      },
    });

    return { achievements };
  } catch {
    let achievements = [...initialAchievements];
    if (filters?.category) {
      achievements = achievements.filter((a) => a.category === filters.category);
    }
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      achievements = achievements.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          (a.description && a.description.toLowerCase().includes(q)) ||
          (a.organization && a.organization.toLowerCase().includes(q))
      );
    }
    return { achievements };
  }
}

// 7. Achievement Detail
export async function getAchievementById(id: string) {
  try {
    const achievement = await prisma.achievement.findUnique({
      where: { id },
      include: {
        students: {
          include: {
            student: {
              select: { id: true, name: true, photoUrl: true, major: true },
            },
          },
        },
        creator: { select: { id: true, name: true, role: true } },
      },
    });
    if (achievement) return achievement;
  } catch {
    // fallback
  }

  return initialAchievements.find((a) => a.id === id) || null;
}

// 8. Announcements Page Data (Public: published only!)
export async function getAnnouncementsData(filters?: { search?: string }) {
  try {
    const where: Prisma.AnnouncementWhereInput = { isPublished: true };
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const announcements = await prisma.announcement.findMany({
      where,
      orderBy: { publishedAt: "desc" },
      include: { creator: { select: { id: true, name: true, role: true } } },
    });

    return { announcements };
  } catch {
    let announcements = initialAnnouncements.filter((a) => a.isPublished);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      announcements = announcements.filter(
        (a) => a.title.toLowerCase().includes(q) || a.content.toLowerCase().includes(q)
      );
    }
    return { announcements };
  }
}

// 9. Gallery Page Data
export async function getGalleryData() {
  try {
    const gallery = await prisma.gallery.findMany({
      orderBy: [{ eventDate: "desc" }, { createdAt: "desc" }],
      include: { uploader: { select: { id: true, name: true } } },
    });
    return { gallery };
  } catch {
    return {
      gallery: initialGallery.map((g) => ({
        ...g,
        uploader: { id: g.uploadedBy, name: "Class Admin" },
      })),
    };
  }
}

// 10. Resources Page Data
export async function getResourcesData(filters?: { category?: ResourceCategory }) {
  try {
    const where: Prisma.ResourceWhereInput = {};
    if (filters?.category) where.category = filters.category;

    const resources = await prisma.resource.findMany({
      where,
      orderBy: { createdAt: "desc" },
      include: { creator: { select: { id: true, name: true } } },
    });

    return { resources };
  } catch {
    let resources = initialResources.map((r) => ({
      ...r,
      creator: { id: r.createdBy, name: "Class Admin" },
    }));
    if (filters?.category) {
      resources = resources.filter((r) => r.category === filters.category);
    }
    return { resources };
  }
}

// 11. Settings Data
export async function getSettings() {
  try {
    const settingsRaw = await prisma.setting.findMany();
    const settings = settingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);
    return { ...initialSettings, ...settings };
  } catch {
    return initialSettings;
  }
}

// 12. Admin Dashboard Overview Data
export async function getAdminOverviewData() {
  const dayOfWeekMap: Record<number, DayOfWeek> = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  const todayDayOfWeek = dayOfWeekMap[new Date().getDay()];

  try {
    const [
      studentsCount,
      subjectsCount,
      upcomingTasksCount,
      achievementsCount,
      announcementsCount,
      galleryCount,
      eventsCount,
      usersCount,
      materialsCount,
      dailyNotesCount,
      upcomingDeadlinesRaw,
      recentAchievements,
      recentAnnouncements,
      recentActivities,
      todaySchedulesRaw,
      recentMaterialsRaw,
      recentDailyNotesRaw,
      settingsRaw,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.subject.count(),
      prisma.task.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
      prisma.achievement.count(),
      prisma.announcement.count(),
      prisma.gallery.count(),
      prisma.classEvent.count(),
      prisma.user.count(),
      prisma.material.count(),
      prisma.dailyNote.count(),
      prisma.task.findMany({
        where: { status: { not: TaskStatus.COMPLETED } },
        orderBy: { deadline: "asc" },
        take: 5,
        include: { subject: true },
      }),
      prisma.achievement.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
        include: { students: { include: { student: true } } },
      }),
      prisma.announcement.findMany({
        orderBy: { createdAt: "desc" },
        take: 4,
      }),
      prisma.activityLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 6,
        include: { user: { select: { name: true, role: true } } },
      }),
      prisma.schedule.findMany({
        where: { dayOfWeek: todayDayOfWeek },
        orderBy: { startTime: "asc" },
        include: { subject: true },
      }),
      prisma.material.findMany({
        orderBy: { createdAt: "desc" },
        take: 3,
        include: { subject: true },
      }),
      prisma.dailyNote.findMany({
        orderBy: { date: "desc" },
        take: 3,
        include: { subject: true, author: { select: { id: true, name: true } } },
      }),
      prisma.setting.findMany(),
    ]);

    const settings = settingsRaw.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const upcomingDeadlines = upcomingDeadlinesRaw.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

    return {
      stats: {
        studentsCount,
        subjectsCount,
        upcomingTasksCount,
        achievementsCount,
        announcementsCount,
        galleryCount,
        eventsCount,
        usersCount,
        materialsCount,
        dailyNotesCount,
      },
      upcomingDeadlines,
      recentAchievements,
      recentAnnouncements,
      recentActivities,
      todaySchedules: todaySchedulesRaw,
      recentMaterials: recentMaterialsRaw,
      recentDailyNotes: recentDailyNotesRaw,
      settings,
    };
  } catch {
    const upcomingDeadlines = initialTasks
      .filter((t) => t.status !== TaskStatus.COMPLETED)
      .map((t) => ({ ...t, computedStatus: computeDynamicTaskStatus(t) }))
      .slice(0, 5);

    return {
      stats: {
        studentsCount: initialStudents.length,
        subjectsCount: initialSubjects.length,
        upcomingTasksCount: initialTasks.filter((t) => t.status !== TaskStatus.COMPLETED).length,
        achievementsCount: initialAchievements.length,
        announcementsCount: initialAnnouncements.length,
        galleryCount: initialGallery.length,
        eventsCount: initialClassEvents.length,
        usersCount: initialUsers.length,
        materialsCount: 0,
        dailyNotesCount: 0,
      },
      upcomingDeadlines,
      recentAchievements: initialAchievements.slice(0, 4),
      recentAnnouncements: initialAnnouncements.slice(0, 4),
      recentActivities: initialActivityLogs,
      todaySchedules: [],
      recentMaterials: [],
      recentDailyNotes: [],
      settings: {},
    };
  }
}

// 13. Subjects Data (Admin / Management & Subjects Hub)
export async function getSubjectsData() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { schedules: true, tasks: true, materials: true, dailyNotes: true },
        },
        schedules: { orderBy: { dayOfWeek: "asc" } },
        tasks: {
          where: { status: { not: TaskStatus.COMPLETED } },
          orderBy: { deadline: "asc" },
        },
        materials: { orderBy: { createdAt: "desc" } },
        dailyNotes: { orderBy: { date: "desc" } },
      },
    });
    return { subjects };
  } catch {
    return {
      subjects: initialSubjects.map((sub) => ({
        ...sub,
        _count: {
          schedules: initialSchedules.filter((sch) => sch.subjectId === sub.id).length,
          tasks: initialTasks.filter((t) => t.subjectId === sub.id).length,
          materials: initialMaterials.filter((m) => m.subjectId === sub.id).length,
          dailyNotes: initialDailyNotes.filter((n) => n.subjectId === sub.id).length,
        },
        schedules: initialSchedules.filter((s) => s.subjectId === sub.id),
        tasks: initialTasks.filter((t) => t.subjectId === sub.id),
        materials: initialMaterials.filter((m) => m.subjectId === sub.id),
        dailyNotes: initialDailyNotes.filter((n) => n.subjectId === sub.id),
      })),
    };
  }
}

// 14. Users Data (Admin / System Management)
export async function getUsersData() {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
    return { users };
  } catch {
    return {
      users: initialUsers.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        role: u.role,
        isActive: u.isActive,
        createdAt: u.createdAt,
      })),
    };
  }
}

// 15. Class Events Data (Public & Admin)
export async function getClassEventsData() {
  try {
    const events = await prisma.classEvent.findMany({
      orderBy: { eventDate: "asc" },
      include: {
        creator: {
          select: { id: true, name: true, role: true },
        },
      },
    });
    return { events };
  } catch {
    return {
      events: initialClassEvents,
    };
  }
}

// 16. Activity Logs Data (Admin / System Audit)
export async function getActivityLogsData() {
  try {
    const logs = await prisma.activityLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        user: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });
    return { logs };
  } catch {
    return {
      logs: initialActivityLogs,
    };
  }
}

// 17. Materials Data (Public & Admin)
export async function getMaterialsData(filters?: {
  subjectId?: string;
  type?: MaterialType;
  search?: string;
}) {
  try {
    const where: Prisma.MaterialWhereInput = {};
    if (filters?.subjectId) where.subjectId = filters.subjectId;
    if (filters?.type) where.type = filters.type;
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { description: { contains: filters.search, mode: "insensitive" } },
        { tags: { contains: filters.search, mode: "insensitive" } },
        { subject: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [materials, subjects] = await Promise.all([
      prisma.material.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: {
          subject: true,
          section: true,
          uploader: { select: { id: true, name: true, role: true } },
        },
      }),
      prisma.subject.findMany({
        orderBy: { code: "asc" },
        include: {
          _count: {
            select: { materials: true },
          },
          materialSections: {
            orderBy: { sortOrder: "asc" },
          },
        },
      }),
    ]);

    return { materials, subjects };
  } catch {
    let materials = initialMaterials;
    if (filters?.subjectId) materials = materials.filter((m) => m.subjectId === filters.subjectId);
    if (filters?.type) materials = materials.filter((m) => m.type === filters.type);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      materials = materials.filter(
        (m) =>
          m.title.toLowerCase().includes(q) ||
          (m.description && m.description.toLowerCase().includes(q)) ||
          (m.tags && m.tags.toLowerCase().includes(q))
      );
    }
    return { materials, subjects: initialSubjects };
  }
}

// 18. Material Detail by ID
export async function getMaterialById(id: string) {
  try {
    const material = await prisma.material.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            tasks: { take: 3, orderBy: { deadline: "asc" } },
            dailyNotes: { take: 3, orderBy: { date: "desc" } },
          },
        },
        section: true,
        uploader: { select: { id: true, name: true, role: true } },
      },
    });

    if (material) {
      const relatedMaterials = await prisma.material.findMany({
        where: {
          subjectId: material.subjectId,
          NOT: { id: material.id },
        },
        take: 3,
        include: { subject: true, section: true },
      });
      return { material, relatedMaterials };
    }

    const initial = initialMaterials.find((m) => m.id === id);
    if (initial) {
      const relatedMaterials = initialMaterials.filter(
        (m) => m.subjectId === initial.subjectId && m.id !== id
      );
      return { material: initial, relatedMaterials };
    }

    return null;
  } catch {
    const initial = initialMaterials.find((m) => m.id === id);
    if (initial) {
      const relatedMaterials = initialMaterials.filter(
        (m) => m.subjectId === initial.subjectId && m.id !== id
      );
      return { material: initial, relatedMaterials };
    }
    return null;
  }
}

// 19. Daily Notes Data (Public & Admin)
export async function getDailyNotesData(filters?: {
  subjectId?: string;
  search?: string;
  tag?: string;
}) {
  try {
    const where: Prisma.DailyNoteWhereInput = {};
    if (filters?.subjectId) where.subjectId = filters.subjectId;
    if (filters?.tag) where.tags = { contains: filters.tag, mode: "insensitive" };
    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: "insensitive" } },
        { summary: { contains: filters.search, mode: "insensitive" } },
        { content: { contains: filters.search, mode: "insensitive" } },
        { importantPoints: { contains: filters.search, mode: "insensitive" } },
        { subject: { name: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [dailyNotes, subjects] = await Promise.all([
      prisma.dailyNote.findMany({
        where,
        orderBy: { date: "desc" },
        include: {
          subject: true,
          author: { select: { id: true, name: true, role: true } },
          materials: { include: { material: true } },
          tasks: { include: { task: true } },
        },
      }),
      prisma.subject.findMany({ orderBy: { code: "asc" } }),
    ]);

    return { dailyNotes, subjects };
  } catch {
    let dailyNotes = initialDailyNotes;
    if (filters?.subjectId) dailyNotes = dailyNotes.filter((n) => n.subjectId === filters.subjectId);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      dailyNotes = dailyNotes.filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          (n.summary && n.summary.toLowerCase().includes(q)) ||
          n.content.toLowerCase().includes(q)
      );
    }
    return { dailyNotes, subjects: initialSubjects };
  }
}

// 20. Daily Note Detail by ID
export async function getDailyNoteById(id: string) {
  try {
    const note = await prisma.dailyNote.findUnique({
      where: { id },
      include: {
        subject: {
          include: {
            schedules: true,
          },
        },
        author: { select: { id: true, name: true, role: true } },
        materials: { include: { material: true } },
        tasks: { include: { task: true } },
      },
    });

    if (note) {
      const [prevNote, nextNote] = await Promise.all([
        prisma.dailyNote.findFirst({
          where: { date: { lt: note.date } },
          orderBy: { date: "desc" },
          select: { id: true, title: true, date: true },
        }),
        prisma.dailyNote.findFirst({
          where: { date: { gt: note.date } },
          orderBy: { date: "asc" },
          select: { id: true, title: true, date: true },
        }),
      ]);

      return { note, prevNote, nextNote };
    }

    const initial = initialDailyNotes.find((n) => n.id === id);
    if (initial) {
      return { note: initial, prevNote: null, nextNote: null };
    }
    return null;
  } catch {
    const initial = initialDailyNotes.find((n) => n.id === id);
    if (initial) {
      return { note: initial, prevNote: null, nextNote: null };
    }
    return null;
  }
}

// 22. Subject Detail by Code (e.g. BBK1AAB4)
export async function getSubjectByCode(code: string) {
  try {
    const subject = await prisma.subject.findFirst({
      where: { code: { equals: code, mode: "insensitive" } },
      include: {
        schedules: { orderBy: { dayOfWeek: "asc" } },
        tasks: {
          orderBy: { deadline: "asc" },
        },
        materialSections: {
          orderBy: { sortOrder: "asc" },
        },
        materials: {
          orderBy: { createdAt: "desc" },
          include: {
            section: true,
            uploader: { select: { id: true, name: true } },
          },
        },
        dailyNotes: {
          orderBy: { date: "desc" },
          include: { author: { select: { id: true, name: true } } },
        },
      },
    });

    if (subject) return subject;

    const initial = initialSubjects.find(
      (s) => s.code.toLowerCase() === code.toLowerCase()
    );
    if (initial) {
      return {
        ...initial,
        schedules: initialSchedules.filter((s) => s.subjectId === initial.id),
        tasks: initialTasks.filter((t) => t.subjectId === initial.id),
        materials: initialMaterials.filter((m) => m.subjectId === initial.id),
        dailyNotes: initialDailyNotes.filter((n) => n.subjectId === initial.id),
      };
    }
    return null;
  } catch {
    const initial = initialSubjects.find(
      (s) => s.code.toLowerCase() === code.toLowerCase()
    );
    if (initial) {
      return {
        ...initial,
        schedules: initialSchedules.filter((s) => s.subjectId === initial.id),
        tasks: initialTasks.filter((t) => t.subjectId === initial.id),
        materials: initialMaterials.filter((m) => m.subjectId === initial.id),
        dailyNotes: initialDailyNotes.filter((n) => n.subjectId === initial.id),
      };
    }
    return null;
  }
}

// 23. Global Search Data (Tasks, Subjects, Materials, Daily Notes, Students, Achievements)
export async function getGlobalSearchData(query: string) {
  if (!query || query.trim().length < 2) {
    return {
      tasks: [],
      subjects: [],
      materials: [],
      dailyNotes: [],
      students: [],
      achievements: [],
    };
  }

  const q = query.trim();

  try {
    const [tasks, subjects, materials, dailyNotes, students, achievements] = await Promise.all([
      prisma.task.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { subject: { select: { id: true, code: true, name: true } } },
      }),
      prisma.subject.findMany({
        where: {
          OR: [
            { code: { contains: q, mode: "insensitive" } },
            { name: { contains: q, mode: "insensitive" } },
            { englishName: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
      prisma.material.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
            { tags: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { subject: { select: { id: true, code: true, name: true } } },
      }),
      prisma.dailyNote.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { summary: { contains: q, mode: "insensitive" } },
            { content: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        include: { subject: { select: { id: true, code: true, name: true } } },
      }),
      prisma.student.findMany({
        where: {
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { major: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
        select: {
          id: true,
          name: true,
          major: true,
          photoUrl: true,
        },
      }),
      prisma.achievement.findMany({
        where: {
          OR: [
            { title: { contains: q, mode: "insensitive" } },
            { description: { contains: q, mode: "insensitive" } },
          ],
        },
        take: 5,
      }),
    ]);

    return { tasks, subjects, materials, dailyNotes, students, achievements };
  } catch {
    const qLower = q.toLowerCase();
    return {
      tasks: initialTasks
        .filter((t) => t.title.toLowerCase().includes(qLower))
        .slice(0, 5),
      subjects: initialSubjects
        .filter(
          (s) =>
            s.code.toLowerCase().includes(qLower) ||
            s.name.toLowerCase().includes(qLower) ||
            (s.englishName && s.englishName.toLowerCase().includes(qLower))
        )
        .slice(0, 5),
      materials: initialMaterials
        .filter((m) => m.title.toLowerCase().includes(qLower))
        .slice(0, 5),
      dailyNotes: initialDailyNotes
        .filter((n) => n.title.toLowerCase().includes(qLower))
        .slice(0, 5),
      students: initialStudents
        .filter((s) => s.name.toLowerCase().includes(qLower) || (s.major && s.major.toLowerCase().includes(qLower)))
        .map((s) => sanitizePublicStudent(s))
        .slice(0, 5),
      achievements: initialAchievements
        .filter((a) => a.title.toLowerCase().includes(qLower))
        .slice(0, 5),
    };
  }
}

