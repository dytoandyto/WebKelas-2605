import type { Metadata } from "next";
import { getStudentsData, getSettings } from "@/lib/data";
import { StudentsDirectory } from "./students-directory";
import { PageHeader, ContentContainer } from "@/components/shared";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSettings();
  return {
    title: `Direktori Mahasiswa — ${settings.className}`,
    description: `Daftar profil mahasiswa kelas ${settings.className} S1 Sistem Informasi Telkom University Jakarta.`,
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
          badge={`COHORT DIRECTORY • ${classCode}`}
          title="Direktori Mahasiswa"
          description={`Profil mahasiswa, rekam prestasi, portofolio, dan visi masa depan talenta kelas ${classCode} (${students.length} Mahasiswa).`}
          breadcrumbs={[{ label: "Direktori Mahasiswa" }]}
        />

        <StudentsDirectory initialStudents={students} />
      </ContentContainer>
    </div>
  );
}
