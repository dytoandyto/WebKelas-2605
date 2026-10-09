import type { Metadata } from "next";
import { getStudentsData, getSettings } from "@/lib/data";
import { StudentsDirectory } from "./students-directory";
import { PageHeader, ContentContainer } from "@/components/shared";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Teman Satu Kelas — ${settings.className || "JS1SI-26-REG-05"}`,
    description: `Kenali teman-teman satu kelas ${settings.className} S1 Sistem Informasi Telkom University Jakarta.`,
  };
}

export default async function StudentsPage() {
  const [{ students }, settings] = await Promise.all([
    getStudentsData(),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`TEMAN KELAS • ${classCode}`}
          title="Teman Satu Kelas"
          description={`Kenali teman-teman satu kelas di ${classCode} (${students.length} Mahasiswa). Temukan profil, minat, dan kontak mereka.`}
          breadcrumbs={[{ label: "Teman Satu Kelas" }]}
        />

        <StudentsDirectory initialStudents={students} />
      </ContentContainer>
    </div>
  );
}
