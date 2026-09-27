import type { Metadata } from "next";
import { getDailyNotesData, getSettings } from "@/lib/data";
import { DailyNotesView } from "@/components/daily-notes/daily-notes-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Jurnal & Catatan Harian Kuliah | JS1SI-26-REG-05",
  description:
    "Jurnal akademik harian kelas JS1SI-26-REG-05 S1 Sistem Informasi Telkom University Jakarta — rangkuman materi harian, poin penting, dan tindak lanjut.",
};

export default async function DailyNotesPage() {
  const [{ dailyNotes, subjects }, settings] = await Promise.all([
    getDailyNotesData({}),
    getSettings(),
  ]);

  const classCode = settings.classCode || "JS1SI-26-REG-05";

  return (
    <div className="cosmic-canvas min-h-screen text-[var(--text-primary)] pb-24 pt-28">
      <ContentContainer>
        <PageHeader
          badge={`ACADEMIC JOURNAL • ${classCode}`}
          title="Catatan Harian Kuliah"
          description="Jurnal akademik harian kelas untuk merekam rangkuman bahasan kuliah, poin penting diskusi kelas, dan tindak lanjut belajar."
          breadcrumbs={[{ label: "Catatan Harian" }]}
        />

        <DailyNotesView dailyNotes={dailyNotes as any} subjects={subjects as any} />
      </ContentContainer>
    </div>
  );
}
