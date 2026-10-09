import type { Metadata } from "next";
import { getMaterialsData, getSettings } from "@/lib/data";
import { MaterialsView } from "@/components/materials/materials-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Materi Kuliah | JS1SI-26-REG-05",
  description:
    "Bahan ajar, slide presentasi dosen, modul praktikum, dan referensi belajar kelas JS1SI-26-REG-05 Telkom University Jakarta.",
};

interface MaterialsPageProps {
  searchParams: Promise<{ subject?: string }>;
}

export default async function MaterialsPage({ searchParams }: MaterialsPageProps) {
  const { subject } = await searchParams;
  const [{ materials, subjects }, settings] = await Promise.all([
    getMaterialsData({}),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`MATERI KULIAH • ${classCode}`}
          title="Materi Kuliah"
          description="Kumpulan berkas materi kuliah, modul praktikum, dan slide presentasi dosen semua mata kuliah."
          breadcrumbs={[{ label: "Materi Kuliah" }]}
        />

        <MaterialsView
          materials={materials as any}
          subjects={subjects as any}
          initialSubjectCode={subject}
        />
      </ContentContainer>
    </div>
  );
}
