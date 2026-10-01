import type { Metadata } from "next";
import { getHomeData, getScheduleData } from "@/lib/data";
import {
  HeroSection,
  AcademicStats,
  TodaySchedule,
  UpcomingTasks,
  FeaturedAchievements,
  StudentShowcase,
  GalleryShowcase,
} from "@/components/home";

export const metadata: Metadata = {
  title: "JS1SI-26-REG-05 | S1 Sistem Informasi Telkom University Jakarta",
  description:
    "Academic class hub for S1 Sistem Informasi Telkom University Jakarta class JS1SI-26-REG-05 — schedules, coursework, learning materials, daily journal, cohort directory, and achievements.",
};

export default async function HomePage() {
  const [data, scheduleData] = await Promise.all([
    getHomeData(),
    getScheduleData(),
  ]);

  const {
    stats,
    upcomingTasks,
    latestAchievements,
    featuredStudents,
    galleryPreview,
    settings,
    todayDayOfWeek,
  } = data;

  const schedules = scheduleData.schedules || [];

  return (
    <div className="relative cosmic-canvas min-h-screen text-[var(--text-primary)] overflow-hidden transition-colors duration-200">
      {/* 1. Hero Section */}
      <HeroSection
        classCode={settings.classCode || "JS1SI-26-REG-05"}
        classNameTitle={settings.className || "S1 Sistem Informasi"}
        majorName={settings.studyProgram || "S1 Sistem Informasi"}
        institutionName={settings.institutionName || "Telkom University Jakarta"}
        academicYear={settings.academicYear || "Semester Ganjil 2026/2027"}
      />

      {/* Main Composed Sections Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pb-24">
        {/* 2. Academic Quick Statistics */}
        <AcademicStats stats={stats} />

        {/* 3. Today's Timetable / Schedule */}
        <TodaySchedule
          schedules={schedules as any}
          todayDayOfWeek={todayDayOfWeek}
        />

        {/* 4. Upcoming Tasks & Deadlines */}
        <UpcomingTasks tasks={upcomingTasks as any} />

        {/* 5. Featured Achievements & Hall of Excellence */}
        <FeaturedAchievements achievements={latestAchievements as any} />

        {/* 6. Student Cohort Showcase */}
        <StudentShowcase students={featuredStudents as any} />

        {/* 7. Asymmetric Editorial Gallery */}
        <GalleryShowcase items={galleryPreview as any} />
      </div>
    </div>
  );
}
