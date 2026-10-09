import type { Metadata } from "next";
import { getHomeData, getScheduleData } from "@/lib/data";
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
} from "@/components/home";

export const metadata: Metadata = {
  title: "Ruang Kelas Digital | JS1SI-26-REG-05",
  description:
    "Ruang digital kelas S1 Sistem Informasi Telkom University Jakarta (JS1SI-26-REG-05) — jadwal kuliah, tugas & deadline, materi kuliah, dan kabar teman sekelas.",
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
    latestMaterials,
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
        waliDosen={settings.waliDosen || "Muhammad Ardiansyah"}
      />

      {/* Main Composed Sections Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 sm:space-y-20 pb-24">
        {/* 2. Statistik Akademik */}
        <AcademicStats stats={stats} />

        {/* 3. Jadwal Kuliah Hari Ini & Akses Cepat Kampus */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-8 items-start">
          {/* Kolom Kiri: Jadwal Kuliah Hari Ini */}
          <div className="lg:col-span-8">
            <TodaySchedule
              schedules={schedules as any}
              todayDayOfWeek={todayDayOfWeek}
            />
          </div>

          {/* Kolom Kanan: Panel Utilitas Vertikal Quick Links */}
          <div className="lg:col-span-4">
            <QuickLinks />
          </div>
        </div>

        {/* 4. Tugas & Deadline (Memanjang di Bawah Quick Links & Jadwal) */}
        <UpcomingTasks tasks={upcomingTasks as any} />

        {/* 5. Materi Kuliah Preview */}
        {/* <HomeMaterialsPreview
          materials={latestMaterials as any}
          totalCount={stats.materialsCount}
        /> */}

        {/* 6. Akses Cepat Kampus (MyTelU, iGracias, LMS Tel-U) */}

        {/* 7. Prestasi Kelas */}
        <FeaturedAchievements achievements={latestAchievements as any} />

        {/* 8. Teman Satu Kelas Showcase */}
        <StudentShowcase students={featuredStudents as any} />

        {/* 9. Galeri Kegiatan Kelas */}
        <GalleryShowcase items={galleryPreview as any} />
      </div>
    </div>
  );
}
