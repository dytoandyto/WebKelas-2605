import type { Metadata } from "next";
import { getScheduleData, getSettings } from "@/lib/data";
import { ScheduleView } from "@/components/schedule/schedule-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Jadwal Kuliah | JS1SI-26-REG-05",
  description:
    "Jadwal kuliah mingguan kelas JS1SI-26-REG-05 S1 Sistem Informasi Telkom University Jakarta.",
};

export default async function SchedulePage() {
  const [{ schedules, subjects }, settings] = await Promise.all([
    getScheduleData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";
  const academicYear = settings.semester || "Semester Ganjil 2026/2027";
  const studyProgram = settings.studyProgram || "S1 Sistem Informasi";
  const institutionName = settings.institutionName || "Telkom University Jakarta";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`JADWAL • ${classCode}`}
          title="Jadwal Kuliah"
          description={`Jadwal perkuliahan mingguan ${classCode} (${studyProgram}, ${institutionName}) — pantau waktu kelas dan ruang belajarmu.`}
          breadcrumbs={[{ label: "Jadwal Kuliah" }]}
        />

        <ScheduleView
          schedules={schedules as any}
          subjects={subjects as any}
          classCode={classCode}
          academicYear={academicYear}
        />
      </ContentContainer>
    </div>
  );
}
