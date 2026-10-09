import type { Metadata } from "next";
import { getHomeData, getScheduleData } from "@/lib/data";
import { getHomepagePublishedConfig } from "@/lib/homepage/storage";
import { SectionRenderer, HomeDataProps } from "@/components/home/section-renderer";
import { ScheduleItem } from "@/components/schedule/schedule-grid";

export const metadata: Metadata = {
  title: "Ruang Kelas Digital | JS1SI-26-REG-05",
  description:
    "Ruang digital kelas S1 Sistem Informasi Telkom University Jakarta (JS1SI-26-REG-05) — jadwal kuliah, tugas & deadline, materi kuliah, dan kabar teman sekelas.",
};

export default async function HomePage() {
  const [data, scheduleData, homepageConfig] = await Promise.all([
    getHomeData(),
    getScheduleData(),
    getHomepagePublishedConfig(),
  ]);

  const schedules = scheduleData.schedules || [];

  return (
    <SectionRenderer
      sections={homepageConfig.sections}
      homeData={data as unknown as HomeDataProps}
      schedules={schedules as unknown as ScheduleItem[]}
    />
  );
}
