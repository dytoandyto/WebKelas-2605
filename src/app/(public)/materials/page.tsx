import type { Metadata } from "next";
import { getMaterialsData, getSettings } from "@/lib/data";
import { MaterialsView } from "@/components/materials/materials-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Materi Kuliah & Sumber Belajar | JS1SI-26-REG-05",
  description:
    "Repositori materi perkuliahan, slide modul, dokumen praktikum, dan referensi akademik kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

export default async function MaterialsPage() {
  const [{ materials, subjects }, settings] = await Promise.all([
    getMaterialsData({}),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`ACADEMIC REPOSITORY • ${classCode}`}
          title="Materi & Sumber Belajar"
          description="Repositori materi kuliah resmi, modul praktikum, slide presentasi dosen, dan tautan referensi belajar mahasiswa."
          breadcrumbs={[{ label: "Materi Perkuliahan" }]}
        />

        <MaterialsView materials={materials as any} subjects={subjects as any} />
      </ContentContainer>
    </div>
  );
}
