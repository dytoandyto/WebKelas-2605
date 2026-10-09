import type { Metadata } from "next";
import { getDailyNotesData, getSettings } from "@/lib/data";
import { DailyNotesView } from "@/components/daily-notes/daily-notes-view";
import { PageHeader, ContentContainer } from "@/components/shared";

export const metadata: Metadata = {
  title: "Catatan Kelas | JS1SI-26-REG-05",
  description:
    "Catatan dan rangkuman perkuliahan harian kelas JS1SI-26-REG-05 Telkom University Jakarta.",
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
          badge={`CATATAN • ${classCode}`}
          title="Catatan Kelas"
          description="Catatan dan rangkuman materi perkuliahan bersama untuk mereview bahasan dosen dan poin penting tiap pertemuan."
          breadcrumbs={[{ label: "Catatan Kelas" }]}
        />

        <DailyNotesView dailyNotes={dailyNotes as any} subjects={subjects as any} />
      </ContentContainer>
    </div>
  );
}
