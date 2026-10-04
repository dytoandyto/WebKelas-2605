import { PrismaClient, TaskStatus, DayOfWeek } from '@prisma/client';

const prisma = new PrismaClient({
  log: ['warn', 'error'],
});

async function runBenchmark() {
  const DAYS_MAP = {
    0: DayOfWeek.SUNDAY,
    1: DayOfWeek.MONDAY,
    2: DayOfWeek.TUESDAY,
    3: DayOfWeek.WEDNESDAY,
    4: DayOfWeek.THURSDAY,
    5: DayOfWeek.FRIDAY,
    6: DayOfWeek.SATURDAY,
  };
  const todayDayOfWeek = DAYS_MAP[new Date().getDay()] || DayOfWeek.MONDAY;

  console.log('--- 1. Testing Unoptimized Homepage Queries (Existing 17 queries) ---');
  const tFullStart = performance.now();
  await Promise.all([
    prisma.student.count(),
    prisma.achievement.count(),
    prisma.subject.count(),
    prisma.task.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
    prisma.material.count(),
    prisma.dailyNote.count(),
    prisma.task.findMany({
      where: { status: { not: TaskStatus.COMPLETED } },
      orderBy: { deadline: 'asc' },
      take: 4,
      include: { subject: true },
    }),
    prisma.schedule.findMany({
      where: { dayOfWeek: todayDayOfWeek },
      orderBy: { startTime: 'asc' },
      include: { subject: true },
    }),
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { creator: { select: { id: true, name: true, role: true } } },
    }),
    prisma.achievement.findMany({
      orderBy: { achievementDate: 'desc' },
      take: 3,
      include: { students: { include: { student: true } } },
    }),
    prisma.student.findMany({
      take: 4,
      orderBy: { name: 'asc' },
      include: { achievements: { include: { achievement: true } } },
    }),
    prisma.gallery.findMany({
      orderBy: { eventDate: 'desc' },
      take: 6,
    }),
    prisma.material.findMany({
      orderBy: { createdAt: 'desc' },
      take: 4,
      include: { subject: true },
    }),
    prisma.dailyNote.findMany({
      orderBy: { date: 'desc' },
      take: 3,
      include: { subject: true, author: { select: { id: true, name: true } } },
    }),
    prisma.setting.findMany(),
    // getScheduleData queries called in page.tsx:
    prisma.schedule.findMany({
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
      include: { subject: true },
    }),
    prisma.subject.findMany({ orderBy: { code: 'asc' } }),
  ]);
  const fullDur = performance.now() - tFullStart;
  console.log(`Existing 17 Homepage queries (Promise.all): ${fullDur.toFixed(2)}ms`);

  console.log('\n--- 2. Testing Pruned & Field-Selected Queries (Only what Homepage displays) ---');
  const tPrunedStart = performance.now();
  const [
    studentsCount,
    subjectsCount,
    tasksCount,
    materialsCount,
    achievementsCount,
    upcomingTasks,
    todaySchedules,
    latestAchievements,
    featuredStudents,
    galleryPreview,
    settingsRaw
  ] = await Promise.all([
    // 5 stats displayed on AcademicStats
    prisma.student.count(),
    prisma.subject.count(),
    prisma.task.count({ where: { status: { not: TaskStatus.COMPLETED } } }),
    prisma.material.count(),
    prisma.achievement.count(),
    // Upcoming tasks (take 4)
    prisma.task.findMany({
      where: { status: { not: TaskStatus.COMPLETED } },
      orderBy: { deadline: 'asc' },
      take: 4,
      select: {
        id: true,
        title: true,
        description: true,
        taskType: true,
        deadline: true,
        priority: true,
        status: true,
        subject: { select: { id: true, name: true, code: true, color: true } },
      },
    }),
    // Today's schedule ONLY (no need to fetch all semester schedules)
    prisma.schedule.findMany({
      where: { dayOfWeek: todayDayOfWeek },
      orderBy: { startTime: 'asc' },
      select: {
        id: true,
        dayOfWeek: true,
        startTime: true,
        endTime: true,
        room: true,
        lecturerName: true,
        subject: {
          select: {
            id: true,
            name: true,
            code: true,
            color: true,
            sks: true,
            lecturerName: true,
            englishName: true,
          },
        },
      },
    }),
    // Latest achievements (take 3)
    prisma.achievement.findMany({
      orderBy: { achievementDate: 'desc' },
      take: 3,
      select: {
        id: true,
        title: true,
        category: true,
        description: true,
        achievementDate: true,
        badgeIconUrl: true,
        imageUrl: true,
        students: {
          select: {
            student: {
              select: {
                id: true,
                name: true,
                photoUrl: true,
              },
            },
          },
        },
      },
    }),
    // Featured students (take 4)
    prisma.student.findMany({
      take: 4,
      orderBy: { name: 'asc' },
      select: {
        id: true,
        name: true,
        major: true,
        photoUrl: true,
        bio: true,
        dream: true,
        motivation: true,
        githubUrl: true,
        linkedinUrl: true,
        portfolioUrl: true,
        instagramUrl: true,
        achievements: {
          select: {
            achievement: {
              select: {
                id: true,
                title: true,
                category: true,
                badgeIconUrl: true,
              },
            },
          },
        },
      },
    }),
    // Gallery preview (take 6)
    prisma.gallery.findMany({
      orderBy: { eventDate: 'desc' },
      take: 6,
      select: {
        id: true,
        title: true,
        description: true,
        imageUrl: true,
        eventDate: true,
      },
    }),
    // Settings
    prisma.setting.findMany({
      select: { key: true, value: true },
    }),
  ]);
  const prunedDur = performance.now() - tPrunedStart;
  console.log(`Optimized 11 Queries (Promise.all with field select): ${prunedDur.toFixed(2)}ms`);
  console.log(`Latency reduction: ${(fullDur - prunedDur).toFixed(2)}ms (${(((fullDur - prunedDur)/fullDur)*100).toFixed(1)}% faster)`);

  await prisma.$disconnect();
}

runBenchmark().catch(console.error);
