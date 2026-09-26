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
} from "./initial-data";
import {
  DayOfWeek,
  TaskPriority,
  TaskStatus,
  AchievementCategory,
  ResourceCategory,
  UserRole,
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

    const [
      studentsCount,
      achievementsCount,
      subjectsCount,
      tasksCount,
      upcomingTasksRaw,
      todaySchedulesRaw,
      latestAnnouncements,
      latestAchievementsRaw,
      featuredStudentsRaw,
      galleryPreview,
      settingsRaw,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.achievement.count(),
      prisma.subject.count(),
      prisma.task.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
      prisma.task.findMany({
        where: { status: { not: TaskStatus.COMPLETED } },
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
        include: { students: { include: { student: true } } },
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
      },
      upcomingTasks,
      todaySchedules: todaySchedulesRaw,
      todayDayOfWeek,
      latestAnnouncements,
      latestAchievements: latestAchievementsRaw,
      featuredStudents: featuredStudentsRaw,
      galleryPreview,
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
      },
      upcomingTasks,
      todaySchedules: initialSchedules.filter((s) => s.dayOfWeek === todayDayOfWeek),
      todayDayOfWeek,
      latestAnnouncements: initialAnnouncements.filter((a) => a.isPublished).slice(0, 3),
      latestAchievements: initialAchievements.slice(0, 3),
      featuredStudents: initialStudents.slice(0, 4),
      galleryPreview: initialGallery.slice(0, 6),
      settings: initialSettings,
    };
  }
}

// 2. Schedule Page Data
export async function getScheduleData(filters?: { dayOfWeek?: DayOfWeek; subjectId?: string }) {
  try {
    const where: any = {};
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
export async function getTasksData(filters?: {
  subjectId?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  search?: string;
  sort?: "newest" | "deadline" | "priority";
}) {
  try {
    const where: any = {};
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

    let orderBy: any = { deadline: "asc" };
    if (filters?.sort === "newest") orderBy = { createdAt: "desc" };
    if (filters?.sort === "priority") orderBy = { priority: "desc" };

    const [tasksRaw, subjects] = await Promise.all([
      prisma.task.findMany({
        where,
        orderBy,
        include: { subject: true, creator: { select: { id: true, name: true, role: true } } },
      }),
      prisma.subject.findMany({ orderBy: { code: "asc" } }),
    ]);

    const tasks = tasksRaw.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

    return { tasks, subjects };
  } catch {
    let tasks = initialTasks.map((t) => ({
      ...t,
      computedStatus: computeDynamicTaskStatus(t),
    }));

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
    } else {
      tasks.sort((a, b) => a.deadline.getTime() - b.deadline.getTime());
    }

    return { tasks, subjects: initialSubjects };
  }
}

// 4. Students Page Data
export async function getStudentsData(filters?: {
  search?: string;
  major?: string;
  sort?: "name_asc" | "name_desc" | "achievements";
}) {
  try {
    const where: any = {};
    if (filters?.major) where.major = filters.major;
    if (filters?.search) {
      where.OR = [
        { name: { contains: filters.search, mode: "insensitive" } },
        { studentNumber: { contains: filters.search, mode: "insensitive" } },
        { major: { contains: filters.search, mode: "insensitive" } },
      ];
    }

    const students = await prisma.student.findMany({
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
    let students = [...initialStudents];
    if (filters?.major) students = students.filter((s) => s.major === filters.major);
    if (filters?.search) {
      const q = filters.search.toLowerCase();
      students = students.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          (s.studentNumber && s.studentNumber.toLowerCase().includes(q)) ||
          s.major.toLowerCase().includes(q)
      );
    }

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

// 5. Student Detail
export async function getStudentById(id: string) {
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
    if (student) return student;
  } catch {
    // fallback
  }

  return initialStudents.find((s) => s.id === id) || null;
}

// 6. Achievements Page Data
export async function getAchievementsData(filters?: {
  category?: AchievementCategory;
  search?: string;
}) {
  try {
    const where: any = {};
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
            student: true,
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
    const where: any = { isPublished: true };
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
    const where: any = {};
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
      upcomingDeadlinesRaw,
      recentAchievements,
      recentAnnouncements,
      recentActivities,
    ] = await Promise.all([
      prisma.student.count(),
      prisma.subject.count(),
      prisma.task.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
      prisma.achievement.count(),
      prisma.announcement.count(),
      prisma.gallery.count(),
      prisma.classEvent.count(),
      prisma.user.count(),
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
    ]);

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
      },
      upcomingDeadlines,
      recentAchievements,
      recentAnnouncements,
      recentActivities,
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
      },
      upcomingDeadlines,
      recentAchievements: initialAchievements.slice(0, 4),
      recentAnnouncements: initialAnnouncements.slice(0, 4),
      recentActivities: initialActivityLogs,
    };
  }
}

// 13. Subjects Data (Admin / Management)
export async function getSubjectsData() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { schedules: true, tasks: true },
        },
      },
    });
    return { subjects };
  } catch {
    return {
      subjects: initialSubjects.map((s) => ({
        ...s,
        _count: {
          schedules: initialSchedules.filter((sch) => sch.subjectId === s.id).length,
          tasks: initialTasks.filter((t) => t.subjectId === s.id).length,
        },
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
