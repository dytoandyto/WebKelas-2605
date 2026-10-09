import * as React from "react";
import {
  SectionConfig,
  HeroSettings,
  StatsSettings,
  ScheduleSettings,
  CampusLinksSettings,
  TasksSettings,
  MaterialsSettings,
  AchievementsSettings,
  StudentsSettings,
  GallerySettings,
  DailyNotesSettings,
  AboutSettings,
} from "@/lib/homepage/types";
import {
  HeroSection,
  AcademicStats,
  QuickLinks,
  TodaySchedule,
  UpcomingTasks,
  HomeMaterialsPreview,
  FeaturedAchievements,
  StudentShowcase,
  GalleryShowcase,
  HomeDailyNotes,
  HomeAboutTeaser,
} from "@/components/home";
import { ScheduleItem } from "@/components/schedule/schedule-grid";
import { TaskCardData } from "@/components/tasks/task-card";
import { AchievementData } from "@/components/achievements/achievement-card";
import { StudentData } from "@/components/students/student-card";
import { GalleryItem } from "@/components/home/gallery-showcase";
import { DailyNoteData } from "@/components/daily-notes/daily-note-card";
import { HomeMaterialItem } from "@/components/home/home-materials-preview";

export interface HomeDataProps {
  stats: {
    studentsCount: number;
    achievementsCount: number;
    subjectsCount: number;
    tasksCount: number;
    materialsCount: number;
    dailyNotesCount: number;
  };
  upcomingTasks: TaskCardData[];
  latestAchievements: AchievementData[];
  featuredStudents: StudentData[];
  galleryPreview: GalleryItem[];
  latestMaterials: HomeMaterialItem[];
  latestDailyNotes: DailyNoteData[];
  settings: Record<string, string>;
  todayDayOfWeek: string;
}

export interface SectionRendererProps {
  sections: SectionConfig[];
  homeData: HomeDataProps;
  schedules: ScheduleItem[];
  className?: string;
}

export function SectionRenderer({
  sections,
  homeData,
  schedules,
}: SectionRendererProps) {
  const visibleSections = sections
    .filter((s) => s.visible !== false)
    .sort((a, b) => a.order - b.order);

  // Check if hero is at top or somewhere in the list
  const heroSection = visibleSections.find((s) => s.key === "hero");
  const contentSections = visibleSections.filter((s) => s.key !== "hero");

  // Track rendered paired sections
  const renderedKeys = new Set<string>();

  return (
    <div className="relative cosmic-canvas min-h-screen text-[var(--text-primary)] overflow-hidden transition-colors duration-200">
      {/* 1. Hero Section if enabled */}
      {heroSection && (
        <HeroSection
          classCode={homeData.settings.classCode || "JS1SI-26-REG-05"}
          classNameTitle={homeData.settings.className || "S1 Sistem Informasi"}
          majorName={homeData.settings.studyProgram || "S1 Sistem Informasi"}
          institutionName={
            homeData.settings.institutionName || "Telkom University Jakarta"
          }
          academicYear={
            homeData.settings.academicYear || "Semester Ganjil 2026/2027"
          }
          waliDosen={homeData.settings.waliDosen || "Muhammad Ardiansyah"}
          settings={heroSection.settings as HeroSettings}
        />
      )}

      {/* Main Composed Sections Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pb-24">
        {contentSections.map((section, index) => {
          if (renderedKeys.has(section.key)) return null;

          // Check if today_schedule and campus_links are directly adjacent
          if (section.key === "today_schedule") {
            const nextSection = contentSections[index + 1];
            if (nextSection && nextSection.key === "campus_links") {
              renderedKeys.add("campus_links");
              return (
                <div
                  key="schedule-and-quicklinks-grid"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-start"
                >
                  <div className="lg:col-span-8">
                    <TodaySchedule
                      schedules={schedules}
                      todayDayOfWeek={homeData.todayDayOfWeek}
                      settings={section.settings as ScheduleSettings}
                    />
                  </div>
                  <div className="lg:col-span-4">
                    <QuickLinks
                      layout="vertical"
                      settings={nextSection.settings as CampusLinksSettings}
                    />
                  </div>
                </div>
              );
            }

            return (
              <TodaySchedule
                key={section.key}
                schedules={schedules}
                todayDayOfWeek={homeData.todayDayOfWeek}
                settings={section.settings as ScheduleSettings}
              />
            );
          }

          if (section.key === "campus_links") {
            const nextSection = contentSections[index + 1];
            if (nextSection && nextSection.key === "today_schedule") {
              renderedKeys.add("today_schedule");
              return (
                <div
                  key="quicklinks-and-schedule-grid"
                  className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-start"
                >
                  <div className="lg:col-span-4">
                    <QuickLinks
                      layout="vertical"
                      settings={section.settings as CampusLinksSettings}
                    />
                  </div>
                  <div className="lg:col-span-8">
                    <TodaySchedule
                      schedules={schedules}
                      todayDayOfWeek={homeData.todayDayOfWeek}
                      settings={nextSection.settings as ScheduleSettings}
                    />
                  </div>
                </div>
              );
            }

            // Standalone quick links uses vertical layout
            return (
              <div key={section.key} className="max-w-xl">
                <QuickLinks
                  layout="vertical"
                  settings={section.settings as CampusLinksSettings}
                />
              </div>
            );
          }

          if (section.key === "stats") {
            return (
              <AcademicStats
                key={section.key}
                stats={homeData.stats}
                settings={section.settings as StatsSettings}
              />
            );
          }

          if (section.key === "upcoming_tasks") {
            return (
              <UpcomingTasks
                key={section.key}
                tasks={homeData.upcomingTasks}
                settings={section.settings as TasksSettings}
              />
            );
          }

          if (section.key === "materials") {
            return (
              <HomeMaterialsPreview
                key={section.key}
                materials={homeData.latestMaterials}
                totalCount={homeData.stats.materialsCount}
                settings={section.settings as MaterialsSettings}
              />
            );
          }

          if (section.key === "achievements") {
            return (
              <FeaturedAchievements
                key={section.key}
                achievements={homeData.latestAchievements}
                settings={section.settings as AchievementsSettings}
              />
            );
          }

          if (section.key === "students") {
            return (
              <StudentShowcase
                key={section.key}
                students={homeData.featuredStudents}
                settings={section.settings as StudentsSettings}
              />
            );
          }

          if (section.key === "gallery") {
            return (
              <GalleryShowcase
                key={section.key}
                items={homeData.galleryPreview}
                settings={section.settings as GallerySettings}
              />
            );
          }

          if (section.key === "daily_notes") {
            return (
              <HomeDailyNotes
                key={section.key}
                notes={homeData.latestDailyNotes}
                settings={section.settings as DailyNotesSettings}
              />
            );
          }

          if (section.key === "about") {
            return (
              <HomeAboutTeaser
                key={section.key}
                settings={section.settings as AboutSettings}
                classCode={homeData.settings.classCode}
                classNameTitle={homeData.settings.className}
                institutionName={homeData.settings.institutionName}
                waliDosen={homeData.settings.waliDosen}
                vision={homeData.settings.aboutVision}
                studentsCount={homeData.stats.studentsCount}
                achievementsCount={homeData.stats.achievementsCount}
              />
            );
          }

          // Safe fallback for any unrecognized or future section key
          return null;
        })}
      </div>
    </div>
  );
}
